"""Offline checks of guide data integrity; does not certify live service capacity."""
import csv, json, collections, re
from pathlib import Path
from urllib.parse import urlparse
from html.parser import HTMLParser
P=Path(__file__).resolve().parent
plan=json.loads((P/'location-plan.json').read_text())
locations=plan['locations']
rows=json.loads((P/'research-ledger.json').read_text())['resources']
sources=json.loads((P/'source-registry.json').read_text())['sources']
registry={x['id']:x for x in sources}
errors=[]
def check(v,message):
 if not v:errors.append(message)
check(len(locations)==41,'Expected 41 locations')
check(collections.Counter(x['country_code'] for x in locations)=={'US':2,'GB':33,'NZ':6},'Country count mismatch')
check(len({x['id'] for x in locations})==41,'Duplicate location IDs')
check(len({x['row_id'] for x in rows})==len(rows),'Duplicate row IDs')
check(len({x['url'] for x in sources})==len(sources),'Duplicate canonical source URLs')
check(all(x['source_checked_on']=='2026-11-18' for x in rows),'Missing source date')
check(all(x['verification_status']=='source_checked_local_review_pending' for x in rows),'Incorrect review status')
for r in rows:
 check(r['source_id'] in registry,r['row_id']+' missing source')
 check(r['url']==registry.get(r['source_id'],{}).get('url'),r['row_id']+' source URL mismatch')
 check(urlparse(r['url']).scheme in ['http','https'],r['row_id']+' invalid URL')
 check(all(r.get(k) for k in ['resource','scope','next_step','categories']),r['row_id']+' empty content')
for l in locations:
 rr=[r for r in rows if r['location_id']==l['id']]
 check(len(rr)==l['resource_rows'],l['id']+' count mismatch')
 check(len(rr)>=20,l['id']+' insufficient researched entries')
 check(len(set(r['url'] for r in rr))==len(rr),l['id']+' duplicate source within guide')
 check(l['generate'] is False and l['publish'] is False,l['id']+' unexpectedly publishable')
 check(l['status']=='source_checked_local_review_pending',l['id']+' incorrect status')
 check((P/l['guide_file']).exists(),l['id']+' missing readable guide')
 csvrows=list(csv.reader((P/l['file']).open(encoding='utf-8-sig')))
 check(len(csvrows[4])==10,l['id']+' schema header mismatch')
 check(len(csvrows[5:])==len(rr),l['id']+' CSV length mismatch')
 for a,r in zip(csvrows[5:],rr):
  check(len(a)==10,l['id']+' non-ten-column row')
  check(a[:5]==[r[k] for k in ['resource','scope','phone','url','next_step']],r['row_id']+' CSV/ledger disagreement')
  check(a[5:]==['']*5,r['row_id']+' fabricated reviewer data')
  check(not any('\n' in x or '\r' in x for x in a),r['row_id']+' multiline field')
  check(not any(x.startswith(('=','+','@')) for x in a),r['row_id']+' spreadsheet formula risk')
 check(all(r['row_id'] in (P/l['guide_file']).read_text() for r in rr),l['id']+' guide missing row')
 if l['country_code']=='GB':check(not any('Illinois' in r['scope'] or 'Cook County' in r['scope'] for r in rr),l['id']+' US route leakage')
 if l['country_code']=='NZ':check(not any('England' in r['scope'] or 'Cook County' in r['scope'] for r in rr),l['id']+' foreign route leakage')
ch=[r for r in rows if r['location_id']=='chicago']
check(not any('thehacc.org' in r['url'] or 'myentrypoint.org' in r['url'] or 'ageoptions.org' in r['url'] for r in ch),'Suburban-only service leaked into Chicago')
coverage=list(csv.DictReader((P/'research-checklist.csv').open(encoding='utf-8-sig')))
check(len(coverage)==656,'Expected 656 category cells')
rowmap={r['row_id']:r for r in rows}
for c in coverage:
 check(c['status']=='source_checked_route_local_review_pending','Unresolved category: '+c['location_id']+' '+c['category'])
 ids=c['resource_ids'].split('; ')
 check(bool(ids) and all(i in rowmap and rowmap[i]['location_id']==c['location_id'] for i in ids),'Coverage references wrong location')
class Links(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.hrefs=[];self.options=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if tag=='a':self.hrefs.append(a.get('href',''))
  if tag=='option':self.options.append(a.get('value',''))
htmltext=(P/'OPEN-GUIDES.html').read_text();doc=Links();doc.feed(htmltext)
check(len(doc.ids)==len(set(doc.ids)),'Duplicate HTML IDs')
check(set(doc.options)=={l['id'] for l in locations},'HTML selector mismatch')
for href in doc.hrefs:
 if href.startswith('#'):check(href[1:] in doc.ids,'Broken HTML fragment '+href)
 elif ':' not in href:check((P/href).exists(),'Broken local HTML link '+href)
check('name="viewport"' in htmltext,'HTML missing mobile viewport')
check('localStorage' not in htmltext and 'fetch(' not in htmltext,'Unexpected browser persistence/network script')
report=dict(status='PASS' if not errors else 'FAIL',checked_on='2026-11-18',guides=len(locations),resource_placements=len(rows),distinct_source_pages=len(sources),category_coverage_cells=len(coverage),errors=errors,limitations='Offline integrity checks only. Source retrieval and content review are recorded separately; local operational review remains pending.')
(P/'validation-report.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
raise SystemExit(bool(errors))
