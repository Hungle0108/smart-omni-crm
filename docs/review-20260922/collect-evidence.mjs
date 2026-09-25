import {mkdirSync,readFileSync,writeFileSync,copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
const dir='docs/review-20260922';mkdirSync(dir,{recursive:true});
const sources=['C:/Users/Nguyet/Downloads/iVier CRM (4).txt','C:/Users/Nguyet/Downloads/iVier CRM (5).txt'];
const evidence={reviewed_at:new Date().toISOString(),sources:[],code:[],database:{}};
for(const source of sources){const content=readFileSync(source),name=source.split('/').pop();copyFileSync(source,dir+'/'+name);evidence.sources.push({source,snapshot:dir+'/'+name,sha256:createHash('sha256').update(content).digest('hex'),lines:content.toString('utf8').split(/\r?\n/).length});}
for(const path of ['app/server.js','app/features.js','app/customer-progress.js','app/progress-ui.js','app/zalo-oa.js','app/zalo-provider.js','app/zalo-ui.js','app/workspace-ui.js','app/features-ui.js','app/app.html'])evidence.code.push({path,sha256:createHash('sha256').update(readFileSync(path)).digest('hex')});
const db=new DatabaseSync('app/crm.db',{readOnly:true});
for(const t of db.prepare("SELECT name,sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all()){
 const table='"'+t.name.replaceAll('"','""')+'"';evidence.database[t.name]={sql:t.sql,columns:db.prepare('PRAGMA table_info('+table+')').all().map(({name,type,notnull,pk})=>({name,type,notnull,pk})),indexes:db.prepare('PRAGMA index_list('+table+')').all(),foreign_keys:db.prepare('PRAGMA foreign_key_list('+table+')').all()};
}
evidence.oa={config_rows:db.prepare('SELECT count(*) n FROM zalo_connection').get().n,live_conversations:db.prepare('SELECT count(*) n FROM conversations WHERE zalo_oa_id IS NOT NULL').get().n};
db.close();writeFileSync(dir+'/evidence.json',JSON.stringify(evidence,null,2));console.log(JSON.stringify({sources:evidence.sources,tables:Object.keys(evidence.database),oa:evidence.oa},null,2));
