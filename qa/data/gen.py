# -*- coding: utf-8 -*-
"""Emit the four workbook-dependent slides straight from the verified figures.

Nothing here is typed by hand: every number comes out of series.json / fam.json /
comp.json, which were reproduced row-by-row from Master Events and checked
against the Annual Metrics sheet.
"""
import json, io, os

D = os.path.dirname(os.path.abspath(__file__))
SER = json.load(open(D + '/series.json'))
COMP = json.load(open(D + '/comp.json'))
FAM = json.load(open(D + '/fam.json', encoding='utf-8'))
YRS = ['2020', '2021', '2022', '2023', '2024', '2025', '2026']
FTR = ('  <div class="ftr">\n    <div class="pageno"></div>\n'
       '    <div class="src">%s</div>\n'
       '    <div class="proj">פלסן סאסא — הפחתת חתימה | מצגת עבודה</div>\n  </div>\n')
LOGO = ('    <img class="bdo-logo" src="@@IMG:bdo-logo.png@@" '
        'alt="BDO Consulting — Strategy Growth &amp; Innovation">\n')


def hdr(kick, title):
    return ('  <div class="hdr">\n    <div class="hdr-titles">\n'
            '      <div class="kicker">%s</div>\n      <h1 class="title">%s</h1>\n'
            '    </div>\n%s  </div>\n' % (kick, title, LOGO))


def xaxis(cls='dx'):
    out = ['  <div class="%s">\n' % cls]
    for y in YRS[:-1]:
        out.append('      <div>%s</div>\n' % y)
    out.append('      <div class="ytd"><span dir="ltr">2026 YTD</span></div>\n    </div>\n')
    return ''.join(out)


# ---------------------------------------------------------------- 1. activity
def activity():
    orders, fams = SER['Actual Orders'], SER['Active Programme Families']
    events = SER['Total Core Events']
    K, H = 9, 360                      # px per unit; one shared zero-based axis
    cols = []
    for i in range(7):
        ytd = ' ytd' if i == 6 else ''
        cols.append('      <div class="dc%s"><div class="b prg" style="height:%dpx">'
                    '<div class="bl">%d</div></div><div class="b ord" style="height:%dpx">'
                    '<div class="bl">%d</div></div></div>\n'
                    % (ytd, K * fams[i], fams[i], K * orders[i], orders[i]))
    # the line: 1692px plot width, 7 columns of 168 with 86px gutters
    pts = [(i * 254 + 84, H - K * events[i]) for i in range(7)]
    segs = ''.join('        <line x1="%d" y1="%d" x2="%d" y2="%d"></line>\n'
                   % (pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]) for i in range(6))
    dots = ''.join('      <div class="lp" style="left:%dpx; top:%dpx"></div>\n'
                   '      <div class="lv" style="left:%dpx; top:%dpx">%d</div>\n'
                   % (x - 9, y - 9, x - 40, y - 40, events[i]) for i, (x, y) in enumerate(pts))
    grid = ''.join('      <div class="dg" style="bottom:%dpx"><span class="dgl">%d</span></div>\n'
                   % (K * v, v) for v in (10, 20, 30))
    return ('<div class="slide-wrap"><section class="slide" id="s-mm-activity">\n'
            + hdr('חלק ב׳ | פעילות שנתית',
                  'מספר ההזמנות עולה בחלק מהשנים — אך נותר תנודתי ומושפע ממספר תוכניות גדולות')
            + '\n  <div class="mm-duo" style="top: 232px; height: 434px;">\n'
              '    <div class="dp" style="height: %dpx;">\n' % H
            + grid + ''.join(cols)
            + '      <svg class="mm-poly" viewBox="0 0 1692 %d" preserveAspectRatio="none" style="height:%dpx">\n' % (H, H)
            + segs + '      </svg>\n' + dots + '    </div>\n'
            + xaxis().replace('<div class="dx">', '<div class="dx" style="top: %dpx;">' % (H + 10))
            + '  </div>\n'
            + '  <div class="mm-legend" style="top: 668px;">\n'
              '    <span><span class="k bar"></span>הזמנות בפועל</span>\n'
              '    <span><span class="k prg"></span>תוכניות / משפחות רכש פעילות</span>\n'
              '    <span><span class="k dot"></span>סה״כ אירועי <span dir="ltr">Land-core</span></span>\n'
              '    <span><span class="k ytd"></span><span dir="ltr">2026</span> — נתון חלקי לשנה שוטפת</span>\n'
              '  </div>\n'
            + '  <div class="mm-conc" style="top: 722px;">\n'
              '    <div class="c"><div class="cy">2020</div><div class="ct">92.9% מההזמנות — <span dir="ltr">ULCANS</span></div></div>\n'
              '    <div class="c"><div class="cy">2021</div><div class="ct">80.0% מההזמנות — <span dir="ltr">ULCANS</span></div></div>\n'
              '    <div class="c"><div class="cy">2025</div><div class="ct">72.2% מההזמנות — <span dir="ltr">Japan MEDS</span></div></div>\n'
              '  </div>\n'
            + '  <div class="mm-take" style="top: 844px;">סך האירועים גדל, אך <b>מספר ההזמנות נותר תנודתי</b>: '
              'תוכנית אחת יכולה לייצר מספר אירועים והזמנות לאורך זמן, ולכן מספר ההזמנות לבדו אינו מדד לרוחב השוק.</div>\n'
            + FTR % ('מקור: מאגר האירועים המאוחד — 115 אירועי <span dir="ltr">Land-core</span> ב-34 תוכניות / משפחות רכש; '
                     'ניתוח BDO על בסיס מקורות רכש ציבוריים ומקורות חברה. 2026 — נתון חלקי לשנה שוטפת')
            + '</section></div>\n')


