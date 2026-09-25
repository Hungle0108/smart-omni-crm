const channelModeLabel=m=>m==='team'?'Theo phạm vi nhóm hiện có':'Chỉ người được chỉ định';
const beforeAssignments=views.channels;
views.channels=async()=>{
 const el=await beforeAssignments();if(me.role!=='admin')return el;
 const d=await api('/channel-access'),section=$(`<section class="card channel-access-section"><h3>Phân quyền kênh theo người dùng</h3><p class="small">Chọn người được sử dụng từng kênh. Quyền thao tác theo vai trò; quyền xem hội thoại và khách hàng vẫn theo phạm vi được phân công.</p>${d.channels.map(c=>`<div class="access-row"><div><strong>${esc(c.name)}</strong><p class="access-badges"><span class="tag status-neutral">${esc(c.technical_status)}</span><span class="tag ${c.mode==='team'?'status-neutral':'status-info'}">${c.mode==='team'?'Theo nhóm':'Chỉ người được chỉ định'}</span></p>${c.mode==='team'?`<p class="small">${esc(c.group_note)}</p>`:`<div class="access-people">${c.members.slice(0,3).map(m=>`<span class="access-person">${avatar(m.name)}<span>${esc(m.name)}${!m.effective?' · không có quyền hiệu lực':''}</span></span>`).join('')||'<span class="small">Chưa phân người dùng</span>'}${c.members.length>3?`<span>+${c.members.length-3} người</span>`:''}</div>`}${c.note?`<p class="small">${esc(c.note)}</p>`:''}</div><button data-assign="${esc(c.key)}">${c.mode==='selected'&&c.members.length?'Chỉnh phân quyền':'Phân người dùng'}</button></div>`).join('')}<p class="hint">Phân quyền không tự kích hoạt kết nối. Kênh mô phỏng hoặc chưa có bộ gửi/nhận vẫn giữ nguyên trạng thái hiện tại.</p></section>`);
 el.querySelector('.page-heading').after(section);action(section,'[data-assign]',b=>openChannelAccess(b.dataset.assign));return el;
};

