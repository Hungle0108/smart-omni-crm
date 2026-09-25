// A read model over existing domains. Only interaction outcomes are new records.
export function installCustomer360({db,q,on,routes,Err,now,helpers}) {
 const route=(method,path)=>routes.find(r=>r.method===method&&r.path===path).fn;
 for(const table of ['tasks','opportunities'])for(const [name,type] of [['contact_id','INTEGER REFERENCES contacts(id)'],...(table==='tasks'?[['opp_id','INTEGER REFERENCES opportunities(id)']]:[])])if(!q(`PRAGMA table_info(${table})`).all().some(c=>c.name===name))db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${type}`);
 db.exec(`CREATE TABLE IF NOT EXISTS customer_interactions(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL REFERENCES customers(id),contact_id INTEGER REFERENCES contacts(id),opp_id INTEGER REFERENCES opportunities(id),kind TEXT NOT NULL,body TEXT NOT NULL,outcome TEXT NOT NULL,user_id INTEGER NOT NULL REFERENCES users(id),at TEXT NOT NULL); CREATE INDEX IF NOT EXISTS interactions_customer ON customer_interactions(customer_id,at);`);
 q('INSERT OR IGNORE INTO schema_migrations(version,at) VALUES(?,?)').run('customer-360-v1',now());
 const context=(u,cid,b)=>{
  const c=helpers.cust(u,cid);if(c.archived_at)throw new Err(409,'Khôi phục khách trước khi thao tác.');
  const contact=b.contact_id?Number(b.contact_id):null,opp=b.opp_id?Number(b.opp_id):null;
  if(contact&&!q('SELECT 1 FROM contacts WHERE id=? AND organization_id=? AND detached_at IS NULL AND archived_at IS NULL').get(contact,c.id))throw new Err(400,'Người liên hệ không còn thuộc tổ chức này.');
  if(opp&&!q('SELECT 1 FROM opportunities WHERE id=? AND customer_id=? AND archived_at IS NULL').get(opp,c.id))throw new Err(400,'Cơ hội không thuộc khách hàng này hoặc đã lưu trữ.');
  return {contact,opp,c};
 };
 // Validate links before the underlying write so failures remain atomic.
 for(const [table,path] of [['tasks','/api/tasks'],['opportunities','/api/opportunities']]){
  const original=route('POST',path);on('POST',path,ctx=>{
   if(!ctx.body.customer_id){if(ctx.body.contact_id||ctx.body.opp_id)throw new Err(400,'Cần khách hàng để liên kết hoạt động.');return original(ctx);}
   const link=context(ctx.user,ctx.body.customer_id,ctx.body),result=original(ctx);
   q(`UPDATE ${table} SET contact_id=?${table==='tasks'?',opp_id=?':''} WHERE id=?`).run(...(table==='tasks'?[link.contact,link.opp,result.id]:[link.contact,result.id]));return result;
  });
 }
 const text=(v,max)=>{if(typeof v!=='string'||!v.trim()||v.length>max)throw new Err(400,'Nhập nội dung hợp lệ, tối đa '+max+' ký tự.');return v.trim();};
 if(!q('PRAGMA table_info(tasks)').all().some(c=>c.name==='creation_key'))db.exec('ALTER TABLE tasks ADD COLUMN creation_key TEXT');
 db.exec('CREATE UNIQUE INDEX IF NOT EXISTS task_creation_request ON tasks(creation_key) WHERE creation_key IS NOT NULL');
 const createTask=route('POST','/api/tasks');
 on('POST','/api/tasks',ctx=>{const b=ctx.body,key=b.request_key?text(b.request_key,100):null;
  helpers.role(ctx.user,'sales','leader');if(b.customer_id)context(ctx.user,b.customer_id,b);
  if(key){const prior=q('SELECT * FROM tasks WHERE creation_key=?').get(key);if(prior){if(!route('GET','/api/tasks')(ctx).some(t=>t.id===prior.id)||Number(prior.customer_id)!==Number(b.customer_id)||prior.title!==b.title||Number(prior.opp_id)!==Number(b.opp_id))throw new Err(409,'Yêu cầu tạo kế hoạch đã dùng.');return {id:prior.id,duplicate:true};}}
  const result=createTask(ctx);if(key)q('UPDATE tasks SET creation_key=? WHERE id=?').run(key,result.id);return result;
 });
 const createChild=route('POST','/api/customers/:id/work-items');
 on('POST','/api/customers/:id/work-items',ctx=>{const b=ctx.body,link=context(ctx.user,ctx.params.id,b),key=b.request_key?text(b.request_key,100):null;
  if(key){const prior=q('SELECT * FROM tasks WHERE creation_key=?').get(key);if(prior){if(prior.customer_id!==link.c.id||prior.title!==b.title)throw new Err(409,'Yêu cầu tạo đã dùng.');return {id:prior.id,duplicate:true};}}
  if(b.kind&&!['Công việc','Cuộc gọi','Cuộc họp','Demo'].includes(b.kind))throw new Err(400,'Loại tiếp xúc không hợp lệ.');
  const result=createChild(ctx);q('UPDATE tasks SET contact_id=?,opp_id=?,kind=?,creation_key=? WHERE id=?').run(link.contact,link.opp,b.kind||'Công việc',key,result.id);return result;
 });
 const applyTemplate=route('POST','/api/customers/:id/apply-work-template');
 on('POST','/api/customers/:id/apply-work-template',ctx=>{const link=context(ctx.user,ctx.params.id,ctx.body),last=q('SELECT coalesce(max(id),0) id FROM tasks').get().id,result=applyTemplate(ctx);if(!result.duplicate)q('UPDATE tasks SET contact_id=?,opp_id=? WHERE customer_id=? AND id>?').run(link.contact,link.opp,link.c.id,last);return result;});
 on('POST','/api/customers/:id/interactions',ctx=>{
  helpers.role(ctx.user,'sales','leader');const {contact,opp,c}=context(ctx.user,ctx.params.id,ctx.body),b=ctx.body;
  if(!['Cuộc gọi','Cuộc gặp','Trao đổi','Tóm tắt hội thoại'].includes(b.kind))throw new Err(400,'Loại trao đổi không hợp lệ.');
  const id=q('INSERT INTO customer_interactions(customer_id,contact_id,opp_id,kind,body,outcome,user_id,at) VALUES(?,?,?,?,?,?,?,?)').run(c.id,contact,opp,b.kind,text(b.body,10000),text(b.outcome,2000),ctx.user.id,now()).lastInsertRowid;return {id};
 });
 const customer=route('GET','/api/customers/:id'),tasks=route('GET','/api/tasks'),opps=route('GET','/api/opportunities'),quotes=route('GET','/api/quotes'),notes=route('GET','/api/customers/:id/notes'),conversations=route('GET','/api/conversations'),channels=route('GET','/api/channel-access/effective');
 const editCustomer=route('PUT','/api/customers/:id');
 on('PUT','/api/customers/:id',ctx=>{const before=helpers.cust(ctx.user,ctx.params.id),result=editCustomer(ctx),after=helpers.cust(ctx.user,ctx.params.id);if(before.interest!==after.interest)q('INSERT INTO audit(user_id,action,entity,detail,at) VALUES(?,?,?,?,?)').run(ctx.user.id,'needs_update','customer',JSON.stringify({id:after.id,from:before.interest,to:after.interest}),now());return result;});
 // Outcomes live on the existing task history; the journey only reads them.
 for(const name of ['outcome','feedback','next_step','request_key'])if(!q('PRAGMA table_info(task_updates)').all().some(c=>c.name===name))db.exec(`ALTER TABLE task_updates ADD COLUMN ${name} TEXT`);
 db.exec('CREATE UNIQUE INDEX IF NOT EXISTS task_result_request ON task_updates(request_key) WHERE request_key IS NOT NULL');
 q('INSERT OR IGNORE INTO schema_migrations(version,at) VALUES(?,?)').run('contact-plan-result-v1',now());
 const allowedTask=ctx=>{helpers.role(ctx.user,'sales','leader');const t=tasks(ctx).find(t=>t.id===Number(ctx.params.id));if(!t)throw new Err(403,'Công việc ngoài phạm vi hoặc đã lưu trữ.');return t;};
 on('GET','/api/tasks/:id/plan',ctx=>{helpers.role(ctx.user,'sales','leader');let t=tasks(ctx).find(t=>t.id===Number(ctx.params.id));if(!t){const archived=q('SELECT t.*,c.name customer_name,u.name assignee_name FROM tasks t LEFT JOIN customers c ON c.id=t.customer_id LEFT JOIN users u ON u.id=t.assignee_id WHERE t.id=? AND t.archived_at IS NOT NULL').get(Number(ctx.params.id));if(!archived?.customer_id)throw new Err(403,'Công việc ngoài phạm vi.');helpers.cust(ctx.user,archived.customer_id);t=archived;}return {task:t,updates:q('SELECT h.*,u.name actor FROM task_updates h LEFT JOIN users u ON u.id=h.user_id WHERE task_id=? ORDER BY h.id DESC').all(t.id),children:tasks(ctx).filter(x=>x.parent_id===t.id)};});
 const editTask=route('PUT','/api/tasks/:id'),editWork=route('PUT','/api/work-items/:id'),finish=route('POST','/api/tasks/:id/done');
 on('PUT','/api/tasks/:id',ctx=>{const t=allowedTask(ctx),b=ctx.body;
  const link=t.customer_id?context(ctx.user,t.customer_id,{contact_id:b.contact_id===undefined?t.contact_id:b.contact_id,opp_id:b.opp_id===undefined?t.opp_id:b.opp_id}):{contact:null,opp:null};
  if(!t.customer_id&&(b.contact_id||b.opp_id))throw new Err(400,'Việc nội bộ không gắn cơ hội khách hàng.');
  const result=editTask(ctx);
  if(t.customer_id)editWork({...ctx,body:{...t,...b,started_at:b.started_at===undefined?t.started_at:b.started_at}});
  else if(b.assignee_id!==undefined&&Number(b.assignee_id)!==Number(t.assignee_id))throw new Err(400,'Chỉ đổi người phụ trách cho kế hoạch khách hàng.');
  q('UPDATE tasks SET contact_id=?,opp_id=? WHERE id=?').run(link.contact,link.opp,t.id);return result;
 });
 on('POST','/api/tasks/:id/complete-contact',ctx=>{const t=allowedTask(ctx),b=ctx.body,key=text(b.request_key,100),outcome=text(b.outcome,2000),feedback=String(b.feedback||'').trim(),next=String(b.next_step||'').trim();
  if(feedback.length>4000||next.length>2000)throw new Err(400,'Nội dung phản hồi hoặc bước tiếp theo quá dài.');
  const prior=q('SELECT * FROM task_updates WHERE request_key=?').get(key);
  if(prior){if(prior.task_id!==t.id||prior.user_id!==ctx.user.id||prior.outcome!==outcome||prior.feedback!==feedback||prior.next_step!==next)throw new Err(409,'Mã lưu kết quả đã được sử dụng.');return {id:prior.id,duplicate:true};}
  if(t.status==='COMPLETED')throw new Err(409,'Công việc đã hoàn thành. Mở lại nếu cần thực hiện tiếp.');
  finish(ctx);
  const id=q('INSERT INTO task_updates(task_id,user_id,body,at,outcome,feedback,next_step,request_key) VALUES(?,?,?,?,?,?,?,?)').run(t.id,ctx.user.id,'Kết quả tiếp xúc: '+outcome,now(),outcome,feedback,next,key).lastInsertRowid;
  return {id};
 });
 on('GET','/api/customers/:id/360',ctx=>{
  helpers.role(ctx.user,'sales','leader');const c=customer(ctx).customer,cid=c.id;
  const ts=tasks(ctx).filter(t=>t.customer_id===cid),os=opps(ctx).filter(o=>o.customer_id===cid),qs=quotes(ctx).filter(o=>o.customer_id===cid),ns=notes(ctx),cs=conversations(ctx).filter(v=>v.customer_id===cid);
  const people=q('SELECT * FROM contacts WHERE organization_id=? AND archived_at IS NULL AND detached_at IS NULL ORDER BY is_primary DESC,full_name').all(cid);
  const interactions=q('SELECT i.*,u.name actor FROM customer_interactions i LEFT JOIN users u ON u.id=i.user_id WHERE customer_id=? ORDER BY i.id DESC').all(cid);
  // Never expose a contact that has since moved outside this organization.
  const personIds=new Set(people.map(p=>p.id)),oppIds=new Set(os.map(o=>o.id));
  const links=r=>({contact_id:personIds.has(r.contact_id)?r.contact_id:null,opp_id:oppIds.has(r.opp_id)?r.opp_id:null});
  const actorFor=(entity,id)=>q("SELECT u.name FROM audit a LEFT JOIN users u ON u.id=a.user_id WHERE a.entity=? AND a.action='create' AND CAST(json_extract(a.detail,'$.id') AS INTEGER)=? ORDER BY a.id LIMIT 1").get(entity,id)?.name||null;
  const events=[{id:'customer:'+cid,type:'Khách hàng',title:'Tiếp nhận hồ sơ khách hàng',at:c.created_at,href:'#/customer/'+cid,actor:actorFor('customer',cid)}];
  for(const h of q("SELECT a.*,u.name actor FROM audit a LEFT JOIN users u ON u.id=a.user_id WHERE entity='customer' AND action='edit' AND CAST(json_extract(detail,'$.id') AS INTEGER)=?").all(cid))events.push({id:'audit:'+h.id,type:'Khách hàng',title:'Cập nhật thông tin khách hàng',at:h.at,actor:h.actor,href:'#/customer/'+cid});
  for(const h of q("SELECT a.*,u.name actor FROM audit a LEFT JOIN users u ON u.id=a.user_id WHERE entity='customer' AND action='needs_update' AND CAST(json_extract(detail,'$.id') AS INTEGER)=?").all(cid)){const d=JSON.parse(h.detail);events.push({id:'audit:'+h.id,type:'Nhu cầu',milestone:true,title:'Cập nhật nhu cầu: '+(d.to||'Chưa ghi nhận'),detail:'Trước đó: '+(d.from||'Chưa ghi nhận'),at:h.at,actor:h.actor,href:'#/customer/'+cid});}
  for(const i of interactions)events.push({id:'interaction:'+i.id,type:i.kind,title:i.body,detail:'Kết quả: '+i.outcome,at:i.at,actor:i.actor,...links(i),href:'#/customer/'+cid});
  for(const n of ns)events.push({id:'note:'+n.id,type:'Ghi chú',title:n.body,actor:n.user_name,at:n.at,href:'#/customer/'+cid});
  const historyTasks=[...ts,...q('SELECT * FROM tasks WHERE customer_id=? AND archived_at IS NOT NULL').all(cid)];
  for(const t of historyTasks){
   const updates=q('SELECT h.*,u.name actor FROM task_updates h LEFT JOIN users u ON u.id=h.user_id WHERE task_id=? ORDER BY h.id').all(t.id);
   if(!updates.some(h=>h.body==='Tạo đầu việc.'))events.push({id:'task:'+t.id,type:'Công việc',title:'Tạo công việc: '+t.title,at:t.created_at,actor:actorFor('task',t.id),...links(t),href:'#/tasks/'+t.id});
   for(const h of updates)events.push({id:'work:'+h.id,type:h.outcome?'Kết quả tiếp xúc':'Công việc',milestone:!!h.outcome,title:t.title+' · '+(h.outcome||h.body),detail:h.outcome?[h.feedback&&'Phản hồi: '+h.feedback,h.next_step&&'Bước tiếp theo: '+h.next_step].filter(Boolean).join('\n'):null,at:h.at,actor:h.actor,...links(t),href:'#/tasks/'+t.id});
   for(const h of q("SELECT a.*,u.name actor FROM audit a LEFT JOIN users u ON u.id=a.user_id WHERE entity='task' AND action='edit' AND CAST(json_extract(detail,'$.id') AS INTEGER)=?").all(t.id))events.push({id:'audit:'+h.id,type:'Công việc',title:'Sửa nội dung/thời hạn: '+t.title,at:h.at,actor:h.actor,...links(t),href:'#/tasks/'+t.id});
  }
  for(const o of os)for(const h of q('SELECT h.*,u.name actor FROM opp_history h LEFT JOIN users u ON u.id=h.user_id WHERE opp_id=?').all(o.id))events.push({id:'stage:'+h.id,type:'Cơ hội',title:o.title+' · '+(h.from_stage?h.from_stage+' → ':'Tạo cơ hội · ')+h.to_stage,detail:h.reason,at:h.at,actor:h.actor,contact_id:personIds.has(o.contact_id)?o.contact_id:null,opp_id:o.id,href:'#/opportunity/'+o.id});
  const labels={approval_revoked:'Thu hồi hiệu lực duyệt',withdraw:'Thu hồi',edit:'Chỉnh sửa',version:'Tạo phiên bản',send:'Gửi thử',submit:'Trình duyệt',approve:'Duyệt',revise:'Yêu cầu sửa',reject:'Từ chối',send_simulated:'Gửi mô phỏng',send_zalo:'Gửi Zalo',new_version:'Tạo phiên bản'};
  for(const quote of qs){const quoteOpp=os.find(o=>o.id===quote.opp_id);const link={opp_id:oppIds.has(quote.opp_id)?quote.opp_id:null,contact_id:personIds.has(quoteOpp?.contact_id)?quoteOpp.contact_id:null};events.push({id:'quote-created:'+quote.id,type:'Báo giá',title:'Tạo '+quote.code,actor:actorFor('quote',quote.id)||q('SELECT name FROM users WHERE id=?').get(quote.owner_id)?.name||null,at:quote.created_at,href:'#/quote/'+quote.id,...link});for(const h of q('SELECT h.*,u.name actor FROM quote_history h LEFT JOIN users u ON u.id=h.user_id WHERE quote_id=?').all(quote.id))events.push({id:'quote:'+h.id,type:'Báo giá',title:(labels[h.action]||h.action)+' · '+quote.code,at:h.at,actor:h.actor,href:'#/quote/'+quote.id,...link});}
  for(const v of cs)for(const m of q("SELECT m.*,u.name actor FROM messages m LEFT JOIN users u ON u.id=m.user_id WHERE conv_id=? AND sender='system'").all(v.id))events.push({id:'message-system:'+m.id,type:'Hội thoại',title:m.body,at:m.at,actor:m.actor,href:'#/conversation/'+v.id});
  for(const h of q('SELECT h.*,u.name actor FROM organization_history h LEFT JOIN users u ON u.id=h.user_id WHERE organization_id=?').all(cid))events.push({id:'org:'+h.id,type:'Khách hàng',title:h.title,at:h.at,actor:h.actor,href:'#/customer/'+cid});
  const unique=[...new Map(events.filter(e=>e.at).map(e=>[e.id,e])).values()].sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)||b.id.localeCompare(a.id));
  const safe=r=>({...r,...links(r)});
  const milestones=unique.filter(e=>e.milestone||e.id.startsWith('interaction:')||e.id.startsWith('stage:')||e.id.startsWith('quote:')&&q('SELECT action FROM quote_history WHERE id=?').get(Number(e.id.split(':')[1]))?.action.startsWith('send_'));
  return {customer:{...c,team_name:q('SELECT name FROM teams WHERE id=?').get(c.team_id)?.name||''},contacts:people,tasks:ts.map(safe),opportunities:os.map(o=>({...o,contact_id:personIds.has(o.contact_id)?o.contact_id:null})),quotes:qs,notes:ns,conversations:cs,events:unique,milestones,channels:channels(ctx).channels,capabilities:{write:!c.archived_at,contracts:false,payments:false,attachments:false},last_interaction:[...interactions.map(i=>i.at),...cs.map(v=>v.last_at)].filter(Boolean).sort().at(-1)||null};
 });
}

