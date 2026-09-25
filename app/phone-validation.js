// Empty is an explicit clear; non-empty invalid input must never erase a stored number.
export function validatePhone(value,fail){
 const raw=String(value??'').trim();if(!raw)return '';
 const compact=raw.replace(/[\s().-]/g,'');
 if(!/^[+\d\s().-]+$/.test(raw)||!/^\+?\d{6,15}$/.test(compact))fail('Số điện thoại không hợp lệ: nhập 6–15 chữ số, có thể có + ở đầu, khoảng trắng, dấu chấm, gạch nối hoặc ngoặc.');
 return compact.replace(/^\+84/,'0');
}
