// Approval settings owned by each sales team; policy frozen on quote submission.
export function installApprovalRules({db,q,on,role,bad,number,now,log,get,thresholds,totals}){
 db.exec(`CREATE TABLE IF NOT EXISTS quote_approval_rules(team_id INTEGER NOT NULL REFERENCES teams(id),kind TEXT NOT NULL,record_id TEXT NOT NULL,amount INTEGER,discount REAL,basis TEXT NOT NULL DEFAULT 'net',money_scope TEXT NOT NULL DEFAULT 'line',confirmed INTEGER NOT NULL DEFAULT 0,active INTEGER NOT NULL DEFAULT 1,revision INTEGER NOT NULL DEFAULT 1,updated_by INTEGER,updated_at TEXT NOT NULL,PRIMARY KEY(team_id,kind,record_id));`);
 if(!q("SELECT 1 FROM schema_migrations WHERE version='quote-approval-rules-v1'").get()){
  db.exec('BEGIN IMMEDIATE');try{const old=thresholds(),basis=get('local_options',{}).threshold_basis==='gross'?'gross':'net';
   for(const team of q('SELECT id FROM teams').all())for(const cat of q('SELECT id FROM product_categories').all())q('INSERT INTO quote_approval_rules(team_id,kind,record_id,amount,discount,basis,money_scope,confirmed,updated_at) VALUES(?,?,?,?,?,?,?,?,?)').run(team.id,'category',cat.id,old.amount,old.discount,basis,'quote',old.amount!==null&&old.discount!==null?1:0,now());
   q('INSERT INTO schema_migrations VALUES(?,?)').run('quote-approval-rules-v1',now());db.exec('COMMIT');
  }catch(e){db.exec('ROLLBACK');throw e;}
 }
 const rule=(team,kind,id)=>q('SELECT * FROM quote_approval_rules WHERE team_id=? AND kind=? AND record_id=? AND active=1').get(team,kind,id);
 const record=(kind,id)=>{if(!['category','product'].includes(kind))bad('Loại thiết lập không hợp lệ.');const r=q(kind==='product'?'SELECT * FROM products WHERE code=?':'SELECT * FROM product_categories WHERE id=?').get(id);if(!r||r.archived_at)bad('Chọn loại hoặc sản phẩm đang hoạt động.');return r;};
 on('GET','/api/approval-rules',({user})=>{const team=q('SELECT name FROM teams WHERE id=?').get(user.team_id);return {team_id:user.team_id,team_name:team?.name||'',can_edit:user.role==='leader',rules:q('SELECT * FROM quote_approval_rules WHERE team_id=? AND active=1').all(user.team_id)};});
 on('PUT','/api/approval-rules/:kind/:id',({user,params,body})=>{
  role(user,'leader');record(params.kind,params.id);const amount=number(body.amount,0,1e12),discount=number(body.discount,0,100);if(!Number.isSafeInteger(amount))bad('Ngưỡng giá trị VNĐ phải là số nguyên.');
  if(!['net','gross'].includes(body.basis)||!['line','quote'].includes(body.money_scope))bad('Chọn cách so sánh giá trị.');const old=rule(user.team_id,params.kind,params.id);
  q(`INSERT INTO quote_approval_rules(team_id,kind,record_id,amount,discount,basis,money_scope,confirmed,updated_by,updated_at) VALUES(?,?,?,?,?,?,?,1,?,?) ON CONFLICT(team_id,kind,record_id) DO UPDATE SET amount=excluded.amount,discount=excluded.discount,basis=excluded.basis,money_scope=excluded.money_scope,confirmed=1,active=1,revision=quote_approval_rules.revision+1,updated_by=excluded.updated_by,updated_at=excluded.updated_at`).run(user.team_id,params.kind,params.id,amount,discount,body.basis,body.money_scope,user.id,now());
  log(user.id,'approval_rule','team',{team_id:user.team_id,kind:params.kind,id:params.id,old,new:rule(user.team_id,params.kind,params.id)});return {ok:true};
 });
 on('POST','/api/approval-rules/product/:id/inherit',({user,params})=>{role(user,'leader');record('product',params.id);const old=rule(user.team_id,'product',params.id);q("UPDATE quote_approval_rules SET active=0,revision=revision+1,updated_by=?,updated_at=? WHERE team_id=? AND kind='product' AND record_id=?").run(user.id,now(),user.team_id,params.id);log(user.id,'approval_rule_inherit','team',{team_id:user.team_id,code:params.id,old});return {ok:true};});
 function route(quote,items){
  const customer=q('SELECT team_id FROM customers WHERE id=?').get(quote.customer_id),team=customer?.team_id,first=totals(items).first,net=Math.round(first*(1-quote.discount_pct/100)),checks=[],missing=[];
  for(const item of items){const p=q('SELECT family FROM products WHERE code=?').get(item.code);const product=rule(team,'product',item.code),r=product||rule(team,'category',p?.family||quote.template);
   if(!r||!r.confirmed||r.amount===null||r.discount===null){missing.push(item.name);continue;}
   const gross=r.money_scope==='quote'?first:item.first_year*item.qty,value=r.basis==='gross'?gross:Math.round(gross*(1-quote.discount_pct/100));
   checks.push({code:item.code,name:item.name,source:r.kind,record_id:r.record_id,revision:r.revision,amount:r.amount,discount:r.discount,basis:r.basis,money_scope:r.money_scope,value,discount_pct:quote.discount_pct,overAmount:value>r.amount,overDiscount:quote.discount_pct>r.discount});
  }
  if(missing.length)return {blocked:'Trưởng nhóm cần thiết lập ngưỡng duyệt cho: '+missing.join(', '),team_id:team,checks};
  const owner=q('SELECT role FROM users WHERE id=?').get(quote.owner_id),overAmount=checks.some(c=>c.overAmount),overDiscount=checks.some(c=>c.overDiscount);
  return {level:overAmount||overDiscount||owner?.role==='leader'?'director':'leader',team_id:team,net,overAmount,overDiscount,checks,source:'product-rules-v1'};
 }
 return {route};
}
