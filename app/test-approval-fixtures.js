import assert from 'node:assert/strict';
// Explicit business setup for isolated regression fixtures, via the leader API.
export async function configureApprovalRules(api,amount,discount,{basis='net',money_scope='quote'}={}){
 const response=await api('hoa','GET','/product-categories');assert.equal(response.status,200);const categories=response.data??response.body;
 for(const c of categories){const r=await api('hoa','PUT','/approval-rules/category/'+c.id,{amount,discount,basis,money_scope});assert.equal(r.status,200,JSON.stringify(r.data??r.body));}
 return {status:200,data:{ok:true},body:{ok:true}};
}
