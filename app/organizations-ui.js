const orgStyles=document.createElement('link');orgStyles.rel='stylesheet';orgStyles.href='/organizations.css';document.head.append(orgStyles);
const orgContactRoles=['Đầu mối liên hệ','Người quyết định','Người dùng','Kế toán','Mua sắm','Kỹ thuật','Khác'];
const orgContactFields=c=>[
 ['full_name','Họ và tên *','text',null,c?.full_name||''],['job_title','Chức vụ','text',null,c?.job_title||''],
 ['department','Phòng / ban','text',null,c?.department||''],['contact_role','Vai trò trong giao dịch','select',orgContactRoles.map(s=>[s,s]),c?.contact_role||'Đầu mối liên hệ'],
 ['phone','Điện thoại','text',null,c?.phone||''],['email','Email','email',null,c?.email||''],
 ['is_primary','Đầu mối liên hệ chính của đơn vị','check',null,!!c?.is_primary],['note','Ghi chú về người liên hệ','textarea',null,c?.note||'']
];
function createOrgChild(c){form('Thêm đơn vị con của '+c.name,[['name','Tên đơn vị con *','text'],['org_type','Loại đơn vị','select',['Chi nhánh','Phòng / ban','Đơn vị trực thuộc','Công ty con','Khác'].map(s=>[s,s])],['tax_code','Mã số thuế (nếu có)','text'],['phone','Điện thoại đơn vị','text'],['email','Email đơn vị','email'],['interest','Dịch vụ quan tâm','text',null,c.interest||'']],async body=>{const r=await api('/customers',{body:{...body,kind:'org',parent_org_id:c.id}});toast('Đã tạo đơn vị con, giữ người phụ trách theo đơn vị mẹ.');go('#/customer/'+r.id);});}
const basicCustomers=views.customers;
views.customers=async id=>{
 const el=await basicCustomers(id),orgs=await api('/organizations');if(!orgs.length)return el;
 const visibleIds=new Set(orgs.map(c=>c.id));
 function branch(c,seen=new Set()){
  if(seen.has(c.id))return '';const next=new Set([...seen,c.id]),children=orgs.filter(x=>x.parent_org_id===c.id);
  return `<li><div class="org-tree-row"><a href="#/customer/${c.id}"><strong>${esc(c.name)}</strong></a><span class="tag status-neutral">${esc(c.org_type||'Tổ chức')}</span><small>${c.contact_count} người liên hệ${c.parent_restricted?' · Đơn vị mẹ ngoài phạm vi xem':''}</small></div>${children.length?'<ul>'+children.map(x=>branch(x,next)).join('')+'</ul>':''}</li>`;
 }
 const tree=$(`<details class="card org-directory" open><summary><strong>Cây tổ chức & đơn vị trực thuộc</strong><span class="small">${orgs.length} đơn vị trong phạm vi</span></summary><p class="small">Bấm tên đơn vị để xem hồ sơ, thêm đơn vị con và người liên hệ.</p><ul class="org-tree">${orgs.filter(c=>!c.parent_org_id||!visibleIds.has(c.parent_org_id)).map(c=>branch(c)).join('')}</ul></details>`);
 el.querySelector('.segments').before(tree);return el;
};
const basicCustomer=views.customer;
views.customer=async id=>{
 const el=await basicCustomer(id),base=await api('/customers/'+id);if(base.customer.kind!=='org')return el;
 const d=await api('/organizations/'+id),c=base.customer,details=d.details,orgs=await api('/organizations');
 const tabs=el.querySelector('.profile-tabs'),box=el.querySelector('.profile-tab-content');
 const infoTab=$('<button role="tab" data-org-tab="structure" aria-selected="false">Tổ chức & đơn vị con</button>'),peopleTab=$('<button role="tab" data-org-tab="people" aria-selected="false">Người liên hệ ('+d.contacts.filter(p=>!p.archived_at).length+')</button>');tabs.prepend(infoTab,peopleTab);
 const childButton=$('<button class="major">+ Đơn vị con</button>');childButton.onclick=()=>createOrgChild(c);el.querySelector('.page-heading .actions').append(childButton);
 const editDetails=()=>form('Thông tin chi tiết tổ chức',[
  ['short_name','Tên viết tắt','text',null,details.short_name||''],['industry','Lĩnh vực hoạt động','text',null,details.industry||''],
  ['website','Website','url',null,details.website||''],['address','Địa chỉ trụ sở / đơn vị','textarea',null,details.address||''],['description','Giới thiệu / thông tin bổ sung','textarea',null,details.description||'']
 ],async body=>{await api('/organizations/'+id+'/details',{method:'PUT',body});render();});
 function changeParent(){const descendants=new Set([Number(id)]);let size;do{size=descendants.size;for(const o of orgs)if(descendants.has(o.parent_org_id))descendants.add(o.id);}while(size!==descendants.size);form('Thay đổi đơn vị mẹ',[
  ['parent_org_id','Thuộc tổ chức / đơn vị','select',[['','Không có — tổ chức độc lập'],...orgs.filter(o=>!descendants.has(o.id)).map(o=>[o.id,o.name])],d.parent?.id||''],['reason','Lý do thay đổi *','textarea']
 ],async body=>{await api('/organizations/'+id+'/parent',{method:'PUT',body});render();});}
 function structure(){
  box.innerHTML=`<section><div class="section-heading"><h3>Thông tin tổ chức</h3><button id="org-edit-details">Bổ sung thông tin</button></div><dl class="org-detail-list">${[['Tên đầy đủ',c.name],['Tên viết tắt',details.short_name],['Loại đơn vị',c.org_type],['Mã số thuế',c.tax_code],['Lĩnh vực',details.industry],['Địa chỉ',details.address],['Website',details.website]].map(([label,v])=>`<div><dt>${label}</dt><dd>${esc(v||'Chưa bổ sung')}</dd></div>`).join('')}</dl>${details.description?`<p class="preserve">${esc(details.description)}</p>`:''}<div class="org-parent"><strong>Đơn vị mẹ</strong><p>${d.parent?`<a href="#/customer/${d.parent.id}">${esc(d.parent.name)}</a>`:d.parent_restricted?'Đơn vị mẹ ngoài phạm vi được xem.':'Tổ chức độc lập / chưa liên kết đơn vị mẹ.'}</p>${me.role==='leader'?'<button id="org-parent-edit">Chọn / thay đổi đơn vị mẹ</button>':''}</div><div class="section-heading"><h3>Đơn vị con (${d.children.length})</h3><button id="org-child-add">+ Thêm đơn vị con</button></div>${d.children.length?`<div class="org-unit-list">${d.children.map(x=>`<a href="#/customer/${x.id}" class="org-unit"><strong>${esc(x.name)}</strong><small>${esc(x.org_type||'Đơn vị trực thuộc')} · ${esc(x.owner_name||'Chưa phân công')}</small><span>${esc(x.phone||x.email||'Chưa bổ sung liên hệ')}</span></a>`).join('')}</div>`:empty('Chưa có đơn vị con trong phạm vi','Có thể thêm chi nhánh, phòng ban hoặc đơn vị trực thuộc.')}<p class="small">Đơn vị con có hồ sơ, cơ hội và tiến trình riêng. Quan hệ mẹ–con không tự mở rộng quyền xem dữ liệu.</p></section>`;
  action(box,'#org-edit-details',editDetails);action(box,'#org-parent-edit',changeParent);action(box,'#org-child-add',()=>createOrgChild(c));
 }
 function editContact(p){form(p?'Sửa người liên hệ':'Thêm người liên hệ của '+c.name,orgContactFields(p),async body=>{await api(p?'/contacts/'+p.id:'/organizations/'+id+'/contacts',{method:p?'PUT':'POST',body:{...body,...(p?{version:p.version}:{})}});toast('Đã lưu người liên hệ.');sessionStorage.setItem('org-tab:'+id,'people');render();});}
 function people(){
  const active=d.contacts.filter(p=>!p.archived_at),archived=d.contacts.filter(p=>p.archived_at);
  box.innerHTML=`<div class="section-heading"><h3>Người liên hệ tại ${esc(c.name)}</h3><button class="major" id="contact-add">+ Thêm người liên hệ</button></div><p class="small">Thông tin cá nhân phục vụ liên hệ với đơn vị này. Chọn một đầu mối chính; người liên hệ không tự trở thành khách hàng mua độc lập.</p><input type="search" id="contact-search" aria-label="Tìm người liên hệ" placeholder="Tìm tên, chức vụ, phòng ban, điện thoại…"><div class="org-contact-list"></div>${archived.length?`<details class="org-archived"><summary>Người liên hệ đã ngừng (${archived.length})</summary>${archived.map(p=>`<div class="template-row"><span>${esc(p.full_name)}</span><button data-contact-restore="${p.id}">Khôi phục</button></div>`).join('')}</details>`:''}`;
  const fill=()=>{const term=box.querySelector('#contact-search').value.toLocaleLowerCase('vi');box.querySelector('.org-contact-list').innerHTML=active.filter(p=>[p.full_name,p.job_title,p.department,p.phone,p.email,p.contact_role].join(' ').toLocaleLowerCase('vi').includes(term)).map(p=>`<article class="org-contact"><div class="section-heading"><div><h3><a href="#/contact/${p.id}">${esc(p.full_name)}</a></h3>${p.is_primary?'<span class="tag status-success">Đầu mối chính</span> ':''}<span class="tag status-info">${esc(p.contact_role)}</span></div><div class="actions"><button data-contact-edit="${p.id}">Sửa</button><button data-contact-unlink="${p.id}">Gỡ khỏi đơn vị</button><button data-contact-archive="${p.id}">Ngừng liên hệ</button></div></div><p>${esc([p.job_title,p.department].filter(Boolean).join(' · ')||'Chưa bổ sung chức vụ / phòng ban')}</p><div class="org-contact-channels"><span>Điện thoại: <strong>${esc(p.phone||'Chưa bổ sung')}</strong></span><span>Email: <strong>${esc(p.email||'Chưa bổ sung')}</strong></span></div>${p.note?`<p class="preserve small">${esc(p.note)}</p>`:''}</article>`).join('')||empty('Chưa có người liên hệ phù hợp');
   action(box,'[data-contact-unlink]',b=>unlinkDirectoryContact(active.find(p=>String(p.id)===b.dataset.contactUnlink),render));action(box,'[data-contact-edit]',b=>editContact(active.find(p=>String(p.id)===b.dataset.contactEdit)));action(box,'[data-contact-archive]',b=>form('Ngừng liên hệ — giữ lịch sử',[['reason','Lý do *','textarea']],async body=>{await api('/contacts/'+b.dataset.contactArchive+'/archive',{body});sessionStorage.setItem('org-tab:'+id,'people');render();}));
  };fill();box.querySelector('#contact-search').oninput=fill;action(box,'#contact-add',()=>addDirectoryContact(c,render));action(box,'[data-contact-restore]',async b=>{await api('/contacts/'+b.dataset.contactRestore+'/restore',{body:{}});sessionStorage.setItem('org-tab:'+id,'people');render();});
 }
 const select=(button,fn)=>{tabs.querySelectorAll('[role=tab]').forEach(t=>{t.classList.toggle('selected',t===button);t.setAttribute('aria-selected',String(t===button));});sessionStorage.setItem('org-tab:'+id,button.dataset.orgTab);fn();};
 infoTab.onclick=()=>select(infoTab,structure);peopleTab.onclick=()=>select(peopleTab,people);
 tabs.querySelectorAll('[data-tab]').forEach(t=>t.addEventListener('click',()=>{sessionStorage.removeItem('org-tab:'+id);[infoTab,peopleTab].forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-selected','false');});}));
 if(sessionStorage.getItem('org-tab:'+id)==='people')peopleTab.click();else infoTab.click();return el;
};
