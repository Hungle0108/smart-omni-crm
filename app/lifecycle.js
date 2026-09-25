import {randomBytes} from 'node:crypto';

export function installLifecycle({db,q,on,routes,Err,now,log,hash,canSeeCustomer,helpers,revokeSessions}) {
 const {role}=helpers;
 const definitions={customers:['customers','name','sales'],opportunities:['opportunities','title','sales'],quotes:['quotes','code','sales'],tasks:['tasks','title','sales'],knowledge:['knowledge','title','knowledge'],templates:['quote_templates','name','admin'],products:['products','name','admin'],'product-categories':['product_categories','name','admin'],'work-templates':['task_templates','name','leader'],teams:['teams','name','admin']};
 definitions.notes=['notes','body','sales'];definitions.conversations=['conversations','channel','sales'];
 const key=kind=>kind==='products'?'code':'id';
 for(const [table] of Object.values(definitions))for(const [col,type] of [['archived_at','TEXT'],['archive_reason',"TEXT NOT NULL DEFAULT ''"],['archive_meta',"TEXT NOT NULL DEFAULT '{}' "]])if(!q(`PRAGMA table_info(${table})`).all().some(c=>c.name===col))db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
 db.exec(`CREATE TABLE IF NOT EXISTS lifecycle_history(id INTEGER PRIMARY KEY,kind TEXT NOT NULL,record_id TEXT NOT NULL,title TEXT NOT NULL,user_id INTEGER,at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS pipeline_stages(id INTEGER PRIMARY KEY,name TEXT UNIQUE NOT NULL,position INTEGER NOT NULL,protected INTEGER NOT NULL DEFAULT 0,archived_at TEXT);`);
 if(!q('SELECT 1 FROM pipeline_stages LIMIT 1').get())['Mới','Xác định nhu cầu','Tư vấn/Demo','Gửi báo giá','Đàm phán','Thắng','Thua'].forEach((s,i)=>q('INSERT INTO pipeline_stages(name,position,protected) VALUES(?,?,?)').run(s,i*10,['Mới','Thắng','Thua'].includes(s)?1:0));
 q('INSERT OR IGNORE INTO schema_migrations VALUES(?,?)').run('lifecycle-v1',now());
 const text=(s,n=500)=>{if(typeof s!=='string'||!s.trim()||s.length>n)throw new Err(400,'Nhập nội dung bắt buộc, tối đa '+n+' ký tự.');return s.trim();};
 const row=(kind,id)=>{const d=definitions[kind];if(!d)throw new Err(404,'Không có loại dữ liệu này.');const r=q(`SELECT * FROM ${d[0]} WHERE ${key(kind)}=?`).get(id);if(!r)throw new Err(404,'Không tìm thấy dữ liệu.');return r;};
 const customer=id=>q('SELECT * FROM customers WHERE id=?').get(id);
 const visible=(u,kind,r)=>{
  if(kind==='templates'&&r.source_import_id&&u.role==='leader'&&r.team_id===u.team_id)return true;
  const permission=definitions[kind][2];if(permission==='admin')return u.role==='admin';if(permission==='leader')return u.role==='leader'&&r.team_id===u.team_id;
  if(permission==='knowledge')return ['leader','director'].includes(u.role);
  if(!['leader','sales'].includes(u.role))return false;
  if(kind==='customers')return canSeeCustomer(u,r);
  if(r.customer_id)return canSeeCustomer(u,customer(r.customer_id));
  return kind==='tasks'&&(u.role==='sales'?r.assignee_id===u.id:q('SELECT team_id FROM users WHERE id=?').get(r.assignee_id)?.team_id===u.team_id);
 };
 const access=(u,kind,id)=>{const r=row(kind,id);if(!visible(u,kind,r))throw new Err(403,'Bạn không có quyền quản lý dữ liệu này.');return r;};
 const activeCustomer=id=>!id||!customer(id)?.archived_at;
 const history=(u,kind,r,message)=>{q('INSERT INTO lifecycle_history(kind,record_id,title,user_id,at) VALUES(?,?,?,?,?)').run(kind,String(r[key(kind)]),message,u.id,now());log(u.id,'lifecycle',kind,{id:r[key(kind)],message});};
 const original=(method,path)=>routes.find(r=>r.method===method&&r.path===path)?.fn;
 const workArchive=original('POST','/api/work-items/:id/archive'),workRestore=original('POST','/api/work-items/:id/restore');
 function change(ctx,restore){
  const {user,params,body}=ctx,kind=params.kind,r=access(user,kind,params.id),reason=restore?'Khôi phục':text(body.reason);
  if(restore&&!r.archived_at||!restore&&r.archived_at)return {ok:true};
  if(r.customer_id&&!activeCustomer(r.customer_id))throw new Err(409,'Khôi phục hồ sơ khách hàng trước.');
  if(kind==='customers'){
   if(restore&&r.parent_org_id&&!activeCustomer(r.parent_org_id))throw new Err(409,'Khôi phục tổ chức mẹ trước.');
   if(!restore){
    if(q('SELECT id FROM customers WHERE parent_org_id=? AND archived_at IS NULL').get(r.id))throw new Err(409,'Lưu trữ hoặc tách đơn vị con trước khi lưu trữ tổ chức mẹ.');
    if(q("SELECT id FROM quotes WHERE customer_id=? AND status='PENDING' AND archived_at IS NULL").get(r.id))throw new Err(409,'Khách còn báo giá chờ duyệt. Xử lý hoặc rút duyệt trước.');
    if(q("SELECT o.id FROM zalo_outbox o JOIN messages m ON m.id=o.message_id JOIN conversations v ON v.id=m.conv_id WHERE v.customer_id=? AND o.status IN ('pending','sending')").get(r.id))throw new Err(409,'Khách có tin OA đang gửi. Chờ xử lý xong.');
    q('UPDATE customers SET do_not_contact=1 WHERE id=?').run(r.id);q('UPDATE conversations SET bot_active=0 WHERE customer_id=?').run(r.id);
   }else q('UPDATE customers SET do_not_contact=? WHERE id=?').run(JSON.parse(r.archive_meta).do_not_contact??0,r.id);
  }
  if(kind==='conversations'&&!restore){if(q("SELECT o.id FROM zalo_outbox o JOIN messages m ON m.id=o.message_id WHERE m.conv_id=? AND o.status IN ('pending','sending')").get(r.id))throw new Err(409,'Hội thoại có tin OA đang gửi. Chờ xử lý xong.');q("UPDATE conversations SET bot_active=0,status='CLOSED' WHERE id=?").run(r.id);}
  if(kind==='opportunities'&&restore&&!q('SELECT 1 FROM pipeline_stages WHERE name=? AND archived_at IS NULL').get(r.stage))throw new Err(409,'Nhờ admin kích hoạt lại bước bán hàng của cơ hội trước khi khôi phục.');
  if(kind==='quotes'&&!restore&&r.status==='PENDING')throw new Err(409,'Rút báo giá khỏi chờ duyệt trước khi lưu trữ.');
  if(kind==='knowledge'){
   if(!restore&&(r.approved_body||r.status==='PENDING')&&user.role!=='director')throw new Err(403,'Giám đốc lưu trữ nội dung đã duyệt hoặc đang chờ duyệt.');
   q("UPDATE knowledge SET status=?,approved_body=NULL,approved_keywords=NULL,updated_at=? WHERE id=?").run(restore?'DRAFT':'WITHDRAWN',now(),r.id);
  }
  if(kind==='product-categories'&&!restore&&(q('SELECT 1 FROM products WHERE family=? AND archived_at IS NULL').get(r.id)||q('SELECT 1 FROM quote_templates WHERE family=? AND archived_at IS NULL').get(r.id)))throw new Err(409,'Lưu trữ các sản phẩm và mẫu trong loại này trước.');
  if(['products','templates'].includes(kind)&&restore&&q('SELECT archived_at FROM product_categories WHERE id=?').get(r.family)?.archived_at)throw new Err(409,'Khôi phục loại sản phẩm/dịch vụ trước.');
  if(kind==='products')q('UPDATE products SET active=? WHERE code=?').run(restore?(JSON.parse(r.archive_meta).active??1):0,r.code);
  if(kind==='teams'&&!restore&&(q('SELECT 1 FROM users WHERE team_id=? AND active=1').get(r.id)||q('SELECT 1 FROM customers WHERE team_id=? AND archived_at IS NULL').get(r.id)))throw new Err(409,'Nhóm còn người dùng hoặc khách đang hoạt động. Bàn giao trước khi lưu trữ.');
  if(kind==='tasks'&&r.customer_id)(restore?workRestore:workArchive)({...ctx,params:{id:r.id},body:{reason}});
  q(`UPDATE ${definitions[kind][0]} SET archived_at=?,archive_reason=?,archive_meta=? WHERE ${key(kind)}=?`).run(restore?null:now(),restore?'':reason,restore?'{}':JSON.stringify({do_not_contact:r.do_not_contact,active:r.active}),r[key(kind)]);
  history(user,kind,r,(restore?'Khôi phục: ':'Lưu trữ: ')+r[definitions[kind][1]]+' · '+reason);return {ok:true};
 }
 on('GET','/api/lifecycle/:kind',({user,params})=>{
  const kind=params.kind,d=definitions[kind];if(!d)throw new Err(404,'Không có loại dữ liệu này.');
  return q(`SELECT * FROM ${d[0]} WHERE archived_at IS NOT NULL ORDER BY archived_at DESC`).all().filter(r=>visible(user,kind,r)).map(r=>({id:r[key(kind)],name:kind==='conversations'?[customer(r.customer_id)?.name,r.channel].filter(Boolean).join(' · '):r[d[1]],at:r.archived_at,reason:r.archive_reason}));
 });
 on('POST','/api/lifecycle/:kind/:id/archive',ctx=>change(ctx,false));on('POST','/api/lifecycle/:kind/:id/restore',ctx=>change(ctx,true));
 on('PUT','/api/notes/:id',({user,params,body})=>{const r=access(user,'notes',params.id);if(r.archived_at||!activeCustomer(r.customer_id))throw new Err(409,'Khôi phục hồ sơ trước.');const value=text(body.body,10000);q('UPDATE notes SET body=? WHERE id=?').run(value,r.id);log(user.id,'edit_note','customer',{id:r.customer_id,note_id:r.id,old:r.body,new:value});return {ok:true};});
 on('PUT','/api/opportunities/:id',({user,params,body})=>{const r=access(user,'opportunities',params.id);if(r.archived_at||!activeCustomer(r.customer_id))throw new Err(409,'Khôi phục hồ sơ trước.');const value=Number(body.est_value);if(!Number.isSafeInteger(value)||value<0||value>1e12)throw new Err(400,'Giá trị dự kiến không hợp lệ.');if(body.expected_close&&(!/^\d{4}-\d{2}-\d{2}$/.test(body.expected_close)||!Number.isFinite(Date.parse(body.expected_close))))throw new Err(400,'Ngày dự kiến không hợp lệ.');q('UPDATE opportunities SET title=?,est_value=?,expected_close=? WHERE id=?').run(text(body.title,250),value,body.expected_close||null,r.id);history(user,'opportunities',r,'Sửa nội dung cơ hội: '+body.title);return {ok:true};});
 on('POST','/api/quotes/:id/withdraw',({user,params,body})=>{const r=access(user,'quotes',params.id);if(r.archived_at||r.status!=='PENDING'||!activeCustomer(r.customer_id))throw new Err(409,'Chỉ rút báo giá đang chờ duyệt và còn hoạt động.');const reason=text(body.reason);q("UPDATE quotes SET status='DRAFT',policy=NULL,reject_note=? WHERE id=?").run(reason,r.id);q('INSERT INTO quote_history(quote_id,action,user_id,at,content) VALUES(?,?,?,?,?)').run(r.id,'withdraw',user.id,now(),JSON.stringify({reason}));return {ok:true};});
 on('GET','/api/admin/teams',({user})=>{role(user,'admin');return q('SELECT * FROM teams ORDER BY id').all();});
 on('POST','/api/admin/teams',({user,body})=>{role(user,'admin');const name=text(body.name,150);if(q('SELECT id FROM teams WHERE name=? COLLATE NOCASE').get(name))throw new Err(409,'Tên nhóm đã có, hãy kiểm tra cả nhóm đã lưu trữ.');const id=q('INSERT INTO teams(name) VALUES(?)').run(name).lastInsertRowid;log(user.id,'create_team','team',{id,name});return {id};});
 on('PUT','/api/admin/teams/:id',({user,params,body})=>{role(user,'admin');const r=row('teams',params.id);if(r.archived_at)throw new Err(409,'Khôi phục nhóm trước.');const name=text(body.name,150);if(q('SELECT id FROM teams WHERE name=? COLLATE NOCASE AND id<>?').get(name,r.id))throw new Err(409,'Tên nhóm đã có.');q('UPDATE teams SET name=? WHERE id=?').run(name,r.id);log(user.id,'edit_team','team',{id:r.id,name});return {ok:true};});
 on('POST','/api/admin/users',({user,body})=>{
  role(user,'admin');const username=text(body.username,60).toLowerCase(),name=text(body.name,150),password=text(body.password,200);
  if(!/^[a-z0-9._-]{3,60}$/.test(username))throw new Err(400,'Tài khoản từ 3–60 ký tự chữ không dấu, số, chấm, gạch nối.');if(password.length<8)throw new Err(400,'Mật khẩu tối thiểu 8 ký tự.');
  if(!['admin','leader','sales','director'].includes(body.role))throw new Err(400,'Vai trò không hợp lệ.');
  if(!q('SELECT id FROM teams WHERE id=? AND archived_at IS NULL').get(Number(body.team_id)))throw new Err(400,'Chọn nhóm đang hoạt động.');
  if(q('SELECT id FROM users WHERE username=? COLLATE NOCASE').get(username))throw new Err(409,'Tên đăng nhập đã có, kể cả tài khoản bị khóa.');
  const salt=randomBytes(16).toString('hex'),id=q('INSERT INTO users(username,name,role,team_id,expertise,salt,pwd) VALUES(?,?,?,?,?,?,?)').run(username,name,body.role,Number(body.team_id),String(body.expertise||'').slice(0,300),salt,hash(password,salt)).lastInsertRowid;log(user.id,'create_user','user',{id,username,role:body.role,team_id:body.team_id});return {id};
 });
 function deactivate(user,u,targetId){
  if(u.id===user.id)throw new Err(409,'Không thể khóa tài khoản đang đăng nhập.');
  const owned=q('SELECT id FROM customers WHERE owner_id=?').all(u.id),openTasks=q("SELECT id FROM tasks WHERE assignee_id=? AND archived_at IS NULL AND status!='COMPLETED'").all(u.id);
  if(owned.length||openTasks.length){const to=q("SELECT * FROM users WHERE id=? AND active=1 AND role='sales' AND team_id=?").get(Number(targetId)||0,u.team_id);if(!to||to.id===u.id)throw new Err(409,'Chọn sales cùng nhóm để nhận khách và công việc trước khi khóa.');
   const conflict=q('SELECT 1 FROM tasks t JOIN customers c ON c.id=t.customer_id WHERE t.assignee_id=? AND t.archived_at IS NULL AND (c.owner_id IS NULL OR c.owner_id NOT IN (?,?))').get(u.id,u.id,to.id);if(conflict)throw new Err(409,'Có việc thuộc khách của sales khác. Trưởng nhóm cần bàn giao riêng việc đó trước.');
   for(const c of owned){q('UPDATE customers SET owner_id=? WHERE id=?').run(to.id,c.id);q('UPDATE conversations SET assignee_id=?,bot_active=0 WHERE customer_id=?').run(to.id,c.id);q('UPDATE opportunities SET owner_id=? WHERE customer_id=?').run(to.id,c.id);q('UPDATE tasks SET assignee_id=? WHERE customer_id=? AND assignee_id=? AND archived_at IS NULL').run(to.id,c.id,u.id);history(user,'customers',{id:c.id,name:'Khách hàng'},'Bàn giao người phụ trách từ '+u.name+' sang '+to.name);}
   q("UPDATE tasks SET assignee_id=? WHERE assignee_id=? AND archived_at IS NULL AND status!='COMPLETED'").run(to.id,u.id);
  }
  q('UPDATE users SET active=0 WHERE id=?').run(u.id);revokeSessions(u.id);log(user.id,'deactivate_user','user',{id:u.id,transfer_to:targetId||null});
 }
 on('POST','/api/admin/users/:id/status',({user,params,body})=>{role(user,'admin');const u=q('SELECT * FROM users WHERE id=?').get(params.id);if(!u)throw new Err(404,'Không có tài khoản.');if(typeof body.active!=='boolean')throw new Err(400,'Trạng thái không hợp lệ.');if(body.active){if(row('teams',u.team_id).archived_at)throw new Err(409,'Khôi phục nhóm trước.');q('UPDATE users SET active=1 WHERE id=?').run(u.id);log(user.id,'activate_user','user',{id:u.id});}else deactivate(user,u,body.transfer_to);return {ok:true};});
 const userEdit=original('PUT','/api/admin/users/:id');on('PUT','/api/admin/users/:id',ctx=>{role(ctx.user,'admin');const u=q('SELECT * FROM users WHERE id=?').get(ctx.params.id);if(u&&ctx.body.active===false&&u.active)deactivate(ctx.user,u,ctx.body.transfer_to);if(u&&!u.active&&ctx.body.active===true&&row('teams',u.team_id).archived_at)throw new Err(409,'Khôi phục nhóm trước.');return userEdit(ctx);});
 on('GET','/api/pipeline-stages',()=>q('SELECT * FROM pipeline_stages ORDER BY position,id').all());
 on('POST','/api/pipeline-stages',({user,body})=>{role(user,'admin');const name=text(body.name,80);if(q('SELECT id FROM pipeline_stages WHERE name=? COLLATE NOCASE').get(name))throw new Err(409,'Tên bước đã có.');const pos=q("SELECT position FROM pipeline_stages WHERE name='Thắng'").get().position;q('UPDATE pipeline_stages SET position=position+10 WHERE position>=?').run(pos);const id=q('INSERT INTO pipeline_stages(name,position) VALUES(?,?)').run(name,pos).lastInsertRowid;log(user.id,'create_stage','pipeline',{id,name});return {id};});
 on('POST','/api/pipeline-stages/:id/status',({user,params,body})=>{role(user,'admin');const s=q('SELECT * FROM pipeline_stages WHERE id=?').get(params.id);if(!s)throw new Err(404,'Không có bước.');if(typeof body.active!=='boolean')throw new Err(400,'Trạng thái không hợp lệ.');if(s.protected&&!body.active)throw new Err(409,'Giữ bước Mới, Thắng, Thua để bảo toàn quy tắc nghiệp vụ.');if(!body.active&&q('SELECT id FROM opportunities WHERE stage=? AND archived_at IS NULL').get(s.name))throw new Err(409,'Chuyển các cơ hội đang dùng bước này trước.');q('UPDATE pipeline_stages SET archived_at=? WHERE id=?').run(body.active?null:now(),s.id);log(user.id,'stage_status','pipeline',{id:s.id,active:body.active});return {ok:true};});

 // Apply the same lifecycle guard to legacy routes, including direct API mutations.
 const resourceKinds={customers:'customers',organizations:'customers',opportunities:'opportunities',quotes:'quotes',tasks:'tasks','work-items':'tasks',knowledge:'knowledge',templates:'templates',products:'products','product-categories':'product-categories','work-templates':'work-templates',notes:'notes',conversations:'conversations'};
 for(const r of routes){if(r.method==='GET'||r.path.startsWith('/api/lifecycle/')||r.path.includes('/api/admin/'))continue;const fn=r.fn;r.fn=ctx=>{
   const parts=r.path.split('/'),kind=resourceKinds[parts[2]],id=ctx.params.id??ctx.params.code;
   if(kind&&id){const item=q(`SELECT * FROM ${definitions[kind][0]} WHERE ${key(kind)}=?`).get(id);if(item?.archived_at&&!/\/(archive|restore)$/.test(r.path))throw new Err(409,'Dữ liệu đã lưu trữ. Khôi phục trước khi thay đổi.');if(item?.customer_id&&!activeCustomer(item.customer_id))throw new Err(409,'Khách hàng đã lưu trữ.');}
   if(ctx.body.customer_id&&!activeCustomer(Number(ctx.body.customer_id)))throw new Err(409,'Khách hàng đã lưu trữ.');
   if(ctx.body.parent_org_id&&!activeCustomer(Number(ctx.body.parent_org_id)))throw new Err(409,'Tổ chức mẹ đã lưu trữ.');
   if(parts[2]==='conversations'&&ctx.params.id){const c=q('SELECT customer_id FROM conversations WHERE id=?').get(ctx.params.id);if(c&&!activeCustomer(c.customer_id))throw new Err(409,'Khách hàng đã lưu trữ.');}
   if(parts[2]==='contacts'&&ctx.params.id){const c=q('SELECT organization_id FROM contacts WHERE id=?').get(ctx.params.id);if(c&&!activeCustomer(c.organization_id))throw new Err(409,'Tổ chức đã lưu trữ.');}
   if(ctx.body.template_id&&['quotes','customers'].includes(parts[2])){const t=row(parts[2]==='quotes'?'templates':'work-templates',ctx.body.template_id);if(t.archived_at)throw new Err(409,'Mẫu đã lưu trữ.');}
   if(ctx.body.family&&['templates','products'].includes(parts[2])&&row('product-categories',ctx.body.family).archived_at)throw new Err(409,'Loại dịch vụ đã lưu trữ.');
   return fn(ctx);
  };}
 const filterRoutes={'/api/customers':'customers','/api/organizations':'customers','/api/opportunities':'opportunities','/api/quotes':'quotes','/api/quotes/pending':'quotes','/api/tasks':'tasks','/api/knowledge':'knowledge','/api/products':'products','/api/product-categories':'product-categories','/api/work-templates':'work-templates'};
 for(const [path,kind] of Object.entries(filterRoutes)){const fn=original('GET',path);on('GET',path,ctx=>fn(ctx).filter(item=>{const r=row(kind,item[key(kind)]);return !r.archived_at&&(!r.customer_id||activeCustomer(r.customer_id));}));}
 const templates=original('GET','/api/templates');on('GET','/api/templates',ctx=>{const d=templates(ctx);d.templates=d.templates.filter(t=>!t.archived_at);return d;});
 const progress=original('GET','/api/customer-progress');on('GET','/api/customer-progress',ctx=>progress(ctx).filter(p=>activeCustomer(p.customer.id)));
 const conversations=original('GET','/api/conversations');on('GET','/api/conversations',ctx=>conversations(ctx).filter(v=>!v.archived_at&&activeCustomer(v.customer_id)));
 const notes=original('GET','/api/customers/:id/notes');on('GET','/api/customers/:id/notes',ctx=>notes(ctx).filter(n=>!n.archived_at));
 const orgDetail=original('GET','/api/organizations/:id');on('GET','/api/organizations/:id',ctx=>{const d=orgDetail(ctx);d.children=d.children.filter(c=>!c.archived_at);return d;});
 const detail=original('GET','/api/customers/:id');on('GET','/api/customers/:id',ctx=>{const d=detail(ctx);for(const kind of ['opportunities','quotes','tasks'])d[kind]=d[kind].filter(r=>!r.archived_at);return d;});
 const timeline=original('GET','/api/customers/:id/timeline');on('GET','/api/customers/:id/timeline',ctx=>{const d=timeline(ctx);d.events.push(...q("SELECT h.*,u.name actor FROM lifecycle_history h LEFT JOIN users u ON u.id=h.user_id WHERE (kind='customers' AND record_id=?) OR (kind='opportunities' AND record_id IN (SELECT CAST(id AS TEXT) FROM opportunities WHERE customer_id=?)) ORDER BY h.id DESC LIMIT 100").all(String(ctx.params.id),ctx.params.id).map(h=>({id:'lifecycle:'+h.id,title:h.title,type:'Quản lý dữ liệu',actor:h.actor,at:h.at})));d.events.sort((a,b)=>Date.parse(b.at)-Date.parse(a.at));d.events=d.events.slice(0,200);return d;});
}
