// Verify semantic text and interaction color pairs used by the CRM theme.
const fs=require('node:fs'),assert=require('node:assert/strict');
const css=fs.readFileSync(new URL('./workspace.css',`file:///${__filename.replaceAll('\\','/')}`),'utf8');
const tokens=Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(#[\da-f]{6})(?=[;\s}])/gi)].map(m=>[m[1],m[2]]));
const luminance=hex=>hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);
const rows=[];function check(fg,bg,min=4.5){assert(tokens[fg]&&tokens[bg],`Missing ${fg}/${bg}`);const a=luminance(tokens[fg]),b=luminance(tokens[bg]),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);rows.push({foreground:fg,background:bg,colors:[tokens[fg],tokens[bg]],ratio:Number(ratio.toFixed(2)),minimum:min,pass:ratio>=min});assert(ratio>=min,`${fg}/${bg}: ${ratio}`);}
for(const bg of ['surface-page','surface-card','surface-subtle','surface-heading','surface-hover','surface-selected'])for(const fg of ['text-primary','text-secondary'])check(fg,bg);
for(const tone of ['success','info','warning','danger','neutral','sent'])check(tone+'-text',tone+'-bg');
check('action-text','action-primary');check('action-text','action-hover');check('action-primary','surface-card');check('action-primary','surface-heading');check('nav-text','nav-bg');check('nav-muted','nav-bg');check('nav-muted','nav-hover');check('action-text','nav-active');check('disabled-text','disabled-bg');check('warning-text','surface-subtle');check('border-input','surface-card',3);check('focus-ring','surface-card',3);check('focus-ring','surface-selected',3);
fs.writeFileSync(new URL('../docs/design/color-review/token-contrast.json',`file:///${__filename.replaceAll('\\','/')}`),JSON.stringify(rows,null,2));console.log(`${rows.length} color pairs passed. Minimum text ratio ${Math.min(...rows.filter(r=>r.minimum===4.5).map(r=>r.ratio))}:1`);
