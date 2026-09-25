// Organization directory: reuse contacts, single active organization per contact.
import {validatePhone} from './phone-validation.js';
export function installDirectory({db,q,on,Err,now,log,org,contact,fields,duplicate,record,text,canSeeCustomer}){
 db.exec(`CREATE TABLE IF NOT EXISTS contact_link_history(id INTEGER PRIMARY KEY,contact_id INTEGER NOT NULL REFERENCES contacts(id),organization_id INTEGER NOT NULL REFERENCES customers(id),action TEXT NOT NULL,reason TEXT NOT NULL DEFAULT '',user_id INTEGER,at TEXT NOT NULL);`);
 const fold=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
 const match=(p,s)=>fold([p.full_name,p.phone,p.email,p.department,p.job_title,p.note].join(' ')).includes(fold(s));
 const activeOrg=(u,id)=>{const c=org(u,id);if(c.archived_at)throw new Err(409,'Đơn vị đã lưu trữ. Khôi phục trước khi thao tác.');return c;};
 const orgs=u=>q('SELECT c.*,u.name owner_name,d.address,d.short_name,d.industry,d.website,d.description FROM customers c LEFT JOIN users u ON u.id=c.owner_id LEFT JOIN organization_details d ON d.customer_id=c.id WHERE c.archived_at IS NULL ORDER BY c.id DESC').all().filter(c=>canSeeCustomer(u,c));
 const allContacts=u=>q('SELECT p.*,c.name organization_name,c.owner_id,c.team_id,c.needs_followup,c.do_not_contact,c.interest,c.archived_at org_archived FROM contacts p JOIN customers c ON c.id=p.organization_id ORDER BY p.is_primary DESC,p.full_name,p.id').all().filter(c=>!c.org_archived&&canSeeCustomer(u,c));
 const page=(rows,url)=>{const size=Math.max(1,Math.min(50,Number(url.searchParams.get('size'))||10)),total=rows.length,pages=Math.max(1,Math.ceil(total/size)),current=Math.min(pages,Math.max(1,Number(url.searchParams.get('page'))||1));return {items:rows.slice((current-1)*size,current*size),total,page:current,pages,size};};
 const checkVersion=(c,b)=>{if(!Number.isInteger(b.version)||b.version!==c.version)throw new Err(409,'Liên hệ đã thay đổi. Tải lại danh sách rồi thử lại.');};
 const history=(u,c,action,reason='')=>{q('INSERT INTO contact_link_history(contact_id,organization_id,action,reason,user_id,at) VALUES(?,?,?,?,?,?)').run(c.id,c.organization_id,action,reason,u.id,now());record(u,c.organization_id,action+(reason?': '+reason:''),{contact_id:c.id});};
 on('GET','/api/directory',({user,url})=>{
  if(!['sales','leader'].includes(user.role))throw new Err(403,'Danh bạ chỉ dành cho người có quyền hồ sơ khách hàng.');
  const all=orgs(user),contacts=allContacts(user).filter(p=>!p.archived_at&&!p.detached_at),search=url.searchParams.get('search')||'',kind=url.searchParams.get('kind')||'all',owner=url.searchParams.get('owner')||'all',care=url.searchParams.get('care')||'all',services=url.searchParams.getAll('service');
  const counts=new Map(),matched=new Map();for(const p of contacts){counts.set(p.organization_id,(counts.get(p.organization_id)||0)+1);if(search&&match(p,search))matched.set(p.organization_id,(matched.get(p.organization_id)||0)+1);}
  const selected=all.filter(c=>(kind==='all'||kind===c.kind)&&(owner==='all'||owner==='none'&&!c.owner_id||String(c.owner_id)===owner)&&(care==='all'||care==='followup'&&c.needs_followup||care==='no-contact'&&c.do_not_contact)&&(!services.length||services.includes(c.interest||'Chưa ghi nhận')));
  const rows=selected.filter(c=>!search||fold([c.name,c.phone,c.email,c.interest,c.owner_name,c.address].join(' ')).includes(fold(search))||matched.has(c.id)).map(c=>({...c,parent_org_id:null,contact_count:counts.get(c.id)||0,matched_contacts:matched.get(c.id)||0}));
  return {...page(rows,url),summary:{total:all.length,orgs:all.filter(c=>c.kind==='org').length,people:all.filter(c=>c.kind==='person').length,unassigned:all.filter(c=>!c.owner_id).length},owners:[...new Map(all.filter(c=>c.owner_id).map(c=>[c.owner_id,c.owner_name])).entries()],services:[...new Set(all.map(c=>c.interest||'Chưa ghi nhận'))]};
 });
 on('GET','/api/organizations/:id/contact-page',({user,params,url})=>{
  const c=activeOrg(user,params.id),search=url.searchParams.get('search')||'';
  const all=q('SELECT * FROM contacts WHERE organization_id=? AND detached_at IS NULL AND archived_at IS NULL ORDER BY is_primary DESC,full_name,id').all(c.id);
  return {...page(all.filter(p=>match(p,search)),url),contact_count:all.length,organization:c,details:q('SELECT * FROM organization_details WHERE customer_id=?').get(c.id)||{}};
 });
 on('GET','/api/directory/contacts',({user,url})=>{
  if(!['sales','leader'].includes(user.role))throw new Err(403,'Không có quyền xem liên hệ.');
  const target=url.searchParams.get('organization_id');if(target)activeOrg(user,target);
  const rows=allContacts(user).filter(p=>!p.archived_at&&(!url.searchParams.get('owner')||url.searchParams.get('owner')==='all'||url.searchParams.get('owner')==='none'&&!p.owner_id||String(p.owner_id)===url.searchParams.get('owner'))&&(!url.searchParams.get('care')||url.searchParams.get('care')==='all'||url.searchParams.get('care')==='followup'&&p.needs_followup||url.searchParams.get('care')==='no-contact'&&p.do_not_contact)&&(!url.searchParams.getAll('service').length||url.searchParams.getAll('service').includes(p.interest||'Chưa ghi nhận'))&&(!url.searchParams.has('detached')||p.detached_at)&&match(p,url.searchParams.get('search')||'')).map(p=>({...p,link_status:p.detached_at?'available':String(p.organization_id)===target?'linked':'other'}));return page(rows,url);
 });
 on('GET','/api/contacts/:id',({user,params})=>{
  const c=contact(user,params.id),o=org(user,c.organization_id);const events=q('SELECT h.*,u.name actor FROM contact_link_history h LEFT JOIN users u ON u.id=h.user_id WHERE contact_id=? ORDER BY h.id DESC').all(c.id).filter(h=>canSeeCustomer(user,q('SELECT * FROM customers WHERE id=?').get(h.organization_id)));
  return {contact:c,organization:c.detached_at?null:{id:o.id,name:o.name},scope_organization:{id:o.id,name:o.name},history:events,can_edit:!c.archived_at&&!o.archived_at};
 });
 on('POST','/api/contacts/:id/unlink',({user,params,body})=>{
  const c=contact(user,params.id);activeOrg(user,c.organization_id);checkVersion(c,body);if(c.detached_at||c.archived_at)throw new Err(409,'Liên hệ không còn gắn với đơn vị đang hoạt động.');
  const reason=text(body.reason,500,true);q('UPDATE contacts SET detached_at=?,is_primary=0,version=version+1,updated_at=?,updated_by=? WHERE id=?').run(now(),now(),user.id,c.id);history(user,c,'Gỡ liên hệ khỏi đơn vị',reason);return {ok:true};
 });
 on('POST','/api/organizations/:id/link-contact',({user,params,body})=>{
  const target=activeOrg(user,params.id),c=contact(user,body.contact_id);activeOrg(user,c.organization_id);checkVersion(c,body);
  if(c.archived_at)throw new Err(409,'Khôi phục liên hệ trước khi liên kết.');
  if(!c.detached_at)throw new Err(409,c.organization_id===target.id?'Liên hệ đã thuộc đơn vị này.':'Liên hệ đang thuộc đơn vị khác. Không tự động chuyển đơn vị.');
  duplicate(target.id,c,c.id);const v=fields({...c,...body,full_name:c.full_name,phone:c.phone,email:c.email,is_primary:body.is_primary===true});
  if(v.is_primary)q('UPDATE contacts SET is_primary=0,version=version+1 WHERE organization_id=? AND is_primary=1').run(target.id);
  history(user,c,'Liên kết lại người liên hệ');q('UPDATE contacts SET organization_id=?,detached_at=NULL,job_title=?,department=?,contact_role=?,is_primary=?,version=version+1,updated_at=?,updated_by=? WHERE id=?').run(target.id,v.job_title,v.department,v.contact_role,v.is_primary,now(),user.id,c.id);history(user,{...c,organization_id:target.id},'Thêm liên hệ có sẵn vào đơn vị');return {ok:true,id:c.id};
 });
 on('PUT','/api/organizations/:id/directory-details',({user,params,body})=>{
  validatePhone(body.phone,message=>{throw new Err(400,message);});
  const c=activeOrg(user,params.id),old=q('SELECT address FROM organization_details WHERE customer_id=?').get(c.id);
  if(body.expected_name!==c.name||body.expected_phone!==(c.phone||'')||body.expected_email!==(c.email||'')||body.expected_address!==(old?.address||''))throw new Err(409,'Thông tin đơn vị đã thay đổi. Tải lại trước khi sửa.');
  const name=text(body.name,250,true),phone=text(body.phone,50),email=text(body.email,250),address=text(body.address,1000);if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Err(400,'Email không hợp lệ.');
  q('UPDATE customers SET name=?,phone=?,email=? WHERE id=?').run(name,phone,email,c.id);q('INSERT INTO organization_details(customer_id,address) VALUES(?,?) ON CONFLICT(customer_id) DO UPDATE SET address=excluded.address').run(c.id,address);record(user,c.id,'Sửa thông tin đơn vị trong Danh bạ.',{id:c.id});return {ok:true};
 });
 q('INSERT OR IGNORE INTO schema_migrations(version,at) VALUES(?,?)').run('directory-contact-links-v1',now());
}
