// Company selection routes requests; only that company's session authenticates them.
import {createServer} from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname,join,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {createCRM} from './crm-server.js';
import {installPlatform} from './platform-server.js';
const DIR=dirname(fileURLToPath(import.meta.url)),DB=process.env.CRM_DB||join(DIR,'crm.db'),PORT=Number(process.env.PORT||3000);
const registry=new DatabaseSync(DB+'.platform.db');
registry.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS companies(code TEXT PRIMARY KEY,name TEXT NOT NULL,db_path TEXT NOT NULL UNIQUE,state TEXT NOT NULL DEFAULT 'active',usage TEXT NOT NULL DEFAULT 'trial',created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS platform_history(id INTEGER PRIMARY KEY,actor INTEGER,action TEXT,company TEXT,at TEXT);`);
registry.prepare('INSERT OR IGNORE INTO companies(code,name,db_path,usage,created_at) VALUES(?,?,?,?,?)').run('ivitech','iViTech',DB,'internal',new Date().toISOString());
const apps=new Map(),companyRow=code=>registry.prepare('SELECT * FROM companies WHERE code=?').get(code);
const present=r=>({code:r.code,name:r.name,state:r.state,usage:r.usage,created_at:r.created_at});
function fail(message,code=400){const e=new Error(message);e.code=code;throw e;}
function clean(v,max){if(typeof v!=='string'||!v.trim()||v.length>max)fail('Thông tin bắt buộc hoặc vượt độ dài cho phép.');return v.trim();}
const platform={
 configured:()=>platformControl.configured(),
 get:code=>present(companyRow(code)),
 list:()=>registry.prepare('SELECT * FROM companies ORDER BY created_at').all().map(present),
 create(body,actor){
  const code=clean(body.code,40).toLowerCase(),name=clean(body.name,150),username=clean(body.username,60).toLowerCase(),adminName=clean(body.admin_name,150),password=clean(body.password,200),usage=body.usage||'trial';
  if(!/^[a-z0-9][a-z0-9-]{2,39}$/.test(code))fail('Mã công ty từ 3–40 ký tự chữ không dấu, số, gạch nối.');
  if(!/^[a-z0-9._-]{3,60}$/.test(username)||password.length<8)fail('Tên đăng nhập cần từ 3 ký tự; mật khẩu tối thiểu 8 ký tự.');
  if(!['internal','trial','customer'].includes(usage))fail('Mục đích sử dụng không hợp lệ.');
  if(companyRow(code))fail('Mã công ty đã được sử dụng.',409);
  const relative=join(randomUUID(),'crm.db'),folder=dirname(join(DB+'.companies',relative));mkdirSync(folder,{recursive:true});
  const row={code,name,db_path:relative,state:'active',usage,created_at:new Date().toISOString()};
  const app=createCRM({dbPath:companyDB(row),company:row,platform,bootstrap:{username,name:adminName,password}});
  try{registry.prepare('INSERT INTO companies VALUES(?,?,?,?,?,?)').run(code,name,row.db_path,row.state,usage,row.created_at);apps.set(code,app);}catch(e){app.close();throw e;}
  registry.prepare('INSERT INTO platform_history(actor,action,company,at) VALUES(?,?,?,?)').run(actor,'create',code,row.created_at);
  return present(row);
 },
 state(code,state,actor){
  if(code==='ivitech')fail('Giữ công ty quản trị nền tảng hoạt động.');
  if(!['active','paused'].includes(state)||!companyRow(code))fail('Công ty hoặc trạng thái không hợp lệ.');
  registry.prepare('UPDATE companies SET state=? WHERE code=?').run(state,code);
  const app=apps.get(code);if(app)app.suspend(state==='paused');
  registry.prepare('INSERT INTO platform_history(actor,action,company,at) VALUES(?,?,?,?)').run(actor,state,code,new Date().toISOString());
  return present(companyRow(code));
 }
};
function companyDB(row){return row.code==='ivitech'?DB:isAbsolute(row.db_path)?row.db_path:join(DB+'.companies',row.db_path);}
function getApp(row){if(!apps.has(row.code))apps.set(row.code,createCRM({dbPath:companyDB(row),company:row,platform,webhookPort:row.code==='ivitech'?Number(process.env.CRM_ZALO_WEBHOOK_PORT??(PORT===3000?3001:0)):0}));return apps.get(row.code);}
const platformControl=installPlatform({registry,platform,dir:DIR,bootstrapUser:req=>{const code=/(?:^|;\s*)crm_company=([a-z0-9-]+)/.exec(req.headers.cookie||'')?.[1]||'ivitech';return code==='ivitech'?getApp(companyRow('ivitech')).bootstrapUser(req):null;}});
getApp(companyRow('ivitech'));
const server=createServer((req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname.startsWith('/api/platform/')||['/platform','/platform/','/platform-ui.js','/platform.css'].includes(url.pathname))return platformControl.handler(req,res);
  const code=url.pathname==='/api/login'?(url.searchParams.get('company')||'ivitech'):(/(?:^|;\s*)crm_company=([a-z0-9-]+)/.exec(req.headers.cookie||'')?.[1]||'ivitech');
  const row=companyRow(code);
  if(!url.pathname.startsWith('/api/'))return getApp(companyRow('ivitech')).handler(req,res);
  if(!row||row.state!=='active'){res.writeHead(401,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(JSON.stringify({error:'Công ty không tồn tại hoặc đang tạm dừng. Kiểm tra mã công ty với admin.'}));}
  return getApp(row).handler(req,res);
 }catch(e){console.error(e);res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Không mở được không gian công ty.'}));}
});
server.listen(PORT,'127.0.0.1',()=>console.log(`Smart Omni CRM (local SaaS pilot) → http://127.0.0.1:${PORT}`));
server.on('close',()=>{platformControl.close();for(const app of apps.values())app.close();registry.close();});
export {server};
