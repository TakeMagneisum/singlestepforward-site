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
const usEntries = Object.entries(areas).filter(([, area]) => area.country === 'US');
const usStates = new Set(usEntries.map(([, area]) => area.stateCode));
const [usWindow, us, usLocation, usEvents] = await run('?country=US');
assert.equal(us('us-map').hidden, false);
assert.equal(us('us-map-graphic').hidden, false);
assert.equal(us('map-guides').children.length, usEntries.length);
assert.equal(us('state-links').children.length, 51);
assert.equal(Object.keys(usWindow.SSFUsStatePaths).length, 51);
assert(!((await run(""))[0].SSFUsStatePaths));
const stateLinks = new Map(us('state-links').children.map(row => {
 const link = row.children[0];
 return [new URL(link.href, 'file:///explore-map.html').searchParams.get('state'), link.href];
}));
for (const [state, href] of stateLinks) {
 assert(usWindow.SSFUsStatePaths[state]?.startsWith('M'));
 assert(us('us-map-svg').children.some(el => el.attrs.href === href));
}
for (const state of usStates) assert(stateLinks.has(state), state);
for (const [state, href] of stateLinks) {
 const [, filtered] = await run(query(href));
 const expected = usEntries.filter(([, area]) => area.stateCode === state).map(([id]) => id).sort();
 const actual = filtered('map-guides').children.map(row =>
   new URL(row.children[0].href, 'file:///explore-map.html').searchParams.get('area')).sort();
 assert.deepEqual(actual, expected);
 assert.equal(filtered('map-unpublished').hidden, expected.length > 0);
 assert.equal(filtered('map-discover').hidden, false);
 assert.equal(filtered('map-back-us').hidden, false);
}
us('state-search').value = 'rhode island';
us('state-search').handlers.input();
assert.equal(us('state-links').children.length, 1);
assert.equal(us('state-links').children[0].children[0].href, stateLinks.get('RI'));
assert(!usStates.has('RI'));
const [, california] = await run('?country=US&state=CA');
california('map-search').value = 'San Diego';
california('map-search').handlers.input();
assert.equal(california('map-guides').children.length, 1);
assert.equal(california('map-guides').children[0].children[0].href, 'find-help.html?area=san-diego');
california('map-clear-search').handlers.click();
assert.equal(california('map-guides').children.length, 8);
usLocation.search = '?country=US&state=CA';
usEvents.popstate();
assert.equal(us('us-map').hidden, true);
usLocation.search = '?country=US';
usEvents.popstate();
assert.equal(us('us-map').hidden, false);
us('map-reset').handlers.click();
assert.equal(us('overview-map').hidden, false);
const [, noStates] = await run('?country=US', ['assets/maps/us-state-boundaries.js']);
assert.notEqual(noStates('us-map-graphic').hidden, false);
assert.equal(noStates('state-links').children.length, 51);
assert.equal(noStates('map-guides').children.length, usEntries.length);
const [, nonUs] = await run('?country=PR&state=CA');
assert.equal(nonUs('map-state-title').hidden, true);
const [, invalidState] = await run('?country=US&state=XX');
assert.equal(invalidState('map-guides').children.length, usEntries.length);
console.log(usEntries.length + ' US guides across ' + usStates.size + ' jurisdictions. All 51 state routes, map coverage, search, ZIP fallback, Back/reset, and missing geometry passed.');
const countyURL = '?country=US&state=GA';
const [gaWindow, ga, gaLocation, gaEvents] = await run(countyURL);
assert.equal(ga('ga-map').hidden, false);
assert.equal(ga('ga-map-graphic').hidden, false);
const countyNames = gaWindow.SSFGeorgiaCountyNames;
const countyShapes = gaWindow.SSFGeorgiaCountyGeometry.paths;
const countyRows = ga('county-links').children;
assert.equal(Object.keys(countyNames).length, 159);
assert.equal(countyRows.length, 159);
assert.deepEqual(Object.keys(countyShapes).sort(), Object.keys(countyNames).sort());
assert.equal(new Set(countyRows.map(row => row.children[0].href)).size, 159);
const mapped = {13051:'savannah-chatham', 13089:'atlanta', 13121:'atlanta', 13179:'liberty'};
const countyCrosswalk = JSON.parse(fs.readFileSync('assets/explore-map.js', 'utf8')
 .match(/const countyGuides = (\{[\s\S]*?\});/)[1]);
assert.deepEqual(Object.keys(countyCrosswalk).sort(), Object.keys(mapped).sort());
for (const [code, ids] of Object.entries(countyCrosswalk)) {
 assert.deepEqual(ids, [mapped[code]]);
 assert.equal(areas[ids[0]].country, 'US');
 assert.equal(areas[ids[0]].stateCode, 'GA');
}
for (const row of countyRows) {
 const link = row.children[0];
 const code = new URL(link.href, 'file:///explore-map.html').searchParams.get('county');
 assert.match(code, /^13\d{3}$/);
 assert.equal(link.textContent, countyNames[code]);
 assert(countyShapes[code].startsWith('M'));
 assert(ga('ga-map-svg').children.some(shape => shape.attrs.href === link.href));
}
for (const [code, id] of Object.entries(mapped)) {
 const [, county] = await run(countyURL + '&county=' + code);
 assert.deepEqual(county('map-guides').children.map(row => row.children[0].href), ['find-help.html?area=' + id]);
}
ga('map-search').value = 'Savannah';
ga('map-search').handlers.input();
assert.equal(ga('map-guides').children[0].children[0].href, 'find-help.html?area=savannah-chatham');
ga('county-search').value = 'Chatham';
ga('county-search').handlers.input();
assert.equal(ga('county-links').children.length, 1);
assert.match(ga('county-links').children[0].children[0].href, /county=13051$/);
const [, noCounties] = await run(countyURL + '&county=13001', ['assets/maps/georgia-county-boundaries.js']);
assert.equal(noCounties('county-links').children.length, 159);
assert.notEqual(noCounties('ga-map-graphic').hidden, false);
assert.equal(noCounties('map-unpublished').hidden, false);
assert.equal(noCounties('map-discover').hidden, false);
const [, invalidCounty] = await run(countyURL + '&county=99999');
assert.equal(invalidCounty('map-guides').children.length, 3);
gaLocation.search = '?country=US';
gaEvents.popstate();
assert.equal(ga('ga-map').hidden, true);
assert.equal(ga('us-map').hidden, false);
assert(!usWindow.SSFGeorgiaCountyGeometry);
console.log('159 Georgia county routes and shapes, crosswalk, Savannah search, ZIP fallback, Back and missing geometry passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
