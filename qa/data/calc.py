# -*- coding: utf-8 -*-
"""Company-based Market Momentum metrics from the event-level dataset.

Sanity checks first; the annual table and coverage counts are only printed if
all five pass.
"""
import csv, io, re, collections, json

P = '/root/.claude/uploads/b6c0c05d-03a1-5e28-bd0d-3100eccdcc98/bb8f98bc-downloaded_file.csv'
YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026]

rows = [x for x in list(csv.reader(io.open(P, encoding='utf-8-sig', errors='replace')))[1:]
        if any(c.strip() for c in x)]

# ---------- sanity checks -------------------------------------------------
raw_n = len(rows)
raw_sup = len({x[7].strip() for x in rows})
dups = sum(v - 1 for v in collections.Counter(tuple(x) for x in rows).values() if v > 1)


def excluded(x):
    blob = ' '.join(x)
    if x[7].startswith('MILSPRAY') and 'CARC' in blob:
        return 'MILSPRAY 2026 CARC'
    if 'burlap' in blob.lower():
        return 'TDU / NSPA 2024 burlap'
    return None


core = [x for x in rows if not excluded(x)]
checks = [('raw rows', raw_n, 95), ('raw supplier-name values', raw_sup, 16),
          ('core rows after exclusions', len(core), 92), ('exact full-row duplicates', dups, 0)]
print('SANITY CHECKS')
ok = True
for name, got, want in checks:
    good = got == want
    ok &= good
    print('  %-30s got %3d  expected %3d   %s' % (name, got, want, 'PASS' if good else 'FAIL'))
print('  approved exclusions applied   :', collections.Counter(excluded(x) for x in rows if excluded(x)))
if not ok:
    raise SystemExit('\nSTOP: a sanity check failed.')

# ---------- buyer canonicalisation ---------------------------------------
# (regex, canonical name, reason).  Only genuine naming variants of one buyer.
RULES = [
    (r'PEO CS&CSS|PEO CSCSS', 'U.S. Army PEO CS&CSS (ACC-APG)',
     'ampersand vs plain spelling, with and without the ACC-APG contracting office'),
    (r'NAVSUP', 'NAVSUP WSS',
     'NAVSUP / NAVSUP WSS / NAVSUP Weapon Systems Support are one contracting body'),
    (r'Air Force Test Center', 'Air Force Test Center',
     'with and without the 412th Test Wing sub-label'),
    (r'Naval Research Laboratory', 'U.S. Naval Research Laboratory / ONR',
     'NRL with and without its ONR parent label'),
    (r'Armament Agency|Armament Inspectorate', 'Polish Armament Agency / Inspectorate',
     'the Armament Agency succeeded the Armament Inspectorate - one state procurement body, '
     'Polish and English naming plus a State Treasury suffix'),
    (r'BAAINBw', 'BAAINBw',
     'BAAINBw, its full German name, and the Bundestag budget-approval milestone for the same '
     'BAAINBw SMT procurement (event family DE-SMT-2024-25)'),
    (r'g[ée]n[ée]rale de l', 'DGA', 'straight vs curly apostrophe in the French name'),
    (r'contractor from PGZ Group', 'Domestic contractor from PGZ Group (undisclosed)',
     'same undisclosed-buyer descriptor with and without "Confidential"; the two rows fall in '
     'different years, so this merge changes no annual figure'),
]


def canon(raw):
    s = raw.strip()
    for pat, name, why in RULES:
        if re.search(pat, s, re.I):
            return name, why
    return s, ''


for x in core:
    x.append(canon(x[3])[0])          # index 24 = canonical buyer

# ---------- classification ------------------------------------------------
DEMAND = re.compile(r'^\s*(RFI|RFQ|RFP|Tender|Solicitation)\s*$', re.I)

print('\nBUYER CANONICALISATION')
groups = collections.defaultdict(set)
for x in core:
    groups[x[24]].add(x[3].strip())
merged = {k: v for k, v in groups.items() if len(v) > 1}
print('  raw buyer values %d  ->  canonical buyers %d   (%d merge groups)'
      % (len({x[3].strip() for x in core}), len(groups), len(merged)))
for k in sorted(merged):
    print('  %s  <- %d raw forms' % (k, len(merged[k])))
    for raw in sorted(merged[k]):
        print('        %s' % raw)
    print('        reason: %s' % canon(sorted(merged[k])[0])[1])

# ---------- annual table --------------------------------------------------
EXPECT = {2020: (14, 13, 2, 2, 2, 0), 2021: (13, 8, 5, 5, 2, 0), 2022: (9, 6, 5, 5, 3, 0),
          2023: (10, 6, 7, 8, 3, 0), 2024: (14, 9, 8, 8, 4, 1), 2025: (16, 5, 11, 10, 6, 3),
          2026: (16, 6, 8, 12, 6, 2)}
print('\nANNUAL TABLE  (recalculated | expected)')
print('  %-9s %-13s %-13s %-13s %-13s %-13s %s'
      % ('Year', 'Events', 'Orders', 'Suppliers', 'Buyers', 'Countries', 'Demand'))
out, diffs = {}, []
for y in YEARS:
    es = [x for x in core if x[1].strip() == str(y)]
    got = (len(es),
           sum(1 for x in es if x[10].strip().lower() == 'yes'),
           len({x[7].strip() for x in es}),
           len({x[24] for x in es}),
           len({x[2].strip() for x in es}),
           sum(1 for x in es if DEMAND.match(x[8])))
    exp = EXPECT[y]
    cells = ' '.join('%3d | %-3d %s' % (g, e, ' ' if g == e else '<') for g, e in zip(got, exp))
    print('  %-9s %s' % ('2026 YTD' if y == 2026 else y, cells))
    if got != exp:
        diffs.append((y, got, exp))
    out[y] = got
print('  MATCH: every cell reproduces the expected working figures' if not diffs
      else '  DIFFERENCES: %s' % diffs)

# ---------- quantitative coverage ----------------------------------------
NONE = re.compile(r'^\s*(not\s+disclos|undisclos|n/?a|none|not\s+public|not\s+specified)', re.I)


# A Quantity value counts only when it describes procurement / product scale.
# "3 shortlisted suppliers" counts bidders in an evaluation, not programme scale.
NOT_SCALE = re.compile(r'\b(supplier|bidder|tenderer|offeror|candidate|shortlist)', re.I)


def has_qty(v):
    v = (v or '').strip()
    return bool(v) and not NONE.match(v) and not NOT_SCALE.search(v)


def has(v):
    v = (v or '').strip()
    return bool(v) and not NONE.match(v)


fam = collections.defaultdict(list)
for x in core:
    key = x[18].strip() or ('%s|%s|%s' % (x[24], x[5].strip(), x[7].strip()))
    fam[key].append(x)
q = {k for k, v in fam.items() if any(has_qty(e[11]) for e in v)}
m = {k for k, v in fam.items() if any(has(e[13]) for e in v)}
print('\nQUANTITATIVE COVERAGE  (grouped on Event Family / Procurement Chain ID)')
cov = [('distinct programmes / procurement requirements', len(fam), 30),
       ('with quantitative scale information', len(q), 11),
       ('with a disclosed monetary value', len(m), 21),
       ('with both quantity and value', len(q & m), 9),
       ('with neither', len(set(fam) - q - m), 7)]
for name, got, want in cov:
    print('  %-46s got %3d  expected %3d   %s' % (name, got, want, 'match' if got == want else 'DIFFERS'))
json.dump({'annual': {str(k): v for k, v in out.items()},
           'coverage': {n: g for n, g, _ in cov}}, open('metrics.json', 'w'), indent=1)