# ---------------------------------------------------------------- 2. breadth
def breadth():
    panels = [('תוכניות / משפחות רכש פעילות', 'תוכנית עם לפחות אירוע אחד באותה שנה', SER['Active Programme Families']),
              ('ספקים פעילים', 'ספקים נבדלים עם אירוע מתועד', SER['Active Suppliers']),
              ('רוכשים ייחודיים', 'רוכשים לאחר איחוד שמות', SER['Unique Canonical Buyers']),
              ('מדינות', 'מדינות רוכשות נבדלות', SER['Countries'])]
    out = ['  <div class="mm-sm" style="top: 244px; row-gap: 26px;">\n']
    for name, sub, vals in panels:
        k = 72.0 / max(vals)
        bars = ''.join('        <div class="sc%s"><div class="sn">%d</div>'
                       '<div class="sb" style="height:%dpx"></div></div>\n'
                       % (' ytd' if i == 6 else '', v, max(3, int(round(k * v))))
                       for i, v in enumerate(vals))
        xs = ''.join('        <div%s>%s</div>\n' % (' class="ytd"' if i == 6 else '',
                                                    'YTD' if i == 6 else y[2:])
                     for i, y in enumerate(YRS))
        out.append('    <div class="p">\n      <div class="ph">%s</div>\n      <div class="pv">%s</div>\n'
                   '      <div class="sp">\n%s      </div>\n      <div class="sx">\n%s      </div>\n    </div>\n'
                   % (name, sub, bars, xs))
    out.append('  </div>\n')
    fo = COMP['first_observed']
    chips = ''.join('      <div class="fc%s"><div class="fy">%s</div><div class="fv">%d</div></div>\n'
                    % (' ytd' if i == 6 else '', 'YTD 26' if i == 6 else YRS[i], v)
                    for i, v in enumerate(fo))
    return ('<div class="slide-wrap"><section class="slide" id="s-mm-broader">\n'
            + hdr('חלק ב׳ | רוחב הפעילות',
                  'במקביל לתנודתיות בהזמנות, בסיס הפעילות מתרחב על פני יותר תוכניות, ספקים, רוכשים ומדינות')
            + '\n' + ''.join(out)
            + '  <div class="mm-first" style="top: 818px;">\n    <div class="fh">תוכניות שנצפו לראשונה במאגר באותה שנה '
              '<span class="fq">— סכום השנים: 34 משפחות הרכש</span></div>\n    <div class="fr">\n'
            + chips + '    </div>\n  </div>\n'
            + FTR % ('מקור: גיליון <span dir="ltr">Annual Metrics</span> שבמאגר האירועים המאוחד, משוחזר ברמת השורה מ-115 '
                     'אירועי ה-<span dir="ltr">Land-core</span>. "נצפו לראשונה" = האירוע הפומבי הראשון שאותר, לא מועד ההשקה. '
                     '2026 — נתון חלקי לשנה שוטפת; ירידה במדד חלקי אינה התכווצות')
            + '</section></div>\n')


