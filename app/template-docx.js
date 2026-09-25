import JSZip from 'jszip';
import xml from 'xml-js';
import {posix} from 'node:path';

// Import data only: no extraction to disk, external relationships, macros or HTML.
export const IMPORT_LIMIT=5*1024*1024;
export const TEMPLATE_SLOTS=['brand','title','customer','items','totals','terms'];
const fail=message=>{throw new Error(message);};
const children=(n,name)=>(n?.elements||[]).filter(e=>e.type==='element'&&(!name||e.name===name));
const child=(n,name)=>children(n,name)[0];
const attr=(n,key='w:val')=>n?.attributes?.[key];
const descendants=(n,name)=>children(n).flatMap(e=>[...(e.name===name?[e]:[]),...descendants(e,name)]);
const textContent=n=>(n?.elements||[]).map(e=>e.type==='text'?e.text:textContent(e)).join('');
function boundedRead(entry,limit){return new Promise((resolve,reject)=>{let size=0;const chunks=[],stream=entry.internalStream('nodebuffer');stream.on('data',chunk=>{size+=chunk.length;if(size>limit){stream.pause();reject(Error('Nội dung sau giải nén vượt kích thước cho phép.'));}else chunks.push(chunk);}).on('error',reject).on('end',()=>resolve(Buffer.concat(chunks))).resume();});}
function readXml(text){
 if(text.length>2*1024*1024||/<!DOCTYPE|<!ENTITY/i.test(text))fail('Nội dung Word không được hỗ trợ.');
 // Bound nesting before recursive traversal and reject malformed XML through sax.
 let depth=0;for(const tag of text.matchAll(/<([^>]+)>/g)){const s=tag[1];if(s.startsWith('/') )depth--;else if(!/^[!?]/.test(s)&&!s.endsWith('/'))depth++;if(depth>60)fail('Tệp Word có cấu trúc quá phức tạp.');}
 return xml.xml2js(text,{compact:false,ignoreComment:true,ignoreDeclaration:true,ignoreInstruction:true});
}
function checkZip(bytes){
 if(bytes.length<22||bytes.length>IMPORT_LIMIT)fail('Chọn tệp Word DOCX tối đa 5 MB.');
 let end=-1;for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(bytes.readUInt32LE(i)===0x06054b50){end=i;break;}
 if(end<0)fail('Tệp không phải Word DOCX hợp lệ.');
 const count=bytes.readUInt16LE(end+10),offset=bytes.readUInt32LE(end+16);
 if(bytes.readUInt16LE(end+4)||bytes.readUInt16LE(end+6)||count>400||offset>=end)fail('Tệp nén không được hỗ trợ.');
 let at=offset,total=0;
 for(let i=0;i<count;i++){
  if(at+46>end||bytes.readUInt32LE(at)!==0x02014b50)fail('Cấu trúc tệp nén không hợp lệ.');
  const flags=bytes.readUInt16LE(at+8),size=bytes.readUInt32LE(at+24),len=bytes.readUInt16LE(at+28),extra=bytes.readUInt16LE(at+30),comment=bytes.readUInt16LE(at+32);
  if(flags&1||size>8*1024*1024||(total+=size)>20*1024*1024)fail('Tệp được bảo vệ hoặc quá lớn sau giải nén.');
  const name=bytes.toString('utf8',at+46,at+46+len);
  if(/vbaProject|activeX|embeddings\//i.test(name))fail('Mẫu có macro hoặc đối tượng nhúng. Hãy lưu một bản DOCX thông thường.');
  at+=46+len+extra+comment;
 }if(at>end)fail('Cấu trúc tệp nén không hợp lệ.');
}
export async function parseTemplateDocx(bytes){
 checkZip(bytes);let zip;try{zip=await JSZip.loadAsync(bytes);}catch{fail('Không đọc được tệp Word DOCX.');}
 if(!zip.file('word/document.xml'))fail('Chọn tệp Word DOCX; chưa hỗ trợ DOC, PDF, Excel hoặc ảnh.');
 const warnings=new Set(['Giữ bố cục cơ bản, màu chữ, bảng và ảnh. Không tái tạo chính xác phân trang, hình nổi hoặc phông chữ riêng của Word.','Tên khách, số tiền và điều kiện cũ không tự đưa vào mẫu. Hãy kiểm tra từng phần trước khi lưu.']);
 const blocks=[];let images=0,budget=0;
 const parts=[...Object.keys(zip.files).filter(n=>/^word\/header\d+\.xml$/.test(n)).sort(),'word/document.xml',...Object.keys(zip.files).filter(n=>/^word\/footer\d+\.xml$/.test(n)).sort()];
 if(parts.length>12)fail('Mẫu có quá nhiều đầu trang / chân trang.');
 for(const part of parts){
  const relationships={},relPath='word/_rels/'+posix.basename(part)+'.rels';
  if(zip.file(relPath)){const doc=readXml((await boundedRead(zip.file(relPath),2*1024*1024)).toString('utf8'));for(const r of descendants(doc,'Relationship'))if(r.attributes?.TargetMode!=='External')relationships[r.attributes?.Id]=r.attributes?.Target;}
  const doc=readXml((await boundedRead(zip.file(part),2*1024*1024)).toString('utf8'));
  if(descendants(doc,'w:txbxContent').length||descendants(doc,'wp:anchor').length)warnings.add('Có hộp chữ / ảnh nổi: vị trí được chuyển về dòng văn bản, cần xem lại.');
  async function paragraph(n){
   const props=child(n,'w:pPr'),alignment=attr(child(props,'w:jc'));
   const runs=[];
   for(const r of descendants(n,'w:r')){
    const p=child(r,'w:rPr'),color=attr(child(p,'w:color')),size=Number(attr(child(p,'w:sz')))/2;
    const text=children(r).map(e=>e.name==='w:t'?textContent(e):['w:br','w:cr'].includes(e.name)?'\n':e.name==='w:tab'?' ': '').join('');
    budget+=text.length;if(budget>120000)fail('Mẫu có quá nhiều nội dung; hãy rút gọn trước khi tải.');
    if(text)runs.push({text,bold:!!child(p,'w:b')&&!['0','false'].includes(attr(child(p,'w:b'))),italic:!!child(p,'w:i'),...(/^[a-f0-9]{6}$/i.test(color)?{color:'#'+color}:{}),...(size>=8&&size<=36?{size}:{})});
    for(const blip of descendants(r,'a:blip')){
     const target=relationships[attr(blip,'r:embed')];if(!target)continue;
     const path=posix.normalize(posix.join('word',target));
     if(!/^word\/media\/[^/]+\.(png|jpe?g|webp)$/i.test(path)||!zip.file(path)){warnings.add('Một ảnh có định dạng chưa hỗ trợ nên được bỏ qua.');continue;}
     if(images>=6){warnings.add('Chỉ nhập tối đa 6 ảnh trong mẫu.');continue;}
     let data;try{data=await boundedRead(zip.file(path),300*1024);}catch{warnings.add('Ảnh quá lớn hoặc bị lỗi được bỏ qua.');continue;}
     const mime=data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'png':data[0]===255&&data[1]===216&&data[2]===255?'jpeg':data.toString('ascii',0,4)==='RIFF'&&data.toString('ascii',8,12)==='WEBP'?'webp':null;
     if(!mime||data.length>300*1024){warnings.add('Ảnh không hợp lệ hoặc trên 300 KB được bỏ qua.');continue;}images++;runs.push({image:`data:image/${mime};base64,${data.toString('base64')}`});
    }
   }
   return {type:'paragraph',align:['center','right','both'].includes(alignment)?alignment==='both'?'justify':alignment:'left',runs};
  }
  async function block(n){
   if(n.name==='w:p')return paragraph(n);
   if(n.name!=='w:tbl')return null;
   const rows=children(n,'w:tr');if(rows.length>100)fail('Bảng trên 100 dòng chưa được hỗ trợ.');
   const result=[];for(const row of rows){const cells=children(row,'w:tc');if(cells.length>12)fail('Bảng trên 12 cột chưa được hỗ trợ.');const line=[];for(const cell of cells){if(descendants(cell,'w:vMerge').length)warnings.add('Ô bảng gộp dọc được chuyển thành các ô thường.');line.push({span:Math.min(12,Math.max(1,Number(attr(child(child(cell,'w:tcPr'),'w:gridSpan')))||1)),paragraphs:await Promise.all(children(cell,'w:p').map(paragraph))});}result.push(line);}
   return {type:'table',rows:result};
  }
  const container=part==='word/document.xml'?descendants(doc,'w:body')[0]:children(doc)[0];
  for(const node of children(container)){const b=await block(node);if(b&&(b.type==='table'||b.runs.length)){blocks.push({...b,id:blocks.length,part:part.includes('header')?'header':part.includes('footer')?'footer':'body'});if(blocks.length>300)fail('Mẫu trên 300 phần nội dung; hãy rút gọn trước khi tải.');}}
 }
 if(!blocks.length)fail('Không tìm thấy nội dung văn bản hoặc ảnh có thể dùng trong mẫu.');
 const assigned=new Set();
 const mapping=blocks.map(b=>{const text=blockText(b).toLocaleLowerCase('vi');let kind='omit';
  if(b.type==='paragraph'&&b.runs.some(r=>r.image)&&!text.trim())kind='static';
  else if(!assigned.has('title')&&/bảng báo giá|báo giá dịch vụ/.test(text))kind='title';
  else if(!assigned.has('customer')&&/kính gửi/.test(text))kind='customer';
  else if(!assigned.has('items')&&b.type==='table'&&/đơn giá|thành tiền|giá bán|vnđ|vnd/.test(text))kind='items';
  else if(!assigned.has('terms')&&b.type==='paragraph'&&/điều kiện thương mại|điều khoản thanh toán/.test(text))kind='terms';
  if(TEMPLATE_SLOTS.includes(kind))assigned.add(kind);return kind;
 });
 return {blocks,mapping,warnings:[...warnings]};
}
export function blockText(b){return b.type==='table'?b.rows.map(r=>r.map(c=>c.paragraphs.map(blockText).join(' ')).join(' | ')).join('\n'):(b.runs||[]).map(r=>r.text||'').join('');}
export function buildTemplateLayout(parsed,mapping){
 if(!Array.isArray(mapping)||mapping.length!==parsed.blocks.length)fail('Danh sách phần nội dung không khớp tệp.');
 const seen=new Set(),sections=[];
 mapping.forEach((kind,i)=>{
  if(!['omit','static',...TEMPLATE_SLOTS].includes(kind))fail('Cách điền nội dung không hợp lệ.');
  if(kind==='omit')return;
  if(kind==='static'){sections.push({kind,block:parsed.blocks[i]});return;}
  if(seen.has(kind))fail('Mỗi phần tự điền từ CRM chỉ chọn một lần.');seen.add(kind);
  sections.push({kind,align:parsed.blocks[i].align||'left'});
 });
 // Required sections cannot be removed accidentally by the uploaded document.
 for(const kind of TEMPLATE_SLOTS.filter(k=>!seen.has(k))){const entry={kind,align:kind==='title'?'center':'left'};if(kind==='brand')sections.unshift(entry);else sections.push(entry);}
 return {version:1,sections};
}
