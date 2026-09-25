import {installDirectory} from './directory.js';
import {validatePhone} from './phone-validation.js';
// Organization hierarchy and contacts reuse the existing customer access scope.
export function installOrganizations({db,q,on,Err,now,log,helpers,canSeeCustomer,legacy}) {
  const {role,cust}=helpers;
  if(!q('PRAGMA table_info(customers)').all().some(c=>c.name==='parent_org_id'))db.exec('ALTER TABLE customers ADD COLUMN parent_org_id INTEGER REFERENCES customers(id)');
  db.exec(`CREATE INDEX IF NOT EXISTS customer_parent_org ON customers(parent_org_id);
    CREATE TABLE IF NOT EXISTS organization_details(customer_id INTEGER PRIMARY KEY REFERENCES customers(id),short_name TEXT NOT NULL DEFAULT '',industry TEXT NOT NULL DEFAULT '',website TEXT NOT NULL DEFAULT '',address TEXT NOT NULL DEFAULT '',description TEXT NOT NULL DEFAULT '');
    CREATE TABLE IF NOT EXISTS contacts(id INTEGER PRIMARY KEY,organization_id INTEGER NOT NULL REFERENCES customers(id),full_name TEXT NOT NULL,job_title TEXT NOT NULL DEFAULT '',department TEXT NOT NULL DEFAULT '',contact_role TEXT NOT NULL DEFAULT 'Đầu mối liên hệ',phone TEXT NOT NULL DEFAULT '',email TEXT NOT NULL DEFAULT '',phone_normalized TEXT NOT NULL DEFAULT '',email_normalized TEXT NOT NULL DEFAULT '',is_primary INTEGER NOT NULL DEFAULT 0,note TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,created_by INTEGER REFERENCES users(id),updated_at TEXT NOT NULL,updated_by INTEGER REFERENCES users(id),archived_at TEXT,archived_by INTEGER REFERENCES users(id));
    CREATE INDEX IF NOT EXISTS contacts_organization ON contacts(organization_id,archived_at);
    CREATE UNIQUE INDEX IF NOT EXISTS contact_primary_active ON contacts(organization_id) WHERE is_primary=1 AND archived_at IS NULL;
    CREATE TABLE IF NOT EXISTS organization_history(id INTEGER PRIMARY KEY,organization_id INTEGER NOT NULL REFERENCES customers(id),title TEXT NOT NULL,user_id INTEGER REFERENCES users(id),at TEXT NOT NULL);`);
  for(const [name,type] of [['detached_at','TEXT'],['version','INTEGER NOT NULL DEFAULT 1']])if(!q('PRAGMA table_info(contacts)').all().some(c=>c.name===name))db.exec('ALTER TABLE contacts ADD COLUMN '+name+' '+type);
  q('INSERT OR IGNORE INTO schema_migrations(version,at) VALUES(?,?)').run('organization-contacts-v1',now());
  const text=(v,max=250,required=false)=>{if(typeof v!=='string'&&v!==undefined&&v!==null)throw new Err(400,'Nội dung phải là văn bản.');const s=String(v??'').trim();if(s.length>max||(required&&!s))throw new Err(400,'Kiểm tra nội dung bắt buộc và độ dài tối đa '+max+' ký tự.');return s;};
  const org=(u,id)=>{role(u,'sales','leader');const c=cust(u,id);if(c.kind!=='org')throw new Err(400,'Chỉ tổ chức mới có đơn vị con và người liên hệ.');return c;};
  const record=(u,id,title,detail)=>{q('INSERT INTO organization_history(organization_id,title,user_id,at) VALUES(?,?,?,?)').run(id,title,u.id,now());log(u.id,'organization_update','customer',{id,...detail});};
  const safeCustomer=(u,c)=>{if(!c?.parent_org_id)return c;const p=q('SELECT * FROM customers WHERE id=?').get(c.parent_org_id);return {...c,parent_org_id:canSeeCustomer(u,p)?p.id:null,parent_restricted:!canSeeCustomer(u,p)};};
  function parent(u,c,parentId) {
    if(!parentId)return null;const p=org(u,parentId);
    if(p.team_id!==c.team_id)throw new Err(403,'Đơn vị mẹ cần thuộc cùng nhóm quản lý.');
    let cursor=p,seen=new Set([c.id]);
    while(cursor){if(seen.has(cursor.id))throw new Err(400,'Không thể chọn chính đơn vị hoặc đơn vị con làm đơn vị mẹ.');seen.add(cursor.id);cursor=cursor.parent_org_id?q('SELECT * FROM customers WHERE id=?').get(cursor.parent_org_id):null;}
    return p.id;
  }
  on('GET','/api/customers',ctx=>legacy.list(ctx).map(c=>safeCustomer(ctx.user,c)));
  on('GET','/api/customers/:id',ctx=>{const d=legacy.detail(ctx);d.customer=safeCustomer(ctx.user,d.customer);return d;});
  on('POST','/api/customers',ctx=>{
    if(!ctx.body.parent_org_id)return legacy.create(ctx);
    const p=org(ctx.user,ctx.body.parent_org_id);if(ctx.body.kind!=='org')throw new Err(400,'Đơn vị con phải là tổ chức. Thêm cá nhân bằng mục Người liên hệ.');
    const result=legacy.create({...ctx,body:{...ctx.body,owner_id:p.owner_id,is_sample:!!p.is_sample}});
    q('UPDATE customers SET parent_org_id=? WHERE id=?').run(p.id,result.id);record(ctx.user,p.id,'Thêm đơn vị con: '+ctx.body.name,{child_id:result.id});return result;
  });
  on('GET','/api/organizations',ctx=>legacy.list(ctx).filter(c=>c.kind==='org').map(c=>({...safeCustomer(ctx.user,c),contact_count:q('SELECT count(*) n FROM contacts WHERE organization_id=? AND archived_at IS NULL AND detached_at IS NULL').get(c.id).n})));
  on('GET','/api/organizations/:id',({user,params})=>{
    const c=org(user,params.id),p=c.parent_org_id?q('SELECT * FROM customers WHERE id=?').get(c.parent_org_id):null;
    const children=q('SELECT c.*,u.name owner_name FROM customers c LEFT JOIN users u ON u.id=c.owner_id WHERE c.parent_org_id=? ORDER BY c.name').all(c.id).filter(c=>canSeeCustomer(user,c));
    return {organization:safeCustomer(user,c),details:q('SELECT * FROM organization_details WHERE customer_id=?').get(c.id)||{},parent:p&&canSeeCustomer(user,p)?{id:p.id,name:p.name}:null,parent_restricted:!!p&&!canSeeCustomer(user,p),children:children.map(c=>safeCustomer(user,c)),contacts:q('SELECT * FROM contacts WHERE organization_id=? AND detached_at IS NULL ORDER BY archived_at IS NOT NULL,is_primary DESC,full_name').all(c.id)};
  });
  on('PUT','/api/organizations/:id/parent',({user,params,body})=>{
    role(user,'leader');const c=org(user,params.id),next=parent(user,c,body.parent_org_id),reason=text(body.reason,500,true);
    q('UPDATE customers SET parent_org_id=? WHERE id=?').run(next,c.id);record(user,c.id,'Cập nhật đơn vị mẹ: '+reason,{old_parent:c.parent_org_id,new_parent:next});return {ok:true};
  });
  on('PUT','/api/organizations/:id/details',({user,params,body})=>{
    const c=org(user,params.id),old=q('SELECT * FROM organization_details WHERE customer_id=?').get(c.id)||{};
    const values={short_name:text(body.short_name),industry:text(body.industry),website:text(body.website,1000),address:text(body.address,1000),description:text(body.description,5000)};
    if(values.website){try{const u=new URL(values.website);if(!['https:','http:'].includes(u.protocol)||u.username||u.password)throw Error();}catch{throw new Err(400,'Website cần bắt đầu bằng https:// hoặc http://.');}}
    q('INSERT INTO organization_details(customer_id,short_name,industry,website,address,description) VALUES(?,?,?,?,?,?) ON CONFLICT(customer_id) DO UPDATE SET short_name=excluded.short_name,industry=excluded.industry,website=excluded.website,address=excluded.address,description=excluded.description').run(c.id,...Object.values(values));
    record(user,c.id,'Cập nhật thông tin chi tiết tổ chức.',{old,new:values});return {ok:true};
  });
  const roles=['Đầu mối liên hệ','Người quyết định','Người dùng','Kế toán','Mua sắm','Kỹ thuật','Khác'];
  function fields(body){
    validatePhone(body.phone,message=>{throw new Err(400,message);});
    const v={full_name:text(body.full_name,250,true),job_title:text(body.job_title),department:text(body.department),contact_role:body.contact_role||'Đầu mối liên hệ',phone:text(body.phone,50),email:text(body.email,250),note:text(body.note,5000)};
    if(!roles.includes(v.contact_role))throw new Err(400,'Vai trò liên hệ không hợp lệ.');
    if(v.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))throw new Err(400,'Email không hợp lệ.');
    v.email_normalized=v.email.toLowerCase();v.phone_normalized=v.phone.replace(/[^\d+]/g,'').replace(/^0084/,'+84').replace(/^84/,'+84').replace(/^0(?=\d{8,10}$)/,'+84');
    if(body.is_primary!==undefined&&typeof body.is_primary!=='boolean')throw new Err(400,'Đầu mối chính không hợp lệ.');v.is_primary=body.is_primary===true?1:0;return v;
  }
  function duplicate(orgId,v,except=0){if(q('SELECT id FROM contacts WHERE organization_id=? AND id<>? AND archived_at IS NULL AND detached_at IS NULL AND ((?<>\'\' AND phone_normalized=?) OR (?<>\'\' AND email_normalized=?))').get(orgId,except,v.phone_normalized,v.phone_normalized,v.email_normalized,v.email_normalized))throw new Err(409,'Đã có người liên hệ cùng điện thoại hoặc email trong đơn vị này. Kiểm tra danh sách trước khi thêm.');}
  const contact=(u,id)=>{const c=q('SELECT * FROM contacts WHERE id=?').get(Number(id));if(!c)throw new Err(404,'Không tìm thấy người liên hệ.');org(u,c.organization_id);return c;};
  on('POST','/api/organizations/:id/contacts',({user,params,body})=>{
    const c=org(user,params.id),v=fields(body);duplicate(c.id,v);
    const existing=q("SELECT p.*,c.owner_id,c.team_id FROM contacts p JOIN customers c ON c.id=p.organization_id WHERE p.archived_at IS NULL AND ((?<>'' AND p.phone_normalized=?) OR (?<>'' AND p.email_normalized=?))").all(v.phone_normalized,v.phone_normalized,v.email_normalized,v.email_normalized).find(p=>canSeeCustomer(user,p));if(existing)throw new Err(409,'Có người liên hệ trùng điện thoại/email trong phạm vi của bạn. Chọn liên hệ có sẵn; không tạo bản sao.');
    if(v.is_primary)q('UPDATE contacts SET is_primary=0,updated_at=?,updated_by=? WHERE organization_id=? AND is_primary=1').run(now(),user.id,c.id);
    const id=q('INSERT INTO contacts(organization_id,full_name,job_title,department,contact_role,phone,email,note,email_normalized,phone_normalized,is_primary,created_at,created_by,updated_at,updated_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(c.id,...Object.values(v),now(),user.id,now(),user.id).lastInsertRowid;
    record(user,c.id,'Thêm người liên hệ: '+v.full_name,{contact_id:Number(id),new:v});return {id:Number(id)};
  });
  on('PUT','/api/contacts/:id',({user,params,body})=>{
    const c=contact(user,params.id);if(body.version!==undefined&&body.version!==c.version)throw new Err(409,'Liên hệ đã thay đổi. Hãy tải lại trước khi sửa.');if(c.archived_at)throw new Err(409,'Khôi phục người liên hệ trước khi sửa.');const v=fields(body);if(c.detached_at&&v.is_primary)throw new Err(400,'Liên hệ chưa gắn đơn vị không thể là đầu mối chính.');if(q('SELECT archived_at FROM customers WHERE id=?').get(c.organization_id)?.archived_at)throw new Err(409,'Đơn vị quản lý đã lưu trữ.');duplicate(c.organization_id,v,c.id);
    if(v.is_primary)q('UPDATE contacts SET is_primary=0,updated_at=?,updated_by=? WHERE organization_id=? AND is_primary=1 AND id<>?').run(now(),user.id,c.organization_id,c.id);
    q('UPDATE contacts SET full_name=?,job_title=?,department=?,contact_role=?,phone=?,email=?,note=?,email_normalized=?,phone_normalized=?,is_primary=?,version=version+1,updated_at=?,updated_by=? WHERE id=?').run(...Object.values(v),now(),user.id,c.id);
    record(user,c.organization_id,'Sửa người liên hệ: '+v.full_name,{contact_id:c.id,old:c,new:v});return {ok:true};
  });
  on('POST','/api/contacts/:id/archive',({user,params,body})=>{const c=contact(user,params.id),reason=text(body.reason,500,true);if(c.archived_at)return {ok:true};q('UPDATE contacts SET archived_at=?,archived_by=?,is_primary=0,version=version+1,updated_at=?,updated_by=? WHERE id=?').run(now(),user.id,now(),user.id,c.id);record(user,c.organization_id,'Ngừng liên hệ '+c.full_name+': '+reason,{contact_id:c.id});return {ok:true};});
  on('POST','/api/contacts/:id/restore',({user,params})=>{const c=contact(user,params.id);if(!c.archived_at)return {ok:true};duplicate(c.organization_id,c,c.id);q('UPDATE contacts SET archived_at=NULL,archived_by=NULL,is_primary=0,version=version+1,updated_at=?,updated_by=? WHERE id=?').run(now(),user.id,c.id);record(user,c.organization_id,'Khôi phục người liên hệ: '+c.full_name,{contact_id:c.id});return {ok:true};});
  on('GET','/api/customers/:id/timeline',ctx=>{const result=legacy.timeline(ctx);const rows=q('SELECT h.*,u.name actor FROM organization_history h LEFT JOIN users u ON u.id=h.user_id WHERE organization_id=? ORDER BY h.id DESC LIMIT 200').all(ctx.params.id);result.events.push(...rows.map(h=>({id:'organization:'+h.id,type:'Tổ chức & liên hệ',title:h.title,actor:h.actor,at:h.at})));result.events.sort((a,b)=>Date.parse(b.at)-Date.parse(a.at));result.events=result.events.slice(0,200);return result;});
  installDirectory({db,q,on,Err,now,log,org,contact,fields,duplicate,record,text,canSeeCustomer});
}
