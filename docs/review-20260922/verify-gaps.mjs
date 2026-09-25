import {spawn} from 'node:child_process';
import {writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import assert from 'node:assert/strict';
mkdirSync('app/test-output',{recursive:true});
const dbPath=resolve('app/test-output/requirements-review-'+Date.now()+'.db');
const server=spawn(process.execPath,[resolve('app/server.js')],{env:{...process.env,PORT:'4012',CRM_DB:dbPath},stdio:['ignore','pipe','pipe']});
const jars={},results=[];let errors='';server.stderr.on('data',c=>errors+=c);
async function api(user,method,path,body){const r=await fetch('http://127.0.0.1:4012/api'+path,{method,headers:{'Content-Type':'application/json',Cookie:jars[user]||''},body:body===undefined?undefined:JSON.stringify(body)});if(r.headers.get('set-cookie'))jars[user]=r.headers.get('set-cookie').split(';')[0];return {status:r.status,data:await r.json()};}
async function ok(p){const r=await p;assert.equal(r.status,200,JSON.stringify(r.data));return r.data;}
try{
 await new Promise((yes,no)=>{const t=setTimeout(()=>no(Error(errors||'Startup timeout')),15000);server.once('error',e=>{clearTimeout(t);no(e)});server.once('exit',()=>{clearTimeout(t);no(Error(errors))});server.stdout.once('data',()=>{clearTimeout(t);yes()});});
 for(const user of ['lan','hoa'])await ok(api(user,'POST','/login',{username:user,password:'123456'}));
 const one=await ok(api('lan','POST','/customers',{name:'Khách kiểm tra định danh A',kind:'person',phone:'0909123456',email:'AUDIT@EXAMPLE.TEST '}));
 const two=await ok(api('lan','POST','/customers',{name:'Khách kiểm tra định danh B',kind:'person',phone:'84909123456',email:' audit@example.test'}));
 const three=await ok(api('lan','POST','/customers',{name:'Khách kiểm tra định danh C',kind:'person',phone:'+84909123456',email:'audit@example.test'}));
 const db=new DatabaseSync(dbPath,{readOnly:true});
 const contacts=db.prepare('SELECT phone,email FROM customers WHERE id IN (?,?,?) ORDER BY id').all(one.id,two.id,three.id);db.close();
 results.push({id:'G01',requirement:'DB §104–106: cùng điện thoại/email phải nhận diện nhất quán',observed:contacts,warnings:[one.duplicate_warning,two.duplicate_warning,three.duplicate_warning],matched:false});
 assert.equal(two.duplicate_warning,null);assert.ok(three.duplicate_warning);
 const task=await ok(api('lan','POST',`/customers/${one.id}/work-items`,{title:'Đầu việc kiểm tra trạng thái',due_at:'2026-10-01T09:00:00.000Z'}));
 const waiting=await api('lan','POST',`/work-items/${task.id}/status`,{status:'WAITING'}),cancelled=await api('lan','POST',`/work-items/${task.id}/status`,{status:'CANCELLED'});
 results.push({id:'G02',requirement:'DB §41: WAITING và CANCELLED',observed:{waiting,cancelled},matched:false});assert.equal(waiting.status,400);assert.equal(cancelled.status,400);
 const archived=await ok(api('lan','POST',`/work-items/${task.id}/archive`,{reason:'Kiểm tra phân biệt lưu trữ và hủy'}));
 const tasks=await ok(api('lan','GET','/tasks'));assert.ok(!tasks.some(t=>t.id===task.id));results.push({id:'G03',requirement:'Lưu trữ loại khỏi danh sách đang làm',matched:true});
 await ok(api('lan','POST',`/work-items/${task.id}/restore`,{}));
 let nodes=[];for(let n=6;n>=1;n--)nodes=[{title:'Cấp '+n,children:nodes}];
 const six=await api('hoa','POST','/work-templates',{name:'Kiểm tra mẫu sáu cấp',items:nodes});
 results.push({id:'G04',requirement:'Cam kết bản 0.4: mẫu tối đa sáu cấp',observed:six,matched:false});assert.equal(six.status,400);
 const lead=await api('hoa','GET','/leads');results.push({id:'G05',requirement:'ARCH §52 và DB §28: có quản lý Lead',observed:lead,matched:false});assert.equal(lead.status,404);
 const summary={at:new Date().toISOString(),mode:'isolated SQLite fixture; no external services; original CRM untouched',results};
 writeFileSync('docs/review-20260922/gap-validation.json',JSON.stringify(summary,null,2));console.log(JSON.stringify(summary,null,2));
}finally{server.kill();}
