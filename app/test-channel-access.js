import {spawn} from 'node:child_process';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url)),out=join(root,'test-output');mkdirSync(out,{recursive:true});
const dbPath=join(out,`channel-access-${Date.now()}.db`),jars={},checks=[];let child,db;
async function start(){child=spawn(process.execPath,[join(root,'server.js')],{env:{...process.env,PORT:'4031',CRM_DB:dbPath,CRM_ZALO_WEBHOOK_PORT:'0'},stdio:['ignore','pipe','pipe']});let errors='';child.stderr.on('data',c=>errors+=c);await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error(errors)),15000);child.once('error',reject);child.once('exit',()=>{clearTimeout(t);reject(Error(errors));});child.stdout.once('data',()=>{clearTimeout(t);resolve();});});}
async function api(who,method,path,body){const r=await fetch('http://127.0.0.1:4031/api'+path,{method,headers:{'Content-Type':'application/json',Cookie:jars[who]||''},body:body===undefined?undefined:JSON.stringify(body)});if(r.headers.getSetCookie().length)jars[who]=r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');return {status:r.status,data:await r.json()};}
const ok=async p=>{const r=await p;assert.equal(r.status,200,JSON.stringify(r.data));return r.data;},deny=async(p,code=403)=>{const r=await p;assert.equal(r.status,code,JSON.stringify(r.data));},done=s=>{checks.push(s);console.log('✓ '+s);};
const get=(p,u='admin')=>ok(api(u,'GET',p));
const save=async(key,mode,members)=>{const d=await get('/channel-access/'+key);return ok(api('admin','PUT','/channel-access/'+key,{mode,members,revision:d.channel.revision}));};
try{
 await start();for(const u of ['admin','hoa','lan','minh'])await ok(api(u,'POST','/login',{username:u,password:'123456'}));db=new DatabaseSync(dbPath);const q=s=>db.prepare(s);
 const lan=q("SELECT id FROM users WHERE username='lan'").get().id,hoa=q("SELECT id FROM users WHERE username='hoa'").get().id;
 const before=q('SELECT id,customer_id,assignee_id,channel FROM conversations ORDER BY id').all();
 for(let i=1;i<=14;i++)await ok(api('admin','POST','/admin/users',{username:'qa'+i,name:'Nhân viên thử '+String(i).padStart(2,'0'),role:'sales',team_id:1,password:'OnlyForFixture123!'}));
 const a=await get('/channel-access/oa/users'),b=await get('/channel-access/oa/users?page=2');assert.equal(a.items.length,10);assert.ok(!a.items.some(u=>b.items.some(v=>v.id===u.id)));
 const found=await get('/channel-access/oa/users?q=nhan+vien+thu+14');assert.equal(found.total,1);assert.equal(found.items[0].username,'qa14');
 const selected=await get('/channel-access/oa/users?selected_only=1&selected_ids='+lan+','+found.items[0].id);assert.equal(selected.total,2);done('Tìm không dấu, phân trang và lọc danh sách nháp đã chọn');
 const initial=await get('/channel-access/oa');await save('oa','selected',[{user_id:lan,permission:'read'},{user_id:hoa,permission:'send'}]);
 const detail=await get('/channel-access/oa');assert.equal(detail.channel.members.length,2);assert.equal(detail.history[0].detail.added.length,2);assert.equal(detail.history[0].detail.old_mode,'team');assert.ok(detail.history[0].actor);
 await deny(api('admin','PUT','/channel-access/oa',{mode:'team',revision:initial.channel.revision,members:[]}),409);await deny(api('lan','PUT','/channel-access/oa',{mode:'team',revision:1,members:[]}));await deny(api('lan','GET','/channel-access/oa/users'));done('Lưu nhiều người, audit trước/sau, chống ghi đè và chống tự cấp quyền');
 const conv=(await get('/conversations','lan'))[0];assert.ok(conv);assert.equal((await get('/channel-access/effective?conversation_id='+conv.id,'lan')).conversation_access,'read');
 await deny(api('lan','POST','/conversations/'+conv.id+'/messages',{body:'Không được gửi',client_key:'forbidden'}));await deny(api('lan','POST','/conversations/'+conv.id+'/bot',{on:true}));
 assert.equal((await get('/channel-access/effective','admin')).channels.length,0);await deny(api('admin','GET','/conversations/'+conv.id));await deny(api('minh','GET','/customers/'+conv.customer_id));done('Chỉ xem không gửi; quyền quản trị không mở hộp thư; không mở rộng quyền khách');
 await save('oa','selected',[]);assert.equal((await get('/conversations','lan')).length,0);await deny(api('lan','GET','/conversations/'+conv.id));assert.equal((await get('/channel-access/effective?conversation_id='+conv.id,'lan')).conversation_access,'none');
 assert.equal((await get('/customers/'+conv.customer_id,'lan')).conversations.length,0);const tl=await get('/customers/'+conv.customer_id+'/timeline','lan');assert.ok(!tl.events.some(e=>/^#\/conversation\//.test(e.href||'')));done('Không chọn ai chặn danh sách, đường dẫn, timeline và quyền hiệu lực ngay');
 await save('oa','team',[]);assert.ok((await get('/conversations','lan')).length);assert.equal(q("SELECT count(*) n FROM channel_members WHERE channel_key='oa'").get().n,0);
 q('UPDATE users SET team_id=NULL WHERE id=?').run(lan);assert.equal((await get('/channel-access/effective','lan')).channels.length,0);q('UPDATE users SET team_id=1 WHERE id=?').run(lan);done('Kế thừa nhóm không cộng danh sách cũ; không có nhóm không có quyền kênh');
 const conn=await ok(api('admin','POST','/channel-connections',{name:'Kênh QA chưa kết nối',provider:'vnpt_sip',team_id:1,config:{}})),key='connection:'+conn.id;
 await save(key,'selected',[{user_id:lan,permission:'send'}]);assert.equal((await get('/channel-access/'+key)).channel.members[0].user_id,lan);
 const team2=await ok(api('admin','POST','/admin/teams',{name:'Nhóm QA khác'}));q('UPDATE users SET team_id=? WHERE id=?').run(team2.id,lan);assert.ok(!(await get('/channel-access/effective','lan')).channels.some(c=>c.key===key));q('UPDATE users SET team_id=1 WHERE id=?').run(lan);
 const afterConn=await get('/channel-connections/'+conn.id);assert.equal(afterConn.state,conn.state);assert.equal(afterConn.messaging_available,false);assert.deepEqual(q('SELECT id,customer_id,assignee_id,channel FROM conversations ORDER BY id').all(),before);done('Phân riêng từng tài khoản, rời nhóm mất quyền; không đổi phân công/kết nối');
 await save('oa','selected',[{user_id:lan,permission:'read'}]);q('UPDATE users SET active=0 WHERE id=?').run(lan);const inactive=await get('/channel-access/oa');assert.equal(inactive.channel.members[0].effective,false);await save('oa','selected',[{user_id:lan,permission:'read'}]);
 await save('oa','selected',[]);await deny(api('admin','PUT','/channel-access/oa',{mode:'selected',revision:(await get('/channel-access/oa')).channel.revision,members:[{user_id:lan,permission:'read'}]}),400);
 q('UPDATE users SET active=1 WHERE id=?').run(lan);await deny(api('admin','PUT','/channel-access/oa',{mode:'selected',revision:(await get('/channel-access/oa')).channel.revision,members:[null]}),400);done('Tài khoản khóa giữ cảnh báo cũ nhưng không có hiệu lực, không cấp mới; kiểm tra dữ liệu sai');
 const prior=await get('/channel-access/oa');q("CREATE TRIGGER fail_acl_audit BEFORE INSERT ON audit WHEN NEW.action='assign_channel' BEGIN SELECT RAISE(ABORT,'QA rollback'); END").run();
 await deny(api('admin','PUT','/channel-access/oa',{mode:'selected',revision:prior.channel.revision,members:[{user_id:lan,permission:'send'}]}),500);q('DROP TRIGGER fail_acl_audit').run();
 const after=await get('/channel-access/oa');assert.deepEqual(after.channel,prior.channel);assert.deepEqual(after.history,prior.history);done('Lỗi lưu audit rollback cả quyền, danh sách và revision');
 writeFileSync(join(out,'channel-access-results.json'),JSON.stringify({at:new Date().toISOString(),db:dbPath,checks},null,2));
}finally{db?.close();if(child&&!child.killed){const exited=new Promise(r=>child.once('exit',r));child.kill();await exited;}}
