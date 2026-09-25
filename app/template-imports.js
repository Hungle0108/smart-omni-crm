import {randomUUID} from 'node:crypto';
import {parseTemplateDocx,buildTemplateLayout,IMPORT_LIMIT} from './template-docx.js';

export function installTemplateImports({db,q,on,routes,Err,now,log}){
 const add=(table,col,type)=>{if(!q(`PRAGMA table_info(${table})`).all().some(c=>c.name===col))db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);};
 for(const [col,type] of [['imported_layout','TEXT'],['source_import_id','TEXT'],['import_mapping','TEXT'],['team_id','INTEGER'],['created_by','INTEGER']])add('quote_templates',col,type);
 add('quotes','layout_snapshot','TEXT');
 db.exec(`CREATE TABLE IF NOT EXISTS quote_template_imports(id TEXT PRIMARY KEY,filename TEXT NOT NULL,bytes BLOB NOT NULL,parsed TEXT NOT NULL,created_by INTEGER NOT NULL,team_id INTEGER NOT NULL,created_at TEXT NOT NULL,template_id TEXT);`);
 q('INSERT OR IGNORE INTO schema_migrations VALUES(?,?)').run('quote-template-import-v1',now());
 const fail=(message,code=400)=>{throw new Err(code,message);};
 const editor=u=>{if(!['admin','leader'].includes(u.role))fail('Chỉ trưởng nhóm hoặc admin tải và thiết kế mẫu báo giá.',403);};
 const text=(v,max)=>{if(typeof v!=='string'||!v.trim()||v.length>max)fail('Nhập nội dung bắt buộc, tối đa '+max+' ký tự.');return v.trim();};
 const visible=(u,t)=>u.role==='admin'||u.role==='director'||t.team_id===null||t.team_id===u.team_id;
 const source=(u,id)=>{editor(u);const r=q('SELECT * FROM quote_template_imports WHERE id=?').get(id);if(!r)fail('Không tìm thấy tệp mẫu.',404);if(u.role!=='admin'&&r.team_id!==u.team_id)fail('Tệp mẫu ngoài phạm vi nhóm.',403);return r;};
 const editable=(u,id)=>{editor(u);const t=q('SELECT * FROM quote_templates WHERE id=?').get(id);if(!t||!t.source_import_id)fail('Không tìm thấy mẫu nhập từ Word.',404);if(u.role!=='admin'&&t.team_id!==u.team_id)fail('Trưởng nhóm chỉ sửa mẫu Word của nhóm mình.',403);if(t.archived_at)fail('Khôi phục mẫu trước khi chỉnh sửa.',409);return t;};
 const layout=(parsed,mapping)=>{try{return buildTemplateLayout(parsed,mapping);}catch(e){fail(e.message);}};
 const old=(method,path)=>routes.find(r=>r.method===method&&r.path===path).fn;
 const list=old('GET','/api/templates');on('GET','/api/templates',ctx=>{const d=list(ctx);d.templates=d.templates.filter(t=>visible(ctx.user,t));return d;});
 const createQuote=old('POST','/api/quotes');on('POST','/api/quotes',ctx=>{
  const t=q('SELECT * FROM quote_templates WHERE id=?').get(ctx.body.template_id||ctx.body.template),c=q('SELECT team_id FROM customers WHERE id=?').get(ctx.body.customer_id);
  if(t&&t.team_id!==null&&t.team_id!==c?.team_id)fail('Mẫu báo giá này chỉ dùng cho khách hàng của nhóm tạo mẫu.',403);
  const result=createQuote(ctx);q('UPDATE quotes SET layout_snapshot=? WHERE id=?').run(t?.imported_layout||null,result.id);return result;
 });
 const revise=old('POST','/api/quotes/:id/revise');on('POST','/api/quotes/:id/revise',ctx=>{const result=revise(ctx);q('UPDATE quotes SET layout_snapshot=(SELECT layout_snapshot FROM quotes WHERE id=?) WHERE id=?').run(ctx.params.id,result.id);return result;});
 on('POST','/api/template-imports',async({user,body})=>{
  editor(user);const filename=text(body.filename,180);
  if(!/\.docx$/i.test(filename)||typeof body.base64!=='string'||body.base64.length>Math.ceil(IMPORT_LIMIT/3)*4||!/^[A-Za-z0-9+/]+={0,2}$/.test(body.base64))fail('Chọn tệp Word DOCX tối đa 5 MB.');
  const bytes=Buffer.from(body.base64,'base64');let parsed;
  try{parsed=await parseTemplateDocx(bytes);}catch(e){fail(e.message);}
  const id=randomUUID();
  // Parsing is asynchronous. Keep the write transaction entirely synchronous.
  db.exec('BEGIN IMMEDIATE');try{
   // Unpublished uploads expire; never delete a source used by a saved template.
   q("DELETE FROM quote_template_imports WHERE template_id IS NULL AND created_at < ?").run(new Date(Date.now()-7*86400000).toISOString());
   if(q('SELECT COUNT(*) n FROM quote_template_imports WHERE created_by=? AND template_id IS NULL').get(user.id).n>=20)fail('Có 20 tệp chưa lưu mẫu. Hãy bỏ các tệp nháp trước khi tải thêm.');
   q('INSERT INTO quote_template_imports VALUES(?,?,?,?,?,?,?,NULL)').run(id,filename,bytes,JSON.stringify(parsed),user.id,user.team_id,now());
   log(user.id,'upload_template','templates',{id,filename,bytes:bytes.length});db.exec('COMMIT');
  }catch(e){if(db.isTransaction)db.exec('ROLLBACK');throw e;}
  return {id,filename,...parsed};
 },{async:true,bodyLimit:8*1024*1024});
 on('GET','/api/template-imports',({user})=>{editor(user);return q('SELECT id,filename,created_at,template_id FROM quote_template_imports WHERE created_by=? AND template_id IS NULL ORDER BY created_at DESC').all(user.id);});
 on('GET','/api/template-imports/:id',({user,params})=>{const r=source(user,params.id),t=r.template_id?q('SELECT * FROM quote_templates WHERE id=?').get(r.template_id):null;return {id:r.id,filename:r.filename,...JSON.parse(r.parsed),...(t?{mapping:JSON.parse(t.import_mapping),template:t}:{})};});
 on('GET','/api/template-imports/:id/source',({user,params})=>{const r=source(user,params.id);return {filename:r.filename,base64:Buffer.from(r.bytes).toString('base64')};});
 on('DELETE','/api/template-imports/:id',({user,params})=>{const r=source(user,params.id);if(r.template_id)fail('Tệp đã gắn với mẫu. Dùng Lưu trữ mẫu để ngừng sử dụng.',409);q('DELETE FROM quote_template_imports WHERE id=?').run(r.id);log(user.id,'discard_template_upload','templates',{id:r.id});return {ok:true};});
 on('POST','/api/template-imports/:id/publish',({user,params,body})=>{
  const r=source(user,params.id);if(r.template_id)fail('Tệp này đã được tạo thành mẫu; hãy sửa mẫu hoặc tải bản Word mới.');
  if(body.reviewed!==true)fail('Xác nhận đã kiểm tra nội dung trước khi lưu mẫu.');
  const name=text(body.name,200),family=text(body.family,40),category=q('SELECT * FROM product_categories WHERE id=?').get(family);
  if(!category||category.archived_at)fail('Chọn loại sản phẩm / dịch vụ đang hoạt động.');
  const codes=body.product_codes;if(!Array.isArray(codes)||!codes.length||codes.length>40||new Set(codes).size!==codes.length)fail('Chọn từ 1 đến 40 sản phẩm, không trùng.');
  for(const code of codes){const p=typeof code==='string'?q('SELECT * FROM products WHERE code=?').get(code):null;if(!p||p.family!==family||!p.active||p.archived_at)fail('Chỉ chọn sản phẩm đang bán thuộc loại dịch vụ của mẫu.');}
  const design=layout(JSON.parse(r.parsed),body.mapping),id='word-'+randomUUID().slice(0,24);
  q('INSERT INTO quote_templates(id,name,family,intro,terms,product_codes,imported_layout,source_import_id,import_mapping,team_id,created_by) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(id,name,family,'','',JSON.stringify(codes),JSON.stringify(design),r.id,JSON.stringify(body.mapping),user.role==='admin'?null:user.team_id,user.id);
  q('UPDATE quote_template_imports SET template_id=? WHERE id=?').run(id,r.id);log(user.id,'import_template','templates',{id,source:r.id,family,product_codes:codes});return {id};
 });
 on('PUT','/api/templates/:id/import-layout',({user,params,body})=>{
  const t=editable(user,params.id);if(body.reviewed!==true)fail('Xác nhận đã kiểm tra nội dung trước khi lưu.');const r=source(user,t.source_import_id),design=layout(JSON.parse(r.parsed),body.mapping);
  q('UPDATE quote_templates SET name=?,imported_layout=?,import_mapping=?,version=version+1 WHERE id=?').run(text(body.name,200),JSON.stringify(design),JSON.stringify(body.mapping),t.id);log(user.id,'edit_import_layout','templates',{id:t.id});return {id:t.id};
 });
}