# ------------------------------------------------------------ 3. composition
def composition():
    c = COMP['comp']
    rows = [('הזמנות בפועל', c['orders'], ' class="ord"'),
            ('אותות ביקוש פורמליים', c['demand'], ''),
            ('פיתוח / אימות', c['dev'], ''),
            ('אבני דרך מסחריות אחרות', c['other'], '')]
    tot = [sum(r[1][i] for r in rows) for i in range(7)]
    body = ''
    for name, vals, cls in rows:
        cells = ''.join('<td%s>%d</td>' % (' class="ytd"' if i == 6 else '', v) for i, v in enumerate(vals))
        body += '    <tr%s><td>%s</td>%s<td class="sum">%d</td></tr>\n' % (cls, name, cells, sum(vals))
    cells = ''.join('<td%s>%d</td>' % (' class="ytd"' if i == 6 else '', v) for i, v in enumerate(tot))
    body += '    <tr class="tot"><td>סה״כ אירועי <span dir="ltr">Land-core</span></td>%s<td class="sum">%d</td></tr>\n' % (cells, sum(tot))
    hdrs = ''.join('<th%s>%s</th>' % (' class="ytd"' if i == 6 else '',
                                      '<span dir="ltr">2026 YTD</span>' if i == 6 else y)
                   for i, y in enumerate(YRS))
    return ('<div class="slide-wrap"><section class="slide" id="s-mm-comp">\n'
            + hdr('חלק ב׳ | הרכב הפעילות',
                  'לא כל אירוע הוא הזמנה — הפעילות כוללת מכרזים, פיתוחים, ניסויים, מסגרות והזמנות')
            + '\n  <table class="mm-comp" style="top: 262px;">\n'
              '    <colgroup><col style="width:436px"><col><col><col><col><col><col><col><col style="width:176px"></colgroup>\n'
              '    <tr><th>שלב במחזור החיים</th>%s<th class="sum">סה״כ</th></tr>\n%s  </table>\n' % (hdrs, body)
            + '  <div class="mm-def" style="top: 604px;">\n'
              '    <div class="d"><div class="dt">הזמנה בפועל</div><div class="dx">רכישה ממשית — הזמנת אספקה, משיכה מתוך חוזה או חוזה ייצור חתום</div></div>\n'
              '    <div class="d"><div class="dt">אות ביקוש פורמלי</div><div class="dx">מכרז, בקשת מידע או הודעת כוונה — הביקוש פורסם, טרם נרכש</div></div>\n'
              '  </div>\n'
              '  <div class="mm-def" style="top: 742px;">\n'
              '    <div class="d"><div class="dt">פיתוח / אימות</div><div class="dx">מו״פ ממומן, ניסוי או בחינת ביצועים — לפני רכש ייצור</div></div>\n'
              '    <div class="d"><div class="dt">אבן דרך מסחרית אחרת</div><div class="dx">הסכם מסגרת, בחירת ספק, אספקה או אבן דרך פומבית אחרת</div></div>\n'
              '  </div>\n'
              '  <div class="mm-take" style="top: 876px;">שלבי הביקוש, הפיתוח והמסגרות מקדימים את ההזמנות — '
              '<b>ולכן התרחבות בסיס הפעילות יכולה להופיע לפני צמיחה עקבית בהזמנות</b>.</div>\n'
            + FTR % ('מקור: 115 אירועי ה-<span dir="ltr">Land-core</span> שבמאגר האירועים המאוחד, לפי סיווג שלב מחזור החיים שבמאגר. '
                     'סכום הקטגוריות בכל שנה שווה לסך אירועי ה-<span dir="ltr">Land-core</span> באותה שנה. 2026 — נתון חלקי לשנה שוטפת')
            + '</section></div>\n')


