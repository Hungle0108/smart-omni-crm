import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url)),out=join(root,'test-output');mkdirSync(out,{recursive:true});
const db=join(out,`review-fixes-${Date.now()}.db`),jars={},checks=[];let child;
async function start(){child=spawn(process.execPath,[join(root,'server.js')],{env:{...process.env,PORT:'4035',CRM_DB:db,CRM_ZALO_WEBHOOK_PORT:'0'},stdio:['ignore','pipe','pipe']});let errors='';child.stderr.on('data',c=>errors+=c);await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error(errors)),15000);child.once('error',reject);child.once('exit',()=>{clearTimeout(t);reject(Error(errors));});child.stdout.once('data',()=>{clearTimeout(t);resolve();});});}
async function stop(){if(child&&!child.killed){const exited=new Promise(r=>child.once('exit',r));child.kill();await exited;}}
async function api(who,method,path,body){const r=await fetch('http://127.0.0.1:4035/api'+path,{method,headers:{'Content-Type':'application/json',Cookie:jars[who]||''},body:body===undefined?undefined:JSON.stringify(body)});if(r.headers.getSetCookie().length)jars[who]=r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');return {status:r.status,data:await r.json()};}
const ok=async p=>{const r=await p;assert.equal(r.status,200,JSON.stringify(r.data));return r.data;},deny=async(p,code=403)=>{const r=await p;assert.equal(r.status,code,JSON.stringify(r.data));},done=s=>{checks.push(s);console.log('✓ '+s);};
const login=(who,company,username,password='QaPassword123!')=>ok(api(who,'POST','/login?company='+company,{username,password}));
try{
 await start();for(const u of ['lan','hoa'])await login(u,'ivitech',u,'123456');
 const c=await ok(api('lan','POST','/customers',{name:'QA số điện thoại',kind:'org',phone:'0901234567'}));
 await deny(api('lan','PUT','/customers/'+c.id,{name:'Không được lưu',phone:'abc'}),400);
 let data=await ok(api('lan','GET','/customers/'+c.id));assert.equal(data.customer.phone,'0901234567');assert.equal(data.customer.name,'QA số điện thoại');
 await ok(api('lan','PUT','/customers/'+c.id,{...data.customer,phone:'+84 901 234 568'}));data=await ok(api('lan','GET','/customers/'+c.id));assert.equal(data.customer.phone,'0901234568');
 await deny(api('lan','POST','/organizations/'+c.id+'/contacts',{full_name:'Sai điện thoại',phone:'090abc123'}),400);
 await deny(api('lan','PUT','/organizations/'+c.id+'/directory-details',{name:data.customer.name,phone:'abc',email:'',address:'',expected_name:data.customer.name,expected_phone:data.customer.phone,expected_email:'',expected_address:''}),400);
 const imported=await ok(api('hoa','POST','/customers/import',{rows:[{name:'Sai số',kind:'person',phone:'abc'}]}));assert.match(imported.rows[0].error,/điện thoại/);done('Chặn điện thoại sai ở hồ sơ, danh bạ, liên hệ và nhập dữ liệu; không mất số cũ');
 const o=await ok(api('lan','POST','/opportunities',{customer_id:c.id,title:'QA TEST cơ hội',est_value:1000000}));await ok(api('lan','POST','/opportunities/'+o.id+'/stage',{to:'Thua',reason:'Tạm dừng'}));await deny(api('lan','POST','/opportunities/'+o.id+'/stage',{to:'Xác định nhu cầu'}),400);await ok(api('lan','POST','/opportunities/'+o.id+'/stage',{to:'Xác định nhu cầu',reason:'Khách liên hệ lại'}));const od=await ok(api('lan','GET','/opportunities/'+o.id));assert.equal(od.opportunity.stage,'Xác định nhu cầu');assert.ok(od.history.some(h=>h.to_stage==='Thua'));done('Mở lại về bước đang xử lý cần lý do và giữ lịch sử thua');
 const quote=await ok(api('lan','POST','/quotes',{customer_id:c.id,template_id:'solution'}));let profile=await ok(api('lan','GET','/customers/'+c.id+'/360'));assert.ok(profile.events.find(e=>e.id==='quote-created:'+quote.id).actor);const qd=await ok(api('lan','GET','/quotes/'+quote.id));assert.ok(qd.catalog.filter(p=>p.needs_pkg1).every(p=>p.terms.includes('Sản phẩm/dịch vụ này chỉ bán')));assert.ok(qd.catalog.every(p=>!p.terms.includes('Gói 3/4 cần khách')));done('Tạo báo giá có người thao tác; điều kiện báo giá mới lấy theo cờ sản phẩm');
 const source=readFileSync(join(root,'workspace-ui.js'),'utf8'),begin=source.indexOf('function reopenOpportunity'),end=source.indexOf('\nviews.pipeline',begin);let fields;runInNewContext(source.slice(begin,end)+';reopenOpportunity({id:1,title:"Thử"},()=>{},"Xác định nhu cầu")',{STAGES:['Mới','Xác định nhu cầu','Thắng','Thua'],render:()=>{},form:(title,f)=>fields=f});assert.equal(fields[0][4],'Xác định nhu cầu');assert.equal(fields[0][3].length,2);assert.equal(fields[1][0],'reason');
 const filters=readFileSync(join(root,'filters-ui.js'),'utf8').split('function installListFilter')[0];assert.ok(!/pipeline:|settings:|guide:|home:/.test(filters));assert.ok(source.includes('const rows=filtered.filter(o=>o.stage===s)'));done('Form mở lại có chọn bước; bỏ bộ lọc chồng Pipeline và bộ lọc cấu hình/hướng dẫn');
 writeFileSync(join(out,'review-fixes-results.json'),JSON.stringify({checks,at:new Date().toISOString(),db},null,2));
}finally{await stop();}

