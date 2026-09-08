# -*- coding: utf-8 -*-
"""Clean the company-based event dataset and compute the annual table."""
import json, csv, io, re, collections, sys
import canon

CSV = '/root/.claude/uploads/b6c0c05d-03a1-5e28-bd0d-3100eccdcc98/390ef3cf-new_company_listNEW.csv'
YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026]

rows = list(csv.reader(io.open(CSV, encoding='utf-8-sig', errors='replace')))[2:]
SRC = {r[0].strip(): r[12].strip() for r in rows}
ev = json.load(open('events.json', encoding='utf-8'))

# ---- scope: companies the dataset flags as having a signature-reduction capability
ev = [e for e in ev if SRC.get(e['company']) == 'Yes']

# ---- year
def year_of(e):
    m = re.findall(r'20\d\d', e['year'])
    return int(m[-1]) if m else None       # ranges take the later year
for e in ev:
    e['y'] = year_of(e)
ev = [e for e in ev if e['y'] in YEARS]

# ---- canonical supplier / buyer / country
for e in ev:
    e['sup'] = canon.canon_supplier(e['company'])
    e['buy'], e['country'], e['why'] = canon.canon_buyer(e['buyer'])

# ---- approved scope exclusions
def excluded(e):
    t = (e['product'] + ' ' + e['programme'] + ' ' + e['etype']).lower()
    if e['sup'] == 'Milspray' and e['y'] == 2026 and 'carc' in t:
        return 'approved exclusion: 2026 MILSPRAY / USMC CARC visual-only repainting'
    if e['sup'] == 'TDU Savunma' and e['y'] == 2024 and 'burlap' in t:
        return 'approved exclusion: 2024 TDU / NSPA burlap'
    return None
dropped_scope = [(e, excluded(e)) for e in ev if excluded(e)]
ev = [e for e in ev if not excluded(e)]

# ---- date normalisation, for duplicate detection
MON = {m: i for i, m in enumerate(
    ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'], 1)}
def norm_date(s):
    s = s.strip('[] ')
    m = re.search(r'(20\d\d)[-/](\d{1,2})[-/](\d{1,2})', s)
    if m:
        return '%s-%02d-%02d' % (m.group(1), int(m.group(2)), int(m.group(3)))
    m = re.search(r'(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?,?\s+(20\d\d)', s)
    if m and m.group(2).lower() in MON:
        return '%s-%02d-%02d' % (m.group(3), MON[m.group(2).lower()], int(m.group(1)))
    m = re.search(r'([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(20\d\d)', s)
    if m and m.group(1).lower() in MON:
        return '%s-%02d-%02d' % (m.group(3), MON[m.group(1).lower()], int(m.group(2)))
    return None
def norm_val(s):
    s = s.strip('[] ').lower()
    m = re.findall(r'[\d][\d,.]*', s)
    return m[0].replace(',', '') if m else ''

# ---- duplicate removal (the same event described under two company rows)
seen, dups = {}, []
clean = []
for e in ev:
    d = norm_date(e['date'])
    key = ('D', e['sup'], d, norm_val(e['value']), e['product'][:28]) if d else \
          ('F', e['sup'], e['y'], e['buy'], e['programme'][:40], e['etype'][:24], norm_val(e['value']))
    if key in seen:
        dups.append((e, seen[key]))
        continue
    seen[key] = e
    clean.append(e)

# ---- event classification
def klass(e):
    t = e['etype'].strip('[] ').lower()
    if re.search(r'\bcontract award to\b|award/result, sterlite l|tender award/result, sterlite bidder', t):
        pass
    order = re.search(r'delivery order|task order|purchase|call-off|contract award|definitive contract|'
                      r'follow-on order|option exercis|contract option|subcontract|initial order|first order|'
                      r'prime contract award|supplier contract award|requirements contract award|'
                      r'contract amendment|contract extension|order\b', t)
    dev = re.search(r'fund|r&d|edf|grant|sbir|ota|development|prototype|study', t)
    demand = re.search(r'\brfi\b|\brfq\b|\brfp\b|tender|solicitation|sources sought|presolicitation|'
                       r'negotiation invitation|special notice|eoi|synopsis|procurement notice|'
                       r'framework notice|bid participation', t)
    trial = re.search(r'trial|evaluat|assessment|experimentation|test', t)
    frame = re.search(r'framework|idiq|\bidc\b|\bidv\b|\bbpa\b|outline agreement|long-term agreement', t)
    # a tender the supplier did not win is demand, never an order
    lost = re.search(r'disqualified|bidder|\bl2\b|\bl4\b|\bl5\b|participation|cancelled', t)
    if demand and lost:
        return 'demand'
    if frame and not re.search(r'order|call-off|firm order', t):
        return 'framework'
    if order and not dev:
        return 'order'
    if dev:
        return 'development'
    if demand:
        return 'demand'
    if trial:
        return 'trial'
    return 'other'
for e in clean:
    e['k'] = klass(e)

json.dump(clean, open('clean.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

# ---- report
print('in-scope events before cleaning : %d' % len(ev))
print('approved scope exclusions       : %d' % len(dropped_scope))
for e, why in dropped_scope:
    print('    %s %s  %s' % (e['y'], e['sup'], why))
print('cross-row duplicates removed    : %d' % len(dups))
dc = collections.Counter(e['sup'] for e, _ in dups)
for k, v in dc.most_common(10):
    print('    %-28s %d' % (k, v))
print('clean events                    : %d' % len(clean))
print()
print('class distribution:', dict(collections.Counter(e['k'] for e in clean)))
print()
hdr = ('שנה', 'Events', 'Orders', 'Suppliers', 'Buyers', 'Countries', 'Demand')
print('%-9s %7s %7s %10s %7s %10s %8s' % hdr)
tbl = {}
for y in YEARS:
    es = [e for e in clean if e['y'] == y]
    sup = {e['sup'] for e in es}
    buy = {e['buy'] for e in es}
    cty = set()
    for e in es:
        for c in re.split(r'\s*/\s*|\s+and\s+', e['country']):
            c = c.strip()
            if c and c.lower() not in ('undisclosed', 'multinational'):
                cty.add(c)
    orders = [e for e in es if e['k'] == 'order']
    dem = [e for e in es if e['k'] == 'demand']
    tbl[y] = dict(events=len(es), orders=len(orders), suppliers=len(sup),
                  buyers=len(buy), countries=len(cty), demand=len(dem))
    print('%-9s %7d %7d %10d %7d %10d %8d' % (y, len(es), len(orders), len(sup), len(buy), len(cty), len(dem)))
json.dump(tbl, open('annual.json', 'w'), indent=1)