async function openChannelAccess(key){
 const endpoint='/channel-access/'+key,dialog=$('<dialog class="channel-access-dialog" aria-labelledby="channel-access-title"><p role="status">Đang tải cấu hình phân quyền…</p></dialog>');
 document.body.append(dialog);dialog.showModal();
 let original,mode,draft,saving=false,sequence=0,page=1,query='',team='',selectedOnly=false,ready=false,timer,initial;
 const snapshot=()=>JSON.stringify([mode,[...draft].sort((a,b)=>a[0]-b[0])]);
 const dirty=()=>ready&&snapshot()!==initial;
 const confirmDraft=(text,proceed)=>{dialog.querySelector('[data-discard]')?.remove();const warning=$(`<div class="access-warning" data-discard role="alert"><p>${esc(text)}</p><div class="actions"><button type="button" data-keep>Tiếp tục chỉnh sửa</button><button type="button" data-discard-confirm>Bỏ bản nháp và tiếp tục</button></div></div>`);dialog.querySelector('footer')?.before(warning);warning.querySelector('[data-keep]').onclick=()=>warning.remove();warning.querySelector('[data-discard-confirm]').onclick=()=>{warning.remove();proceed();};warning.querySelector('[data-keep]').focus();};
 const close=()=>{if(saving)return;if(dirty()){confirmDraft('Các thay đổi chưa được lưu. Chị muốn tiếp tục chỉnh sửa hay bỏ bản nháp?',()=>{ready=false;dialog.close();});return;}dialog.close();};
 dialog.oncancel=e=>{e.preventDefault();close();};
 const leave=e=>{if(dirty()){e.preventDefault();e.returnValue='';}};addEventListener('beforeunload',leave);
 dialog.onclose=()=>{clearTimeout(timer);removeEventListener('beforeunload',leave);dialog.remove();};
 async function load(){
  const data=await api(endpoint);if(!dialog.open)return;original=data;mode=data.channel.mode;draft=new Map(data.channel.members.map(m=>[m.user_id,m.permission]));initial=snapshot();ready=true;page=1;query='';team='';selectedOnly=false;
  const c=data.channel;
  dialog.innerHTML=`<form><header><h2 id="channel-access-title">Phân quyền người dùng — ${esc(c.name)}</h2><p class="small">${esc(c.kind)} · ${esc(c.technical_status)}</p>${c.note?`<p class="small">${esc(c.note)}</p>`:''}</header><div class="access-dialog-body"><fieldset class="access-modes"><legend>Phạm vi sử dụng kênh</legend>${['team','selected'].map(m=>`<label><input type="radio" name="mode" value="${m}" ${m===mode?'checked':''}><span>${channelModeLabel(m)}</span></label>`).join('')}</fieldset><p class="hint" data-scope-note></p><section data-selection><div class="access-filters"><label>Tìm người dùng<input type="search" data-search placeholder="Tên hoặc tài khoản…"></label><label>Nhóm<select data-team><option value="">Tất cả nhóm</option>${data.teams.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('')}</select></label><label>Trạng thái chọn<select data-selected-filter><option value="all">Tất cả người dùng</option><option value="selected">Đã chọn</option></select></label></div><p class="small">Tìm bằng tên hoặc tài khoản. Hồ sơ người dùng hiện chưa có trường email.</p><div class="access-select-bar"><label><input type="checkbox" data-all> Chọn tất cả trên trang này</label><strong data-selected-count aria-live="polite"></strong></div><div data-users aria-live="polite"></div><div class="access-pagination"><button type="button" data-prev>← Trang trước</button><span data-page></span><button type="button" data-next>Trang sau →</button></div><div data-stale></div></section><section class="access-summary" aria-live="polite" data-summary></section><details class="access-history"><summary>Lịch sử phân quyền gần đây</summary>${data.history.map(h=>`<p><strong>${esc(h.actor||'Quản trị viên')}</strong> · ${dt(h.at)}<br>${h.detail.old_mode?esc(channelModeLabel(h.detail.old_mode))+' → ':''}${esc(channelModeLabel(h.detail.mode))}${h.detail.added?` · Thêm ${h.detail.added.length}, gỡ ${h.detail.removed.length}, đổi quyền ${h.detail.changed.length}`:' · Bản ghi cũ'}</p>`).join('')||'<p class="small">Chưa có thay đổi được ghi nhận.</p>'}</details><p class="err" data-error role="alert"></p><button type="button" data-reload hidden>Tải cấu hình mới để đối chiếu</button></div><footer><button type="button" data-cancel>Hủy</button><button class="major" type="submit">Lưu phân quyền</button></footer></form>`;
  const formEl=dialog.querySelector('form');
  formEl.querySelectorAll('[name=mode]').forEach(r=>r.onchange=()=>{mode=r.value;updateSummary();});
  dialog.querySelector('[data-cancel]').onclick=close;
  dialog.querySelector('[data-reload]').onclick=()=>{const reload=async()=>{try{await load();}catch(e){dialog.querySelector('[data-error]').textContent=e.message;}};if(dirty())confirmDraft('Tải cấu hình mới sẽ thay thế bản nháp hiện tại.',reload);else reload();};
  dialog.querySelector('[data-search]').oninput=e=>{query=e.target.value;page=1;clearTimeout(timer);timer=setTimeout(loadPeople,200);};
  dialog.querySelector('[data-team]').onchange=e=>{team=e.target.value;page=1;loadPeople();};
  dialog.querySelector('[data-selected-filter]').onchange=e=>{selectedOnly=e.target.value==='selected';page=1;loadPeople();};
  dialog.querySelector('[data-prev]').onclick=()=>{page--;loadPeople();};dialog.querySelector('[data-next]').onclick=()=>{page++;loadPeople();};
  formEl.onsubmit=async e=>{
   e.preventDefault();if(saving)return;saving=true;const controls=[...formEl.querySelectorAll('input,select,button')],disabled=controls.map(c=>c.disabled);controls.forEach(c=>c.disabled=true);dialog.querySelector('[data-error]').textContent='';
   try{await api(endpoint,{method:'PUT',body:{mode,revision:c.revision,members:mode==='selected'?[...draft].map(([user_id,permission])=>({user_id,permission})):[]}});ready=false;dialog.close();toast('Đã cập nhật phân quyền cho '+c.name);render();}
   catch(e){dialog.querySelector('[data-error]').textContent=e.message;dialog.querySelector('[data-reload]').hidden=!/đã thay đổi|Mở lại/i.test(e.message);}
   finally{saving=false;controls.forEach((c,i)=>c.disabled=disabled[i]);if(dialog.open)loadPeople();}
  };
  updateSummary();await loadPeople();
 }
 function updateSummary(){
  const {channel:c,effective_users:old,inherited_users:inherited,assigned_counts:assigned}=original;
  const next=mode==='team'?new Map(inherited.map(u=>[u.id,'send'])):new Map([...draft].filter(([id])=>inherited.some(u=>u.id===id))),prev=new Map(old.map(u=>[u.id,u.permission]));
  const added=[...next.keys()].filter(id=>!prev.has(id)),removed=[...prev.keys()].filter(id=>!next.has(id)),changed=[...next].filter(([id,p])=>prev.has(id)&&prev.get(id)!==p);
  const impacted=assigned.filter(a=>removed.includes(a.assignee_id)).reduce((n,a)=>n+a.count,0);
  dialog.querySelector('[data-selection]').hidden=mode!=='selected';
  dialog.querySelector('[data-scope-note]').textContent=mode==='team'?c.group_note+' Chỉ sales/trưởng nhóm đủ điều kiện được sử dụng; danh sách chỉ định cũ không được cộng thêm.':'Danh sách chỉ định không thay đổi vai trò hoặc người phụ trách khách. Quyền chỉ xem không cho phép gửi hay thao tác hội thoại.';
  dialog.querySelector('[data-selected-count]').textContent=`Đã chọn ${draft.size} người · ${[...draft.keys()].filter(id=>inherited.some(u=>u.id===id)).length} đủ điều kiện`;
  dialog.querySelector('[data-summary]').innerHTML=`<strong>Thay đổi khi lưu</strong><p>${esc(channelModeLabel(c.mode))} → ${esc(channelModeLabel(mode))}</p><p>Quyền hiệu lực: thêm ${added.length} người · gỡ ${removed.length} người · đổi mức quyền ${changed.length} người.</p>${mode==='selected'&&!draft.size?'<p class="access-warning">Chưa phân người dùng: không ai được cấp quyền nghiệp vụ qua danh sách này.</p>':''}${!next.size?'<p class="small">Hiện không có người đủ điều kiện sử dụng kênh.</p>':''}${impacted?`<p class="access-warning">Có ${impacted} hội thoại đang mở được giao cho người sắp bị gỡ quyền. Hệ thống giữ nguyên người phụ trách. Nhờ trưởng nhóm kiểm tra phân công trong Hộp thư.</p>`:''}`;
  dialog.querySelector('[data-stale]').innerHTML=c.members.filter(m=>draft.has(m.user_id)&&!m.effective).map(m=>`<p class="access-warning">${esc(m.name)}: không có quyền hiệu lực (bị khóa, đổi vai trò hoặc đổi nhóm). <button type="button" data-remove-stale="${m.user_id}">Gỡ khỏi danh sách</button></p>`).join('');
  dialog.querySelectorAll('[data-remove-stale]').forEach(b=>b.onclick=()=>{draft.delete(Number(b.dataset.removeStale));updateSummary();loadPeople();});
 }
 async function loadPeople(){
  const request=++sequence,box=dialog.querySelector('[data-users]');if(!box)return;
  box.innerHTML='<p role="status">Đang tải người dùng…</p>';dialog.querySelector('[data-all]').disabled=true;dialog.querySelector('[data-prev]').disabled=true;dialog.querySelector('[data-next]').disabled=true;
  const params=new URLSearchParams({q:query,team,page:String(page)});if(selectedOnly){params.set('selected_only','1');params.set('selected_ids',[...draft.keys()].join(','));}
  try{
   const result=await api(endpoint+'/users?'+params);if(request!==sequence||!dialog.open)return;page=result.page;
   box.innerHTML=result.items.map(u=>`<div class="access-user-row"><label class="access-user-label"><input type="checkbox" data-user="${u.id}" ${draft.has(u.id)?'checked':''} ${!u.eligible&&!draft.has(u.id)?'disabled':''}>${avatar(u.name)}<span><strong>${esc(u.name)}</strong><small>${esc(u.username)} · ${esc(u.team_name||'Chưa có nhóm')} · ${esc(({sales:'Sales',leader:'Trưởng nhóm',admin:'Quản trị',director:'Giám đốc'})[u.role]||u.role)}</small><small>${esc(u.reason)}</small></span></label><select data-permission="${u.id}" aria-label="Quyền của ${esc(u.name)}" ${!draft.has(u.id)||!u.eligible?'disabled':''}><option value="read" ${draft.get(u.id)==='read'?'selected':''}>Chỉ xem</option><option value="send" ${draft.get(u.id)!=='read'?'selected':''}>Xem và gửi / thao tác</option></select></div>`).join('')||'<p class="empty">Không có người dùng phù hợp. Thử xóa từ khóa hoặc đổi bộ lọc.</p>';
   const selectable=result.items.filter(u=>u.eligible),all=dialog.querySelector('[data-all]');
   const updateAll=()=>{const n=selectable.filter(u=>draft.has(u.id)).length;all.disabled=saving||!selectable.length;all.checked=!!n&&n===selectable.length;all.indeterminate=n>0&&n<selectable.length;};
   all.onchange=()=>{for(const u of selectable)if(all.checked){if(!draft.has(u.id))draft.set(u.id,'send');}else draft.delete(u.id);updateSummary();loadPeople();};
   box.querySelectorAll('[data-user]').forEach(b=>b.onchange=()=>{const id=Number(b.dataset.user);if(b.checked)draft.set(id,'send');else draft.delete(id);box.querySelector(`[data-permission="${id}"]`).disabled=!b.checked||!result.items.find(u=>u.id===id).eligible;updateAll();updateSummary();});
   box.querySelectorAll('[data-permission]').forEach(s=>s.onchange=()=>{draft.set(Number(s.dataset.permission),s.value);updateSummary();});
   dialog.querySelector('[data-page]').textContent=`Trang ${page}/${result.pages} · ${result.total} người`;dialog.querySelector('[data-prev]').disabled=saving||page<=1;dialog.querySelector('[data-next]').disabled=saving||page>=result.pages;updateAll();if(saving)box.querySelectorAll('input,select').forEach(c=>c.disabled=true);
  }catch(e){if(request===sequence&&dialog.open){box.innerHTML=`<p class="err">${esc(e.message)}</p><button type="button" data-retry>Tải lại danh sách</button>`;box.querySelector('[data-retry]').onclick=loadPeople;}}
 }
 try{await load();}catch(e){if(dialog.open){dialog.innerHTML=`<p class="err">${esc(e.message)}</p><button type="button">Đóng</button>`;dialog.querySelector('button').onclick=close;}}
}

