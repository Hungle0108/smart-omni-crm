import { createServer } from 'node:http';
import { createHash, createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { zaloProvider, ZaloError } from './zalo-provider.js';

export function installZaloOA({ db, q, on, Err, now, log, helpers, legacy, keyPath, provider = zaloProvider() }) {
  const { role, cust, myConv, conv, message, answer, inHours } = helpers;
  db.exec(`CREATE TABLE IF NOT EXISTS zalo_connection(id INTEGER PRIMARY KEY CHECK(id=1), config TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 0, verified INTEGER NOT NULL DEFAULT 0, name TEXT, last_received TEXT, issue TEXT);
    CREATE TABLE IF NOT EXISTS zalo_contacts(oa_id TEXT NOT NULL, uid TEXT NOT NULL, customer_id INTEGER NOT NULL REFERENCES customers(id), conv_id INTEGER NOT NULL UNIQUE REFERENCES conversations(id), PRIMARY KEY(oa_id,uid));
    CREATE TABLE IF NOT EXISTS zalo_events(event_key TEXT PRIMARY KEY, received_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS zalo_echoes(oa_id TEXT NOT NULL,provider_id TEXT NOT NULL,conv_id INTEGER NOT NULL,body TEXT NOT NULL,PRIMARY KEY(oa_id,provider_id));
    CREATE TABLE IF NOT EXISTS zalo_outbox(id INTEGER PRIMARY KEY, message_id INTEGER UNIQUE NOT NULL REFERENCES messages(id), oa_id TEXT NOT NULL, uid TEXT NOT NULL, client_key TEXT NOT NULL UNIQUE, status TEXT NOT NULL, provider_id TEXT, error TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS zalo_outbox_status ON zalo_outbox(status,id);`);
  for (const [name, type] of [['zalo_oa_id','TEXT'],['zalo_uid','TEXT']]) if (!q('PRAGMA table_info(conversations)').all().some(x=>x.name===name)) db.exec(`ALTER TABLE conversations ADD COLUMN ${name} ${type}`);
  q('INSERT OR IGNORE INTO schema_migrations(version,at) VALUES(?,?)').run('zalo-oa-v1',now());
  // Never retry a request that may already have reached Zalo after a crash.
  q("UPDATE zalo_outbox SET status='unknown',error='Ứng dụng dừng khi đang gửi. Kiểm tra trên Zalo trước khi gửi lại.',updated_at=? WHERE status='sending'").run(now());
  for(const o of q("SELECT o.message_id,o.error,m.metadata FROM zalo_outbox o JOIN messages m ON m.id=o.message_id WHERE o.status='unknown'").all())q('UPDATE messages SET metadata=? WHERE id=?').run(JSON.stringify({...JSON.parse(o.metadata||'{}'),delivery:'unknown',error:o.error}),o.message_id);
  let key, refreshLock, busy=false, checking=0, ingress, ingressIssue='';
  const row=()=>q('SELECT * FROM zalo_connection WHERE id=1').get();
  function getKey() {
    if(key)return key;
    if(existsSync(keyPath))key=readFileSync(keyPath);
    else { if(row())throw new Err(503,'Thiếu khóa bảo vệ kết nối. Khôi phục khóa từ bản sao lưu.'); key=randomBytes(32);writeFileSync(keyPath,key,{flag:'wx',mode:0o600}); }
    if(key.length!==32)throw new Err(503,'Khóa bảo vệ kết nối không hợp lệ.');return key;
  }
  function seal(value) { const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',getKey(),iv);const data=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);return JSON.stringify({iv:iv.toString('base64'),data:data.toString('base64'),tag:cipher.getAuthTag().toString('base64')}); }
  function config() { const r=row();if(!r)return {};try {const s=JSON.parse(r.config),dec=createDecipheriv('aes-256-gcm',getKey(),Buffer.from(s.iv,'base64'));dec.setAuthTag(Buffer.from(s.tag,'base64'));return JSON.parse(Buffer.concat([dec.update(Buffer.from(s.data,'base64')),dec.final()]).toString('utf8'));}catch {throw new Err(503,'Không mở được cấu hình Zalo. Kiểm tra khóa bảo vệ kết nối.');} }
  function store(c) { q('INSERT INTO zalo_connection(id,config) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET config=excluded.config').run(seal(c)); }
  let suspended=false;
  const enabled=()=>!suspended&&!!row()?.enabled;
  const identifier=(v,label)=>{if(typeof v!=='string'||!/^\d{1,30}$/.test(v))throw new Err(400,label+' phải là dãy số, nhập dưới dạng văn bản.');return v;};
  const text=(v,max)=>{if(typeof v!=='string'||!v.trim()||[...v].length>max)throw new Err(400,`Nội dung cần từ 1 đến ${max} ký tự.`);return v.trim();};
  const status=()=>{const r=row(),c=config();return {configured:!!r,enabled:!!r?.enabled,verified:!!r?.verified,app_id:c.app_id||'',oa_id:c.oa_id||'',name:r?.name||'',team_id:c.team_id||null,public_url:c.public_url||'',auto_reply:!!c.auto_reply,last_received:r?.last_received||null,issue:ingressIssue||r?.issue||'',webhook_path:'/zalo/oa/webhook',receiver_port:ingress?.address()?.port||null,expires_at:c.expires_at||null,has_access_token:!!c.access_token,has_refresh_token:!!c.refresh_token,has_app_secret:!!c.app_secret,has_webhook_secret:!!c.webhook_secret};};
  async function access() {
    const c=config();if(c.access_token&&(!c.expires_at||c.expires_at>Date.now()+120000))return c.access_token;
    if(refreshLock)return refreshLock;
    if(!c.refresh_token||!c.app_secret)throw new Err(409,'Cần cấp mã truy cập và mã làm mới của OA.');
    refreshLock=(async()=>{try {const next=await provider.refresh(c);store({...config(),...next});return next.access_token;}catch(e){q('UPDATE zalo_connection SET enabled=0,verified=0,issue=? WHERE id=1').run('Không làm mới được quyền Zalo. Cần kiểm tra và cấp quyền lại.');throw e;}finally{refreshLock=null;}})();return refreshLock;
  }
  on('GET','/api/integrations/zalo-oa',({user})=>{const s=status();if(user.role!=='admin'||user.admin_level==='subadmin')return {enabled:s.enabled,verified:s.verified,name:s.name};return {...s,teams:q('SELECT id,name FROM teams ORDER BY id').all()};});
  on('PUT','/api/integrations/zalo-oa',({user,body})=>{
    role(user,'admin');if(busy||refreshLock||checking)throw new Err(409,'Đang xử lý kết nối; vui lòng thử lại sau ít giây.');
    const old=config(),app_id=identifier(body.app_id,'App ID'),oa_id=identifier(body.oa_id,'OA ID');
    if(old.oa_id&&old.oa_id!==oa_id&&q('SELECT 1 FROM zalo_contacts LIMIT 1').get())throw new Err(409,'Bản này kết nối một OA. Không thay OA khi đã có hội thoại thật.');
    const team_id=Number(body.team_id);if(!q('SELECT id FROM teams WHERE id=?').get(team_id))throw new Err(400,'Chọn nhóm nhận khách.');
    let public_url=String(body.public_url||'').trim();if(public_url){try {const u=new URL(public_url);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/zalo/oa/webhook')throw Error();public_url=u.href;}catch {throw new Err(400,'Địa chỉ nhận tin phải có dạng https://ten-mien/zalo/oa/webhook');}}
    const changed=old.app_id&&old.app_id!==app_id,c={...(changed?{}:old),app_id,oa_id,team_id,public_url,auto_reply:body.auto_reply===true};
    for(const k of ['app_secret','webhook_secret','access_token','refresh_token'])if(body[k])c[k]=text(body[k],8192);
    if(body.access_token)c.expires_at=Date.now()+Math.min(25,Math.max(0.01,Number(body.token_hours)||1))*3600000;
    store(c);q('UPDATE zalo_connection SET enabled=0,verified=0,issue=NULL WHERE id=1').run();log(user.id,'configure','zalo_oa',{oa_id});return {ok:true,note:'Đã lưu mã hóa. Kiểm tra kết nối trước khi bật nhận/gửi.'};
  });
  on('POST','/api/integrations/zalo-oa/check',async({user})=>{role(user,'admin');checking++;try {const c=config(),data=await provider.info(await access());if(String(data?.oaid??data?.oa_id)!==c.oa_id)throw new Err(409,'Mã truy cập thuộc OA khác. Kiểm tra lại OA ID.');q('UPDATE zalo_connection SET verified=1,name=?,issue=NULL WHERE id=1').run(String(data.name||'Zalo OA').slice(0,200));return {ok:true,name:data.name,note:'Đã xác minh đúng OA. Quyền nhận/gửi sẽ được kiểm tra bằng tin thử thực tế.'};}catch(e){q('UPDATE zalo_connection SET verified=0,enabled=0,issue=? WHERE id=1').run(e instanceof Err||e instanceof ZaloError?e.message:'Không kiểm tra được kết nối.');throw e instanceof Err?e:new Err(502,e instanceof ZaloError?e.message:'Không kiểm tra được Zalo.');}finally{checking--;}},{async:true});
  on('POST','/api/integrations/zalo-oa/enable',({user,body})=>{role(user,'admin');if(typeof body.enabled!=='boolean')throw new Err(400,'Trạng thái không hợp lệ.');if(body.enabled&&checking)throw new Err(409,'Đang kiểm tra kết nối. Vui lòng chờ kết quả.');const c=config();if(body.enabled&&(!row()?.verified||!c.webhook_secret||!c.public_url||!ingress?.listening))throw new Err(409,'Cần kiểm tra đúng OA, khóa webhook và địa chỉ HTTPS trước khi bật.');q('UPDATE zalo_connection SET enabled=? WHERE id=1').run(body.enabled?1:0);log(user.id,body.enabled?'enable':'pause','zalo_oa');return {ok:true};});
  function enqueue(v,sender,userId,body,clientKey,metadata={}) {
    if(!enabled())throw new Err(409,'Kết nối OA đang tạm dừng.');
    const c=config();if(v.zalo_oa_id!==c.oa_id)throw new Err(409,'Hội thoại không thuộc OA đang kết nối.');
    const key=`${v.id}:${text(clientKey,100)}`,old=q('SELECT * FROM zalo_outbox WHERE client_key=?').get(key);if(old)return {id:old.message_id,duplicate:true,status:old.status,note:'Yêu cầu này đã được ghi nhận, không gửi trùng.'};
    const mid=message(v.id,sender,userId,text(body,2000),'oa-out:'+key,{...metadata,live:true,delivery:'pending'});
    q("INSERT INTO zalo_outbox(message_id,oa_id,uid,client_key,status,created_at,updated_at) VALUES(?,?,?,?,'pending',?,?)").run(mid,v.zalo_oa_id,v.zalo_uid,key,now(),now());return {id:mid,delivered:false,status:'pending',note:'Đã xếp hàng gửi tới Zalo OA. Theo dõi trạng thái trên tin nhắn.'};
  }
  on('POST','/api/conversations/:id/messages',ctx=>{const v=conv(ctx.user,ctx.params.id);if(!v.zalo_oa_id)return legacy.messages(ctx);myConv(ctx.user,v.id);if(v.status==='CLOSED'||cust(ctx.user,v.customer_id).do_not_contact)throw new Err(409,'Hội thoại đã đóng hoặc khách yêu cầu không liên hệ.');const result=enqueue(v,'agent',ctx.user.id,ctx.body.body,ctx.body.client_key);q('UPDATE conversations SET bot_active=0 WHERE id=?').run(v.id);return result;});
  on('POST','/api/conversations/:id/incoming',ctx=>{if(conv(ctx.user,ctx.params.id).zalo_oa_id)throw new Err(400,'Không tạo tin giả trong hội thoại Zalo thật.');return legacy.incoming(ctx);});
  on('POST','/api/conversations/:id/bot',ctx=>{const v=conv(ctx.user,ctx.params.id);if(v.zalo_oa_id&&ctx.body.on&&!config().auto_reply)throw new Err(409,'Admin chưa bật FAQ tự trả lời cho OA thật.');return legacy.bot(ctx);});
  on('POST','/api/quotes/:id/send',ctx=>{if(ctx.body.conv_id&&conv(ctx.user,ctx.body.conv_id).zalo_oa_id)throw new Err(400,'Gửi báo giá tự động qua OA thật chưa hỗ trợ. Hãy dùng hội thoại mô phỏng để thử báo giá.');const quote=q('SELECT customer_id FROM quotes WHERE id=?').get(ctx.params.id);if(!ctx.body.conv_id&&quote&&q('SELECT 1 FROM conversations WHERE customer_id=? AND zalo_oa_id IS NOT NULL').get(quote.customer_id))throw new Err(400,'Chọn rõ hội thoại mô phỏng để gửi báo giá thử.');return legacy.quoteSend(ctx);});
  on('POST','/api/conversations/:id/link-customer',({user,params,body})=>{role(user,'leader');const v=conv(user,params.id),c=cust(user,body.customer_id);if(!v.zalo_oa_id)throw new Err(400,'Chỉ liên kết hội thoại OA thật.');if(q('SELECT 1 FROM zalo_outbox o JOIN messages m ON m.id=o.message_id WHERE m.conv_id=? AND o.status IN (\'pending\',\'sending\')').get(v.id))throw new Err(409,'Đang có tin chờ gửi. Thử lại khi xử lý xong.');q('UPDATE conversations SET customer_id=?,assignee_id=? WHERE id=?').run(c.id,c.owner_id,v.id);q('UPDATE zalo_contacts SET customer_id=? WHERE conv_id=?').run(c.id,v.id);message(v.id,'system',user.id,'Trưởng nhóm liên kết hội thoại với hồ sơ khách hiện có.');return {ok:true};});
  function receive(raw,signature) {
    if(!enabled())throw new Err(503,'Kết nối đang dừng.');const c=config();let event;try{event=JSON.parse(raw);}catch{throw new Err(400,'JSON không hợp lệ.');}
    if(!event||event.app_id!==c.app_id||typeof event.timestamp!=='string'||!/^\d{10,16}$/.test(event.timestamp))throw new Err(403,'Sự kiện không hợp lệ.');
    const mac=createHash('sha256').update(c.app_id).update(raw).update(event.timestamp).update(c.webhook_secret).digest('hex'),given=String(signature||'').replace(/^mac=/,'');
    if(!/^[a-f0-9]{64}$/i.test(given)||!timingSafeEqual(Buffer.from(mac,'hex'),Buffer.from(given,'hex')))throw new Err(403,'Chữ ký không hợp lệ.');
    const incoming=event.event_name==='user_send_text',echo=event.event_name==='oa_send_text';
    if(!incoming&&!echo)return {ok:true,ignored:true};
    const oa=incoming?event.recipient?.id:event.sender?.id,uid=incoming?event.sender?.id:event.recipient?.id;
    if(oa!==c.oa_id||typeof uid!=='string'||!/^\d{1,30}$/.test(uid)||!event.message?.msg_id)throw new Err(403,'OA hoặc người gửi không hợp lệ.');
    const eventKey=`${oa}:${event.event_name}:${event.message.msg_id}`;if(q('SELECT 1 FROM zalo_events WHERE event_key=?').get(eventKey))return {ok:true,duplicate:true};
    if(Math.abs(Date.now()-Number(event.timestamp))>24*3600000)throw new Err(400,'Sự kiện đã quá thời gian nhận.');
    const content=text(event.message.text,10000);db.exec('BEGIN IMMEDIATE');try {
      let contact=q('SELECT * FROM zalo_contacts WHERE oa_id=? AND uid=?').get(oa,uid);
      if(!contact&&incoming){const id=q("INSERT INTO customers(kind,name,team_id,created_at) VALUES('person',?,?,?)").run('Khách Zalo '+uid.slice(-6),c.team_id,now()).lastInsertRowid;const vid=q('INSERT INTO conversations(customer_id,channel,bot_active,last_at,zalo_oa_id,zalo_uid) VALUES(?,?,?,?,?,?)').run(id,'Zalo OA (thật)',c.auto_reply?1:0,now(),oa,uid).lastInsertRowid;q('INSERT INTO zalo_contacts(oa_id,uid,customer_id,conv_id) VALUES(?,?,?,?)').run(oa,uid,id,vid);contact={customer_id:id,conv_id:vid};}
      if(contact){const v=q('SELECT * FROM conversations WHERE id=?').get(contact.conv_id),customer=q('SELECT * FROM customers WHERE id=?').get(contact.customer_id);
        if(incoming){message(v.id,'customer',null,content,'oa-in:'+event.message.msg_id,{live:true,provider_id:event.message.msg_id});q("UPDATE conversations SET status='OPEN',assignee_id=? WHERE id=?").run(customer.owner_id,v.id);
          if(c.auto_reply&&v.bot_active&&!customer.do_not_contact){const reply=answer(content);if(inHours()===false)reply.body+=' Nhân viên sẽ liên hệ trong giờ làm việc.';if([...reply.body].length<=2000)enqueue(v,'bot',null,reply.body,'bot:'+event.message.msg_id,{source:reply.source});}
        }else {q('INSERT OR IGNORE INTO zalo_echoes(oa_id,provider_id,conv_id,body) VALUES(?,?,?,?)').run(oa,event.message.msg_id,v.id,content);}
      }
      q('INSERT INTO zalo_events(event_key,received_at) VALUES(?,?)').run(eventKey,now());q('UPDATE zalo_connection SET last_received=? WHERE id=1').run(now());db.exec('COMMIT');if(!busy)flushEchoes();return {ok:true};
    }catch(e){if(db.isTransaction)db.exec('ROLLBACK');throw e;}
  }
  const delivery=(o,state,error=null,providerId=null)=>{q('UPDATE zalo_outbox SET status=?,error=?,provider_id=COALESCE(?,provider_id),updated_at=? WHERE id=?').run(state,error,providerId,now(),o.id);const m=q('SELECT metadata FROM messages WHERE id=?').get(o.message_id);q('UPDATE messages SET metadata=? WHERE id=?').run(JSON.stringify({...JSON.parse(m.metadata||'{}'),delivery:state,error,provider_id:providerId}),o.message_id);};
  function flushEchoes(){for(const echo of q('SELECT * FROM zalo_echoes').all()){db.exec('BEGIN IMMEDIATE');try{if(!q('SELECT 1 FROM zalo_outbox WHERE oa_id=? AND provider_id=?').get(echo.oa_id,echo.provider_id)){message(echo.conv_id,'agent',null,echo.body,'oa-echo:'+echo.provider_id,{live:true,delivery:'accepted',provider_id:echo.provider_id});q('UPDATE conversations SET bot_active=0 WHERE id=?').run(echo.conv_id);}q('DELETE FROM zalo_echoes WHERE oa_id=? AND provider_id=?').run(echo.oa_id,echo.provider_id);db.exec('COMMIT');}catch(e){if(db.isTransaction)db.exec('ROLLBACK');throw e;}}}
  async function processOne() {
    if(busy||!enabled())return;busy=true;let o;
    try {o=q("SELECT o.*,m.conv_id,m.body,m.sender,m.user_id FROM zalo_outbox o JOIN messages m ON m.id=o.message_id WHERE o.status='pending' ORDER BY o.id LIMIT 1").get();if(!o)return;
      const token=await access();if(!enabled())return;
      const v=q('SELECT * FROM conversations WHERE id=?').get(o.conv_id),c=q('SELECT * FROM customers WHERE id=?').get(v.customer_id);
      let revoked=o.sender==='agent'&&helpers.canSendChannelMessage&&!helpers.canSendChannelMessage(o.user_id,v);
      if(o.sender==='bot'){const meta=JSON.parse(q('SELECT metadata FROM messages WHERE id=?').get(o.message_id).metadata||'{}');if(meta.source){const k=q('SELECT approved_version,status FROM knowledge WHERE id=?').get(meta.source.id);revoked=!k||k.status==='WITHDRAWN'||k.approved_version!==meta.source.version;}}
      if(c.do_not_contact||v.status==='CLOSED'||revoked||(o.sender==='bot'&&(!v.bot_active||!config().auto_reply))){delivery(o,'cancelled','Đã dừng gửi theo trạng thái chăm sóc, nội dung hoặc bàn giao.');return;}
      delivery(o,'sending');try {const id=await provider.send(token,o.uid,o.body);delivery(o,'accepted',null,id);}catch(e){delivery(o,e.uncertain?'unknown':'failed',e instanceof ZaloError?e.message:'Không gửi được tin.');}
    }catch(e){if(o)delivery(o,'failed',e instanceof Err||e instanceof ZaloError?e.message:'Không chuẩn bị được tin gửi.');}finally{busy=false;try{flushEchoes();}catch{q('UPDATE zalo_connection SET issue=? WHERE id=1').run('Cần đối chiếu tin trả lời từ OA.');}}
  }
  const timer=setInterval(()=>void processOne(),1000);timer.unref();
  function listen(port) {
    ingress=createServer(async(req,res)=>{res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');try {
      if(req.method!=='POST'||req.url!=='/zalo/oa/webhook'){res.writeHead(404);return res.end('{"error":"Not found"}');}
      if(!String(req.headers['content-type']||'').startsWith('application/json'))throw new Err(415,'Cần JSON.');
      const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>262144)throw new Err(413,'Sự kiện quá lớn.');chunks.push(chunk);}
      const r=receive(Buffer.concat(chunks),req.headers['x-zevent-signature']);res.writeHead(200);res.end(JSON.stringify(r));
    }catch(e){res.writeHead(e instanceof Err?e.code:500);res.end(JSON.stringify({error:e instanceof Err?e.message:'Không nhận được sự kiện.'}));}});
    ingress.requestTimeout=10000;ingress.headersTimeout=10000;ingress.on('error',()=>{ingressIssue='Cổng nhận webhook chưa mở được. Kiểm tra cổng nhận tin.';});ingress.listen(port,'127.0.0.1');return ingress;
  }
  return {status,receive,processOne,listen,suspend:value=>{suspended=value;},close:()=>{clearInterval(timer);ingress?.close();}};
}
