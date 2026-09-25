import {configureApprovalRules} from './test-approval-fixtures.js';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url)),out=join(root,'test-output');mkdirSync(out,{recursive:true});
const db=join(out,`service-content-${Date.now()}.db`),jar={},checks=[];let child;
async function start(){child=spawn(process.execPath,[join(root,'server.js')],{env:{...process.env,PORT:'4019',CRM_DB:db},stdio:['ignore','pipe','pipe']});let errors='';child.stderr.on('data',c=>errors+=c);await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error(errors)),15000);child.once('error',reject);child.once('exit',()=>reject(Error(errors)));child.stdout.once('data',()=>{clearTimeout(t);resolve();});});}
async function stop(){if(child&&!child.killed){const exited=new Promise(r=>child.once('exit',r));child.kill();await exited;}}
async function api(u,method,path,body){const r=await fetch('http://127.0.0.1:4019/api'+path,{method,headers:{'Content-Type':'application/json',Cookie:jar[u]||''},body:body===undefined?undefined:JSON.stringify(body)});if(r.headers.get('set-cookie'))jar[u]=r.headers.get('set-cookie').split(';')[0];return {status:r.status,data:await r.json()};}
const ok=async p=>{const r=await p;assert.equal(r.status,200,JSON.stringify(r.data));return r.data;},no=async p=>assert.ok((await p).status>=400),done=s=>{checks.push(s);console.log('✓ '+s);};
try{
 await start();for(const u of ['admin','lan','hoa','minh'])await ok(api(u,'POST','/login',{username:u,password:'123456'}));
 const category={id:'consulting',name:'Tư vấn',description:'Giới thiệu chung',terms:'Thanh toán trong 30 ngày'};
 await no(api('lan','POST','/product-categories',category));await ok(api('admin','POST','/product-categories',category));
 const base={family:category.id,name:'Tư vấn A',unit:'Buổi',first_year:1000000,renewal:0,active:true,description:'',terms:''};
 await ok(api('admin','PUT','/products/CA',base));await ok(api('admin','PUT','/products/CB',{...base,name:'Tư vấn B',description:'Mô tả riêng B',terms:'Thanh toán trước 50%'}));await ok(api('admin','PUT','/products/CC',{...base,name:'Tư vấn C',terms:'Bảo hành 6 tháng'}));
 await no(api('admin','PUT','/products/CA',{...base,terms:123}));await no(api('admin','PUT','/product-categories/consulting',{...category,description:'x'.repeat(5001)}));done('Thêm loại và sản phẩm có mô tả/điều kiện, kiểm tra quyền và dữ liệu');
 await ok(api('admin','PUT','/templates/consulting',{name:'Mẫu tư vấn',family:category.id,product_codes:['CA','CB','CC']}));
 const a=await ok(api('lan','POST','/quotes',{customer_id:1,template_id:'consulting'}));let d=await ok(api('lan','GET','/quotes/'+a.id));
 assert.equal(d.catalog.find(p=>p.code==='CA').description,category.description);assert.equal(d.catalog.find(p=>p.code==='CA').terms,category.terms);assert.equal(d.catalog.find(p=>p.code==='CB').terms,'Thanh toán trước 50%');assert.equal(d.catalog.find(p=>p.code==='CC').description,category.description);assert.equal(d.catalog.find(p=>p.code==='CC').terms,'Bảo hành 6 tháng');done('Mẫu không yêu cầu nhập lại nội dung; mỗi mục trống kế thừa riêng từ loại');
 const selection={items:[{code:'CA',qty:2,terms:'Giả mạo'},{code:'CB',qty:1},{code:'CC',qty:1}]};await ok(api('lan','PUT','/quotes/'+a.id,selection));
 let doc=(await ok(api('lan','GET','/quotes/'+a.id+'/document'))).document;assert.equal(doc.first_year,4000000);assert.equal(doc.items[0].terms,category.terms);assert.equal(doc.items[1].description,'Mô tả riêng B');assert.equal(doc.items[2].terms,'Bảo hành 6 tháng');assert.equal(doc.template.terms,'');assert.equal(doc.template.intro,'');done('Báo giá nhiều hạng mục giữ nội dung riêng, không nhận nội dung giả từ sales');
 await ok(api('admin','PUT','/product-categories/consulting',{...category,description:'Giới thiệu mới',terms:'Điều kiện mới'}));await ok(api('admin','PUT','/products/CB',{...base,name:'Tư vấn B',description:'Mô tả B mới',terms:'Điều kiện B mới'}));await ok(api('lan','PUT','/quotes/'+a.id,selection));d=await ok(api('lan','GET','/quotes/'+a.id));assert.equal(d.items[0].terms,category.terms);assert.equal(d.items[1].description,'Mô tả riêng B');
 const b=await ok(api('lan','POST','/quotes',{customer_id:1,template_id:'consulting'}));await ok(api('lan','PUT','/quotes/'+b.id,selection));d=await ok(api('lan','GET','/quotes/'+b.id));assert.equal(d.items[0].terms,'Điều kiện mới');assert.equal(d.items[1].description,'Mô tả B mới');done('Thay danh mục chỉ áp dụng báo giá mới; nháp đã lập giữ nội dung');
 await ok(configureApprovalRules(api,1e9,20));await ok(api('lan','POST','/quotes/'+a.id+'/submit',{}));await ok(api('hoa','POST','/quotes/'+a.id+'/approve',{decision:'approve'}));const approved=(await ok(api('lan','GET','/quotes/'+a.id+'/document'))).document;
 await ok(api('admin','PUT','/product-categories/consulting',{...category,description:'Lần sửa khác',terms:'Thay điều kiện'}));assert.deepEqual((await ok(api('lan','GET','/quotes/'+a.id+'/document'))).document,approved);const rev=await ok(api('lan','POST','/quotes/'+a.id+'/revise',{}));await ok(api('lan','PUT','/quotes/'+rev.id,selection));assert.equal((await ok(api('lan','GET','/quotes/'+rev.id))).items[1].terms,'Thanh toán trước 50%');done('Bản duyệt và phiên bản kế tiếp giữ nội dung đã chốt');
 await stop();await start();await ok(api('lan','POST','/login',{username:'lan',password:'123456'}));assert.deepEqual((await ok(api('lan','GET','/quotes/'+a.id+'/document'))).document,approved);assert.equal((await ok(api('lan','GET','/product-categories'))).find(c=>c.id===category.id).terms,'Thay điều kiện');done('Khởi động lại không ghi đè mô tả/điều kiện đã chỉnh');
 writeFileSync(join(out,'service-content-results.json'),JSON.stringify({at:new Date().toISOString(),checks},null,2));
}finally{await stop();}
