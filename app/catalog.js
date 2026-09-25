// Catalogue administration and immutable quote price selections for the local pilot.
export function installCatalog({sampleData=true,db,q,on,bad,role,str,number,now,log,get,set,add}) {
  add('products','unit',"TEXT NOT NULL DEFAULT 'Gói'");add('products','active','INTEGER NOT NULL DEFAULT 1');
  add('products','supply_type',"TEXT NOT NULL DEFAULT 'unknown'");add('products','partner_name',"TEXT NOT NULL DEFAULT ''");
  q('INSERT OR IGNORE INTO schema_migrations VALUES(?,?)').run('product-supply-v1',now());
  add('quote_templates','product_codes','TEXT');add('quote_templates','logo',"TEXT NOT NULL DEFAULT ''");
  add('quotes','catalog_snapshot','TEXT');add('quote_items','unit',"TEXT NOT NULL DEFAULT 'Gói'");add('quote_items','note',"TEXT NOT NULL DEFAULT ''");
  db.exec('CREATE TABLE IF NOT EXISTS product_categories(id TEXT PRIMARY KEY,name TEXT NOT NULL UNIQUE)');
  if(sampleData)q('INSERT OR IGNORE INTO product_categories(id,name) VALUES(?,?)').run('solution','Giải pháp Smart iVier');
  if(sampleData)q('INSERT OR IGNORE INTO product_categories(id,name) VALUES(?,?)').run('training','Đào tạo AI');
  for(const table of ['products','product_categories']){add(table,'description',"TEXT NOT NULL DEFAULT ''");add(table,'terms',"TEXT NOT NULL DEFAULT ''");}
  add('quotes','content_source',"TEXT NOT NULL DEFAULT 'legacy'");add('quotes','legacy_template_content','TEXT');
  db.exec('BEGIN IMMEDIATE');try{
    if(!q("SELECT 1 FROM schema_migrations WHERE version='catalog-service-content-v1'").get()){
      q("UPDATE products SET description=COALESCE(note,'')").run();
      for(const c of q('SELECT * FROM product_categories').all()){
        const templates=q('SELECT intro,terms FROM quote_templates WHERE family=?').all(c.id);
        const single=key=>{const values=[...new Set(templates.map(t=>(t[key]||'').trim()).filter(Boolean))];return values.length===1?values[0]:'';};
        q('UPDATE product_categories SET description=?,terms=? WHERE id=?').run(single('intro'),single('terms'),c.id);
      }
      for(const quote of q('SELECT * FROM quotes').all()){
        const t=q('SELECT intro,terms FROM quote_templates WHERE id=?').get(quote.template_id||quote.template)||{};
        q('UPDATE quotes SET legacy_template_content=? WHERE id=?').run(JSON.stringify(t),quote.id);
      }
      q('INSERT INTO schema_migrations VALUES(?,?)').run('catalog-service-content-v1',now());
    }
    db.exec('COMMIT');
  }catch(e){db.exec('ROLLBACK');throw e;}
  const content=(value,fallback,max)=>{if(value===undefined)return fallback||'';if(typeof value!=='string'||value.length>max)bad('Nội dung không hợp lệ hoặc vượt '+max+' ký tự.');return value.trim();};
  const category=id=>q('SELECT * FROM product_categories WHERE id=?').get(id);
  const productTerms=(p,c)=>{
    const terms=(p.terms||c?.terms||'').replace(/Gói 3\/4 cần khách đã đăng ký Gói 1\.?/g,'').trim();
    return [terms,p.needs_pkg1?'Sản phẩm/dịch vụ này chỉ bán khi khách đã đăng ký Gói 1.':''].filter(Boolean).join('\n');
  };
  const available=tpl=>{
    if(!tpl)return [];const codes=tpl.product_codes===null?null:JSON.parse(tpl.product_codes);
    return q('SELECT * FROM products WHERE family=? AND active=1 ORDER BY code').all(tpl.family).filter(p=>codes===null||codes.includes(p.code)).map(p=>{const c=category(p.family);return {...p,description:p.description||c?.description||'',terms:productTerms(p,c)};});
  };
  const capture=quote=>{
    const tpl=q('SELECT * FROM quote_templates WHERE id=?').get(quote.template_id||quote.template);
    const products=available(tpl),lines=q('SELECT * FROM quote_items WHERE quote_id=?').all(quote.id);
    for(const line of lines){const p=q('SELECT * FROM products WHERE code=?').get(line.code)||{};const saved={...p,...line,family:quote.template,active:1};const i=products.findIndex(p=>p.code===line.code);if(i<0)products.push(saved);else products[i]=saved;}
    return products;
  };
  // Additive migration captures saved line prices; it never reprices existing quotes.
  db.exec('BEGIN IMMEDIATE');try{for(const quote of q('SELECT * FROM quotes WHERE catalog_snapshot IS NULL').all())q('UPDATE quotes SET catalog_snapshot=? WHERE id=?').run(JSON.stringify(capture(quote)),quote.id);q('INSERT OR IGNORE INTO schema_migrations VALUES(?,?)').run('catalog-prices-logo-v1',now());db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
  const prices=quote=>quote.catalog_snapshot?JSON.parse(quote.catalog_snapshot):capture(quote);
  function logo(value){
    if(value==='')return '';if(typeof value!=='string')bad('Logo không hợp lệ.');
    const match=/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);if(!match)bad('Chọn ảnh PNG, JPG hoặc WebP.');
    const bytes=Buffer.from(match[2],'base64');if(bytes.length>300*1024||bytes.length<12)bad('Logo tối đa 300 KB.');
    const valid=match[1]==='png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):match[1]==='jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
    if(!valid)bad('Nội dung tệp không khớp định dạng ảnh.');return value;
  }
  on('GET','/api/product-categories',()=>q('SELECT * FROM product_categories ORDER BY name').all());
  on('POST','/api/product-categories',({user,body})=>{role(user,'admin');const id=str(body.id,40),name=str(body.name,150);if(!/^[a-z0-9_-]+$/.test(id))bad('Mã loại chỉ gồm chữ thường, số, gạch nối.');if(category(id)||q('SELECT id FROM product_categories WHERE name=? COLLATE NOCASE').get(name))bad('Mã hoặc tên loại đã có.');q('INSERT INTO product_categories(id,name,description,terms) VALUES(?,?,?,?)').run(id,name,content(body.description,'',5000),content(body.terms,'',10000));log(user.id,'create_category','catalog',{id,name});return {id};});
  on('PUT','/api/product-categories/:id',({user,params,body})=>{role(user,'admin');if(!category(params.id))bad('Không tìm thấy loại.');const name=str(body.name,150);if(q('SELECT id FROM product_categories WHERE name=? COLLATE NOCASE AND id<>?').get(name,params.id))bad('Tên loại đã có.');const old=category(params.id);q('UPDATE product_categories SET name=?,description=?,terms=? WHERE id=?').run(name,content(body.description,old.description,5000),content(body.terms,old.terms,10000),params.id);log(user.id,'edit_category','catalog',{id:params.id,name});return {ok:true};});
  on('GET','/api/products',()=>q('SELECT * FROM products ORDER BY family,code').all());
  on('PUT','/api/products/:code',({user,params,body})=>{
    role(user,'admin');const code=str(params.code,50),old=q('SELECT * FROM products WHERE code=?').get(code);
    if(!/^[A-Za-z0-9_-]+$/.test(code))bad('Mã sản phẩm chỉ gồm chữ, số, gạch nối.');
    if(!old&&q('SELECT code FROM products WHERE code=? COLLATE NOCASE').get(code))bad('Mã sản phẩm đã có.');
    const family=body.family;if(!category(family))bad('Chọn loại sản phẩm/dịch vụ.');if(old&&old.family!==family)bad('Không đổi loại của mã đã có; hãy tạo mã mới.');
    const first=number(body.first_year,0,1e10),renewal=body.renewal===''||body.renewal===null?null:number(body.renewal,0,1e10);
    if(!Number.isInteger(first)||(renewal!==null&&!Number.isInteger(renewal)))bad('Đơn giá VNĐ phải là số nguyên.');
    if(body.active!==undefined&&typeof body.active!=='boolean')bad('Trạng thái không hợp lệ.');
    const supply=body.supply_type===undefined?(old?.supply_type||'unknown'):body.supply_type;
    if(!['unknown','self','partner','distributor'].includes(supply))bad('Chọn hình thức cung cấp hợp lệ.');
    const partner=['partner','distributor'].includes(supply)?content(body.partner_name,old?.partner_name,250):'';
    if(['partner','distributor'].includes(supply)&&!partner)bad('Nhập tên đối tác cung cấp sản phẩm / dịch vụ.');
    const values={name:str(body.name,250),family,first_year:first,renewal,unit:str(body.unit,60),note:String(body.note||'').slice(0,5000),active:body.active===false?0:1};
    q('INSERT INTO products(code,name,family,first_year,renewal,unit,note,active) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(code) DO UPDATE SET name=excluded.name,first_year=excluded.first_year,renewal=excluded.renewal,unit=excluded.unit,note=excluded.note,active=excluded.active').run(code,...Object.values(values));
    q('UPDATE products SET description=?,terms=? WHERE code=?').run(content(body.description,old?.description??body.note,5000),content(body.terms,old?.terms,10000),code);
    q('UPDATE products SET supply_type=?,partner_name=? WHERE code=?').run(supply,partner,code);
    log(user.id,'save_product','catalog',{code,old,new:{...values,supply_type:supply,partner_name:partner}});return {ok:true};
  });
  on('PUT','/api/templates/:id',({user,params,body})=>{
    role(user,'admin');const id=params.id,old=q('SELECT * FROM quote_templates WHERE id=?').get(id),family=body.family;
    if(!category(family))bad('Loại mẫu không hợp lệ.');if(old&&old.family!==family)bad('Không đổi loại dịch vụ của mẫu đã có; hãy tạo mẫu mới.');if(!/^[a-z0-9_-]{1,40}$/.test(id))bad('Mã mẫu chỉ gồm chữ thường, số, gạch nối.');
    let codes=body.product_codes===undefined?(old?.product_codes??null):JSON.stringify(body.product_codes);
    if(body.product_codes!==undefined){if(!Array.isArray(body.product_codes)||body.product_codes.length>40||new Set(body.product_codes).size!==body.product_codes.length)bad('Chọn tối đa 40 hạng mục, không trùng.');for(const code of body.product_codes){const p=q('SELECT * FROM products WHERE code=?').get(code);if(!p||p.family!==family)bad('Hạng mục không thuộc loại dịch vụ của mẫu.');}}
    const image=body.logo===undefined?(old?.logo||''):logo(body.logo);
    q('INSERT INTO quote_templates(id,name,family,intro,terms,product_codes,logo) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,intro=excluded.intro,terms=excluded.terms,product_codes=excluded.product_codes,logo=excluded.logo,version=quote_templates.version+1').run(id,str(body.name,200),family,old?.intro||'',old?.terms||'',codes,image);
    log(user.id,'template','settings',{id,product_codes:codes,has_logo:!!image});return {ok:true};
  });
  on('PUT','/api/brand',({user,body})=>{role(user,'admin');if(!/^#[0-9a-f]{6}$/i.test(body.color))bad('Màu cần ở định dạng #RRGGBB.');set('brand',{name:str(body.name,250),short:str(body.short,80),address:String(body.address||'').slice(0,500),contact:String(body.contact||'').slice(0,500),color:body.color,logo:body.logo===undefined?get('brand',{}).logo||'':logo(body.logo)});log(user.id,'brand','settings',{has_logo:!!get('brand',{}).logo});return {ok:true};});
  const documentTemplate=quote=>{const t=q('SELECT * FROM quote_templates WHERE id=?').get(quote.template_id||quote.template)||{};return {...t,imported_layout:quote.layout_snapshot||null,...(quote.content_source==='products'?{intro:'',terms:''}:JSON.parse(quote.legacy_template_content||'{}'))};};
  const contentLines=(quote,lines)=>quote.content_source==='products'?lines.map(i=>{const p=prices(quote).find(p=>p.code===i.code)||{};return {...i,description:p.description||'',terms:p.terms||''};}):lines;
  return {available,prices,documentTemplate,contentLines};
}
