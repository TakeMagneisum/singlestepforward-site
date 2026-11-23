const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Node {
 constructor(){this.handlers={};this.children=[];this.attrs={};this.value='';}
 setAttribute(k,v){this.attrs[k]=v;} addEventListener(k,f){this.handlers[k]=f;}
 append(...n){this.children.push(...n);} replaceChildren(...n){this.children=n;}
 focus(){this.focused=true;}
}
process.chdir(require('node:path').resolve(__dirname, '..'));
const html=fs.readFileSync('explore-map.html','utf8');
const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]);
assert(!/\b(?:src|href)="https?:[^"]+"/.test(html.replace(/<a [^>]+>/g,'')));
const run=(query,missing=false)=>{
 const nodes={},get=id=>nodes[id]??=new Node();
 get('map-country').options=['','GB','US','PR','CL','NZ'].map(value=>({value}));
 const ctx=vm.createContext({window:{},document:{getElementById:get,createElement:()=>new Node,createElementNS:()=>new Node},location:{search:query},URLSearchParams});
 for(const f of files)if(!/calm|i18n/.test(f)&&!(missing&&f.includes('london-boundaries')))vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
 return [ctx.window,get];
};
const [w,get]=run('?country=GB');
const areas=w.SSF_RESOURCE_AREAS;
const guideCount=Object.keys(areas).length;
assert.equal(get('map-country').value,'GB');
assert.equal(get('london-map').hidden,false);
const paths=get('borough-map').children;
const crosswalk=JSON.parse(fs.readFileSync("assets/explore-map.js","utf8").match(/const london = (\{[\s\S]*?\});/)[1]);
assert.deepEqual(Object.keys(crosswalk).sort(),Object.keys(w.SSFLondonPaths).sort());
assert.equal(new Set(Object.values(crosswalk)).size,33);
assert.equal(paths.length,33);
const opened=new Set;
for(const p of paths){
 p.handlers.pointerenter();assert.equal(get('map-hover').textContent,p.attrs['aria-label']);p.handlers.pointerleave();
 p.handlers.click();
 const link=get('map-open').href;
 const id=new URL(link,'https://example.test').searchParams.get('area');
 assert.equal(areas[id].country,'GB');assert.equal(areas[id].name,p.attrs['aria-label']);
 assert(!opened.has(id));opened.add(id);
 p.handlers.keydown({key:'Enter',preventDefault(){}});assert.equal(get('map-open').href,link);
 assert.equal(p.attrs['aria-pressed'],'true');
}
for(const name of ['enfield','croydon','westminster','city-of-london'])assert(opened.has('london-'+name));
get('pick-city').handlers.click();assert.equal(get('map-open').href,'find-help.html?area=london-city-of-london');
for(const code of ['GB','US','PR','CL','NZ']){
 get('map-country').value=code;get('map-country').handlers.change();
 const ids=get('map-guides').children.map(n=>n.children[0].href.split('=')[1]).sort();
 assert.deepEqual(ids,Object.keys(areas).filter(id=>areas[id].country===code).sort());
}
get('map-reset').handlers.click();assert.equal(get('map-guides').children.length,guideCount);
for(const term of ['San Juan','Valparaíso','Valparaiso','Enfield']){
 get('map-search').value=term;get('map-search').handlers.input();assert(get('map-guides').children.length>0);
}
get('map-search').value='abcdef-no-result';get('map-search').handlers.input();assert.equal(get('map-empty').hidden,false);
const [,empty]=run('?country=GB',true);assert(empty('london-map').hidden);assert.equal(empty('map-guides').children.length,33);
console.log(guideCount+' exact list routes, 33 unique SVG routes, country filters, search, pointer and keyboard handlers, and missing-geometry fallback passed.');
