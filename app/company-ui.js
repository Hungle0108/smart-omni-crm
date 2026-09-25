const companyUsage={internal:'Dùng nội bộ',trial:'Dùng thử',customer:'Khách thuê dịch vụ'};
const isSubadmin=()=>me?.role==='admin'&&me.admin_level==='subadmin';
const beforeCompanyLogin=loginView;
loginView=function(){
 const el=beforeCompanyLogin(),formEl=el.querySelector('form'),label=$('<label><span>Mã công ty</span><input name="company" value="ivitech" autocomplete="organization" required pattern="[a-z0-9][a-z0-9-]{2,39}"><small>Công ty hiện tại: ivitech. Công ty mới dùng mã do chủ nền tảng cấp.</small></label>');
 formEl.prepend(label);el.querySelector('.lead').textContent='Đăng nhập vào không gian riêng của công ty.';
 const input=label.querySelector('input');input.value=sessionStorage.getItem('crm-company')||'ivitech';
 const quick=el.querySelector('#quick-account'),sampleNote=formEl.querySelector('p.lead');
 const change=()=>{const sample=input.value.trim()==='ivitech';quick.closest('label').hidden=!sample;if(sampleNote)sampleNote.hidden=!sample;el.querySelector('#u').value=sample?'hoa':'';el.querySelector('#p').value=sample?'123456':'';};
 input.addEventListener('input',change);if(input.value!=='ivitech')change();el.append($('<p><a href="/platform">Quản trị nền tảng — Super Admin →</a></p>'));return el;
};
const apiBeforeCompany=api;
api=async function(path,opts){
 if(path==='/login'){const code=document.querySelector('#login-form [name=company]')?.value.trim()||'ivitech';const r=await apiBeforeCompany(path+'?company='+encodeURIComponent(code),opts);sessionStorage.setItem('crm-company',code);return r;}
 return apiBeforeCompany(path,opts);
};
const beforeCompanyUsers=views.users;
views.users=async()=>{
 const el=await beforeCompanyUsers();
 el.querySelector('.page-heading').after($(`<p class="hint">Công ty: <strong>${esc(me.company?.name||'iViTech')}</strong> · Mã đăng nhập: <strong>${esc(me.company?.code||'ivitech')}</strong>. Admin quản trị công ty; subadmin quản lý danh mục, người dùng thường và phân kênh.</p>`));
 el.querySelector('.page-heading').after($('<p class="hint">Quản trị các công ty thuê dịch vụ đã chuyển sang <a href="/platform">Quản trị nền tảng — Super Admin →</a>. Dùng tài khoản Super Admin riêng.</p>'));
 if(isSubadmin()){el.querySelector('#add-team')?.remove();el.querySelectorAll('[data-edit-team],[data-archive-team],#archived-teams,a[href="#/audit"]').forEach(b=>b.remove());}
 return el;
};

const beforeCompanyTemplates=views.templates;
views.templates=async()=>{const el=await beforeCompanyTemplates();if(isSubadmin()){el.querySelectorAll('[id^="brand-"]').forEach(n=>n.disabled=true);el.querySelector('#brand')?.remove();}return el;};
const beforeCompanyGuide=views.guide;
views.guide=async()=>{if(me.company?.code==='ivitech')return beforeCompanyGuide();return $(`<div>${pageHeading('Hướng dẫn bắt đầu','Dành cho công ty mới trên Smart Omni CRM.')}<section class="card"><h3>1 · Người dùng và nhóm</h3><p>Admin tạo nhóm, trưởng nhóm, nhân viên sales và giám đốc. Có thể tạo subadmin để quản lý danh mục, người dùng thường và phân kênh.</p></section><section class="card"><h3>2 · Danh mục và mẫu báo giá</h3><p>Trong Mẫu & nhận diện, tạo loại dịch vụ, sản phẩm, giá bán, nguồn cung, mô tả và điều kiện. Chọn sản phẩm vào mẫu. Trưởng nhóm thiết lập ngưỡng duyệt cho nhóm.</p></section><section class="card"><h3>3 · Khách hàng và kênh</h3><p>Trưởng nhóm/sales thêm khách, đơn vị con và người liên hệ. Admin cấu hình kênh; admin/subadmin phân kênh cho người dùng. Trạng thái kênh cho biết đã nhận/gửi thật hay còn mô phỏng.</p></section><section class="card"><h3>Phạm vi hiện tại</h3><p>Bản thử nhiều công ty trên localhost. Chưa có thu phí/gia hạn tự động hoặc vận hành cho thuê qua Internet.</p></section></div>`);};
