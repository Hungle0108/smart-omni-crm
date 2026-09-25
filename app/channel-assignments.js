// Assignment adds a channel permission; it never expands the existing customer scope.
export function installChannelAssignments({db,q,on,routes,Err,now,log,helpers,oaStatus=()=>({}),connectionDefinitions=()=>[]}){
 db.exec(`CREATE TABLE IF NOT EXISTS channel_access(channel_key TEXT PRIMARY KEY,mode TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 1,updated_by INTEGER,updated_at TEXT);
 CREATE TABLE IF NOT EXISTS channel_members(channel_key TEXT NOT NULL,user_id INTEGER NOT NULL REFERENCES users(id),permission TEXT NOT NULL,PRIMARY KEY(channel_key,user_id));`);
 const admin=u=>{if(u.role!=='admin')throw new Err(403,'Chỉ admin/subadmin được phân kênh.');};
 const keyFor=v=>v.zalo_oa_id||!String(v.channel).includes('cá nhân')?'oa':'personal';
 const definitions=()=>{const s=oaStatus();return [{key:'oa',name:s.name?'Zalo OA · '+s.name:'Zalo OA',kind:'Zalo OA',technical_status:s.issue?'Kết nối OA có lỗi':s.enabled?'Đã bật nhận/gửi OA':s.configured?'OA đang dừng':'Chưa kết nối OA thật',note:'Bao gồm hội thoại OA mô phỏng; bản hiện tại có một kết nối OA.'},{key:'personal',name:'Zalo cá nhân công ty',kind:'Zalo cá nhân',technical_status:'Mô phỏng'},...connectionDefinitions().map(c=>({key:'connection:'+c.id,name:c.name,kind:c.kind,team_id:c.team_id,technical_status:({PAUSED:'Đang tạm dừng',ERROR:'Cấu hình có lỗi',VERIFIED:'Đã kiểm tra tài khoản API',DRAFT:'Chưa đủ cấu hình',CONFIGURED:'Đã cấu hình · chưa xác minh'})[c.state]||c.state,note:'Chưa có bộ nhận/gửi trong CRM.'}))];};
 const eligible=(u,d)=>!!u?.active&&['sales','leader'].includes(u.role)&&!!q('SELECT 1 FROM teams WHERE id=? AND archived_at IS NULL').get(u.team_id||0)&&(!d.team_id||d.team_id===u.team_id);
 const allowed=(u,key,write=false)=>{
  const definition=['oa','personal'].includes(key)?{}:/^connection:\d+$/.test(key)?q('SELECT team_id FROM channel_connections WHERE id=? AND archived_at IS NULL').get(Number(key.split(':')[1])):null;
  if(!definition||!eligible(u,definition))return false;
  const rule=q('SELECT mode FROM channel_access WHERE channel_key=?').get(key);
  if(!rule||rule.mode==='team')return true;
  const member=q('SELECT permission FROM channel_members WHERE channel_key=? AND user_id=?').get(key,u.id);
  return !!member&&(!write||member.permission==='send');
 };
 helpers.canSendChannelMessage=(id,v)=>{const user=q('SELECT * FROM users WHERE id=? AND active=1').get(id),c=q('SELECT * FROM customers WHERE id=?').get(v.customer_id);return !!user&&!!c&&!c.archived_at&&!v.archived_at&&(user.role==='sales'?c.owner_id===user.id:user.role==='leader'&&c.team_id===user.team_id)&&allowed(user,keyFor(v),true);};
 const requireAccess=(u,key,write=false)=>{if(!allowed(u,key,write))throw new Err(403,write?'Bạn chưa được cấp quyền thao tác/gửi trên kênh này.':'Bạn chưa được cấp quyền xem kênh này.');};
 const getDefinition=key=>{const d=definitions().find(c=>c.key===key);if(!d)throw new Err(404,'Không có kênh đang hoạt động này.');return d;};
 const users=()=>q('SELECT u.id,u.name,u.username,u.role,u.team_id,u.active,t.name team_name FROM users u LEFT JOIN teams t ON t.id=u.team_id ORDER BY u.name,u.id').all();
 const members=key=>q('SELECT user_id,permission FROM channel_members WHERE channel_key=? ORDER BY user_id').all(key);
 const present=d=>({...d,...(q('SELECT mode,revision,updated_at FROM channel_access WHERE channel_key=?').get(d.key)||{mode:'team',revision:0}),group_note:d.team_id?'Nhóm phụ trách: '+(q('SELECT name FROM teams WHERE id=? AND archived_at IS NULL').get(d.team_id)?.name||'Nhóm không còn hoạt động'):'Theo nhóm đang hoạt động của từng người và phạm vi khách được giao.',members:members(d.key).map(m=>{const u=q('SELECT id,name,username,role,team_id,active FROM users WHERE id=?').get(m.user_id);return {...m,name:u?.name||'Người dùng không còn tồn tại',active:!!u?.active,effective:eligible(u,d)};})});
 on('GET','/api/channel-access',({user})=>{admin(user);return {channels:definitions().map(present)};});
 on('GET','/api/channel-access/effective',({user,url})=>{
  const id=Number(url.searchParams.get('conversation_id')),v=id?q('SELECT * FROM conversations WHERE id=?').get(id):null;
  let access=null;if(id){access='none';try{helpers.conv(user,id);const customer=v&&q('SELECT archived_at FROM customers WHERE id=?').get(v.customer_id);if(v&&!v.archived_at&&customer&&!customer.archived_at&&allowed(user,keyFor(v)))access=allowed(user,keyFor(v),true)?'send':'read';}catch{}}
  return {channels:definitions().filter(d=>allowed(user,d.key)).map(d=>({key:d.key,permission:allowed(user,d.key,true)?'send':'read'})),conversation_access:access};
 });
 on('GET','/api/channel-access/:id',({user,params})=>{
  admin(user);const d=getDefinition(params.id),people=users();
  const assigned=q("SELECT assignee_id,count(*) count FROM conversations WHERE archived_at IS NULL AND status='OPEN' AND assignee_id IS NOT NULL AND "+(d.key==='oa'?"(zalo_oa_id IS NOT NULL OR channel NOT LIKE '%cá nhân%')":d.key==='personal'?"zalo_oa_id IS NULL AND channel LIKE '%cá nhân%'":"0=1")+' GROUP BY assignee_id').all();
  const history=q("SELECT a.at,a.detail,u.name actor FROM audit a LEFT JOIN users u ON u.id=a.user_id WHERE a.action='assign_channel' AND json_extract(a.detail,'$.key')=? ORDER BY a.id DESC LIMIT 20").all(d.key).map(h=>({...h,detail:JSON.parse(h.detail)}));
  return {channel:present(d),teams:q('SELECT id,name FROM teams WHERE archived_at IS NULL ORDER BY name').all(),effective_users:people.filter(u=>allowed(u,d.key)).map(u=>({id:u.id,name:u.name,permission:allowed(u,d.key,true)?'send':'read'})),inherited_users:people.filter(u=>eligible(u,d)).map(u=>({id:u.id,name:u.name})),assigned_counts:assigned,history};
 });
 on('GET','/api/channel-access/:id/users',({user,params,url})=>{
  admin(user);const d=getDefinition(params.id),term=String(url.searchParams.get('q')||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d'),team=Number(url.searchParams.get('team'));
  const selected=new Set(String(url.searchParams.get('selected_ids')||'').split(',').map(Number));
  const list=users().filter(u=>(!team||u.team_id===team)&&(!url.searchParams.has('selected_only')||selected.has(u.id))&&[u.name,u.username].join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').includes(term));
  const size=10,pages=Math.max(1,Math.ceil(list.length/size)),page=Math.min(pages,Math.max(1,Math.floor(Number(url.searchParams.get('page')))||1));
  return {items:list.slice((page-1)*size,page*size).map(u=>({...u,eligible:eligible(u,d),reason:!u.active?'Đã khóa · không có quyền hiệu lực':!['sales','leader'].includes(u.role)?'Vai trò chưa có quyền sử dụng hộp thư':!eligible(u,d)?'Không thuộc nhóm đang hoạt động của kênh':'Có quyền xem và trả lời theo vai trò'})),page,pages,total:list.length};
 });
 on('PUT','/api/channel-access/:id',({user,params,body})=>{
  admin(user);const key=params.id,definition=definitions().find(c=>c.key===key);if(!definition)throw new Err(404,'Không có kênh đang hoạt động này.');
  const old=q('SELECT * FROM channel_access WHERE channel_key=?').get(key);
  if(body.revision!==(old?.revision||0))throw new Err(409,'Phân quyền đã thay đổi. Mở lại trước khi lưu.');
  if(!['team','selected'].includes(body.mode)||!Array.isArray(body.members)||body.members.length>1000)throw new Err(400,'Phạm vi hoặc danh sách không hợp lệ.');
  const previous=members(key),next=body.mode==='selected'?body.members:[];
  const ids=new Set();for(const m of next){const u=q('SELECT * FROM users WHERE id=?').get(Number(m?.user_id)||0),retained=previous.some(p=>p.user_id===m?.user_id&&p.permission===m.permission);if(!Number.isInteger(m?.user_id)||ids.has(m.user_id)||!['read','send'].includes(m.permission)||!u||(!eligible(u,definition)&&!retained))throw new Err(400,'Chọn người đang hoạt động, đủ quyền hộp thư và đúng nhóm của kênh.');ids.add(m.user_id);}
  q('INSERT INTO channel_access(channel_key,mode,updated_by,updated_at) VALUES(?,?,?,?) ON CONFLICT(channel_key) DO UPDATE SET mode=excluded.mode,revision=channel_access.revision+1,updated_by=excluded.updated_by,updated_at=excluded.updated_at').run(key,body.mode,user.id,now());
  q('DELETE FROM channel_members WHERE channel_key=?').run(key);
  for(const m of next)q('INSERT INTO channel_members VALUES(?,?,?)').run(key,m.user_id,m.permission);
  log(user.id,'assign_channel','channel',{key,old_mode:old?.mode||'team',mode:body.mode,revision:(old?.revision||0)+1,added:next.filter(m=>!previous.some(p=>p.user_id===m.user_id)),removed:previous.filter(p=>!next.some(m=>m.user_id===p.user_id)),changed:next.filter(m=>previous.some(p=>p.user_id===m.user_id&&p.permission!==m.permission)),members:next});return {ok:true};
 });
 // Wrap every conversation endpoint, including real OA send, retry, takeover and bot.
 for(const r of routes){
  const original=r.fn;
  if(r.path==='/api/home'&&r.method==='GET')r.fn=ctx=>{const result=original(ctx);result.unassigned_conversations=ctx.user.role==='leader'?q("SELECT v.* FROM conversations v JOIN customers c ON c.id=v.customer_id WHERE v.archived_at IS NULL AND c.archived_at IS NULL AND v.assignee_id IS NULL AND v.status='OPEN' AND c.team_id=?").all(ctx.user.team_id).filter(v=>allowed(ctx.user,keyFor(v))).length:0;return result;};
  if(r.path.startsWith('/api/lifecycle/:kind'))r.fn=ctx=>{if(ctx.params.kind!=='conversations')return original(ctx);if(ctx.params.id){const c=q('SELECT * FROM conversations WHERE id=?').get(ctx.params.id);if(c)requireAccess(ctx.user,keyFor(c),r.method!=='GET');return original(ctx);}return original(ctx).filter(item=>{const c=q('SELECT * FROM conversations WHERE id=?').get(item.id);return !c||allowed(ctx.user,keyFor(c));});};
  if(r.path.startsWith('/api/conversations/:id'))r.fn=ctx=>{const c=q('SELECT * FROM conversations WHERE id=?').get(ctx.params.id);if(c)requireAccess(ctx.user,keyFor(c),r.method!=='GET');const result=original(ctx);if(r.method==='GET'&&r.path==='/api/conversations/:id')result.channel_permission=allowed(ctx.user,keyFor(c),true)?'send':'read';return result;};
  if(r.path==='/api/conversations'&&r.method==='GET')r.fn=ctx=>original(ctx).filter(c=>allowed(ctx.user,keyFor(c)));
  if(r.path==='/api/conversations'&&r.method==='POST')r.fn=ctx=>{requireAccess(ctx.user,ctx.body.channel,true);return original(ctx);};
  if(r.path==='/api/quotes/:id/send')r.fn=ctx=>{const quote=q('SELECT customer_id FROM quotes WHERE id=?').get(ctx.params.id);const cs=ctx.body.conv_id?q('SELECT * FROM conversations WHERE id=?').all(ctx.body.conv_id):quote?q('SELECT * FROM conversations WHERE customer_id=? AND archived_at IS NULL').all(quote.customer_id):[];for(const c of cs)requireAccess(ctx.user,keyFor(c),true);return original(ctx);};
  if(r.path==='/api/channel-connections'&&r.method==='GET')r.fn=ctx=>{const d=original(ctx);if(!['admin','director'].includes(ctx.user.role))d.channels=d.channels.filter(c=>allowed(ctx.user,'connection:'+c.id));return d;};
  if(r.path==='/api/customers/:id/timeline'&&r.method==='GET')r.fn=ctx=>{const d=original(ctx);d.events=d.events.filter(e=>{const id=/^#\/conversation\/(\d+)$/.exec(e.href||'')?.[1],c=id?q('SELECT * FROM conversations WHERE id=?').get(id):null;return !c||allowed(ctx.user,keyFor(c));});return d;};
  if(r.path==='/api/customers/:id'&&r.method==='GET')r.fn=ctx=>{const d=original(ctx);if(d.conversations)d.conversations=d.conversations.filter(c=>allowed(ctx.user,keyFor(c)));return d;};
 }
}
