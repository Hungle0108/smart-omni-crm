import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url)),out=join(root,'test-output');mkdirSync(out,{recursive:true});
const db=join(out,`customer360-${Date.now()}.db`),jars={},checks=[];let child;
async function start(){child=spawn(process.execPath,[join(root,'server.js')],{env:{...process.env,PORT:'4033',CRM_DB:db,CRM_ZALO_WEBHOOK_PORT:'0'},stdio:['ignore','pipe','pipe']});let errors='';child.stderr.on('data',c=>errors+=c);await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error(errors)),15000);child.once('error',reject);child.once('exit',()=>{clearTimeout(t);reject(Error(errors));});child.stdout.once('data',()=>{clearTimeout(t);resolve();});});}
async function stop(){if(child&&!child.killed){const exited=new Promise(r=>child.once('exit',r));child.kill();await exited;}}
async function api(who,method,path,body){const r=await fetch('http://127.0.0.1:4033/api'+path,{method,headers:{'Content-Type':'application/json',Cookie:jars[who]||''},body:body===undefined?undefined:JSON.stringify(body)});if(r.headers.getSetCookie().length)jars[who]=r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');return {status:r.status,data:await r.json()};}
const ok=async p=>{const r=await p;assert.equal(r.status,200,JSON.stringify(r.data));return r.data;},deny=async(p,code=403)=>{const r=await p;assert.equal(r.status,code,JSON.stringify(r.data));},done=s=>{checks.push(s);console.log('✓ '+s);};
const login=(who,company,username,password='QaPassword123!')=>ok(api(who,'POST','/login?company='+company,{username,password}));
const user=(username,role='sales')=>({username,name:username,role,team_id:1,password:'QaPassword123!'});
try{
 await start();for(const u of ['admin','hoa','lan','minh'])await login(u,'ivitech',u,'123456');
 const c=await ok(api('lan','POST','/customers',{kind:'org',name:'QA Hồ sơ 360',interest:'Smart iVier'}));
 const other=await ok(api('minh','POST','/customers',{kind:'org',name:'Khách ngoài phạm vi'}));
 const p=await ok(api('lan','POST','/organizations/'+c.id+'/contacts',{full_name:'Đầu mối kiểm thử',department:'Kinh doanh',job_title:'Trưởng phòng',contact_role:'Người quyết định',is_primary:true}));
 const op=await ok(api('lan','POST','/opportunities',{customer_id:c.id,contact_id:p.id,title:'Cơ hội triển khai',est_value:1000000}));
 const op2=await ok(api('lan','POST','/opportunities',{customer_id:c.id,title:'Cơ hội đào tạo',est_value:2000000}));
 const get=()=>ok(api('lan','GET','/customers/'+c.id+'/360'));
 await deny(api('minh','GET','/customers/'+c.id+'/360'));await deny(api('admin','GET','/customers/'+c.id+'/360'));
 await deny(api('lan','POST','/tasks',{customer_id:other.id,contact_id:p.id,title:'Không được tạo'}));
 await deny(api('lan','POST','/tasks',{customer_id:c.id,contact_id:99999,title:'Sai đầu mối'}),400);
 await deny(api('lan','POST','/tasks',{customer_id:c.id,opp_id:99999,title:'Sai cơ hội'}),400);
 done('Kiểm tra quyền khách và chặn liên kết đầu mối/cơ hội không hợp lệ trước khi ghi');
 await ok(api('lan','POST','/customers/'+c.id+'/interactions',{kind:'Cuộc gọi',body:'Khách cần triển khai tháng tới',outcome:'Gửi đề xuất',contact_id:p.id,opp_id:op.id}));
 const t=await ok(api('lan','POST','/tasks',{customer_id:c.id,contact_id:p.id,opp_id:op.id,title:'Gửi đề xuất triển khai',due_at:'2026-10-01T03:00:00Z'}));
 let d=await get();assert.equal(d.tasks.length,1);assert.equal(d.tasks[0].opp_id,op.id);assert.equal(d.tasks[0].contact_id,p.id);assert.equal(d.opportunities.length,2);assert.equal(d.events.filter(e=>e.type==='Cuộc gọi').length,1);
 const createdAt=d.tasks[0].created_at;assert.ok(Number.isFinite(Date.parse(createdAt)));
 await ok(api('lan','PUT','/tasks/'+t.id,{created_at:'2000-01-01T00:00:00Z',title:'Gửi đề xuất đã sửa',due_at:'2026-10-02T03:00:00Z'}));await ok(api('lan','POST','/tasks/'+t.id+'/done',{}));
 d=await get();assert.equal(d.tasks[0].created_at,createdAt);assert.equal(d.tasks[0].status,'COMPLETED');assert.equal(d.tasks[0].opp_id,op.id);assert.ok(d.events.some(e=>e.title.includes('Sửa nội dung/thời hạn')));assert.equal(d.events.length,new Set(d.events.map(e=>e.id)).size);
 await ok(api('lan','POST','/tasks/'+t.id+'/reopen',{}));
 await ok(api('lan','POST','/opportunities/'+op.id+'/stage',{to:'Xác định nhu cầu'}));d=await get();assert.equal(d.opportunities.find(o=>o.id===op.id).stage,'Xác định nhu cầu');assert.equal(d.opportunities.find(o=>o.id===op2.id).stage,'Mới');
 done('Trao đổi → công việc → sửa/hoàn thành/mở lại → nhiều cơ hội độc lập và lịch sử không trùng');
 const conv=await ok(api('lan','POST','/conversations',{customer_id:c.id,channel:'oa'}));await ok(api('lan','POST','/conversations/'+conv.id+'/bot',{on:false}));
 d=await get();assert.equal(d.conversations.length,1);assert.ok(d.events.some(e=>e.type==='Hội thoại'));
 const rule=await ok(api('admin','GET','/channel-access/oa'));await ok(api('admin','PUT','/channel-access/oa',{revision:rule.channel.revision,mode:'selected',members:[]}));
 d=await get();assert.equal(d.conversations.length,0);assert.equal(d.events.filter(e=>e.type==='Hội thoại').length,0);assert.ok(!d.channels.some(c=>c.key==='oa'));
 done('Thu hồi quyền kênh ẩn cả hội thoại, sự kiện và thông tin kênh trong hồ sơ');
 const quote=await ok(api('lan','POST','/quotes',{customer_id:c.id,opp_id:op.id,template_id:'solution'}));d=await get();assert.ok(d.quotes.some(q=>q.id===quote.id&&q.opp_id===op.id));assert.equal(d.capabilities.payments,false);assert.equal(d.capabilities.contracts,false);
 await ok(api('lan','POST','/contacts/'+p.id+'/unlink',{version:1,reason:'Đổi đầu mối'}));d=await get();assert.equal(d.contacts.length,0);assert.equal(d.tasks[0].contact_id,null);await deny(api('lan','POST','/customers/'+c.id+'/interactions',{kind:'Cuộc gọi',body:'abc',outcome:'xyz',contact_id:p.id}),400);
 done('Báo giá liên kết đúng cơ hội; đầu mối đã gỡ không thể dùng cho hoạt động mới');
 await stop();await start();await login('lan','ivitech','lan','123456');d=await get();assert.equal(d.tasks[0].created_at,createdAt);assert.equal(d.tasks[0].title,'Gửi đề xuất đã sửa');assert.equal(d.opportunities.length,2);assert.ok(d.events.some(e=>e.type==='Cuộc gọi'));done('Dữ liệu giữ nguyên sau khởi động lại');
 writeFileSync(join(out,'customer360-results.json'),JSON.stringify({at:new Date().toISOString(),checks,db,customer_id:c.id},null,2));
}finally{await stop();}
