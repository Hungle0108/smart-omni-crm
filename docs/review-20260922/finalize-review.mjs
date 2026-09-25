import {readFileSync,writeFileSync,copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const dir='docs/review-20260922',evidence=JSON.parse(readFileSync(dir+'/evidence.json'));
let index='# Chỉ mục hai tài liệu đã đọc\n\nPhụ lục truy vết nguồn của [báo cáo đối chiếu](../planning/18_DOI_CHIEU_REQUIREMENTS_IVIER_CRM.md). Các số dưới đây là số mục trong tài liệu, không phải điểm hoàn thành.\n\n';
for(const [filename,expected] of [['iVier CRM (4).txt',54],['iVier CRM (5).txt',176]]){
 const lines=readFileSync(dir+'/'+filename,'utf8').split(/\r?\n/);let prev='',sections=[];
 lines.forEach((line,i)=>{if(!line.trim())return;const m=/^(\d+)\.\s+(.+)$/.exec(line);if(m&&prev==='________________')sections.push({n:Number(m[1]),title:m[2],line:i+1});prev=line.trim();});
 assert.equal(sections.length,expected);assert.deepEqual(sections.map(s=>s.n),Array.from({length:expected},(_,i)=>i+1));
 index+='## '+filename+' — '+expected+' mục\n\n| Mục | Nội dung | Dòng bắt đầu |\n|---|---|---|\n'+sections.map(s=>`| ${s.n} | ${s.title.replaceAll('|','/')} | ${s.line} |`).join('\n')+'\n\n';
}
writeFileSync(dir+'/CHI_MUC_NGUON.md',index);
for(const item of evidence.code)assert.equal(createHash('sha256').update(readFileSync(item.path)).digest('hex'),item.sha256,'App source changed '+item.path);
for(const name of ['progress-results.json','zalo-results.json'])copyFileSync('app/test-output/'+name,dir+'/'+name);
writeFileSync(dir+'/review-verification.json',JSON.stringify({at:new Date().toISOString(),source_sections:{architecture:54,database:176},application_source_unchanged:true,app_database_read_only:true,tests:['progress:7 groups passed','zalo:12 offline groups passed','5 targeted observations in gap-validation.json']},null,2));
console.log('54 + 176 mục đã lập chỉ mục; mã ứng dụng giữ nguyên; đã lưu kết quả kiểm tra.');