function applyChannelReadOnly(el){
 el.querySelectorAll('#reply,#send,#test-message,#bot,#close,[data-composer],#suggest button').forEach(n=>n.disabled=true);
 if(!el.querySelector('[data-channel-readonly]'))el.querySelector('.chat-pane')?.prepend($('<p class="hint" data-channel-readonly>Bạn chỉ được xem kênh này. Quyền gửi và thao tác hiện đã bị giới hạn.</p>'));
}
function filterChannelPreviews(el,channels){
 el.querySelectorAll('.conversation-preview').forEach(row=>{const label=row.querySelector('.channel-chip')?.textContent;if(label&&!channels.some(c=>c.key===(label.includes('cá nhân')?'personal':'oa')))row.remove();});
}
for(const name of ['inbox','conversation']){const before=views[name];views[name]=async id=>{
 const el=await before(id),convId=/conversation\/(\d+)/.exec(el.querySelector('.conversation-preview.active')?.getAttribute('href')||'')?.[1];
 const d=await api('/channel-access/effective'+(convId?'?conversation_id='+convId:''));
 filterChannelPreviews(el,d.channels);
 el.querySelectorAll('[data-channel]').forEach(b=>{if(b.dataset.channel!=='all'&&!d.channels.some(c=>c.key===b.dataset.channel))b.remove();});
 if(d.conversation_access==='read')applyChannelReadOnly(el);if(d.conversation_access==='none')el.querySelector('.inbox-frame')?.replaceChildren($('<p class="hint">Quyền truy cập hội thoại đã thay đổi. Hãy mở lại Hộp thư.</p>'));return el;
};}
// Check permissions even during typing. The existing message poll uses guarded APIs.
let channelPermissionChecking=false;
setInterval(async()=>{
 if(channelPermissionChecking||!me||!/^#\/(inbox|conversation)(\/|$)/.test(location.hash))return;
 const pane=document.querySelector('.inbox-frame'),hash=location.hash,actor=me.id;if(!pane)return;
 const id=/conversation\/(\d+)/.exec(pane.querySelector('.conversation-preview.active')?.getAttribute('href')||'')?.[1];channelPermissionChecking=true;
 try{const d=await api('/channel-access/effective'+(id?'?conversation_id='+id:''));if(!pane.isConnected||hash!==location.hash||actor!==me?.id)return;
  filterChannelPreviews(pane,d.channels);
  pane.querySelectorAll('[data-channel]').forEach(b=>{if(b.dataset.channel!=='all'&&!d.channels.some(c=>c.key===b.dataset.channel))b.remove();});
  if(d.conversation_access==='none')pane.replaceChildren($('<p class="hint" role="alert">Quyền truy cập hội thoại đã bị thu hồi hoặc phạm vi khách đã thay đổi. Lịch sử vẫn được giữ. <a href="#/inbox">Mở lại Hộp thư</a></p>'));
  else if(d.conversation_access==='read')applyChannelReadOnly(pane);
 }catch(e){if(pane.isConnected){applyChannelReadOnly(pane);if(!pane.querySelector('[data-permission-error]'))pane.prepend($('<p class="hint" data-permission-error>Chưa kiểm tra được quyền hiện tại. Vui lòng làm mới Hộp thư trước khi tiếp tục.</p>'));}}
 finally{channelPermissionChecking=false;}
},4000);
