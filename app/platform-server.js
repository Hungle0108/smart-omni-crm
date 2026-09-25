import {randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

// Platform identities and sessions are separate from all CRM company databases.
export function installPlatform({registry,platform,dir,bootstrapUser}){
 registry.exec(`CREATE TABLE IF NOT EXISTS platform_users(id INTEGER PRIMARY KEY,username TEXT NOT NULL UNIQUE COLLATE NOCASE,name TEXT NOT NULL,salt TEXT NOT NULL,pwd TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL);`);
 const q=sql=>registry.prepare(sql),now=()=>new Date().toISOString(),sessions=new Map(),failures=new Map();
 const configured=()=>!!q('SELECT 1 FROM platform_users LIMIT 1').get();
 const fail=(code,msg)=>{const e=new Error(msg);e.code=code;throw e;};
 const text=(v,max)=>{if(typeof v!=='string'||!v.trim()||v.length>max)fail(400,'Điền đủ thông tin, trong độ dài cho phép.');return v.trim();};
 const hash=(pw,salt)=>scryptSync(pw,salt,32).toString('hex');
 const validPassword=(value,u)=>typeof value==='string'&&value.length<=200&&timingSafeEqual(Buffer.from(hash(value,u?.salt||'not-found'),'hex'),Buffer.from(u?.pwd||hash('missing','not-found'),'hex'));
 const publicUser=u=>({id:u.id,username:u.username,name:u.name,role:'superadmin'});
 function authenticate(req){const sid=/(?:^|;\s*)platform_sid=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie||'')?.[1],s=sessions.get(sid);if(!s)return null;const u=q('SELECT * FROM platform_users WHERE id=? AND active=1').get(s.id);if(!u||s.expires<Date.now()||s.pwd!==u.pwd){sessions.delete(sid);return null;}return u;}
 function session(u){const sid=randomBytes(32).toString('hex');sessions.set(sid,{id:u.id,pwd:u.pwd,expires:Date.now()+8*3600000});return {user:publicUser(u),cookie:`platform_sid=${sid}; HttpOnly; SameSite=Strict; Path=/api/platform; Max-Age=28800`};}
 function attempt(req){const key=req.socket.remoteAddress||'local',f=failures.get(key);if(f?.until>Date.now()&&f.count>=20)fail(429,'Đăng nhập sai quá nhiều lần. Thử lại sau 10 phút.');return key;}
 function failed(key){const f=failures.get(key);failures.set(key,{count:f?.until>Date.now()?f.count+1:1,until:f?.until>Date.now()?f.until:Date.now()+600000});}
 const history=(actor,action,company='')=>q('INSERT INTO platform_history(actor,action,company,at) VALUES(?,?,?,?)').run(actor,action,company,now());
 async function handler(req,res){
  try{
   const host=req.headers.host||'';if(!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host))fail(403,'Chỉ phục vụ localhost.');
   if(req.headers.origin&&req.headers.origin!==`http://${host}`)fail(403,'Nguồn yêu cầu không hợp lệ.');
   res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','no-referrer');
   res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; form-action 'self'");
   const path=new URL(req.url,'http://localhost').pathname;
   const staticFiles={'/platform':'platform.html','/platform/':'platform.html','/platform-ui.js':'platform-ui.js','/platform.css':'platform.css'};
   if(staticFiles[path]){if(req.method!=='GET')fail(405,'Chỉ đọc trang.');res.setHeader('Content-Type',path.endsWith('.js')?'application/javascript; charset=utf-8':path.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8');return res.end(readFileSync(join(dir,staticFiles[path])));}
   let body={};if(req.method!=='GET'){
    if(!String(req.headers['content-type']||'').startsWith('application/json'))fail(415,'Cần nội dung JSON.');
    let raw='',size=0;for await(const c of req){size+=c.length;if(size>65536)fail(413,'Thông tin quá lớn.');raw+=c;}
    try{body=JSON.parse(raw||'{}');}catch{fail(400,'JSON không hợp lệ.');}if(!body||typeof body!=='object'||Array.isArray(body))fail(400,'Thông tin không hợp lệ.');
   }
   let result,user=authenticate(req);
   if(path==='/api/platform/status'&&req.method==='GET')result={configured:configured(),can_bootstrap:!configured()&&!!bootstrapUser(req)};
   else if(path==='/api/platform/bootstrap'&&req.method==='POST'){
    if(configured())fail(409,'Super Admin đã được khởi tạo. Hãy đăng nhập.');
    const key=attempt(req),owner=bootstrapUser(req);if(!owner)fail(403,'Đăng nhập bằng tài khoản chủ nền tảng iViTech hiện có để khởi tạo.');
    if(!validPassword(body.current_password,owner)){failed(key);fail(401,'Mật khẩu admin hiện tại không đúng.');}
    const username=text(body.username,60).toLowerCase(),name=text(body.name,150),password=body.password;
    if(!/^[a-z0-9._-]{3,60}$/.test(username)||typeof password!=='string'||password.length<12||password.length>200||!password.trim())fail(400,'Tên đăng nhập từ 3 ký tự không dấu; mật khẩu Super Admin ít nhất 12 ký tự.');
    if(password!==body.confirm_password)fail(400,'Hai lần nhập mật khẩu mới chưa khớp.');
    const salt=randomBytes(16).toString('hex');
    registry.exec('BEGIN IMMEDIATE');try{if(configured())fail(409,'Tài khoản đã được khởi tạo ở cửa sổ khác.');const id=Number(q('INSERT INTO platform_users(username,name,salt,pwd,created_at) VALUES(?,?,?,?,?)').run(username,name,salt,hash(password,salt),now()).lastInsertRowid);history(id,'bootstrap_superadmin');registry.exec('COMMIT');result=session(q('SELECT * FROM platform_users WHERE id=?').get(id));}catch(e){if(registry.isTransaction)registry.exec('ROLLBACK');throw e;}
    failures.delete(key);
   }else if(path==='/api/platform/login'&&req.method==='POST'){
    const key=attempt(req),u=q('SELECT * FROM platform_users WHERE username=? COLLATE NOCASE AND active=1').get(String(body.username||'').trim());
    if(!validPassword(body.password,u)||!u){failed(key);fail(401,'Sai tài khoản hoặc mật khẩu Super Admin.');}failures.delete(key);result=session(u);history(u.id,'platform_login');
   }else if(path==='/api/platform/logout'&&req.method==='POST'){
    const sid=/(?:^|;\s*)platform_sid=([a-f0-9]+)/.exec(req.headers.cookie||'')?.[1];sessions.delete(sid);result={ok:true,cookie:'platform_sid=; HttpOnly; SameSite=Strict; Path=/api/platform; Max-Age=0'};
   }else{
    if(!user)fail(403,'Cần đăng nhập Super Admin riêng. Tài khoản admin công ty không có quyền này.');
    if(path==='/api/platform/me'&&req.method==='GET')result=publicUser(user);
    else if(path==='/api/platform/companies'&&req.method==='GET')result=platform.list();
    else if(path==='/api/platform/companies'&&req.method==='POST')result=platform.create(body,user.id);
    else if(/^\/api\/platform\/companies\/[a-z0-9-]+\/state$/.test(path)&&req.method==='POST')result=platform.state(path.split('/')[4],body.state,user.id);
    else if(path==='/api/platform/history'&&req.method==='GET')result=q('SELECT id,actor,action,company,at FROM platform_history ORDER BY id DESC LIMIT 200').all();
    else fail(404,'Không có chức năng này.');
   }
   if(result.cookie){res.setHeader('Set-Cookie',result.cookie);delete result.cookie;}res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(result));
  }catch(e){const status=Number.isInteger(e.code)&&e.code>=400&&e.code<600?e.code:500;if(status===500)console.error(e);res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify({error:status===500?'Không xử lý được thao tác quản trị nền tảng.':e.message}));}
 }
 return {handler,configured,close:()=>sessions.clear()};
}
