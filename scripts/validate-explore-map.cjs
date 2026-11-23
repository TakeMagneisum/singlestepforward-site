const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Node {
 constructor(){this.handlers={};this.children=[];this.attrs={};this.value='';}
 toggleAttribute(k,v){this.attrs[k]=v;} setAttribute(k,v){this.attrs[k]=v;} addEventListener(k,f){this.handlers[k]=f;}
 append(...n){this.children.push(...n);} replaceChildren(...n){this.children=n;}
 focus(){this.focused=true;}
}
process.chdir(require('node:path').resolve(__dirname, '..'));
const html=fs.readFileSync('explore-map.html','utf8');
const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]);
assert(!/\b(?:src|href)="https?:[^"]+"/.test(html.replace(/<a [^>]+>/g,'')));
const run = async (query, missing = []) => {
 const nodes = {}, get = id => nodes[id] ??= new Node();
 const country = get('map-country');
 country.options = [...html.matchAll(/<option value="([^"]*)">([^<]*)<\/option>/g)]
   .filter(match => !['en','es'].includes(match[1]))
   .map(match => ({value: match[1], textContent: match[2]}));
 country.append = option => country.options.push(option);
 const location = {search: query}, events = {};
 const document = {
   getElementById: get, createElement: () => new Node(), createElementNS: () => new Node(),
   documentElement: {lang: 'en'}, addEventListener: (type, callback) => { events[type] = callback; },
   head: {append(script) {
     assert.match(script.src, /^assets\/maps\//);
     if (missing.includes(script.src)) script.onerror();
     else { load(script.src); script.onload(); }
   }}
 };
 const window = {addEventListener: document.addEventListener};
 const history = {pushState(_, __, url) { location.search = new URL(url, 'file:///explore-map.html').search; }};
 const ctx = vm.createContext({window, document, location, history, URLSearchParams});
 const load = file => vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, {filename:file});
 for (const file of files) if (!/calm|i18n/.test(file) && !missing.includes(file)) load(file);
 events.DOMContentLoaded();
 await Promise.resolve();
 return [window, get, location, events];
};
(async () => {
const [w,get] = await run('?country=GB');
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
const [,empty]=await run('?country=GB',['assets/maps/london-boundaries.js']);assert(empty('london-map').hidden);assert.equal(empty('map-guides').children.length,33);
console.log(guideCount+' exact list routes, 33 unique SVG routes, country filters, search, pointer and keyboard handlers, and missing-geometry fallback passed.');
 
const [world, home, location, events] = await run('');
assert.equal(home('overview-title').textContent, 'World map');
assert.equal(home('overview-map').hidden, false);
assert.equal(world.SSFLondonPaths, undefined);
assert.equal(world.SSFCaribbeanOverview, undefined);
assert.equal(home('map-guides').children.length, guideCount);
const regionLink = home('overview-links').children[0].children[0];
const query = href => new URL(href, 'file:///explore-map.html').search;
const [, caribbean] = await run(query(regionLink.href));
assert.equal(caribbean('overview-title').textContent, 'Caribbean');
const prLink = caribbean('overview-links').children[0].children[0];
assert.equal(prLink.textContent, 'Puerto Rico');
const [, pr] = await run(query(prLink.href));
assert.equal(pr('map-country').value, 'PR');
assert.equal(pr('map-guides').children.length, Object.values(areas).filter(area => area.country === 'PR').length);
const [, canada] = await run('?country=CA');
assert.equal(canada('map-unpublished').hidden, false);
assert.equal(canada('map-discover').hidden, true);
home('map-country').value = 'US';
home('map-country').handlers.change();
assert.equal(location.search, '?country=US');
assert.equal(home('map-discover').hidden, false);
location.search = '';
events.popstate();
assert.equal(home('overview-map').hidden, false);
const [, noWorld] = await run('', ['assets/maps/world-overview.js']);
assert.equal(noWorld('map-guides').children.length, guideCount);
const [, noInset] = await run('?region=caribbean', ['assets/maps/caribbean-overview.js']);
assert.equal(noInset('overview-links').children[0].children[0].href, 'explore-map.html?country=PR');
console.log('World landing, lazy geometry, Caribbean → Puerto Rico, uncovered country, Back, and map failure fallbacks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
