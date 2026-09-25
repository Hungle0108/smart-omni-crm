import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url)),out=join(root,'test-output');mkdirSync(out,{recursive:true});
const child=spawn(process.execPath,[join(root,'server.js')],{env:{...process.env,PORT:'4007',CRM_DB:join(out,`progress-${Date.now()}.db`)},stdio:['ignore','pipe','pipe']});
const jar={},checks=[];const done=s=>{checks.push(s);console.log(' ✓ '+s);};
async function api(u,method,path,body){const r=await fetch('http://127.0.0.1:4007/api'+path,{method,headers:{'Content-Type':'application/json',Cookie:jar[u]||''},body:body===undefined?undefined:JSON.stringify(body)});if(r.headers.get('set-cookie'))jar[u]=r.headers.get('set-cookie').split(';')[0];return{status:r.status,data:await r.json()};}
const ok=async p=>{const r=await p;assert.equal(r.status,200,JSON.stringify(r.data));return r.data;};
const no=async p=>{const r=await p;assert.ok(r.status>=400,JSON.stringify(r.data));};
let errors='';child.stderr.on('data',c=>errors+=c);
try {
 await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error(errors||'Server timeout')),15000);child.once('error',reject);child.once('exit',()=>reject(Error(errors)));child.stdout.once('data',()=>{clearTimeout(t);resolve();});});
 for(const u of ['admin','hoa','lan','minh'])await ok(api(u,'POST','/login',{username:u,password:'123456'}));
 await no(api('admin','GET','/customer-progress'));await no(api('minh','PUT','/customers/1/delivery',{services:['Không được']}));
 await ok(api('hoa','PUT','/customers/1/delivery',{platform:'Smart iVier / On premise',address:'Địa chỉ thử',services:['CQS','XHS','KTS']}));assert.equal((await ok(api('lan','GET','/customer-progress')))[0].platform,'Smart iVier / On premise');done('Thông tin triển khai dùng đúng phạm vi khách và vai trò');
 const tpl=await ok(api('hoa','POST','/work-templates',{name:'Mẫu nghiệm thu',items:[{title:'Thử nghiệm',children:[{title:'Chuẩn bị'},{title:'Demo'}]},{title:'Báo cáo kết quả'}]}));await no(api('lan','POST','/work-templates',{name:'Không quyền',items:[{title:'A'}]}));
 const applied=await ok(api('hoa','POST','/customers/1/apply-work-template',{template_id:tpl.id,request_key:'apply-1'}));assert.equal(applied.count,4);assert.equal((await ok(api('hoa','POST','/customers/1/apply-work-template',{template_id:tpl.id,request_key:'apply-1'}))).duplicate,true);done('Mẫu có công việc con, phân quyền sửa mẫu, áp dụng chống trùng');
 let p=(await ok(api('hoa','GET','/customer-progress'))).find(p=>p.customer.id===1),parent=p.tasks.find(t=>t.title==='Thử nghiệm'),children=p.tasks.filter(t=>t.parent_id===parent.id);
 await no(api('hoa','POST',`/work-items/${parent.id}/status`,{status:'COMPLETED'}));await no(api('hoa','POST',`/tasks/${parent.id}/done`,{}));
 await ok(api('lan','POST',`/work-items/${children[0].id}/status`,{status:'COMPLETED'}));p=(await ok(api('hoa','GET','/customer-progress'))).find(p=>p.customer.id===1);assert.equal(p.tasks.find(t=>t.id===parent.id).status,'IN_PROGRESS');
 await ok(api('hoa','POST',`/tasks/${children[1].id}/done`,{}));p=(await ok(api('hoa','GET','/customer-progress'))).find(p=>p.customer.id===1);assert.equal(p.tasks.find(t=>t.id===parent.id).status,'COMPLETED');
 await ok(api('hoa','POST',`/tasks/${children[0].id}/reopen`,{}));p=(await ok(api('hoa','GET','/customer-progress'))).find(p=>p.customer.id===1);assert.equal(p.tasks.find(t=>t.id===parent.id).status,'IN_PROGRESS');done('Việc cha tự cập nhật; lịch không thể bỏ qua việc con chưa xong');
 await no(api('minh','POST',`/work-items/${children[0].id}/status`,{status:'COMPLETED'}));await no(api('lan','POST','/customers/1/work-items',{title:'Giao sai',assignee_id:2}));await no(api('hoa','POST','/customers/1/work-items',{title:'Giao admin',assignee_id:5}));await no(api('hoa','POST','/customers/1/work-items',{title:'Sai thời gian',started_at:'2026-10-02',due_at:'2026-10-01'}));done('Chặn sửa ngoài quyền, giao sai người và thời gian đảo ngược');
 await ok(api('hoa','POST',`/work-items/${parent.id}/updates`,{body:'Đã trao đổi yêu cầu demo.'}));await ok(api('hoa','POST',`/work-items/${parent.id}/archive`,{reason:'Tạm bỏ khỏi tiến trình'}));let tasks=await ok(api('hoa','GET','/tasks'));assert.ok(!tasks.some(t=>t.id===parent.id||children.some(c=>c.id===t.id)));
 await no(api('hoa','POST',`/work-items/${children[0].id}/restore`,{}));await ok(api('hoa','POST',`/work-items/${parent.id}/restore`,{}));tasks=await ok(api('hoa','GET','/tasks'));assert.ok(tasks.some(t=>t.id===parent.id));p=(await ok(api('hoa','GET','/customer-progress'))).find(p=>p.customer.id===1);assert.ok(p.updates.some(h=>h.body==='Đã trao đổi yêu cầu demo.'));done('Lưu trữ/khôi phục cả nhánh, giữ lịch sử và đồng bộ danh sách lịch');
 await ok(api('hoa','PUT',`/work-templates/${tpl.id}`,{name:'Mẫu đã sửa',items:[{title:'Tên mới'}]}));p=(await ok(api('hoa','GET','/customer-progress'))).find(p=>p.customer.id===1);assert.ok(p.tasks.some(t=>t.title==='Thử nghiệm'));done('Sửa mẫu không đổi các tiến trình khách đã tạo');
 let nested=[{title:'Cấp 6'}];for(let i=5;i>=1;i--)nested=[{title:'Cấp '+i,children:nested}];const deep=await ok(api('hoa','POST','/work-templates',{name:'Mẫu sáu cấp',items:nested}));assert.equal((await ok(api('hoa','POST','/customers/1/apply-work-template',{template_id:deep.id,request_key:'six-levels'}))).count,6);await no(api('hoa','POST','/work-templates',{name:'Bảy cấp',items:[{title:'Vượt giới hạn',children:nested}]}));done('Mẫu đủ 6 cấp áp dụng thành công và từ chối cấp thứ 7');
 const emptyStatus=await ok(api('admin','GET','/integrations/zalo-oa'));assert.equal(emptyStatus.configured,false);assert.equal(emptyStatus.enabled,false);await no(api('lan','PUT','/integrations/zalo-oa',{}));done('API cấu hình OA mặc định tắt và chỉ admin được sửa');
 writeFileSync(join(out,'progress-results.json'),JSON.stringify({at:new Date().toISOString(),checks},null,2));console.log(`${checks.length} nhóm kiểm tra tiến trình đạt.`);
}finally{child.kill();}
