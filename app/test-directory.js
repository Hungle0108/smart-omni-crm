import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url)),out=join(root,'test-output');mkdirSync(out,{recursive:true});
const db=join(out,`directory-${Date.now()}.db`),jars={},checks=[];let child;
async function start(){child=spawn(process.execPath,[join(root,'server.js')],{env:{...process.env,PORT:'4029',CRM_DB:db,CRM_ZALO_WEBHOOK_PORT:'0'},stdio:['ignore','pipe','pipe']});let errors='';child.stderr.on('data',c=>errors+=c);await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error(errors)),15000);child.once('error',reject);child.once('exit',()=>{clearTimeout(t);reject(Error(errors));});child.stdout.once('data',()=>{clearTimeout(t);resolve();});});}
async function stop(){if(child&&!child.killed){const exited=new Promise(r=>child.once('exit',r));child.kill();await exited;}}
async function api(who,method,path,body){const r=await fetch('http://127.0.0.1:4029/api'+path,{method,headers:{'Content-Type':'application/json',Cookie:jars[who]||''},body:body===undefined?undefined:JSON.stringify(body)});if(r.headers.getSetCookie().length)jars[who]=r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');return {status:r.status,data:await r.json()};}
const ok=async p=>{const r=await p;assert.equal(r.status,200,JSON.stringify(r.data));return r.data;},deny=async(p,code=403)=>{const r=await p;assert.equal(r.status,code,JSON.stringify(r.data));},done=s=>{checks.push(s);console.log('✓ '+s);};
const login=(who,company,username,password='QaPassword123!')=>ok(api(who,'POST','/login?company='+company,{username,password}));
const user=(username,role='sales')=>({username,name:username,role,team_id:1,password:'QaPassword123!'});
try{
 await start();for(const u of ['admin','hoa','lan','minh'])await login(u,'ivitech',u,'123456');
 const orgA=await ok(api('lan','POST','/customers',{kind:'org',name:'QA Đơn vị Alpha',interest:'Smart iVier'})),orgB=await ok(api('lan','POST','/customers',{kind:'org',name:'QA Đơn vị Beta'})),hidden=await ok(api('minh','POST','/customers',{kind:'org',name:'QA Ngoài phạm vi'}));
 const data=n=>({full_name:'Liên hệ thử '+n,job_title:'Trưởng phòng',department:'Kỹ thuật',contact_role:'Kỹ thuật',email:`person${n}@example.invalid`,phone:'',note:'Dữ liệu giả',is_primary:n===1});
 const plan=await ok(api('lan','POST','/tasks',{customer_id:orgA.id,title:'Gọi khách Alpha',kind:'Cuộc gọi',priority:'Cao',note:'Chuẩn bị nội dung'}));
 const equalPlans=async who=>{const all=await ok(api(who,'GET','/tasks')),scoped=await ok(api(who,'GET','/customers/'+orgA.id+'/tasks'));assert.deepEqual(scoped,all.filter(t=>t.customer_id===orgA.id));return scoped;};
 assert.equal((await equalPlans('lan'))[0].id,plan.id);await equalPlans('hoa');assert.deepEqual(await ok(api('lan','GET','/customers/'+orgB.id+'/tasks')),[]);
 await deny(api('minh','GET','/customers/'+orgA.id+'/tasks'));await deny(api('admin','GET','/customers/'+orgA.id+'/tasks'));
 await ok(api('lan','PUT','/tasks/'+plan.id,{title:'Gọi Alpha đã sửa',kind:'Cuộc gọi',priority:'Cao',note:'Ghi chú mới',due_at:'2026-10-01T03:00:00.000Z'}));assert.equal((await equalPlans('lan'))[0].note,'Ghi chú mới');
 await ok(api('lan','POST','/tasks/'+plan.id+'/done',{}));assert.equal((await equalPlans('lan'))[0].status,'COMPLETED');
 await ok(api('lan','POST','/tasks/'+plan.id+'/reopen',{}));assert.equal((await equalPlans('lan'))[0].status,'OPEN');
 await ok(api('lan','POST','/lifecycle/tasks/'+plan.id+'/archive',{reason:'Kiểm tra đồng bộ'}));assert.deepEqual(await equalPlans('lan'),[]);await ok(api('lan','POST','/lifecycle/tasks/'+plan.id+'/restore',{}));assert.equal((await equalPlans('lan')).length,1);done('Kế hoạch hồ sơ và tiếp xúc đồng nhất sau thêm/sửa/hoàn thành/mở lại/xóa/khôi phục; giữ phạm vi khách');
 const ids=[];for(let n=1;n<=3;n++)ids.push((await ok(api('lan','POST','/organizations/'+orgA.id+'/contacts',data(n)))).id);
 const hiddenP=await ok(api('minh','POST','/organizations/'+hidden.id+'/contacts',{...data(9),full_name:'Tên bí mật mẫu'}));
 let r=await ok(api('lan','GET','/directory?search=lien%20he%20thu%202'));assert.equal(r.items.length,1);assert.equal(r.items[0].id,orgA.id);assert.equal(r.items[0].contact_count,3);assert.equal(r.items[0].matched_contacts,1);
 assert.equal((await ok(api('lan','GET','/directory?search=bi%20mat'))).total,0);assert.equal((await ok(api('lan','GET','/directory/contacts?search=bi%20mat'))).total,0);
 r=await ok(api('lan','GET','/organizations/'+orgA.id+'/contact-page?size=2'));assert.equal(r.items.length,2);assert.equal(r.total,3);assert.equal(r.items[0].is_primary,1);assert.equal((await ok(api('lan','GET','/organizations/'+orgA.id+'/contact-page?size=2&page=2'))).items.length,1);done('Tìm tên liên hệ không dấu, số đếm đúng; phân trang liên hệ riêng; không lộ kết quả ngoài quyền');
 const person=(await ok(api('lan','GET','/contacts/'+ids[0]))).contact;
 await deny(api('minh','POST','/contacts/'+ids[0]+'/unlink',{version:person.version,reason:'Sai quyền'}));await deny(api('admin','GET','/contacts/'+ids[0]));await deny(api('lan','GET','/organizations/'+hidden.id+'/contact-page'));
 await deny(api('lan','POST','/organizations/'+orgB.id+'/link-contact',{contact_id:person.id,version:person.version}),409);
 await ok(api('lan','POST','/contacts/'+person.id+'/unlink',{version:person.version,reason:'Đổi đầu mối thử'}));
 let detached=(await ok(api('lan','GET','/contacts/'+person.id))).contact;assert.ok(detached.detached_at);assert.equal((await ok(api('lan','GET','/organizations/'+orgA.id+'/contact-page'))).contact_count,2);assert.equal((await ok(api('lan','GET','/organizations/'+orgA.id))).contacts.length,2);assert.equal((await ok(api('lan','GET','/directory/contacts?detached=1'))).items[0].id,person.id);
 await deny(api('lan','POST','/organizations/'+orgA.id+'/contacts',data(1)),409);
 await deny(api('lan','POST','/organizations/'+orgB.id+'/link-contact',{contact_id:person.id,version:person.version}),409);
 await ok(api('lan','POST','/organizations/'+orgB.id+'/link-contact',{contact_id:person.id,version:detached.version,job_title:'Giám đốc',department:'Điều hành',contact_role:'Người quyết định'}));
 const linked=await ok(api('lan','GET','/contacts/'+person.id));assert.equal(linked.contact.id,person.id);assert.equal(linked.organization.id,orgB.id);assert.equal(linked.contact.job_title,'Giám đốc');assert.ok(linked.history.length>=2);
 await deny(api('lan','POST','/organizations/'+orgB.id+'/link-contact',{contact_id:person.id,version:linked.contact.version}),409);done('Gỡ giữ hồ sơ và lịch sử; liên kết lại đúng ID; không nhân bản hoặc tự chuyển liên hệ đang thuộc đơn vị khác');
 await ok(api('lan','PUT','/contacts/'+person.id,{...linked.contact,version:linked.contact.version,full_name:'Tên đã sửa',is_primary:false}));await deny(api('lan','PUT','/contacts/'+person.id,{...linked.contact,version:linked.contact.version,is_primary:false}),409);
 r=await ok(api('lan','GET','/organizations/'+orgB.id+'/contact-page'));assert.equal(r.items[0].full_name,'Tên đã sửa');
 const detail={name:'Alpha mới',phone:'',email:'',address:'Địa chỉ giả',expected_name:'QA Đơn vị Alpha',expected_phone:'',expected_email:'',expected_address:''};await ok(api('lan','PUT','/organizations/'+orgA.id+'/directory-details',detail));await deny(api('lan','PUT','/organizations/'+orgA.id+'/directory-details',detail),409);assert.equal((await ok(api('lan','GET','/organizations/'+orgA.id))).details.address,'Địa chỉ giả');done('Sửa đồng bộ hồ sơ và 360°, chặn ghi đè phiên bản cũ');
 jars.root=jars.admin;await ok(api('root','POST','/platform/bootstrap',{current_password:'123456',username:'root',name:'Quản trị thử',password:'QaSuperAdmin123!',confirm_password:'QaSuperAdmin123!'}));
 await ok(api('root','POST','/platform/companies',{code:'directory-b',name:'Công ty kiểm thử B',username:'boss',admin_name:'Admin thử',password:'QaPassword123!',usage:'trial'}));await login('b','directory-b','boss');await ok(api('b','POST','/admin/users',user('sales')));await login('bs','directory-b','sales');
 assert.equal((await ok(api('bs','GET','/directory'))).total,0);assert.equal((await ok(api('bs','GET','/directory/contacts'))).total,0);await deny(api('bs','GET','/contacts/'+ids[2]),404);
 jars.forged=jars.lan.replace('crm_company=ivitech','crm_company=directory-b');await deny(api('forged','GET','/directory'),401);done('Danh sách, số đếm, lookup và hồ sơ tách theo tenant; đổi cookie không vượt quyền');
 await stop();await start();await login('lan','ivitech','lan','123456');assert.equal((await ok(api('lan','GET','/contacts/'+person.id))).contact.full_name,'Tên đã sửa');assert.equal((await ok(api('lan','GET','/organizations/'+orgA.id+'/contact-page'))).contact_count,2);done('Dữ liệu và quan hệ còn nguyên sau khởi động lại');
 writeFileSync(join(out,'directory-results.json'),JSON.stringify({at:new Date().toISOString(),checks,db,orgA:orgA.id,orgB:orgB.id},null,2));
}finally{await stop();}
