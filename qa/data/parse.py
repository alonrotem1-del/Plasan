# -*- coding: utf-8 -*-
"""Parse the company-based event narrative into structured events.

Each event is 13 pipe-separated fields; the source field of one event is glued
to the date of the next, so the YEAR field is used as the anchor.
"""
import csv, io, json, re, sys, collections

CSV = '/root/.claude/uploads/b6c0c05d-03a1-5e28-bd0d-3100eccdcc98/390ef3cf-new_company_listNEW.csv'
FIELDS = ['date','year','etype','buyer','programme','product','spectrum','qty','value','option','status','note','source']

def parse_cell(company, cell):
    toks = [t.strip() for t in cell.split('|')]
    anchors = [i for i, t in enumerate(toks)
               if re.fullmatch(r'\[?\s*(20\d\d)(\s*[-–/to]+\s*20\d\d)?\s*\]?', t)]
    evs = []
    for a in anchors:
        if a - 1 < 0 or a + 11 >= len(toks):
            continue
        e = dict(zip(FIELDS, toks[a-1:a+12]))
        e['company'] = company
        evs.append(e)
    return evs, anchors, len(toks)

def main():
    r = list(csv.reader(io.open(CSV, encoding='utf-8-sig', errors='replace')))
    rows = r[2:]
    out, stats = [], []
    for row in rows:
        co, cell = row[0].strip(), row[2]
        if not cell.strip() or cell.strip().lower().startswith('no qualifying'):
            continue
        evs, anchors, n = parse_cell(co, cell)
        gaps = [anchors[i+1]-anchors[i] for i in range(len(anchors)-1)]
        stats.append((co, len(evs), n, collections.Counter(gaps)))
        out.extend(evs)
    json.dump(out, open(sys.argv[1], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('companies with events:', len(stats), ' events parsed:', len(out))
    odd = [(c, e, n, dict(g)) for c, e, n, g in stats if any(k != 13 for k in g)]
    print('companies whose anchor gaps are not all 13:', len(odd))
    for c, e, n, g in odd[:20]:
        print('  ', c, 'events', e, 'tokens', n, 'gaps', g)

main()
