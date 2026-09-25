export function installCompanyAccess({db,q,on,routes,Err,now,log,company,platform,sessions}){
 const original=(method,path)=>routes.find(r=>r.method===method&&r.path===path).fn;
 const fullAdmin=u=>u?.role==='admin'&&u.admin_level!=='subadmin';
 if(company.code==='ivitech'&&!q("SELECT 1 FROM settings WHERE key='platform_owner'").get()){
  const u=q("SELECT id FROM users WHERE role='admin' AND active=1 ORDER BY id LIMIT 1").get();
  if(u)q('INSERT INTO settings(key,value) VALUES(?,?)').run('platform_owner',String(u.id));
 }
 const owner=u=>!platform.configured()&&!!u&&company.code==='ivitech'&&fullAdmin(u)&&String(u.id)===q("SELECT value FROM settings WHERE key='platform_owner'").get()?.value;
 const me=u=>({id:u.id,name:u.name,role:u.role,team_id:u.team_id,admin_level:u.admin_level,company:platform.get(company.code),platform_owner:false,can_setup_platform:owner(u)});
 const login=original('POST','/api/login');
 on('POST','/api/login',ctx=>{const result=login(ctx),u=q('SELECT * FROM users WHERE id=?').get(result.user.id);return {...result,user:me(u),cookie:[result.cookie,`crm_company=${company.code}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`]};},{open:true});
 on('GET','/api/me',({user})=>me(user));
 on('GET','/api/company',({user})=>({...platform.get(company.code),platform_owner:false,can_setup_platform:owner(user)}));
 const createUser=original('POST','/api/admin/users');
 on('POST','/api/admin/users',ctx=>{
  const sub=ctx.body.role==='subadmin';if(sub&&!fullAdmin(ctx.user))throw new Err(403,'Chỉ admin được tạo subadmin.');
  const result=createUser({...ctx,body:{...ctx.body,role:sub?'admin':ctx.body.role}});
  if(sub)q("UPDATE users SET admin_level='subadmin' WHERE id=?").run(result.id);
  return result;
 });
 on('POST','/api/admin/users/:id/admin-level',({user,params,body})=>{
  if(!fullAdmin(user))throw new Err(403,'Chỉ admin được đổi cấp quản trị.');
  const target=q('SELECT * FROM users WHERE id=?').get(params.id);
  if(!target||target.role!=='admin'||!['admin','subadmin'].includes(body.admin_level))throw new Err(400,'Chọn tài khoản quản trị và cấp hợp lệ.');
  if(target.id===user.id||owner(target))throw new Err(409,'Không tự đổi cấp hoặc đổi cấp chủ nền tảng.');
  q('UPDATE users SET admin_level=? WHERE id=?').run(body.admin_level,target.id);
  for(const [sid,s] of sessions)if(s.id===target.id)sessions.delete(sid);
  log(user.id,'admin_level','user',{id:target.id,level:body.admin_level});return {ok:true};
 });
 function guard(ctx,r){
  const {user,body,params}=ctx;if(!user)return;const p=r.path;
  if(r.method!=='GET'&&p.startsWith('/api/admin/users/')&&params.id){
   const target=q('SELECT * FROM users WHERE id=?').get(params.id);
   if(user.admin_level==='subadmin'&&target?.role==='admin')throw new Err(403,'Subadmin chỉ quản lý người dùng thường.');
   if(owner(target)&&user.id!==target.id)throw new Err(403,'Chỉ chủ nền tảng sửa tài khoản của mình.');
   if(target&&fullAdmin(target)&&body.active===false&&q("SELECT count(*) n FROM users WHERE role='admin' AND admin_level='admin' AND active=1").get().n<=1)throw new Err(409,'Cần giữ ít nhất một admin hoạt động.');
  }
  if(user.role!=='admin'||user.admin_level!=='subadmin')return;
  if(p.startsWith('/api/platform/')||(p.startsWith('/api/integrations/')&&!(r.method==='GET'&&p==='/api/integrations/zalo-oa'))||p==='/api/audit')throw new Err(403,'Mục này dành cho admin.');
  if(r.method==='GET')return;
  if(p==='/api/logout')return;
  if(p.startsWith('/api/admin/users')){
   const target=params.id?q('SELECT * FROM users WHERE id=?').get(params.id):null;
   if(target?.role==='admin'||['admin','subadmin'].includes(body.role)||body.admin_level!==undefined)throw new Err(403,'Subadmin chỉ được quản lý người dùng thường.');return;
  }
  if(/^\/api\/(products|product-categories|templates|template-imports|channel-access)(\/|$)/.test(p))return;
  if(p.startsWith('/api/lifecycle/')&&['products','product-categories','templates'].includes(params.kind))return;
  throw new Err(403,'Subadmin được quản lý danh mục, người dùng thường và phân kênh. Cấu hình công ty/API do admin quản lý.');
 }
 return {guard,canBootstrap:owner};
}
