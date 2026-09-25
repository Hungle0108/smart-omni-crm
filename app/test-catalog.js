import {configureApprovalRules} from './test-approval-fixtures.js';
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url)),out=join(root,'test-output');mkdirSync(out,{recursive:true});
const db=join(out,`catalog-${Date.now()}.db`),jar={},checks=[];let child;
async function start(){child=spawn(process.execPath,[join(root,'server.js')],{env:{...process.env,PORT:'4015',CRM_DB:db},stdio:['ignore','pipe','pipe']});let errors='';child.stderr.on('data',c=>errors+=c);await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error(errors)),15000);child.once('error',reject);child.once('exit',()=>reject(Error(errors)));child.stdout.once('data',()=>{clearTimeout(t);resolve();});});}
async function stop(){if(child&&!child.killed){const exited=new Promise(r=>child.once('exit',r));child.kill();await exited;}}
async function api(u,method,path,body){const r=await fetch('http://127.0.0.1:4015/api'+path,{method,headers:{'Content-Type':'application/json',Cookie:jar[u]||''},body:body===undefined?undefined:JSON.stringify(body)});if(r.headers.get('set-cookie'))jar[u]=r.headers.get('set-cookie').split(';')[0];return {status:r.status,data:await r.json()};}
const ok=async p=>{const r=await p;assert.equal(r.status,200,JSON.stringify(r.data));return r.data;},no=async p=>assert.ok((await p).status>=400),done=s=>{checks.push(s);console.log('✓ '+s);};
const logo='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==';
try{
 await start();for(const u of ['admin','lan','hoa','minh','duc'])await ok(api(u,'POST','/login',{username:u,password:'123456'}));
 await no(api('lan','POST','/product-categories',{id:'support',name:'Hỗ trợ'}));await ok(api('admin','POST','/product-categories',{id:'support',name:'Dịch vụ hỗ trợ'}));await no(api('admin','POST','/product-categories',{id:'support',name:'Trùng'}));await ok(api('admin','PUT','/product-categories/support',{name:'Tư vấn & hỗ trợ'}));done('Admin tạo/sửa loại dịch vụ, chặn trùng và sai quyền');
 const product={name:'Buổi tư vấn',family:'support',unit:'Buổi',first_year:1250000,renewal:'',note:'Tư vấn theo nhu cầu',active:true};
 await no(api('hoa','PUT','/products/TV',product));for(const price of [-1,1.5,'',null])await no(api('admin','PUT','/products/TV',{...product,first_year:price}));await no(api('admin','PUT','/products/TV',{...product,family:'missing'}));
 await ok(api('admin','PUT','/products/TV',product));await ok(api('admin','PUT','/products/HT',{...product,name:'Hỗ trợ',first_year:500000,renewal:0}));done('Lưu đơn vị, đơn giá, gia hạn chưa xác định; kiểm tra giá hợp lệ');
 const template={name:'Mẫu tư vấn',family:'support',intro:'Giới thiệu',terms:'Theo thỏa thuận',product_codes:['TV'],logo};
 await no(api('lan','PUT','/templates/support',template));await no(api('admin','PUT','/templates/support',{...template,product_codes:['G1']}));await ok(api('admin','PUT','/templates/support',template));
 const a=await ok(api('lan','POST','/quotes',{customer_id:1,template_id:'support'}));const save={items:[{code:'TV',qty:3,first_year:1}],discount_pct:10};
 await no(api('lan','PUT','/quotes/'+a.id,{...save,items:[{code:'HT',qty:1}]}));await no(api('minh','PUT','/quotes/'+a.id,save));await no(api('lan','PUT','/quotes/'+a.id,{...save,items:[{code:'TV',qty:0}]}));
 await ok(api('lan','PUT','/quotes/'+a.id,save));let quote=await ok(api('lan','GET','/quotes/'+a.id));assert.equal(quote.net_first_year,3375000);assert.equal(quote.items[0].unit,'Buổi');assert.equal(quote.items[0].first_year,1250000);assert.equal(quote.items[0].note,product.note);done('Sales chỉ chọn hạng mục của mẫu, số lượng tính đúng, không sửa lén giá');
 await ok(api('admin','PUT','/products/TV',{...product,first_year:2000000,name:'Tên mới'}));await ok(api('lan','PUT','/quotes/'+a.id,save));assert.equal((await ok(api('lan','GET','/quotes/'+a.id))).items[0].first_year,1250000);
 const b=await ok(api('lan','POST','/quotes',{customer_id:1,template_id:'support'}));await ok(api('lan','PUT','/quotes/'+b.id,save));assert.equal((await ok(api('lan','GET','/quotes/'+b.id))).items[0].first_year,2000000);done('Giá mới dùng cho báo giá mới, bản đã lập giữ đơn giá cũ');
 await ok(api('admin','PUT','/brand',{name:'Công ty mẫu',short:'Mẫu',color:'#174db8',logo}));await no(api('admin','PUT','/brand',{name:'Công ty mẫu',short:'Mẫu',color:'#174db8',logo:'data:image/svg+xml;base64,AAAA'}));await no(api('admin','PUT','/templates/support',{...template,logo:'data:image/png;base64,'+Buffer.from('not an image at all').toString('base64')}));await no(api('lan','PUT','/brand',{name:'Mẫu',short:'Mẫu',color:'#174db8',logo}));
 await ok(configureApprovalRules(api,1e9,20));await ok(api('lan','POST','/quotes/'+a.id+'/submit',{}));await ok(api('hoa','POST','/quotes/'+a.id+'/approve',{decision:'approve'}));const before=(await ok(api('lan','GET','/quotes/'+a.id+'/document'))).document;assert.equal(before.brand.logo,logo);assert.equal(before.template.logo,logo);
 await ok(api('admin','PUT','/templates/support',{...template,logo:'',product_codes:['HT']}));await ok(api('admin','PUT','/brand',{name:'Công ty khác',short:'Khác',color:'#123456',logo:''}));assert.deepEqual((await ok(api('lan','GET','/quotes/'+a.id+'/document'))).document,before);done('Logo công ty/mẫu được kiểm tra; bản đã duyệt giữ ảnh và nội dung');
 const rev=await ok(api('lan','POST','/quotes/'+a.id+'/revise',{}));await ok(api('lan','PUT','/quotes/'+rev.id,save));assert.equal((await ok(api('lan','GET','/quotes/'+rev.id))).items[0].first_year,1250000);
 await ok(api('admin','PUT','/products/HT',{...product,name:'Hỗ trợ',active:false,first_year:500000,renewal:0}));await no(api('lan','POST','/quotes',{customer_id:1,template_id:'support'}));done('Sửa mẫu/ngừng bán không phá bản cũ; bản mới cần sản phẩm đang bán');
 const existing=await ok(api('lan','POST','/quotes',{customer_id:1,template_id:'solution'}));await no(api('lan','PUT','/quotes/'+existing.id,{items:[{code:'G1',qty:1},{code:'GFULL',qty:1}]}));const training=await ok(api('minh','POST','/quotes',{customer_id:2,template_id:'training'}));const trainingProducts=(await ok(api('minh','GET','/quotes/'+training.id))).catalog;await no(api('minh','PUT','/quotes/'+training.id,{items:trainingProducts.slice(0,2).map(p=>({code:p.code,qty:1}))}));done('Giữ quy tắc trọn bộ và các phương án đào tạo');
 await stop();await start();await ok(api('lan','POST','/login',{username:'lan',password:'123456'}));assert.deepEqual((await ok(api('lan','GET','/quotes/'+a.id+'/document'))).document,before);done('Đơn giá và logo đã duyệt còn nguyên sau khởi động lại');
 writeFileSync(join(out,'catalog-results.json'),JSON.stringify({at:new Date().toISOString(),checks},null,2));
}finally{await stop();}
