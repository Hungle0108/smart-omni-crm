import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url)),out=join(root,'test-output');mkdirSync(out,{recursive:true});
const db=join(out,`organizations-${Date.now()}.db`),jar={},checks=[];let child;
async function start(){child=spawn(process.execPath,[join(root,'server.js')],{env:{...process.env,PORT:'4013',CRM_DB:db},stdio:['ignore','pipe','pipe']});let errors='';child.stderr.on('data',c=>errors+=c);await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error(errors)),15000);child.once('error',reject);child.stdout.once('data',()=>{clearTimeout(t);resolve();});});}
async function stop(){const exited=new Promise(r=>child.once('exit',r));child.kill();await exited;}
async function api(u,method,path,body){const r=await fetch('http://127.0.0.1:4013/api'+path,{method,headers:{'Content-Type':'application/json',Cookie:jar[u]||''},body:body===undefined?undefined:JSON.stringify(body)});if(r.headers.get('set-cookie'))jar[u]=r.headers.get('set-cookie').split(';')[0];return {status:r.status,data:await r.json()};}
const ok=async p=>{const r=await p;assert.equal(r.status,200,JSON.stringify(r.data));return r.data;},no=async p=>assert.ok((await p).status>=400),done=s=>{checks.push(s);console.log('✓ '+s);};
try{
 await start();for(const u of ['hoa','lan','minh','admin','duc'])await ok(api(u,'POST','/login',{username:u,password:'123456'}));
 const original=await ok(api('hoa','GET','/customers/1'));
 const a=await ok(api('hoa','POST','/customers',{kind:'org',name:'Tổ chức thử',owner_id:1}));
 // Seed IDs are discovered from existing assigned customer, not assumed.
 const owner=(await ok(api('hoa','GET','/customers/'+a.id))).customer.owner_id;
 const b=await ok(api('hoa','POST','/customers',{kind:'org',name:'Chi nhánh thử',parent_org_id:a.id}));
 const c=await ok(api('hoa','POST','/customers',{kind:'org',name:'Phòng thử',parent_org_id:b.id}));
 assert.equal((await ok(api('hoa','GET','/customers/'+b.id))).customer.owner_id,owner);
 assert.equal((await ok(api('hoa','GET','/organizations/'+a.id))).children[0].id,b.id);done('Tổ chức nhiều cấp và đơn vị con giữ người phụ trách');
 await no(api('hoa','PUT','/organizations/'+a.id+'/parent',{parent_org_id:c.id,reason:'Vòng lặp'}));
 await no(api('hoa','PUT','/organizations/'+a.id+'/parent',{parent_org_id:a.id,reason:'Chính mình'}));
 await no(api('hoa','PUT','/organizations/'+c.id+'/parent',{parent_org_id:a.id}));
 await ok(api('hoa','PUT','/organizations/'+c.id+'/parent',{parent_org_id:a.id,reason:'Điều chỉnh cơ cấu'}));
 await ok(api('hoa','PUT','/organizations/'+c.id+'/parent',{parent_org_id:'',reason:'Tách độc lập'}));
 const person=await ok(api('hoa','POST','/customers',{kind:'person',name:'Khách cá nhân'}));
 await no(api('hoa','POST','/customers',{kind:'org',name:'Sai',parent_org_id:person.id}));
 await no(api('hoa','POST','/customers',{kind:'person',name:'Sai',parent_org_id:a.id}));done('Chặn vòng lặp và liên kết sai loại; đổi đơn vị mẹ có lý do');
 const detail={short_name:'IVT',industry:'Công nghệ',website:'https://example.com',address:'Địa chỉ thử',description:'Thông tin tổ chức'};
 await ok(api('hoa','PUT','/organizations/'+a.id+'/details',detail));assert.equal((await ok(api('hoa','GET','/organizations/'+a.id))).details.address,detail.address);
 await no(api('hoa','PUT','/organizations/'+a.id+'/details',{...detail,website:'javascript:alert(1)'}));done('Lưu thông tin chi tiết và kiểm tra website');
 const contact={full_name:'Nguyễn An',job_title:'Trưởng phòng',department:'Kinh doanh',contact_role:'Người quyết định',phone:'0901234567',email:'An@Example.com',note:'Liên hệ trong giờ làm',is_primary:true};
 const p=await ok(api('hoa','POST','/organizations/'+a.id+'/contacts',contact));
 await no(api('hoa','POST','/organizations/'+a.id+'/contacts',{...contact,phone:'+84 901 234 567',email:''}));
 await no(api('hoa','POST','/organizations/'+a.id+'/contacts',{...contact,phone:'',email:'an@example.com'}));
 const p2=await ok(api('hoa','POST','/organizations/'+a.id+'/contacts',{...contact,full_name:'Trần Bình',phone:'',email:'binh@example.com'}));
 let contacts=(await ok(api('hoa','GET','/organizations/'+a.id))).contacts;assert.equal(contacts.filter(p=>p.is_primary).length,1);assert.equal(contacts.find(x=>x.id===p2.id).is_primary,1);
 await ok(api('hoa','PUT','/contacts/'+p.id,{...contact,job_title:'Giám đốc'}));contacts=(await ok(api('hoa','GET','/organizations/'+a.id))).contacts;assert.equal(contacts.find(x=>x.id===p.id).job_title,'Giám đốc');assert.equal(contacts.find(x=>x.id===p.id).note,contact.note);done('Thêm/sửa cá nhân, chuẩn hóa trùng liên hệ và một đầu mối chính');
 await no(api('hoa','POST','/contacts/'+p.id+'/archive',{}));
 await ok(api('hoa','POST','/contacts/'+p.id+'/archive',{reason:'Thay đổi đầu mối'}));await no(api('hoa','PUT','/contacts/'+p.id,contact));
 const replacement=await ok(api('hoa','POST','/organizations/'+a.id+'/contacts',contact));await no(api('hoa','POST','/contacts/'+p.id+'/restore',{}));
 await ok(api('hoa','POST','/contacts/'+replacement.id+'/archive',{reason:'Gộp về liên hệ cũ'}));await ok(api('hoa','POST','/contacts/'+p.id+'/restore',{}));
 const events=(await ok(api('hoa','GET','/customers/'+a.id+'/timeline'))).events;assert.ok(events.some(e=>e.title.includes('Thay đổi đầu mối')));assert.ok(events.some(e=>e.title.includes('Khôi phục')));done('Ngừng/khôi phục liên hệ giữ lịch sử và kiểm tra trùng');
 for(const u of ['admin','duc','minh']){await no(api(u,'GET','/organizations/'+a.id));await no(api(u,'PUT','/contacts/'+p.id,contact));assert.ok(!(await ok(api(u,'GET','/organizations'))).some(x=>x.id===a.id));}
 await no(api('lan','PUT','/organizations/'+b.id+'/parent',{reason:'Không quyền'}));await no(api('hoa','POST','/organizations/'+person.id+'/contacts',contact));
 const hidden=await ok(api('hoa','POST','/customers',{kind:'org',name:'Tổ chức của Minh',owner_id:2}));
 await ok(api('hoa','PUT','/organizations/'+a.id+'/parent',{parent_org_id:hidden.id,reason:'Liên kết do trưởng nhóm'}));
 const scoped=await ok(api('lan','GET','/organizations/'+a.id));assert.equal(scoped.parent,null);assert.equal(scoped.organization.parent_org_id,null);assert.equal(scoped.parent_restricted,true);done('Phân quyền hồ sơ, cá nhân và ẩn tổ chức mẹ ngoài phạm vi');
 assert.deepEqual((await ok(api('hoa','GET','/customers/1'))).opportunities,original.opportunities);
 await stop();await start();await ok(api('hoa','POST','/login',{username:'hoa',password:'123456'}));assert.equal((await ok(api('hoa','GET','/organizations/'+a.id))).details.short_name,'IVT');assert.ok((await ok(api('hoa','GET','/organizations/'+a.id))).contacts.find(x=>x.id===p.id&&!x.archived_at));done('Dữ liệu tồn tại sau khởi động lại; cơ hội cũ được giữ');
 writeFileSync(join(out,'organizations-results.json'),JSON.stringify({at:new Date().toISOString(),checks},null,2));console.log(checks.length+' nhóm kiểm tra đạt.');
}finally{if(child&&!child.killed)await stop();}
