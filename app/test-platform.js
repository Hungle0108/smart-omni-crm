import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const dir=dirname(fileURLToPath(import.meta.url)),out=join(dir,'test-output');mkdirSync(out,{recursive:true});
const db=join(out,`platform-${Date.now()}.db`),url='http://127.0.0.1:4026',cookies={},checks=[];let child;
async function start(){child=spawn(process.execPath,[join(dir,'server.js')],{env:{...process.env,PORT:'4026',CRM_DB:db,CRM_ZALO_WEBHOOK_PORT:'0'},stdio:['ignore','pipe','pipe']});let log='';child.stderr.on('data',b=>log+=b);await new Promise((ok,no)=>{const timeout=setTimeout(()=>no(Error(log)),10000);child.once('error',no);child.once('exit',()=>{clearTimeout(timeout);no(Error(log));});child.stdout.once('data',()=>{clearTimeout(timeout);ok();});});}
async function stop(){if(child&&!child.killed){const end=new Promise(r=>child.once('exit',r));child.kill();await end;}}
async function api(who,path,body,extra={}){const r=await fetch(url+'/api'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',Cookie:cookies[who]||'',...extra},body:body?JSON.stringify(body):undefined});if(r.headers.getSetCookie().length)cookies[who]=r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')};}
const ok=async p=>{const r=await p;assert.equal(r.status,200,JSON.stringify(r.data));return r.data;},no=async(p,status)=>{const r=await p;assert.equal(r.status,status,JSON.stringify(r.data));},done=s=>{checks.push(s);console.log('✓ '+s);};
const setup={username:'superadmin',name:'Quản trị nền tảng thử',current_password:'123456',password:'LocalSuperAdmin123!',confirm_password:'LocalSuperAdmin123!'};
try{
 await start();assert.equal((await fetch(url+'/platform')).status,200);assert.equal((await fetch(url+'/platform-ui.js')).status,200);
 assert.deepEqual(await ok(api('none','/platform/status')),{configured:false,can_bootstrap:false});await no(api('none','/platform/bootstrap',setup),403);
 for(const u of ['admin','hoa','lan'])await ok(api(u,'/login',{username:u,password:'123456'}));
 assert.equal((await ok(api('admin','/me'))).platform_owner,false);assert.equal((await ok(api('admin','/platform/status'))).can_bootstrap,true);
 await no(api('hoa','/platform/bootstrap',setup),403);await no(api('admin','/platform/companies'),403);
 await no(api('admin','/platform/bootstrap',{...setup,current_password:'wrong'}),401);await no(api('admin','/platform/bootstrap',{...setup,password:'short'}),400);await no(api('admin','/platform/bootstrap',{...setup,confirm_password:'Mismatch12345'}),400);
 cookies.root=cookies.admin;const created=await api('root','/platform/bootstrap',setup);assert.equal(created.status,200,JSON.stringify(created.data));assert.equal(created.data.user.role,'superadmin');assert.match(created.cookie,/HttpOnly/);assert.match(created.cookie,/SameSite=Strict/);assert.match(created.cookie,/Path=\/api\/platform/);
 assert.equal((await ok(api('admin','/platform/status'))).can_bootstrap,false);await no(api('admin','/platform/bootstrap',setup),409);done('Khởi tạo một lần cần phiên chủ cũ và mật khẩu; Super Admin có tài khoản/cookie riêng');
 await no(api('admin','/platform/companies'),403);await no(api('lan','/platform/history'),403);await no(api('root','/customers'),401);await no(api('root','/admin/users'),401);
 cookies.forged=cookies.admin.replace('sid=','platform_sid=');await no(api('forged','/platform/companies'),403);
 assert.equal((await ok(api('admin','/me'))).role,'admin');assert.equal((await ok(api('admin','/me'))).platform_owner,false);
 const tenant={code:'cty-test',name:'Công ty kiểm thử',usage:'trial',username:'admin',admin_name:'Admin công ty',password:'CompanyPassword123!'};
 await no(api('admin','/platform/companies',tenant),403);await ok(api('root','/platform/companies',tenant));
 await ok(api('tenant','/login?company=cty-test',{username:'admin',password:tenant.password}));await no(api('tenant','/platform/companies'),403);
 assert.equal((await ok(api('root','/platform/companies'))).length,2);assert.equal((await ok(api('tenant','/admin/users'))).length,1);done('Admin công ty không vượt quyền nền tảng; Super Admin không đọc dữ liệu CRM');
 await no(api('root','/platform/companies',tenant),409);await no(api('root','/platform/companies',{...tenant,code:'../path'}),400);
 await no(api('root','/platform/companies/cty-test/state',{state:'wrong'}),400);await ok(api('root','/platform/companies/cty-test/state',{state:'paused'}));await no(api('tenant','/me'),401);
 await ok(api('root','/platform/companies/cty-test/state',{state:'active'}));await no(api('tenant','/me'),401);await ok(api('tenant','/login?company=cty-test',{username:'admin',password:tenant.password}));
 const history=await ok(api('root','/platform/history'));assert.ok(history.some(r=>r.action==='create'&&r.company==='cty-test'));assert.ok(history.some(r=>r.action==='paused'));assert.ok(!JSON.stringify(history).includes(tenant.password));done('Tạo/tạm dừng/mở lại công ty đúng quyền, có nhật ký và giữ dữ liệu');
 await no(api('root','/platform/companies',{...tenant,code:'bad-origin'},{Origin:'https://untrusted.example'}),403);
 const inspect=new DatabaseSync(db+'.platform.db',{readOnly:true}),saved=inspect.prepare('SELECT * FROM platform_users').get();assert.notEqual(saved.pwd,setup.password);assert.equal(saved.pwd.length,64);inspect.close();
 await ok(api('root','/platform/logout',{}));await no(api('root','/platform/companies'),403);await no(api('root','/platform/login',{username:'admin',password:'123456'}),401);
 await ok(api('root','/platform/login',{username:setup.username,password:setup.password}));await stop();await start();await no(api('root','/platform/me'),403);
 await ok(api('root','/platform/login',{username:setup.username,password:setup.password}));assert.equal((await ok(api('root','/platform/companies'))).length,2);assert.equal((await ok(api('none','/platform/status'))).configured,true);await no(api('none','/platform/bootstrap',setup),409);
 done('Chặn nguồn ngoài, lưu mật khẩu băm; đăng xuất/khởi động lại thu hồi phiên và giữ tài khoản');
 for(let i=0;i<20;i++)await no(api('bad','/platform/login',{username:'missing',password:'wrong'}),401);await no(api('bad','/platform/login',{username:'missing',password:'wrong'}),429);done('Giới hạn thử sai mật khẩu Super Admin');
 writeFileSync(join(out,'platform-results.json'),JSON.stringify({at:new Date().toISOString(),checks,db},null,2));
}finally{await stop();}
