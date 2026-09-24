// Run with Node and optionally pass the original inventory text for a full source audit.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,filename);
const {products,money,filterProducts,sortProducts,updateCart,orderMessage,cartSummary,brandsFor,brandHref}=require('../lib/catalog.ts');
const {emptyFilters,applyFilters}=require('../lib/catalog-filters.ts');

assert.equal(products.length,122);
assert.equal(new Set(products.map(p=>p.id)).size,122);
assert.equal(new Set(products.map(p=>p.slug)).size,122);
assert.equal(new Set(products.map(p=>`${p.category}:${p.brand}:${p.name}`)).size,122);
assert.equal(filterProducts('Hombre').length,82);
assert.equal(filterProducts('Mujer').length,40);
assert.ok(products.every(p=>['Hombre','Mujer'].includes(p.category)));
assert.ok(products.every(p=>p.availability==='on-request'));
assert.ok(products.every(p=>p.image&&fs.existsSync(path.join(__dirname,'../public',p.image))));
assert.equal(products.filter(p=>p.name.includes('Mandarin Sky')).length,1);
assert.equal(products.find(p=>p.name.includes('Mandarin Sky')).price,32000);
for(const amount of [13500,59900,65000,110000])assert.equal(money(amount),`₡${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g,'.')}`);

assert.equal(filterProducts('Todos','JPG').length,8);
assert.equal(filterProducts('Todos','ysl').length,4);
assert.equal(filterProducts('Todos','lancome').length,4);
assert.equal(filterProducts('Todos','l’homme').length,2);
assert.equal(filterProducts('Todos','odyssey').length,5);
assert.equal(filterProducts('Mujer','chanel').length,4);
const combined={...emptyFilters(),brands:['Prada','Chanel'],genders:['Mujer'],sizes:['90'],priceRange:[60000,70000]};
assert.deepEqual(applyFilters(products,combined).map(p=>p.name),['Paradoxe','Paradoxe Intense','Paradoxe Virtual Flower']);
assert.equal(applyFilters(products,emptyFilters()).length,122);
assert.ok(applyFilters(products,{...emptyFilters(),priceRange:[0,20000]}).every(p=>p.price!==null&&p.price<=20000));
for(const order of ['price-asc','price-desc']){
 const sorted=sortProducts(products,order);const priced=sorted.filter(p=>p.price!==null);
 assert.ok(sorted.slice(priced.length).every(p=>p.price===null));
 assert.ok(priced.every((p,i)=>!i||(order==='price-asc'?priced[i-1].price<=p.price:priced[i-1].price>=p.price)));
}
const alphabetical=sortProducts(products,'name');assert.ok(alphabetical.every((p,i)=>!i||alphabetical[i-1].name.localeCompare(p.name,'es')<=0));
assert.equal(brandsFor('Mujer').length,10);
assert.equal(brandHref('Jean Paul Gaultier','Hombre'),'/hombre/jean-paul-gaultier');
assert.equal(brandHref('Carolina Herrera','Mujer'),'/mujer/carolina-herrera');

let cart=updateCart({},'bleu',2);cart=updateCart(cart,'good-girl',1);
assert.equal(cartSummary(cart).subtotal,272900);
const message=orderMessage(cart);assert.ok(message.includes('Cantidad: 2'));assert.ok(message.includes('₡110.000'));assert.ok(message.includes('₡272.900'));assert.ok(message.includes('SINPE Móvil'));
const unpriced=products.find(p=>p.price===null);const mixed=updateCart(cart,unpriced.id,1);
assert.ok(orderMessage(mixed).includes('Subtotal de productos con precio'));
assert.ok(!orderMessage(mixed).includes('Total de productos (sin envío)'));
assert.ok(!/pendiente|undefined|null/.test(orderMessage(mixed)));
assert.throws(()=>updateCart({},'million',1));assert.throws(()=>updateCart({},'gypsy',1));

if(process.argv[2]){
 const source=fs.readFileSync(process.argv[2],'utf8');let category='';let checked=0;
 for(const raw of source.split(/\r?\n/)){
  const line=raw.trim();
  if(line==='PERFUMES PARA HOMBRE'){category='Hombre';continue}
  if(line==='PERFUMES PARA MUJER'){category='Mujer';continue}
  if(line==='3. ESTRUCTURA DEL CATÁLOGO')break;
  if(!category||!line.includes(' — '))continue;
  const [name,...details]=line.split(' — ');if(name==='Armaf Odyssey Mandarin Sky')continue;
  const product=products.find(p=>p.category===category&&p.name===name);assert.ok(product,`${category}: ${name}`);
  const amount=details.find(d=>d.startsWith('₡'));const volume=details.find(d=>/^\d+ ml$/.test(d));
  // Owner's later correction supersedes the two conflicting inventory entries.
  const expectedPrice=name==='Odyssey Mandarin Sky'?32000:amount?Number(amount.replace(/[^\d]/g,'')):null;
  assert.equal(product.price,expectedPrice,`price: ${name}`);
  assert.equal(product.volumeMl,volume?parseInt(volume):null,`volume: ${name}`);checked++;
 }
 assert.equal(checked,products.length);console.log(`Source audit: ${checked} exact names, categories, prices and volumes verified.`);
}
console.log('Catalogue checks passed: unique inventory, images, filters, aliases, sorting, brand routes, cart and WhatsApp totals.');
