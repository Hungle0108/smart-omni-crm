import {installApprovalRules} from './approval-rules.js';
import {validatePhone} from './phone-validation.js';
import { randomBytes } from 'node:crypto';
import { installCatalog } from './catalog.js';

export function extendCRM({ db, q, on, Err, bad, now, log, scope, canSeeCustomer, totals, thresholds, hash, sampleData=true, company }) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations(version TEXT PRIMARY KEY, at TEXT);
    CREATE TABLE IF NOT EXISTS notes(id INTEGER PRIMARY KEY,customer_id INTEGER REFERENCES customers(id),body TEXT NOT NULL,user_id INTEGER REFERENCES users(id),at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS knowledge(id INTEGER PRIMARY KEY,title TEXT NOT NULL,keywords TEXT NOT NULL,body TEXT NOT NULL,status TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,approved_body TEXT,approved_keywords TEXT,approved_version INTEGER,author_id INTEGER REFERENCES users(id),reviewer_id INTEGER REFERENCES users(id),updated_at TEXT,review_note TEXT);
    CREATE TABLE IF NOT EXISTS knowledge_history(id INTEGER PRIMARY KEY,knowledge_id INTEGER REFERENCES knowledge(id),version INTEGER,body TEXT,keywords TEXT,action TEXT,user_id INTEGER,at TEXT);
    CREATE TABLE IF NOT EXISTS quote_templates(id TEXT PRIMARY KEY,name TEXT,family TEXT,intro TEXT,terms TEXT,version INTEGER DEFAULT 1);
    CREATE TABLE IF NOT EXISTS quote_history(id INTEGER PRIMARY KEY,quote_id INTEGER REFERENCES quotes(id),action TEXT,user_id INTEGER,at TEXT,content TEXT);
  `);
  const add = (table, name, definition) => { if(!q(`PRAGMA table_info(${table})`).all().some(c=>c.name===name)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`); };
  add('quotes','policy','TEXT'); add('quotes','template_id','TEXT'); add('customers','is_sample','INTEGER NOT NULL DEFAULT 1');
  add('customers','needs_followup','INTEGER NOT NULL DEFAULT 1'); add('customers','do_not_contact','INTEGER NOT NULL DEFAULT 0');
  add('messages','client_key','TEXT'); add('messages','metadata','TEXT');
  add('tasks','kind',"TEXT NOT NULL DEFAULT 'Công việc'"); add('tasks','priority',"TEXT NOT NULL DEFAULT 'Bình thường'"); add('tasks','note',"TEXT NOT NULL DEFAULT ''"); add('tasks','completed_at','TEXT');
  q('INSERT OR IGNORE INTO schema_migrations(version,at) VALUES(?,?)').run('local-journey-v1',now());
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS message_idempotency ON messages(conv_id,client_key) WHERE client_key IS NOT NULL;');
  const set=(key,value)=>q('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key,value===null?null:typeof value==='string'?value:JSON.stringify(value));
  const get=(key,fallback)=>{const v=q('SELECT value FROM settings WHERE key=?').get(key)?.value;try{return v==null?fallback:JSON.parse(v);}catch{return v??fallback;}};
  if(!q('SELECT version FROM schema_migrations WHERE version=?').get('local-v2')) {
    db.exec('BEGIN IMMEDIATE');
    try {
      if(sampleData)q('INSERT OR IGNORE INTO quote_templates VALUES(?,?,?,?,?,1)').run('solution','Smart iVier — giải pháp phần mềm','solution','Giải pháp điều hành số và trợ lý AI theo phạm vi gói dịch vụ lựa chọn.','12 tháng từ ngày nghiệm thu đưa vào sử dụng. Giá chưa gồm thuế GTGT; thuế theo hạng mục sẽ được xác nhận trước ký. Hiệu lực 30 ngày. Gói 3/4 cần khách đã đăng ký Gói 1.');
      if(sampleData)q('INSERT OR IGNORE INTO quote_templates VALUES(?,?,?,?,?,1)').run('training','Đào tạo và chuyển giao AI','training','05 chuyên đề: Tổng quan AI; ChatGPT và prompt; Văn phòng–hành chính; Truyền thông; An toàn thông tin.','12 tháng từ ngày kích hoạt. Số tài khoản theo gói, không đồng nghĩa số học viên. Giá chưa gồm VAT và chi phí đi lại/lưu trú ngoài phạm vi thỏa thuận. Hiệu lực 30 ngày.');
      const author=q("SELECT id FROM users WHERE role='leader' LIMIT 1").get()?.id??null;
      if(sampleData)q('INSERT INTO knowledge(title,keywords,body,status,author_id,updated_at) VALUES(?,?,?,?,?,?)').run('Thời hạn đào tạo AI','đào tạo,thời hạn,kích hoạt,12 tháng','Dịch vụ đào tạo có thời hạn 12 tháng từ ngày kích hoạt. Nhân viên sẽ tư vấn gói phù hợp với nhu cầu của anh/chị.','DRAFT',author,now());
      const c=q("SELECT * FROM customers WHERE kind='person' LIMIT 1").get();
      if(c&&!q("SELECT id FROM conversations WHERE channel LIKE '%cá nhân%'").get()) {
        const id=q('INSERT INTO conversations(customer_id,channel,assignee_id,bot_active,last_at) VALUES(?,?,?,?,?)').run(c.id,'Zalo cá nhân công ty (mô phỏng)',c.owner_id,0,now()).lastInsertRowid;
        q('INSERT INTO messages(conv_id,sender,body,at) VALUES(?,?,?,?)').run(id,'customer','Tôi muốn tìm hiểu thời hạn chương trình đào tạo AI.',now());
      }
      set('brand',{name:sampleData?'CÔNG TY CỔ PHẦN CÔNG NGHỆ IVITECH':company.name,short:sampleData?'iViTech':company.name,address:'',contact:'',color:'#174db8'});
      set('schedule',{days:[1,2,3,4,5],intervals:[['08:00','12:00'],['13:30','17:30']],holidays:[],configured:false});
      set('local_options',{threshold_basis:'net',director_sequential:false});
      q('INSERT INTO schema_migrations VALUES(?,?)').run('local-v2',now());
      db.exec('COMMIT');
    }catch(e){db.exec('ROLLBACK');throw e;}
  }
  const role=(u,...roles)=>{if(!roles.includes(u.role))throw new Err(403,'Vai trò của bạn không được thực hiện thao tác này.');};
  const str=(v,n=2000)=>{if(typeof v!=='string'||!v.trim()||v.length>n)bad(`Nội dung bắt buộc, tối đa ${n} ký tự.`);return v.trim();};
  const number=(v,min=0,max=1e12)=>{if(v===''||v===null||v===undefined||!Number.isFinite(Number(v))||Number(v)<min||Number(v)>max)bad('Số không hợp lệ.');return Number(v);};
  const date=(v)=>{if(!v)return null;if(!/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(v)||Number.isNaN(Date.parse(v)))bad('Ngày không hợp lệ.');return v;};
  const cust=(u,id)=>{const c=q('SELECT * FROM customers WHERE id=?').get(Number(id)||0);if(!canSeeCustomer(u,c))throw new Err(403,'Khách hàng ngoài phạm vi được xem.');return c;};
  const writer=(u,id)=>{role(u,'sales','leader');return cust(u,id);};
  const publicUser=u=>({id:u.id,name:u.name,username:u.username,role:u.role,team_id:u.team_id,expertise:u.expertise,active:u.active,admin_level:u.admin_level});
  const listCustomers=u=>{const s=scope(u);return q(`SELECT * FROM customers WHERE archived_at IS NULL AND (${s.sql})`).all(...s.args);};
  const normalize=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
  const phone=v=>validatePhone(v,bad);
  const usersForTeam=u=>q("SELECT id,name,role,expertise,team_id FROM users WHERE active=1 AND team_id=?").all(u.team_id);
  const taskAllowed=(u,t)=>t&&(['sales','leader'].includes(u.role))&&(t.customer_id?canSeeCustomer(u,q('SELECT * FROM customers WHERE id=?').get(t.customer_id)):(u.role==='sales'?t.assignee_id===u.id:usersForTeam(u).some(x=>x.id===t.assignee_id)));
  const conv=(u,id)=>{const v=q('SELECT * FROM conversations WHERE id=?').get(Number(id)||0);if(!v)throw new Err(404,'Không có hội thoại.');cust(u,v.customer_id);return v;};
  const myConv=(u,id)=>{role(u,'sales','leader');const v=conv(u,id);if(!v.assignee_id)bad('Trưởng nhóm cần giao khách trước khi tiếp nhận.');return v;};
  const message=(id,sender,uid,body,key=null,metadata=null)=>{
    const old=key&&q('SELECT id FROM messages WHERE conv_id=? AND client_key=?').get(id,key);
    if(old)return old.id;
    const mid=q('INSERT INTO messages(conv_id,sender,user_id,body,at,client_key,metadata) VALUES(?,?,?,?,?,?,?)').run(id,sender,uid,body,now(),key,metadata?JSON.stringify(metadata):null).lastInsertRowid;
    q('UPDATE conversations SET last_at=? WHERE id=?').run(now(),id);return mid;
  };
  function inHours(at=now()){
    const sc=get('schedule',{});if(!sc.configured)return null;
    const d=new Date(Date.parse(at)+7*3600000),day=d.getUTCDay(),daystr=d.toISOString().slice(0,10),hm=d.toISOString().slice(11,16);
    return !sc.holidays.includes(daystr)&&sc.days.includes(day)&&sc.intervals.some(([a,b])=>hm>=a&&hm<b);
  }
  // Public data only; deterministic FAQ retrieval, deliberately no generative claims.
  function answer(text){
    const t=normalize(text);
    const unsafe=['giam gia','chiet khau','cam ket','mien phi','thay doi gia'].some(x=>t.includes(x));
    if(unsafe)return {body:'Nhân viên sẽ kiểm tra và phản hồi đề nghị này. Bot không tự giảm giá hoặc thay đổi cam kết.',source:null};
    const matched=q("SELECT * FROM knowledge WHERE approved_body IS NOT NULL AND status!='WITHDRAWN'").all().map(k=>({k,score:k.approved_keywords.split(',').filter(x=>x.trim()&&t.includes(normalize(x.trim()))).length})).sort((a,b)=>b.score-a.score);
    if(!matched[0]?.score)return {body:'Tôi chưa có nội dung đã duyệt phù hợp. Anh/chị vui lòng để lại nhu cầu; nhân viên sẽ tiếp nhận và tư vấn.',source:null};
    const k=matched[0].k;return {body:k.approved_body,source:{id:k.id,title:k.title,version:k.approved_version}};
  }
  function assign(u,c,target){
    role(u,'leader');if(c.team_id!==u.team_id)throw new Err(403,'Khách ngoài nhóm.');
    const existing=c.owner_id&&q('SELECT * FROM users WHERE id=?').get(c.owner_id);
    const to=existing||q("SELECT * FROM users WHERE id=? AND role='sales' AND active=1 AND team_id=?").get(Number(target)||0,u.team_id);
    if(!to||!to.active||to.team_id!==u.team_id)bad('Người phụ trách không còn hoạt động hoặc ngoài nhóm.');
    q('UPDATE customers SET owner_id=? WHERE id=?').run(to.id,c.id);
    q('UPDATE conversations SET assignee_id=? WHERE customer_id=?').run(to.id,c.id);
    q('UPDATE opportunities SET owner_id=? WHERE customer_id=?').run(to.id,c.id);
    log(u.id,'assign','customer',{id:c.id,to:to.id,kept_existing_owner:!!existing});return to;
  }
  on('GET','/api/home',({user})=>{
    const cs=listCustomers(user),ids=new Set(cs.map(c=>c.id));
    const os=q('SELECT * FROM opportunities WHERE archived_at IS NULL').all().filter(o=>ids.has(o.customer_id));
    const ts=q('SELECT * FROM tasks').all().filter(t=>!t.archived_at&&(!t.customer_id||ids.has(t.customer_id))&&taskAllowed(user,t));
    const won=os.filter(o=>o.stage==='Thắng'),lost=os.filter(o=>o.stage==='Thua');
    return {customers:cs.length,open_value:os.filter(o=>!['Thắng','Thua'].includes(o.stage)).reduce((a,o)=>a+o.est_value,0),won:won.length,lost:lost.length,win_rate:won.length+lost.length?Math.round(won.length*100/(won.length+lost.length)):null,won_value:won.reduce((a,o)=>a+o.final_value,0),overdue_tasks:ts.filter(t=>t.status!=='COMPLETED'&&t.due_at&&t.due_at<now()).length,unassigned_conversations:user.role==='leader'?cs.filter(c=>!c.owner_id).length:0,knowledge_pending:['director','leader'].includes(user.role)?q("SELECT count(*) n FROM knowledge WHERE status='PENDING'").get().n:0};
  });
  on('POST','/api/customers',({user,body})=>{
    role(user,'sales','leader');const name=str(body.name,250);if(!['org','person'].includes(body.kind))bad('Loại khách không hợp lệ.');
    const owner=user.role==='sales'?user.id:(body.owner_id?number(body.owner_id,1):null);
    if(owner&&!q("SELECT id FROM users WHERE id=? AND team_id=? AND role='sales' AND active=1").get(owner,user.team_id))bad('Chọn sales trong nhóm.');
    const ph=phone(body.phone),dup=ph?q('SELECT * FROM customers WHERE phone=?').get(ph):null;
    const id=q('INSERT INTO customers(kind,name,tax_code,phone,email,org_type,interest,has_pkg1,owner_id,team_id,created_at,is_sample) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(body.kind,name,String(body.tax_code||'').slice(0,100),ph,String(body.email||'').slice(0,250),body.kind==='org'?String(body.org_type||'Tổ chức').slice(0,100):null,String(body.interest||'').slice(0,150),body.has_pkg1===true?1:0,owner,user.team_id,now(),body.is_sample===false?0:1).lastInsertRowid;
    q('UPDATE customers SET needs_followup=?,do_not_contact=? WHERE id=?').run(body.needs_followup===false?0:1,body.do_not_contact===true?1:0,id);
    log(user.id,'create','customer',{id});return {id,duplicate_warning:dup?(canSeeCustomer(user,dup)?'Trùng số điện thoại với '+dup.name:'Số điện thoại có hồ sơ trùng. Trưởng nhóm cần kiểm tra.'):null};
  });
  on('PUT','/api/customers/:id',({user,params,body})=>{
    const c=writer(user,params.id);const name=str(body.name,250);
    q('UPDATE customers SET name=?,phone=?,email=?,org_type=?,tax_code=?,interest=?,has_pkg1=?,needs_followup=?,do_not_contact=? WHERE id=?').run(name,phone(body.phone),String(body.email||'').slice(0,250),c.kind==='org'?String(body.org_type||'Tổ chức'):null,String(body.tax_code||''),String(body.interest||''),body.has_pkg1===true?1:0,body.needs_followup===false?0:1,body.do_not_contact===true?1:0,c.id);
    log(user.id,'edit','customer',{id:c.id});return {ok:true};
  });
  on('POST','/api/customers/:id/assign',({user,params,body})=>({assigned_to:assign(user,cust(user,params.id),body.user_id).id}));
  on('GET','/api/customers/:id/notes',({user,params})=>{cust(user,params.id);return q('SELECT n.*,u.name user_name FROM notes n LEFT JOIN users u ON u.id=n.user_id WHERE customer_id=? ORDER BY n.id DESC').all(params.id);});
  on('POST','/api/customers/:id/notes',({user,params,body})=>{const c=writer(user,params.id);const id=q('INSERT INTO notes(customer_id,body,user_id,at) VALUES(?,?,?,?)').run(c.id,str(body.body,10000),user.id,now()).lastInsertRowid;log(user.id,'note','customer',{id:c.id});return {id};});
  on('POST','/api/customers/import',({user,body})=>{
    role(user,'leader');if(!Array.isArray(body.rows)||body.rows.length>500)bad('Tệp tối đa 500 dòng.');
    const seen=new Set();const rows=body.rows.map((r,i)=>{
      let ph='',error='';try{ph=phone(r.phone);}catch(e){error=e.message;}
      if(!r.name?.trim()||r.name.length>250)error='Thiếu tên hoặc tên quá dài';
      else if(!['org','person'].includes(r.kind))error='kind cần là org hoặc person';
      else if(ph&&(seen.has(ph)||q('SELECT id FROM customers WHERE phone=?').get(ph)))error='Trùng số điện thoại';
      seen.add(ph);return {line:i+2,name:r.name||'',kind:r.kind,phone:ph,email:String(r.email||'').slice(0,250),interest:String(r.interest||'').slice(0,150),error};
    });
    if(body.commit){if(rows.some(r=>r.error))bad('Cần sửa các dòng lỗi trước khi nhập toàn bộ tệp.');if(body.confirm!==true)bad('Xác nhận danh sách trước khi nhập.');for(const r of rows)q('INSERT INTO customers(kind,name,phone,email,interest,owner_id,team_id,created_at,is_sample) VALUES(?,?,?,?,?,NULL,?,?,?)').run(r.kind,r.name.trim(),r.phone,r.email,r.interest,user.team_id,now(),body.is_sample===false?0:1);log(user.id,'import','customer',{count:rows.length,is_sample:body.is_sample!==false});}
    return {rows,count:rows.length,imported:body.commit?rows.length:0};
  });
  on('POST','/api/opportunities',({user,body})=>{const c=writer(user,body.customer_id);if(!c.owner_id)bad('Hãy phân công khách trước.');const id=q('INSERT INTO opportunities(customer_id,title,stage,est_value,owner_id,expected_close,created_at) VALUES(?,?,?,?,?,?,?)').run(c.id,str(body.title,250),'Mới',number(body.est_value||0),c.owner_id,date(body.expected_close),now()).lastInsertRowid;q('INSERT INTO opp_history(opp_id,to_stage,user_id,at) VALUES(?,?,?,?)').run(id,'Mới',user.id,now());log(user.id,'create','opportunity',{id});return {id};});
  on('GET','/api/tasks',({user})=>q('SELECT t.*,c.name customer_name,u.name assignee_name FROM tasks t LEFT JOIN customers c ON c.id=t.customer_id LEFT JOIN users u ON u.id=t.assignee_id ORDER BY t.due_at').all().filter(t=>taskAllowed(user,t)));
  on('POST','/api/tasks',({user,body})=>{
    role(user,'sales','leader');const c=body.customer_id?cust(user,body.customer_id):null;
    const target=Number(body.assignee_id||c?.owner_id||user.id);const tu=q('SELECT * FROM users WHERE id=? AND active=1').get(target);
    if(!tu||tu.team_id!==user.team_id||(user.role==='sales'&&target!==user.id)||(c&&tu.role==='sales'&&c.owner_id!==target))bad('Người được giao việc phải có quyền với khách hàng.');
    const id=q('INSERT INTO tasks(title,customer_id,assignee_id,due_at,created_at) VALUES(?,?,?,?,?)').run(str(body.title,300),c?.id||null,target,date(body.due_at),now()).lastInsertRowid;const kind=body.kind||'Công việc',priority=body.priority||'Bình thường';if(!['Công việc','Cuộc gọi','Cuộc họp','Demo'].includes(kind)||!['Bình thường','Cao'].includes(priority))bad('Loại công việc hoặc ưu tiên không hợp lệ.');q('UPDATE tasks SET kind=?,priority=?,note=? WHERE id=?').run(kind,priority,String(body.note||'').slice(0,10000),id);log(user.id,'create','task',{id});return {id};
  });
  on('POST','/api/tasks/:id/done',({user,params})=>{const t=q('SELECT * FROM tasks WHERE id=?').get(params.id);if(!taskAllowed(user,t))throw new Err(403,'Công việc ngoài phạm vi.');q("UPDATE tasks SET status='COMPLETED',completed_at=? WHERE id=?").run(now(),t.id);log(user.id,'complete','task',{id:t.id});return {ok:true};});
  on('POST','/api/tasks/:id/reopen',({user,params})=>{const t=q('SELECT * FROM tasks WHERE id=?').get(params.id);if(!taskAllowed(user,t))throw new Err(403,'Công việc ngoài phạm vi.');q("UPDATE tasks SET status='OPEN',completed_at=NULL WHERE id=?").run(t.id);log(user.id,'reopen','task',{id:t.id});return {ok:true};});
  on('PUT','/api/tasks/:id',({user,params,body})=>{
    const task=q('SELECT * FROM tasks WHERE id=?').get(params.id);
    if(!taskAllowed(user,task))throw new Err(403,'Công việc ngoài phạm vi.');
    if(task.archived_at)bad('Khôi phục đầu việc trước khi sửa.');
    if(task.started_at&&body.due_at&&Date.parse(body.due_at)<Date.parse(task.started_at))bad('Hạn hoàn thành phải sau ngày bắt đầu.');
    const kind=body.kind||task.kind,priority=body.priority||task.priority;
    if(!['Công việc','Cuộc gọi','Cuộc họp','Demo'].includes(kind)||!['Bình thường','Cao'].includes(priority))bad('Loại công việc hoặc ưu tiên không hợp lệ.');
    q('UPDATE tasks SET title=?,due_at=?,kind=?,priority=?,note=? WHERE id=?').run(str(body.title,300),date(body.due_at),kind,priority,String(body.note||'').slice(0,10000),task.id);
    log(user.id,'edit','task',{id:task.id});return {ok:true};
  });
  // Customer 360 read model: aggregate meaningful events without duplicating
  // customers or treating every chat message as a business activity.
  on('GET','/api/customers/:id/timeline',({user,params})=>{
    const c=cust(user,params.id);
    const events=[{id:'customer:'+c.id,type:'Khách hàng',title:'Tạo hồ sơ khách hàng',at:c.created_at,href:'#/customer/'+c.id}];
    for(const n of q('SELECT n.*,u.name actor FROM notes n LEFT JOIN users u ON u.id=n.user_id WHERE customer_id=? ORDER BY n.id DESC LIMIT 100').all(c.id))events.push({id:'note:'+n.id,type:'Ghi chú',title:n.body,at:n.at,actor:n.actor});
    for(const h of q('SELECT h.*,o.title,u.name actor FROM opp_history h JOIN opportunities o ON o.id=h.opp_id LEFT JOIN users u ON u.id=h.user_id WHERE o.customer_id=? ORDER BY h.id DESC LIMIT 100').all(c.id))events.push({id:'stage:'+h.id,type:'Cơ hội',title:h.title+' · '+(h.from_stage?h.from_stage+' → ':'')+h.to_stage,detail:h.reason,at:h.at,actor:h.actor,href:'#/opportunity/'+h.opp_id});
    const labels={submit:'Trình duyệt',approve:'Đã duyệt',revise:'Yêu cầu sửa',reject:'Từ chối',send_simulated:'Gửi thử',approval_revoked:'Thu hồi hiệu lực duyệt',new_version:'Tạo phiên bản mới'};
    for(const h of q('SELECT h.*,qt.code,qt.version,u.name actor FROM quote_history h JOIN quotes qt ON qt.id=h.quote_id LEFT JOIN users u ON u.id=h.user_id WHERE qt.customer_id=? ORDER BY h.id DESC LIMIT 100').all(c.id))events.push({id:'quote:'+h.id,type:'Báo giá',title:(labels[h.action]||h.action)+' · '+h.code+' v'+h.version,at:h.at,actor:h.actor,href:'#/quote/'+h.quote_id});
    for(const t of q('SELECT * FROM tasks WHERE customer_id=? ORDER BY id DESC LIMIT 100').all(c.id)){events.push({id:'task:'+t.id,type:t.kind,title:'Lên kế hoạch: '+t.title,detail:t.note,at:t.created_at,href:'#/tasks/'+t.id});if(t.completed_at)events.push({id:'done:'+t.id,type:'Hoàn thành',title:t.title,at:t.completed_at,href:'#/tasks/'+t.id});}
    for(const m of q("SELECT m.*,u.name actor FROM messages m JOIN conversations v ON v.id=m.conv_id LEFT JOIN users u ON u.id=m.user_id WHERE v.customer_id=? AND m.sender='system' ORDER BY m.id DESC LIMIT 100").all(c.id))events.push({id:'handoff:'+m.id,type:'Hội thoại',title:m.body,at:m.at,actor:m.actor,href:'#/conversation/'+m.conv_id});
    return {events:events.sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)||b.id.localeCompare(a.id)).slice(0,200)};
  });
  on('GET','/api/conversations',({user})=>{const s=scope(user,'c.owner_id','c.team_id');return q(`SELECT v.*,c.name customer_name,u.name assignee_name,(SELECT body FROM messages WHERE conv_id=v.id ORDER BY id DESC LIMIT 1) last_body FROM conversations v JOIN customers c ON c.id=v.customer_id LEFT JOIN users u ON u.id=v.assignee_id WHERE ${s.sql} ORDER BY v.last_at DESC`).all(...s.args);});
  on('GET','/api/conversations/:id',({user,params})=>{const v=conv(user,params.id);return {conversation:v,customer:cust(user,v.customer_id),messages:q('SELECT m.*,u.name user_name FROM messages m LEFT JOIN users u ON u.id=m.user_id WHERE conv_id=? ORDER BY m.id').all(v.id),hours:inHours()};});
  on('POST','/api/conversations',({user,body})=>{const c=writer(user,body.customer_id);if(!['oa','personal'].includes(body.channel))bad('Kênh không hợp lệ.');const channel=body.channel==='oa'?'Zalo OA (mô phỏng)':'Zalo cá nhân công ty (mô phỏng)';const old=q('SELECT id,archived_at FROM conversations WHERE customer_id=? AND channel=?').get(c.id,channel);if(old?.archived_at)bad('Hội thoại đã lưu trữ. Khôi phục hội thoại trong mục Đã lưu trữ.');if(old)return old;const id=q('INSERT INTO conversations(customer_id,channel,assignee_id,bot_active,last_at) VALUES(?,?,?,?,?)').run(c.id,channel,c.owner_id,1,now()).lastInsertRowid;log(user.id,'create','conversation',{id});return {id};});
  on('GET','/api/conversations/:id/suggest',({user,params})=>{role(user,'leader');const v=conv(user,params.id),c=cust(user,v.customer_id);if(c.owner_id)return {locked_to:q('SELECT id,name FROM users WHERE id=?').get(c.owner_id),list:[]};const list=q("SELECT u.id,u.name,u.expertise,(SELECT count(*) FROM customers WHERE owner_id=u.id AND needs_followup=1) load FROM users u WHERE role='sales' AND active=1 AND team_id=?").all(user.team_id).map(u=>({...u,expert:u.expertise.split(',').some(e=>normalize(e.trim())===normalize(c.interest))})).sort((a,b)=>Number(b.expert)-Number(a.expert)||a.load-b.load||a.id-b.id);return {list,interest:c.interest};});
  on('POST','/api/conversations/:id/assign',({user,params,body})=>{const v=conv(user,params.id),c=cust(user,v.customer_id);const to=assign(user,c,body.user_id);message(v.id,'system',user.id,`Đã giao cho ${to.name}. Nhân viên bấm Tiếp nhận để dừng bot.`);return {ok:true,assigned_to:to.id};});
  on('POST','/api/conversations/:id/messages',({user,params,body})=>{const v=myConv(user,params.id);if(cust(user,v.customer_id).do_not_contact)bad('Khách được đánh dấu không liên hệ.');if(v.status==='CLOSED')bad('Mở lại hội thoại trước khi trả lời.');q('UPDATE conversations SET bot_active=0 WHERE id=?').run(v.id);const id=message(v.id,'agent',user.id,str(body.body,10000),body.client_key?str(body.client_key,100):null);log(user.id,'reply_simulated','conversation',{id:v.id,message:id});return {id,delivered:false,note:'Tin đã lưu trong CRM ở chế độ thử, chưa gửi tới Zalo.'};});
  on('POST','/api/conversations/:id/bot',({user,params,body})=>{const v=myConv(user,params.id);if(typeof body.on!=='boolean')bad('Trạng thái bot không hợp lệ.');q('UPDATE conversations SET bot_active=? WHERE id=?').run(body.on?1:0,v.id);message(v.id,'system',user.id,body.on?'Đã chuyển lại cho bot.':'Nhân viên tiếp nhận, bot dừng trả lời.');log(user.id,body.on?'return_bot':'takeover','conversation',{id:v.id});return {ok:true};});
  on('POST','/api/conversations/:id/status',({user,params,body})=>{const v=myConv(user,params.id);if(!['OPEN','CLOSED'].includes(body.status))bad('Trạng thái không hợp lệ.');q('UPDATE conversations SET status=? WHERE id=?').run(body.status,v.id);message(v.id,'system',user.id,body.status==='CLOSED'?'Đã đóng hội thoại.':'Đã mở lại hội thoại, giữ trạng thái bàn giao.');return {ok:true};});
  on('POST','/api/conversations/:id/incoming',({user,params,body})=>{role(user,'sales','leader');const v=conv(user,params.id),c=cust(user,v.customer_id),key=str(body.client_key,100);const old=q('SELECT id FROM messages WHERE conv_id=? AND client_key=?').get(v.id,key);if(old)return {id:old.id,duplicate:true};const text=str(body.body,5000);const id=message(v.id,'customer',null,text,key,{simulated:true});q("UPDATE conversations SET status='OPEN' WHERE id=?").run(v.id);let reply=null;if(v.bot_active&&!c.do_not_contact){reply=answer(text);const hours=body.outside_hours===true?false:inHours();if(hours===false)reply.body+=' Nhân viên sẽ liên hệ trong giờ làm việc.';message(v.id,'bot',null,reply.body,'bot:'+key,{source:reply.source,engine:'approved_faq',outside_hours:hours===false});}log(user.id,'simulate_incoming','conversation',{id:v.id});return {id,reply,simulated:true};});
  on('GET','/api/knowledge',({user})=>{if(['leader','director'].includes(user.role))return q('SELECT * FROM knowledge ORDER BY updated_at DESC').all();return q("SELECT id,title,approved_body body,approved_keywords keywords,approved_version version FROM knowledge WHERE approved_body IS NOT NULL AND status!='WITHDRAWN'").all();});
  on('POST','/api/knowledge',({user,body})=>{role(user,'leader');const id=q("INSERT INTO knowledge(title,keywords,body,status,author_id,updated_at) VALUES(?,?,?,'DRAFT',?,?)").run(str(body.title,250),str(body.keywords,500),str(body.body,20000),user.id,now()).lastInsertRowid;log(user.id,'draft','knowledge',{id});return {id};});
  const kh=(k,u,action)=>q('INSERT INTO knowledge_history(knowledge_id,version,body,keywords,action,user_id,at) VALUES(?,?,?,?,?,?,?)').run(k.id,k.version,k.body,k.keywords,action,u.id,now());
  on('GET','/api/knowledge/:id',({user,params})=>{role(user,'leader','director');const k=q('SELECT * FROM knowledge WHERE id=?').get(params.id);if(!k)throw new Err(404,'Không tìm thấy nội dung.');return {...k,history:q('SELECT h.*,u.name user_name FROM knowledge_history h LEFT JOIN users u ON u.id=h.user_id WHERE knowledge_id=? ORDER BY h.id DESC').all(k.id)};});
  on('PUT','/api/knowledge/:id',({user,params,body})=>{role(user,'leader');const k=q('SELECT * FROM knowledge WHERE id=?').get(params.id);if(!k)throw new Err(404,'Không có nội dung.');if(k.status==='PENDING')bad('Nội dung đang chờ duyệt.');if(Number(body.version)!==k.version)throw new Err(409,'Nội dung đã thay đổi. Tải lại trước khi sửa.');kh(k,user,'previous');q("UPDATE knowledge SET title=?,keywords=?,body=?,version=version+1,status='DRAFT',author_id=?,updated_at=? WHERE id=?").run(str(body.title,250),str(body.keywords,500),str(body.body,20000),user.id,now(),k.id);return {ok:true};});
  on('POST','/api/knowledge/:id/submit',({user,params})=>{role(user,'leader');const k=q('SELECT * FROM knowledge WHERE id=?').get(params.id);if(!k||k.status!=='DRAFT')bad('Chỉ gửi duyệt bản nháp.');q("UPDATE knowledge SET status='PENDING',updated_at=? WHERE id=?").run(now(),k.id);kh(k,user,'submit');return {ok:true};});
  on('POST','/api/knowledge/:id/review',({user,params,body})=>{role(user,'director');const k=q('SELECT * FROM knowledge WHERE id=?').get(params.id);if(!k||k.status!=='PENDING')bad('Nội dung không chờ duyệt.');if(!['approve','revise'].includes(body.decision))bad('Chọn duyệt hoặc yêu cầu sửa.');if(body.decision==='approve')q("UPDATE knowledge SET status='APPROVED',approved_body=body,approved_keywords=keywords,approved_version=version,reviewer_id=?,updated_at=?,review_note=NULL WHERE id=?").run(user.id,now(),k.id);else q("UPDATE knowledge SET status='DRAFT',review_note=?,updated_at=? WHERE id=?").run(str(body.note),now(),k.id);kh(k,user,body.decision);log(user.id,body.decision,'knowledge',{id:k.id});return {ok:true};});
  on('POST','/api/knowledge/:id/withdraw',({user,params})=>{role(user,'director');const k=q('SELECT * FROM knowledge WHERE id=?').get(params.id);if(!k)throw new Err(404,'Không có nội dung.');q("UPDATE knowledge SET status='WITHDRAWN',approved_body=NULL,approved_keywords=NULL,updated_at=? WHERE id=?").run(now(),k.id);kh(k,user,'withdraw');return {ok:true};});
  on('POST','/api/bot/preview',({user,body})=>{role(user,'leader','director');const a=answer(str(body.body));if(body.outside_hours===true)a.body+=' Nhân viên sẽ liên hệ trong giờ làm việc.';return {...a,engine:'FAQ đã duyệt; chưa kết nối AI',persisted:false};});
  // Quote route is pinned at submission; later admin edits cannot change a pending approver.
  const its=id=>q('SELECT * FROM quote_items WHERE quote_id=? ORDER BY id').all(id);
  const qt=id=>{const v=q('SELECT * FROM quotes WHERE id=?').get(Number(id)||0);if(!v)throw new Err(404,'Không tìm thấy báo giá.');return v;};
  const routeFor=(quote,items)=>approvalRules.route(quote,items);
  const routePinned=quote=>quote.policy?JSON.parse(quote.policy):routeFor(quote,its(quote.id));
  const canApprove=(u,quote)=>{const c=q('SELECT * FROM customers WHERE id=?').get(quote.customer_id);const r=routePinned(quote);return !r.blocked&&u.id!==quote.owner_id&&(r.level==='director'?u.role==='director':u.role==='leader'&&c?.team_id===u.team_id);};
  const quoteReadable=(u,quote)=>canSeeCustomer(u,q('SELECT * FROM customers WHERE id=?').get(quote.customer_id))||(u.role==='director'&&(quote.status==='PENDING'?canApprove(u,quote):quote.approver_id===u.id));
  const requireQuote=(u,id,write=false)=>{const quote=qt(id);if(write){writer(u,quote.customer_id);}else if(!quoteReadable(u,quote))throw new Err(403,'Báo giá ngoài phạm vi.');return quote;};
  const recordQuote=(quote,u,action,content)=>q('INSERT INTO quote_history(quote_id,action,user_id,at,content) VALUES(?,?,?,?,?)').run(quote.id,action,u.id,now(),JSON.stringify(content||{...quote,items:its(quote.id)}));
  function snapshot(quote,u){const lines=catalog.contentLines(quote,its(quote.id)),t=totals(lines),c=q('SELECT * FROM customers WHERE id=?').get(quote.customer_id);return {code:quote.code,version:quote.version,content_source:quote.content_source,template:catalog.documentTemplate(quote),customer:{id:c.id,name:c.name,kind:c.kind,org_type:c.org_type,address:'',phone:c.phone,email:c.email},brand:get('brand',{}),items:lines,discount_pct:quote.discount_pct,first_year:t.first,net_first_year:Math.round(t.first*(1-quote.discount_pct/100)),renewal:t.renewal,renewal_unknown:t.renewalUnknown,activation_date:quote.activation_date,tax_note:'Giá chưa gồm thuế; thuế suất chưa xác định.',approved_at:now(),approver:u.name};}
  on('GET','/api/quotes',({user})=>q('SELECT qt.*,c.name customer_name,pc.name family_name FROM quotes qt JOIN customers c ON c.id=qt.customer_id LEFT JOIN product_categories pc ON pc.id=qt.template ORDER BY qt.id DESC').all().filter(t=>quoteReadable(user,t)));
  on('GET','/api/quotes/pending',({user})=>q("SELECT qt.*,c.name customer_name,u.name owner_name FROM quotes qt JOIN customers c ON c.id=qt.customer_id LEFT JOIN users u ON u.id=qt.owner_id WHERE status='PENDING'").all().filter(t=>canApprove(user,t)));
  on('GET','/api/quotes/:id',({user,params})=>{const quote=requireQuote(user,params.id),lines=catalog.contentLines(quote,its(quote.id)),t=totals(lines);return {quote,items:lines,catalog:catalog.prices(quote),customer:q('SELECT id,name,kind,has_pkg1 FROM customers WHERE id=?').get(quote.customer_id),totals:t,net_first_year:Math.round(t.first*(1-quote.discount_pct/100)),route:['DRAFT','PENDING'].includes(quote.status)?routePinned(quote):null,can_edit:['sales','leader'].includes(user.role)&&canSeeCustomer(user,q('SELECT * FROM customers WHERE id=?').get(quote.customer_id)),can_approve:quote.status==='PENDING'&&canApprove(user,quote),history:q('SELECT h.id,h.action,h.at,u.name user_name FROM quote_history h LEFT JOIN users u ON u.id=h.user_id WHERE quote_id=? ORDER BY h.id DESC').all(quote.id)};});
  on('POST','/api/quotes',({user,body})=>{const c=writer(user,body.customer_id);const tpl=q('SELECT * FROM quote_templates WHERE id=?').get(body.template_id||body.template);if(!tpl||tpl.archived_at)bad('Chọn mẫu báo giá đang hoạt động.');if(body.opp_id){const o=q('SELECT * FROM opportunities WHERE id=?').get(Number(body.opp_id));if(!o||o.customer_id!==c.id)bad('Cơ hội không thuộc khách hàng.');}const code='BG-'+randomBytes(4).toString('hex').toUpperCase();const id=q('INSERT INTO quotes(code,customer_id,opp_id,template,template_id,owner_id,created_at) VALUES(?,?,?,?,?,?,?)').run(code,c.id,body.opp_id?Number(body.opp_id):null,tpl.family,tpl.id,user.id,now()).lastInsertRowid;const choices=catalog.available(tpl);if(!choices.length)bad('Mẫu chưa có sản phẩm/dịch vụ đang bán. Admin cần bổ sung danh mục cho mẫu.');q("UPDATE quotes SET catalog_snapshot=?,content_source='products' WHERE id=?").run(JSON.stringify(choices),id);log(user.id,'create','quote',{id});return {id};});
  on('PUT','/api/quotes/:id',({user,params,body})=>{
    const quote=requireQuote(user,params.id,true);if(quote.status==='SENT')bad('Bản đã gửi không sửa đè. Tạo phiên bản mới.');
    if(!Array.isArray(body.items)||body.items.length>40)bad('Danh sách hạng mục không hợp lệ.');
    const codes=new Set();const lines=body.items.map(i=>{if(codes.has(i.code))bad('Hạng mục bị trùng.');codes.add(i.code);const p=catalog.prices(quote).find(p=>p.code===i.code);if(!p||p.family!==quote.template)bad('Sản phẩm không thuộc danh mục đã chốt khi lập báo giá.');const qty=number(i.qty??1,1,1000);if(!Number.isInteger(qty))bad('Số lượng phải là số nguyên.');return {...p,qty};});
    const c=cust(user,quote.customer_id);
    if(!c.has_pkg1&&lines.some(i=>i.needs_pkg1))bad(lines.filter(i=>i.needs_pkg1).map(i=>i.name).join(', ')+' cần khách đã đăng ký Gói 1. Chọn Gói 1 trong cùng báo giá chưa phải đã đăng ký.');
    if(codes.has('GFULL')&&['G1','G2','G3','G4'].some(x=>codes.has(x)))bad('Trọn bộ không cộng thêm gói thành phần.');
    if(quote.template==='training'&&lines.length>1)bad('AI 05/10/20 là các phương án lựa chọn; chỉ chọn một phương án.');
    const pct=number(body.discount_pct??0,0,100);const activation=date(body.activation_date);
    if(quote.snapshot||quote.status==='PENDING')recordQuote(quote,user,'approval_revoked');
    q('DELETE FROM quote_items WHERE quote_id=?').run(quote.id);for(const i of lines)q('INSERT INTO quote_items(quote_id,code,name,qty,first_year,renewal,unit,note) VALUES(?,?,?,?,?,?,?,?)').run(quote.id,i.code,i.name,i.qty,i.first_year,i.renewal,i.unit||'Gói',i.note||'');
    q("UPDATE quotes SET discount_pct=?,activation_date=?,status='DRAFT',policy=NULL,approver_id=NULL,approved_at=NULL,snapshot=NULL WHERE id=?").run(pct,activation,quote.id);log(user.id,'edit','quote',{id:quote.id});return {ok:true,approval_revoked:quote.status!=='DRAFT'};
  });
  on('POST','/api/quotes/:id/submit',({user,params})=>{const quote=requireQuote(user,params.id,true);if(quote.status!=='DRAFT')bad('Chỉ gửi duyệt bản nháp.');if(!its(quote.id).length)bad('Chưa có hạng mục.');if(!cust(user,quote.customer_id).has_pkg1&&its(quote.id).some(i=>catalog.prices(quote).find(p=>p.code===i.code)?.needs_pkg1))bad('Khách cần đã đăng ký Gói 1 trước khi trình duyệt gói bán kèm.');const route=routeFor(quote,its(quote.id));if(route.blocked)bad(route.blocked);q("UPDATE quotes SET status='PENDING',policy=?,reject_note=NULL WHERE id=?").run(JSON.stringify(route),quote.id);recordQuote(quote,user,'submit');return {ok:true,level:route.level,reason:route.overAmount?'Vượt ngưỡng tiền':route.overDiscount?'Vượt chiết khấu':route.level==='director'?'Người lập là trưởng nhóm; giám đốc duyệt':'Trong ngưỡng'};});
  on('POST','/api/quotes/:id/approve',({user,params,body})=>{const quote=qt(params.id);if(quote.status!=='PENDING')bad('Báo giá không chờ duyệt.');if(!canApprove(user,quote))throw new Err(403,'Bạn không thuộc cấp duyệt hoặc phạm vi nhóm của báo giá này.');if(!['approve','revise','reject'].includes(body.decision))bad('Quyết định không hợp lệ.');if(body.decision!=='approve'){q("UPDATE quotes SET status='DRAFT',policy=NULL,reject_note=? WHERE id=?").run(str(body.note),quote.id);recordQuote(quote,user,body.decision);return {ok:true,status:'DRAFT'};}const snap=snapshot(quote,user);q("UPDATE quotes SET status='APPROVED',approver_id=?,approved_at=?,snapshot=? WHERE id=?").run(user.id,now(),JSON.stringify(snap),quote.id);recordQuote(quote,user,'approve',snap);return {ok:true,status:'APPROVED'};});
  on('GET','/api/quotes/:id/document',({user,params})=>{const quote=requireQuote(user,params.id);return {draft:!quote.snapshot,document:quote.snapshot?JSON.parse(quote.snapshot):snapshot(quote,user)};});
  on('POST','/api/quotes/:id/send',({user,params,body})=>{const quote=requireQuote(user,params.id,true);if(quote.status==='SENT')return {ok:true,already_sent:true,delivered:false};if(quote.status!=='APPROVED')throw new Err(403,'Chỉ gửi bản đã duyệt.');const c=cust(user,quote.customer_id);if(c.do_not_contact)bad('Khách đang được đánh dấu không liên hệ.');const key=str(body.send_key,100);if(q('SELECT id FROM quotes WHERE send_key=?').get(key))bad('Mã gửi đã dùng cho báo giá khác.');let v;if(body.conv_id){v=conv(user,body.conv_id);if(v.customer_id!==c.id)bad('Người nhận không khớp khách của báo giá.');}else v=q('SELECT * FROM conversations WHERE customer_id=? ORDER BY id LIMIT 1').get(c.id);if(v?.archived_at)bad('Hội thoại đã lưu trữ. Khôi phục hoặc chọn hội thoại đang hoạt động.');if(!v){const id=q('INSERT INTO conversations(customer_id,channel,assignee_id,bot_active,last_at) VALUES(?,?,?,?,?)').run(c.id,'Zalo OA (mô phỏng)',c.owner_id,0,now()).lastInsertRowid;v={id};}q("UPDATE quotes SET status='SENT',sent_at=?,send_key=? WHERE id=?").run(now(),key,quote.id);message(v.id,'agent',user.id,`[GỬI THỬ] Báo giá ${quote.code} phiên bản ${quote.version}.`,'quote:'+key,{quote_id:quote.id,simulated:true});recordQuote(quote,user,'send_simulated');return {ok:true,delivered:false,note:'Đã lưu lần gửi thử và tin trong hộp thư. Chưa gửi tới Zalo thật.'};});
  on('POST','/api/quotes/:id/revise',({user,params})=>{const old=requireQuote(user,params.id,true);const version=q('SELECT MAX(version) n FROM quotes WHERE code=?').get(old.code).n+1;const id=q('INSERT INTO quotes(code,version,parent_id,customer_id,opp_id,template,template_id,discount_pct,activation_date,owner_id,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(old.code,version,old.id,old.customer_id,old.opp_id,old.template,old.template_id,old.discount_pct,old.activation_date,user.id,now()).lastInsertRowid;for(const i of its(old.id))q('INSERT INTO quote_items(quote_id,code,name,qty,first_year,renewal,unit,note) VALUES(?,?,?,?,?,?,?,?)').run(id,i.code,i.name,i.qty,i.first_year,i.renewal,i.unit||'Gói',i.note||'');q('UPDATE quotes SET catalog_snapshot=?,content_source=?,legacy_template_content=? WHERE id=?').run(old.catalog_snapshot,old.content_source,old.legacy_template_content,id);recordQuote(old,user,'new_version',{id,version});return {id,version};});
  on('GET','/api/templates',()=>({templates:q('SELECT * FROM quote_templates').all(),brand:get('brand',{})}));
  on('PUT','/api/templates/:id',({user,params,body})=>{role(user,'admin');const family=body.family;if(!['solution','training'].includes(family))bad('Loại mẫu không hợp lệ.');const id=params.id;const existing=q('SELECT family FROM quote_templates WHERE id=?').get(id);if(existing&&existing.family!==family)bad('Không đổi loại dịch vụ của mẫu đã có; hãy tạo mẫu mới.');if(!/^[a-z0-9_-]{1,40}$/.test(id))bad('Mã mẫu chỉ gồm chữ thường, số, gạch nối.');q('INSERT INTO quote_templates(id,name,family,intro,terms) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,intro=excluded.intro,terms=excluded.terms,version=quote_templates.version+1').run(id,str(body.name,200),family,str(body.intro,5000),str(body.terms,10000));log(user.id,'template','settings',{id});return {ok:true};});
  on('PUT','/api/brand',({user,body})=>{role(user,'admin');if(!/^#[0-9a-f]{6}$/i.test(body.color))bad('Màu cần ở định dạng #RRGGBB.');set('brand',{name:str(body.name,250),short:str(body.short,80),address:String(body.address||'').slice(0,500),contact:String(body.contact||'').slice(0,500),color:body.color});log(user.id,'brand','settings');return {ok:true};});
  on('GET','/api/settings',()=>({...thresholds(),work_hours:get('work_hours',''),schedule:get('schedule',{}),options:get('local_options',{}),mode:'local-simulated',in_hours:inHours()}));
  on('PUT','/api/settings',({user,body})=>{role(user,'admin');if(['amount','discount','threshold_basis'].some(k=>k in body))bad('Ngưỡng duyệt đã chuyển sang Mẫu & nhận diện; trưởng nhóm thiết lập theo loại/sản phẩm.');if(body.work_hours!==undefined)set('work_hours',String(body.work_hours).slice(0,500));if(body.schedule){const sc=body.schedule;if(!Array.isArray(sc.days)||sc.days.some(d=>!Number.isInteger(d)||d<0||d>6)||!Array.isArray(sc.intervals)||sc.intervals.length>8||!Array.isArray(sc.holidays)||sc.holidays.length>100)bad('Lịch không hợp lệ.');const validTime=x=>/^([01]\d|2[0-3]):[0-5]\d$/.test(x);for(const row of sc.intervals)if(!Array.isArray(row)||row.length!==2||!validTime(row[0])||!validTime(row[1])||row[0]>=row[1])bad('Khung giờ không hợp lệ.');sc.holidays.forEach(d=>date(d));set('schedule',{days:sc.days,intervals:sc.intervals,holidays:sc.holidays,configured:true});}log(user.id,'settings','system');return {ok:true};});
  on('GET','/api/users',({user})=>usersForTeam(user));
  on('GET','/api/admin/users',({user})=>{role(user,'admin');return q('SELECT * FROM users ORDER BY id').all().map(publicUser);});
  on('PUT','/api/admin/users/:id',({user,params,body})=>{role(user,'admin');const u=q('SELECT * FROM users WHERE id=?').get(params.id);if(!u)bad('Không có người dùng.');if(u.id===user.id&&body.active===false)bad('Không tự vô hiệu hóa tài khoản đang dùng.');q('UPDATE users SET name=?,expertise=?,active=? WHERE id=?').run(str(body.name,150),String(body.expertise||'').slice(0,300),body.active===false?0:1,u.id);if(body.password){const pw=str(body.password,200);if(pw.length<8)bad('Mật khẩu mới tối thiểu 8 ký tự.');const salt=randomBytes(16).toString('hex');q('UPDATE users SET salt=?,pwd=? WHERE id=?').run(salt,hash(pw,salt),u.id);}log(user.id,'update_user','user',{id:u.id});return {ok:true};});
  on('GET','/api/audit',({user})=>{role(user,'admin');return q('SELECT a.*,u.name user_name FROM audit a LEFT JOIN users u ON u.id=a.user_id ORDER BY a.id DESC LIMIT 200').all();});
  on('GET','/api/capabilities',()=>({local:['CRM và phân quyền','Cơ hội và lịch sử','Công việc','Báo giá, duyệt, bản in và phiên bản','Mẫu báo giá và nhận diện','Kho nội dung, duyệt và FAQ','Cấu hình giờ làm việc','Nhập danh sách có xem trước'],external:[{name:'Zalo OA',status:'Chưa kết nối'},{name:'Zalo cá nhân',status:'Chưa kiểm chứng giải pháp kết nối'},{name:'AI tạo sinh / Copilot',status:'Chưa cấu hình nhà cung cấp'}]}));
  const catalog=installCatalog({sampleData,db,q,on,bad,role,str,number,now,log,get,set,add});
  const approvalRules=installApprovalRules({db,q,on,role,bad,number,now,log,get,thresholds,totals});
  return {role,cust,myConv,conv,message,answer,inHours};
}