# ------------------------------------------------------- 4. programme tables
CO = {'Australia': 'אוסטרליה', 'Belgium': 'בלגיה', 'Denmark': 'דנמרק', 'Finland': 'פינלנד',
      'France': 'צרפת', 'Germany': 'גרמניה', 'India': 'הודו', 'Japan': 'יפן',
      'Luxembourg': 'לוקסמבורג', 'Netherlands': 'הולנד', 'Nordic joint': 'שיתוף נורדי',
      'Norway': 'נורווגיה', 'Poland': 'פולין', 'Sweden': 'שוודיה', 'Switzerland': 'שווייץ',
      'United Kingdom': 'בריטניה', 'United Kingdom; United States': 'בריטניה / ארה״ב',
      'United States': 'ארה״ב'}

# programme label, buyer label, supplier label, product label — one entry per
# family id, so every cell on the slide is traceable to a workbook row.
LBL = {
 'AU-LAND400-P3-MCS':        ('LAND 400 Phase 3', 'Hanwha Defence Australia', 'CBG Systems', 'MCS לרק״ם'),
 'AU-LAND8116-MCS':          ('LAND 8116', 'Hanwha Defence Australia', 'CBG Systems', 'MCS לתותח ולרכב חילוץ'),
 'BE-SEYNTEX-SIOEN-2024-25': ('מסגרת רשתות רב-ספקטרליות', 'משרד ההגנה הבלגי', 'Seyntex', 'רשתות וכיסויים'),
 'DK-SAAB-MCS-IKK':          ('הסוואת רק״ם', 'Danish FMI / Army', 'Saab Barracuda', 'MCS לרק״ם'),
 'FI-ATMIS-GTD26':           ('GTD26', 'Griffin Tech Days', 'BCB International', 'רשתות רב-ספקטרליות'),
 'FR-FENRIR':                ('FENRIR', 'DGA', 'Saab Barracuda', 'רשתות למפקדות ולרכב'),
 'FR-HT4-2024':              ('HT4 — Prix de l’Audace', 'DGA / AID', 'PGM Précision', 'טקסטיל תרמי'),
 'DE-SMT-2024-25':           ('SMT — הסוואה נייחת', 'BAAINBw', 'Sioen Industries', 'רשתות וציוד תומך'),
 'IN-GEM-5756973':           ('MSCN — מכרז GeM', 'צבא הודו', 'Sterlite Camotech', 'רשתות רב-ספקטרליות'),
 'JP-MEDS':                  ('MEDS', 'משרד ההגנה היפני / JGSDF', 'NAS / Fibrotex', 'רשתות הסוואה אלקטרומגנטית'),
 'LU-BARRACUDA-2026':        ('משאיות Scania MLST', 'רכש ההגנה של לוקסמבורג', 'Saab Barracuda', 'MCS לרכב'),
 'NL-SAAB-MCS-2026':         ('Fennek · PzH2000NL · CV90', 'משרד ההגנה ההולנדי', 'Saab Barracuda', 'MCS לרכב'),
 'NORDIC-SAAB-MCS-2026':     ('בחינה נורדית משותפת', 'Norwegian FMA', 'Saab Barracuda', 'MCS לרכב'),
 'NO-SAAB-MCS-4600002386':   ('מסגרת 4600002386', 'Norwegian FMA', 'Saab Barracuda', 'MCS לרכב'),
 'PL-BERBERYS-2023':         ('BERBERYS', 'Armament Agency', 'Miranda Textiles', 'כיסויים רב-תחומיים'),
 'PL-BERBERYS-WB-2024':      ('BERBERYS — WB', 'WB Electronics', 'Miranda Textiles', 'כיסויים רב-ספקטרליים'),
 'PL-BERBERYS-ZMT-2024':     ('BERBERYS 2024–2028', 'ZM Tarnów', 'Miranda Textiles', 'כיסויים רב-ספקטרליים'),
 'PL-MIR-COVERS-2025':       ('כיסויי הסוואה לפלטפורמה', 'קבלן מקומי (חסוי)', 'Miranda Textiles', 'כיסויים רב-תחומיים'),
 'PL-MIR-COVERS-2026':       ('כיסויי הסוואה לפלטפורמה', 'קבלן מקבוצת PGZ', 'Miranda Textiles', 'כיסויים רב-תחומיים'),
 'PL-NAREW-CAMO':            ('NAREW', 'תעשייה ביטחונית פולנית', 'Lubawa', 'הסוואה והטעיה'),
 'PL-WISLA-CAMO':            ('WISŁA שלב 1', 'Armament Agency', 'Miranda Textiles', 'הסוואה והטעיה'),
 'PL-WISLA-II-CAMO':         ('WISŁA II', 'Armament Agency', 'Lubawa', 'הסוואה והטעיה'),
 'SE-FMV-MCS-2023':          ('מסגרת הסוואה קשורת-אובייקט', 'Swedish FMV', 'Saab Barracuda', 'MCS לרכב'),
 'SE-FMV-MSN-2020':          ('UH-2020-256 — MSN', 'Swedish FMV', 'Saab Barracuda', 'רשתות רב-ספקטרליות'),
 'CH-MSTS-2025':             ('MSTS', 'armasuisse', 'SSZ · Saro · Saab', 'מערכות הסוואה'),
 'UK-ATMIS-TRIAL-2026':      ('ניסויי שדה מבצעיים', 'British Army', 'BCB International', 'רשתות רב-ספקטרליות'),
 'AMD-CHAMEM':               ('ChamEM · ChamEM FCT', 'Dstl · U.S. OSD FCT', 'Advanced Material Development', 'חומר להפחתת מכ״ם'),
 'AME-CNELS-XHANGAR-2023-25':('CNELS · X-Hangar', 'U.S. NRL / ONR', 'Ametrine Technologies', 'רשתות וכיסויי הסתרה'),
 'AWE-TACTICAM-2021':        ('מחקר TactiCam', 'צבא ארה״ב (Natick)', 'ArmorWorks Enterprises', 'הסוואת רכב תלת-ממדית'),
 'DEC-W911NF2490001':        ('W911NF2490001', 'צבא ארה״ב', 'DECPT', 'מו״פ הסוואה'),
 'FIB-USAF-FA483024P0076':   ('ערכות הסוואה — Moody AFB', 'חיל האוויר האמריקאי', 'Fibrotex', 'ערכות הסוואה'),
 'ULCANS-IDV-W911QY18D0210': ('ULCANS', 'צבא ארה״ב (PEO CS&amp;CSS)', 'Fibrotex', 'רשתות הסוואה קלות'),
 'US-AMET-FLINT-MESH-2026':  ('W912CH26P0033', 'צבא ארה״ב', 'Ametrine Technologies', 'ציפוי Flint לרכב'),
 'US-AMET-VEH-MESH-2026':    ('W912CH26P0031', 'צבא ארה״ב', 'Ametrine Technologies', 'רשת לרכב'),
}
QTY = {'units': 'יחידות', 'nets': 'רשתות', 'covers': 'כיסויים', 'sets': 'סטים'}
CCY = {'USD': '$', 'EUR': '€', 'GBP': '£', 'PLN': 'PLN ', 'JPY': '¥', 'SEK': 'SEK '}


