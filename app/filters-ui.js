// Shared local list filtering, after API authorization. Filters do not grant access.
const listFilterState=new Map();
const searchFold=v=>String(v||'').toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
const filterViews={
 customers:['tbody tr'],quotes:['tbody tr'],tasks:['.task-row,.calendar-event'],
 inbox:['.conversation-preview'],progress:['.customer-project'],
 'work-templates':['.template-row'],knowledge:['.readystate'],
 templates:['.catalog-section .catalog-table-wrap tbody tr,.readystate'],users:['tbody tr,.company-row'],
 channels:['.channel-grid > .card,.access-row'],audit:['tbody tr']
};
function installListFilter(el,key){
 if(el.dataset.serverDirectory)return el;
 const stateKey=(me.company?.code||'ivitech')+':'+me.id+':'+key;
 const state=listFilterState.get(stateKey)||{text:'',values:[]};listFilterState.set(stateKey,state);
 const toolbar=$(`<section class="list-tools" aria-label="Tìm kiếm và lọc danh sách"><label>Tìm trong mục này<input type="search" placeholder="Nhập từ khóa, có thể không dấu…" value="${esc(state.text)}"></label><details><summary>Lọc nhiều loại / trạng thái</summary><div class="list-filter-options"></div></details><button type="button" data-clear-filter>Xóa bộ lọc</button><span class="small" data-filter-count aria-live="polite"></span><small class="filter-explanation">Chọn nhiều giá trị để lấy các mục thuộc một trong các giá trị đó. Các bộ lọc bên dưới vẫn được áp dụng; số tổng quan giữ nguyên.</small></section>`);
 const heading=el.querySelector('.page-heading,.hero');heading?heading.after(toolbar):el.prepend(toolbar);
 let priorOptions='';
 function rows(){let found=[...el.querySelectorAll(filterViews[key][0])].filter(r=>!r.closest('.list-tools')&&!(r.matches('tr')&&r.querySelector('td[colspan]')));return found.filter(r=>!found.some(parent=>parent!==r&&parent.contains(r)));}
 function rowText(row){const clone=row.cloneNode(true);clone.querySelectorAll('button,select,input,textarea').forEach(n=>n.remove());return (row.dataset.search||'')+' '+clone.textContent;}
 function facets(row){
  const values=[...row.querySelectorAll('.tag,.chip,.channel-chip')].map(t=>t.textContent.trim());
  if(row.matches('tr')){const table=row.closest('table'),heads=[...table.querySelectorAll('thead th')];heads.forEach((h,i)=>{if(/loại|trạng thái|vai trò|nhóm|cung cấp|dịch vụ quan tâm|chăm sóc|phụ trách/i.test(h.textContent)){const cell=row.cells[i];if(cell){const small=cell.querySelector('small');if(small)values.push(small.textContent.trim());const copy=cell.cloneNode(true);copy.querySelectorAll('button,small').forEach(x=>x.remove());values.push(copy.textContent.trim());}}});}
  if(key==='customers'){const detail=row.querySelector('td small');if(detail)values.push(detail.textContent.split('·')[0].trim());}
  if(key==='pipeline'){const stage=row.closest('[data-stage]')?.dataset.stage;if(stage)values.push(stage);}
  if(['settings','guide','home','work-templates'].includes(key))values.push(row.querySelector('h3,h2,strong')?.textContent.trim());
  return [...new Set(values.filter(v=>v&&v.length<150))];
 }
 function apply(){
  const records=rows(),all=[...new Set([...records.flatMap(facets),...state.values])].sort((a,b)=>a.localeCompare(b,'vi'));
  const next=JSON.stringify(all);if(next!==priorOptions){priorOptions=next;toolbar.querySelector('.list-filter-options').innerHTML=all.map((v,i)=>`<label><input type="checkbox" data-facet="${i}" ${state.values.includes(v)?'checked':''}>${esc(v)}</label>`).join('')||'<span class="small">Mục này có thể tìm bằng từ khóa.</span>';toolbar.querySelectorAll('[data-facet]').forEach(b=>b.onchange=()=>{const v=all[Number(b.dataset.facet)];state.values=b.checked?[...state.values,v]:state.values.filter(x=>x!==v);apply();});}
  let visible=0;for(const row of records){const match=searchFold(rowText(row)).includes(searchFold(state.text))&&(!state.values.length||facets(row).some(v=>state.values.includes(v)));row.classList.toggle('list-filter-hidden',!match);if(match)visible++;}
  if(key==='tasks')el.querySelectorAll('.task-unit').forEach(group=>group.classList.toggle('list-filter-hidden',![...group.querySelectorAll('.task-row')].some(row=>!row.classList.contains('list-filter-hidden'))));
  toolbar.querySelector('[data-filter-count]').textContent=`${visible}/${records.length} mục trong danh sách hiện tại`;
  toolbar.querySelector('summary').textContent='Lọc nhiều loại / trạng thái'+(state.values.length?' ('+state.values.length+')':'');
  // The organization tree is a separate overview; hide it while filtering the list.
  if(key==='customers')el.querySelector('.org-directory')?.classList.toggle('list-filter-hidden',!!state.text||!!state.values.length);
 }
 toolbar.querySelector('input[type=search]').oninput=e=>{state.text=e.target.value;apply();};
 toolbar.querySelector('[data-clear-filter]').onclick=()=>{state.text='';state.values=[];toolbar.querySelector('input[type=search]').value='';priorOptions='';apply();};
 apply();const observer=new MutationObserver(changes=>{if(changes.some(c=>!toolbar.contains(c.target)))apply();});observer.observe(el,{childList:true,subtree:true});
 return el;
}
for(const key of Object.keys(filterViews)){if(!views[key])continue;const before=views[key];views[key]=async(...args)=>installListFilter(await before(...args),key);}
