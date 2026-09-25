import {createCipheriv,createDecipheriv,randomBytes,createHash} from 'node:crypto';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {isIP} from 'node:net';
import {CHANNEL_PROVIDERS,channelProvider,ChannelCheckError} from './channel-providers.js';

export function installChannelConnections({db,q,on,Err,now,log,keyPath,provider=channelProvider()}){
 db.exec(`CREATE TABLE IF NOT EXISTS channel_connections(id INTEGER PRIMARY KEY,name TEXT NOT NULL COLLATE NOCASE UNIQUE,provider TEXT NOT NULL,kind TEXT NOT NULL,team_id INTEGER NOT NULL,config TEXT NOT NULL,identity_key TEXT UNIQUE,revision INTEGER NOT NULL DEFAULT 1,paused INTEGER NOT NULL DEFAULT 0,archived_at TEXT,archive_reason TEXT NOT NULL DEFAULT '',verified_at TEXT,checked_at TEXT,check_result TEXT,issue TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS channel_connection_history(id INTEGER PRIMARY KEY,channel_id INTEGER NOT NULL,user_id INTEGER NOT NULL,action TEXT NOT NULL,at TEXT NOT NULL,detail TEXT NOT NULL);`);
 q('INSERT OR IGNORE INTO schema_migrations VALUES(?,?)').run('channel-connections-v1',now());
 let key;const checking=new Set();
 const fail=(message,code=400)=>{throw new Err(code,message);},admin=u=>{if(u.role!=='admin')fail('Chỉ admin được quản lý cấu hình API kênh kết nối.',403);};
 const definition=id=>CHANNEL_PROVIDERS.find(p=>p.id===id);
 function getKey(){if(key)return key;if(existsSync(keyPath))key=readFileSync(keyPath);else{if(q('SELECT 1 FROM channel_connections LIMIT 1').get())fail('Thiếu khóa bảo vệ kênh. Khôi phục từ bản sao lưu.',503);key=randomBytes(32);writeFileSync(keyPath,key,{flag:'wx',mode:0o600});}if(key.length!==32)fail('Khóa bảo vệ kênh không hợp lệ.',503);return key;}
 function seal(config){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',getKey(),iv),data=Buffer.concat([cipher.update(JSON.stringify(config),'utf8'),cipher.final()]);return JSON.stringify({iv:iv.toString('base64'),data:data.toString('base64'),tag:cipher.getAuthTag().toString('base64')});}
 function open(row){try{const data=JSON.parse(row.config),dec=createDecipheriv('aes-256-gcm',getKey(),Buffer.from(data.iv,'base64'));dec.setAuthTag(Buffer.from(data.tag,'base64'));return JSON.parse(Buffer.concat([dec.update(Buffer.from(data.data,'base64')),dec.final()]).toString('utf8'));}catch{fail('Không mở được cấu hình kênh. Kiểm tra khóa bảo vệ từ bản sao lưu.',503);}}
 const row=id=>{const r=q('SELECT * FROM channel_connections WHERE id=?').get(id);if(!r)fail('Không tìm thấy kênh kết nối.',404);return r;};
 const text=(v,max,required=false)=>{if(typeof v!=='string'||v.length>max||/[\x00-\x08\x0b-\x1f]/.test(v)||required&&!v.trim())fail('Nội dung không hợp lệ; tối đa '+max+' ký tự.');return v.trim();};
 const history=(u,r,action,detail={})=>{q('INSERT INTO channel_connection_history(channel_id,user_id,action,at,detail) VALUES(?,?,?,?,?)').run(r.id,u.id,action,now(),JSON.stringify(detail));log(u.id,action,'channel_connection',{id:r.id,provider:r.provider});};
 function validateField(f,value){
  const v=text(value,f.secret?8192:1000);if(!v)return v;
  if(f.secret&&/[\r\n]/.test(v))fail('Mã API phải nằm trên một dòng.');
  if(f.choices&&!f.choices.some(([value])=>value===v))fail('Chọn giá trị hợp lệ cho '+f.label+'.');
  if(f.format==='ip'&&!isIP(v))fail('Địa chỉ IP không hợp lệ.');
  if(f.format==='host'&&!isIP(v)&&!(/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(v)))fail('Nhập IP hoặc tên miền SIP, không gồm http://, mật khẩu hay đường dẫn.');
  if(f.format==='port'&&(!/^\d{1,5}$/.test(v)||Number(v)<1||Number(v)>65535))fail('Cổng SIP cần từ 1 đến 65535.');
  if(f.format==='sip_phone'&&!/^\+?\d{3,20}$/.test(v))fail('Đầu số SIP chỉ gồm chữ số, có thể bắt đầu bằng +.');
  if(f.format==='digits'&&!/^\d{1,40}$/.test(v))fail(f.label+' chỉ gồm chữ số.');
  if(f.format==='version'&&!/^v\d{1,3}\.0$/.test(v))fail('Phiên bản Graph API có dạng v24.0; dùng phiên bản của ứng dụng Meta.');
  if(f.format==='sid'&&!/^AC[a-f0-9]{32}$/i.test(v))fail('Account SID bắt đầu bằng AC và 32 ký tự mã.');
  if(f.format==='phone'&&!/^\+[1-9]\d{6,14}$/.test(v))fail('Số tổng đài cần mã quốc gia, ví dụ +84..., không có khoảng trắng.');
  if(f.format==='url'){try{const url=new URL(v);if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw Error();}catch{fail('Địa chỉ API / tài liệu phải là HTTPS, không chứa mật khẩu hoặc tham số bí mật.');}}
  return v;
 }
 const missing=(p,c)=>{const list=p.fields.filter(f=>f.required&&!c[f.key]).map(f=>f.label);if(p.id==='vnpt_sip'){if(c.auth_mode==='ip'&&!c.allowed_ip)list.push('IP tổng đài đăng ký với VNPT');if(c.auth_mode==='registration'){if(!c.sip_username)list.push('Tên tài khoản SIP');if(!c.sip_password)list.push('Mật khẩu SIP');}}return list;};
 function present(r,user){const p=definition(r.provider),c=open(r),need=missing(p,c),state=r.archived_at?'ARCHIVED':r.paused?'PAUSED':r.issue?'ERROR':r.verified_at?'VERIFIED':need.length?'DRAFT':'CONFIGURED';
  const result={id:r.id,name:r.name,kind:r.kind,provider:r.provider,provider_name:p.name,team_id:r.team_id,team_name:q('SELECT name FROM teams WHERE id=?').get(r.team_id)?.name||'',state,can_check:p.check,verified_at:r.verified_at,checked_at:r.checked_at,messaging_available:false,archived_at:r.archived_at,archive_reason:r.archive_reason,updated_at:r.updated_at};
  if(user.role==='admin'&&user.admin_level!=='subadmin')Object.assign(result,{revision:r.revision,missing:need,issue:r.issue||'',account:JSON.parse(r.check_result||'null'),config:Object.fromEntries(p.fields.filter(f=>!f.secret).map(f=>[f.key,c[f.key]||''])),has_secrets:Object.fromEntries(p.fields.filter(f=>f.secret).map(f=>[f.key,!!c[f.key]]))});return result;
 }
 const canSee=(u,r)=>['admin','director'].includes(u.role)||r.team_id===u.team_id;
 on('GET','/api/channel-connections',({user,url})=>{const archived=url.searchParams.get('archived')==='1';if(archived)admin(user);return {channels:q('SELECT * FROM channel_connections ORDER BY id DESC').all().filter(r=>canSee(user,r)&&!!r.archived_at===archived).map(r=>present(r,user)),providers:user.role==='admin'?CHANNEL_PROVIDERS:[],teams:user.role==='admin'?q('SELECT id,name FROM teams WHERE archived_at IS NULL ORDER BY name').all():[]};});
 on('GET','/api/channel-connections/:id',({user,params})=>{admin(user);const r=row(params.id);return {...present(r,user),history:q('SELECT h.action,h.at,h.detail,u.name user_name FROM channel_connection_history h JOIN users u ON u.id=h.user_id WHERE channel_id=? ORDER BY h.id DESC LIMIT 40').all(r.id)};});
 function save(ctx,existing){const {user,body}=ctx;admin(user);if(existing?.archived_at)fail('Khôi phục kênh trước khi sửa.',409);if(existing&&checking.has(existing.id))fail('Đang kiểm tra API. Hãy chờ kết quả trước khi sửa.',409);if(existing&&body.revision!==existing.revision)fail('Cấu hình đã đổi ở cửa sổ khác. Mở lại để cập nhật.',409);
  const p=definition(existing?.provider||body.provider);if(!p)fail('Chọn nhà cung cấp được hỗ trợ.');if(existing&&body.provider&&body.provider!==existing.provider)fail('Tạo kênh mới để đổi nhà cung cấp.');
  const name=text(body.name,150,true),team=Number(body.team_id);if(!Number.isInteger(team)||!q('SELECT 1 FROM teams WHERE id=? AND archived_at IS NULL').get(team))fail('Chọn nhóm đang hoạt động.');
  if(q('SELECT id FROM channel_connections WHERE name=? AND id<>?').get(name,existing?.id||0))fail('Tên kênh đã có, kể cả kênh lưu trữ. Dùng tên khác hoặc khôi phục.');
  if(!body.config||typeof body.config!=='object'||Array.isArray(body.config)||Object.keys(body.config).some(k=>!p.fields.some(f=>f.key===k)))fail('Trường cấu hình không thuộc nhà cung cấp.');
  const clear=body.clear_secrets||[];if(!Array.isArray(clear)||clear.some(k=>!p.fields.some(f=>f.key===k&&f.secret)))fail('Danh sách xóa mã API không hợp lệ.');
  const config=existing?open(existing):{};
  for(const f of p.fields){if(clear.includes(f.key))config[f.key]='';if(body.config[f.key]!==undefined){const value=validateField(f,body.config[f.key]);if(!f.secret||value)config[f.key]=value;}}
  const identity={meta_messenger:config.page_id,meta_whatsapp:config.phone_number_id,viber_bot:config.bot_id,twilio_voice:config.account_sid}[p.id];
  const identityKey=identity?createHash('sha256').update(p.id+':'+identity).digest('hex'):null;
  if(identityKey&&q('SELECT id FROM channel_connections WHERE identity_key=? AND id<>?').get(identityKey,existing?.id||0))fail('Tài khoản này đã có cấu hình. Sửa hoặc khôi phục kênh đã có.');
  const encrypted=seal(config);let id;
  if(existing){id=existing.id;q('UPDATE channel_connections SET name=?,team_id=?,config=?,identity_key=?,revision=revision+1,verified_at=NULL,checked_at=NULL,check_result=NULL,issue=NULL,updated_at=? WHERE id=?').run(name,team,encrypted,identityKey,now(),id);}
  else id=Number(q('INSERT INTO channel_connections(name,provider,kind,team_id,config,identity_key,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').run(name,p.id,p.kind,team,encrypted,identityKey,now(),now()).lastInsertRowid);
  const r=row(id);history(user,r,existing?'edit':'create',{changed_fields:Object.keys(body.config),cleared_fields:clear});return present(r,user);
 }
 on('POST','/api/channel-connections',ctx=>save(ctx));
 on('PUT','/api/channel-connections/:id',ctx=>{admin(ctx.user);return save(ctx,row(ctx.params.id));});
 on('POST','/api/channel-connections/:id/check',async({user,params})=>{
  admin(user);const r=row(params.id),p=definition(r.provider);if(r.archived_at||r.paused)fail('Khôi phục hoặc tiếp tục cấu hình trước khi kiểm tra.',409);if(checking.has(r.id))fail('Kênh đang được kiểm tra.',409);if(!p.check)fail('Đã hỗ trợ lưu cấu hình; cần tài liệu và bộ kết nối riêng để kiểm tra API này.',409);
  const config=open(r),need=missing(p,config);if(need.length)fail('Cần bổ sung: '+need.join(', '));checking.add(r.id);
  try{
   const account=await provider.check(p.id,config);
   // The account check never changes subscriptions, sends messages or makes calls.
   const current=row(r.id);if(current.revision!==r.revision||current.archived_at||current.paused)fail('Cấu hình đã thay đổi; hãy kiểm tra lại.',409);
   q('UPDATE channel_connections SET verified_at=?,checked_at=?,check_result=?,issue=NULL WHERE id=?').run(now(),now(),JSON.stringify(account),r.id);history(user,r,'check_ok');return {ok:true,note:'Đã xác minh tài khoản API. Nhận/gửi tin và gọi điện trong CRM chưa được bật cho kênh này.',channel:present(row(r.id),user)};
  }catch(e){const message=e instanceof ChannelCheckError?e.message:'Không kiểm tra được API. Kiểm tra cấu hình và thử lại.';q('UPDATE channel_connections SET verified_at=NULL,checked_at=?,check_result=NULL,issue=? WHERE id=? AND revision=?').run(now(),message,r.id,r.revision);history(user,r,'check_failed');throw new Err(502,message);}finally{checking.delete(r.id);}
 },{async:true});
 on('POST','/api/channel-connections/:id/state',({user,params,body})=>{
  admin(user);const r=row(params.id);if(checking.has(r.id))fail('Đang kiểm tra API; vui lòng chờ.',409);if(!['pause','resume','archive','restore'].includes(body.action))fail('Thao tác không hợp lệ.');
  if(['pause','resume'].includes(body.action)&&r.archived_at)fail('Khôi phục kênh trước.',409);
  if(body.action==='archive'){const reason=text(body.reason,500,true);q('UPDATE channel_connections SET archived_at=?,archive_reason=?,paused=1,verified_at=NULL,check_result=NULL,revision=revision+1 WHERE id=?').run(now(),reason,r.id);}
  if(body.action==='restore'){if(!r.archived_at)fail('Kênh chưa lưu trữ.');if(!q('SELECT 1 FROM teams WHERE id=? AND archived_at IS NULL').get(r.team_id))fail('Khôi phục nhóm phụ trách trước.');q("UPDATE channel_connections SET archived_at=NULL,archive_reason='',paused=1,verified_at=NULL,issue=NULL,revision=revision+1 WHERE id=?").run(r.id);}
  if(['pause','resume'].includes(body.action))q('UPDATE channel_connections SET paused=?,verified_at=NULL,check_result=NULL,issue=NULL,revision=revision+1 WHERE id=?').run(body.action==='pause'?1:0,r.id);
  q('UPDATE channel_connections SET updated_at=? WHERE id=?').run(now(),r.id);history(user,r,body.action);return present(row(r.id),user);
 });
 // Public connection state, shared with the permission screen; never includes config or secrets.
 return {accessDefinitions:()=>q('SELECT * FROM channel_connections WHERE archived_at IS NULL').all().map(r=>present(r,{}))};
}