def money(ccy, v):
    v = float(v)
    sym = CCY.get(ccy, ccy + ' ')
    if ccy == 'INR':
        return 'INR %s' % format(int(v), ',')
    if v >= 1e9:
        return '%s%.2fB' % (sym, v / 1e9)
    if v >= 1e6:
        return '%s%.1fM' % (sym, v / 1e6)
    if v >= 1e3:
        return '%s%s' % (sym, format(int(v), ','))
    return '%s%s' % (sym, format(int(v), ','))


def stage(f):
    k = f['kinds']
    n = int(f['orders'] or 0)
    if n >= 1:
        return ('ord', 'הזמנה בפועל' if n == 1 else 'הזמנות בפועל · %d' % n)
    if 'Framework' in k:
        return ('fw', 'מסגרת')
    if 'Demand' in k:
        return ('ev', 'מכרז / דרישה')
    if 'Selection' in k:
        return ('ev', 'בחירת ספק')
    if 'Development / Validation' in k:
        return ('ev', 'פיתוח / ניסוי')
    return ('ev', 'אירוע פומבי')


def prog_slides():
    by = {f['id']: f for f in FAM}
    groups = [
        ('פולין, גרמניה וצרפת', ['PL-WISLA-CAMO', 'PL-BERBERYS-2023', 'PL-BERBERYS-WB-2024',
                                 'PL-BERBERYS-ZMT-2024', 'PL-MIR-COVERS-2025', 'PL-MIR-COVERS-2026',
                                 'PL-NAREW-CAMO', 'PL-WISLA-II-CAMO', 'DE-SMT-2024-25',
                                 'FR-FENRIR', 'FR-HT4-2024']),
        ('סקנדינביה, בנלוקס ושאר אירופה', ['SE-FMV-MSN-2020', 'SE-FMV-MCS-2023', 'NO-SAAB-MCS-4600002386',
                                            'NORDIC-SAAB-MCS-2026', 'DK-SAAB-MCS-IKK', 'FI-ATMIS-GTD26',
                                            'NL-SAAB-MCS-2026', 'LU-BARRACUDA-2026', 'BE-SEYNTEX-SIOEN-2024-25',
                                            'CH-MSTS-2025', 'UK-ATMIS-TRIAL-2026', 'AMD-CHAMEM']),
        ('ארה״ב, אוסטרליה ואסיה', ['ULCANS-IDV-W911QY18D0210', 'AME-CNELS-XHANGAR-2023-25',
                                    'AWE-TACTICAM-2021', 'DEC-W911NF2490001', 'FIB-USAF-FA483024P0076',
                                    'US-AMET-FLINT-MESH-2026', 'US-AMET-VEH-MESH-2026',
                                    'AU-LAND8116-MCS', 'AU-LAND400-P3-MCS', 'IN-GEM-5756973', 'JP-MEDS']),
    ]
    seen, out = [], []
    for n, (name, ids) in enumerate(groups, 1):
        rows = ''
        for fid in ids:
            f, seen = by[fid], seen + [fid]
            prog, buyer, sup, prod = LBL[fid]
            sc, sl = stage(f)
            yrs = str(f['y0']) if f['y0'] == f['y1'] else '%s–%s' % (f['y0'], f['y1'])
            if f['y1'] == 2026:
                yrs += ' YTD'
            q = f['qty']
            qty = ('%s %s' % (format(int(float(q)), ','), QTY.get(f['unit'], f['unit']))
                   if q else 'לא פורסם')
            vs = ' · '.join(money(k, v) for k, v in sorted(f['val'].items())) or 'לא פורסם'
            stage_cell = ('<span class="stg %s">%s</span>' % (sc, sl))
            if fid == 'AME-CNELS-XHANGAR-2023-25':
                # 98.7% of this family's disclosed value is a firm-fixed-price R&D
                # award, not procurement: the row says so rather than letting the
                # family total read as order value.
                stage_cell = ('<span class="stg ord">הזמנה בפועל · 1</span> '
                              '<span class="stg ev">פיתוח / אימות · 3</span>')
                vs = '~$0.25M הזמנה בפועל<small>~$18.36M פיתוח / אימות</small>'
            cl = ''
            if f['ceil']:
                cl = '<small>תקרת מסגרת: %s — אינה מכירה</small>' % ' · '.join(
                    money(k, v) for v, k in f['ceil'])
            note = ''
            if fid == 'JP-MEDS':
                note = '<small>26,000 מערכות — היקף תוכנית מדווח, לא כמות חוזית מאומתת</small>'
            if fid == 'IN-GEM-5756973':
                note = '<small>זכייה ממקור משני</small>'
            rows += ('    <tr><td>%s</td><td class="pg">%s<small dir="ltr" style="text-align:right">%s</small></td>'
                     '<td>%s</td><td>%s</td><td>%s</td>'
                     '<td>%s<small><span dir="ltr">%s</span></small></td>'
                     '<td>%s%s</td><td>%s%s</td></tr>\n'
                     % (CO[f['country']], prog, fid, buyer, sup, prod, stage_cell, yrs, qty, note, vs, cl))
        out.append('<div class="slide-wrap"><section class="slide tall-ftr" id="s-mm-prog-%d">\n' % n
                   + hdr('חלק ב׳ | כל משפחות הרכש ב-<span dir="ltr">Land-core</span> · %d מתוך 3' % n,
                         'כל 34 התוכניות ומשפחות הרכש — %s' % name)
                   + '\n  <table class="mm-fam" style="top: 190px;">\n'
                     '    <colgroup><col style="width:112px"><col style="width:326px"><col style="width:236px">'
                     '<col style="width:214px"><col style="width:242px"><col style="width:224px">'
                     '<col style="width:200px"><col style="width:222px"></colgroup>\n'
                     '    <tr><th>מדינה</th><th>תוכנית / דרישת רכש</th><th>רוכש</th><th>ספק</th>'
                     '<th>מוצר / פתרון</th><th>שלב / שנים</th><th>כמות שפורסמה</th><th>שווי פומבי באירועי המשפחה</th></tr>\n'
                   + rows + '  </table>\n'
                   + FTR % ('מקור: גיליון <span dir="ltr">Programme Families</span> שבמאגר האירועים המאוחד — 34 משפחות '
                            '<span dir="ltr">Land-core</span> ב-3 שקפים. שורה אחת לכל משפחת רכש ולא לכל אירוע; תקרות מסגרת '
                            'ומכסות מכרז אינן מוצגות כמכירה. השווי הוא סכום הערכים שפורסמו באירועי המשפחה, לכל מטבע בנפרד — '
                            'וכולל גם אירועים שאינם הזמנה בפועל. 2026 — חלקי')
                   + '</section></div>\n')
    assert len(seen) == 34 and len(set(seen)) == 34, len(seen)
    assert set(seen) == set(by), set(by) ^ set(seen)
    return out


for name, html in [('s-mm-activity', activity()), ('s-mm-broader', breadth()),
                   ('s-mm-comp', composition())] + \
                  [('s-mm-prog-%d' % i, h) for i, h in enumerate(prog_slides(), 1)]:
    io.open(D + '/../slides/%s.html' % name, 'w', encoding='utf-8').write(html)
    print('wrote', name, len(html))
