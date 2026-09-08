# -*- coding: utf-8 -*-
"""Quantitative-coverage counts at the distinct programme / requirement level."""
import json, re, collections

c = json.load(open('clean.json', encoding='utf-8'))
NONE = re.compile(r'^\s*\[?\s*(not\s+(publicly\s+)?disclos|not\s+disclos|undisclos|n/?a|none|no\s+|'
                  r'order-dependent|not\s+applicable|not\s+separately|not\s+specified|not\s+stated|'
                  r'not\s+public)', re.I)


def has(v):
    v = (v or '').strip('[] ').strip()
    if not v or NONE.match(v):
        return False
    return bool(re.search(r'\d', v))


def req(e):
    p = e['programme'].strip('[] ').strip().lower()
    p = re.sub(r'[^0-9a-z ]+', ' ', p)
    p = re.sub(r'\s+', ' ', p).strip()
    if not p or p.startswith('not disclosed') or p.startswith('undisclosed'):
        return (e['buy'], 'unnamed requirement / ' + e['sup'])
    return (e['buy'], p[:60])


g = collections.defaultdict(list)
for e in c:
    g[req(e)].append(e)

q = {k for k, v in g.items() if any(has(e['qty']) for e in v)}
m = {k for k, v in g.items() if any(has(e['value']) for e in v)}
tot = len(g)
print('distinct programmes / procurement requirements : %d' % tot)
print('  quantity publicly disclosed                  : %d' % len(q))
print('  monetary value publicly disclosed            : %d' % len(m))
print('  both quantity AND value                      : %d' % len(q & m))
print('  neither quantity nor value                   : %d' % len(set(g) - q - m))
print('  quantity only                                : %d' % len(q - m))
print('  value only                                   : %d' % len(m - q))
json.dump({'total': tot, 'qty': len(q), 'val': len(m), 'both': len(q & m),
           'neither': len(set(g) - q - m)}, open('coverage.json', 'w'), indent=1)
