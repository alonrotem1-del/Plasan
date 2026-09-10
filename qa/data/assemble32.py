# -*- coding: utf-8 -*-
"""Management-feedback pass on the committed 31-slide deck -> 32 slides. Re-runnable from HEAD."""
import io, re, subprocess

D = '/tmp/claude-0/-home-user-Plasan/b6c0c05d-03a1-5e28-bd0d-3100eccdcc98/scratchpad/slides/'
T = '/home/user/Plasan/deck_template.html'
src = subprocess.run(['git', '-C', '/home/user/Plasan', 'show', 'HEAD:deck_template.html'],
                     capture_output=True, text=True, check=True).stdout
i = src.index('<!-- ====== 01 ')
head, body = src[:i], src[i:]
a = body.index('<script>'); b = body.index('</script>') + len('</script>')
script = body[a:b]; body = body[:a] + body[b:]
cur = {}
for p in re.split(r'(?=<div class="slide-wrap">)', re.sub(r'<!-- ====== \d\d · s-[a-z0-9-]+ ====== -->\n', '', body))[1:]:
    cur[re.search(r'id="(s-[a-z0-9-]+)"', p).group(1)] = p.strip() + '\n'
assert len(cur) == 31, len(cur)
cur['s-vectors'] = io.open(D + 's-vectors.html', encoding='utf-8').read()


def rep(k, a, b, n=1):
    assert cur[k].count(a) == n, (k, a[:70], cur[k].count(a))
    cur[k] = cur[k].replace(a, b)


def row(k, company):
    """The <tr> of one company in the overview table."""
    m = re.search(r'<tr(?: class="out")?>\s*<td><div class="co">%s(?:<small>[^<]*</small>)?</div></td>.*?</tr>' % re.escape(company), cur[k], re.S)
    assert m, company
    return m.group(0)


# ---- 4. funnel: the revised five ----
rep('s-scope', '<div class="fd"><span dir="ltr">CBG Systems · Sterlite Camotech · Ravelin Defense · Spectralx · Ametrine Technologies</span></div>',
    '<div class="fd"><span dir="ltr">CBG Systems · Ravelin Defense · Spectralx · Permali · Ametrine Technologies</span><br><span class="fdq">Ametrine - לדיון</span></div>')

rep('s-scope', '<div class="fun-strip" style="top: 702px;">', '<div class="fun-strip" style="top: 694px;">')
# ---- 5. ten-company overview ----
rep('s-table', 'וחמש שנבחרו להמשך בחינת M&amp;A</h1>', 'וחמש שנבחרו להמשך בחינה</h1>')
r = row('s-table', 'Sterlite Camotech')
r2 = r.replace('<tr>', '<tr class="out">', 1).replace('<td class="stt"><span class="go">להמשך בחינת M&amp;A</span></td>',
      '<td class="stt"><span class="no">לא להמשך</span><span class="rsn">נגישות / הודו ובידול מוגבל</span></td>')
assert r2 != r; cur['s-table'] = cur['s-table'].replace(r, r2)
r = row('s-table', 'Ametrine Technologies')
r2 = r.replace('<td class="stt"><span class="go">להמשך בחינת M&amp;A</span></td>',
      '<td class="stt"><span class="dq">לדיון</span><span class="rsn dq">ניסיון קודם חלש</span></td>')
assert r2 != r; cur['s-table'] = cur['s-table'].replace(r, r2)
r = row('s-table', 'Permali')
r2 = r.replace('<tr class="out">', '<tr>', 1).replace('<td class="stt"><span class="no">לא להמשך</span><span class="rsn">תחום צר בעסק</span></td>',
      '<td class="stt"><span class="go">להמשך בחינת M&amp;A</span></td>')
assert r2 != r; cur['s-table'] = cur['s-table'].replace(r, r2)
rep('s-table', 'הסטטוס הוא החלטת סינון להמשך בחינת M&amp;A, לא שלילת יכולת ולא המלצת רכישה.',
    'הסטטוס הוא החלטת סינון להמשך בחינה, לא שלילת יכולת ולא המלצת רכישה; סטטוס Sterlite ו-Ametrine משקף שיקול הנהלה, לא עובדה אנליטית.')

# ---- 6. Sterlite -> appendix, framed as reviewed and not continued ----
rep('s-sterlite', '<div class="kicker">חלק 1 | פרופיל חברה · משפחה 1: מערכות ברמת הפלטפורמה · ליבת העסק</div>',
    '<div class="kicker">נספח | פרופיל חברה - נבדקה; לא להמשך לאחר סינון ההנהלה · משפחה 1: מערכות ברמת הפלטפורמה · ליבת העסק</div>')
rep('s-sterlite', '<div class="ri" style="font-size:21px; line-height:1.34;"><b>רלוונטיות לפלסן:</b> התאמה לרכב <span class="dim">(MCS לרכב נע)</span> · רוחב פורטפוליו · אחיזה מסחרית <span class="dim">(MSCN 2026)</span> · גודל / נגישות - קטנה ובהובלת המייסד, קרובה יותר לטווח היעד מ-Ravelin · <b>ההוכחה חזקה ל-MSCN יותר מל-MCS</b> · לא המלצה</div>',
    '<div class="ri" style="font-size:21px; line-height:1.34;"><b>סטטוס לאחר סינון ההנהלה: לא להמשך</b> - נגישות / עבודה מול הודו ובידול מוצר מוגבל <span class="dim">(שיקול סינון של ההנהלה, לא עובדת שוק)</span> · הניתוח והמקורות בשקף נשמרים כפי שהם · <b>ההוכחה חזקה ל-MSCN יותר מל-MCS</b></div>')

# ---- 6. Permali -> main, reframed around the broader package ----
rep('s-permali', '<div class="kicker">נספח | פרופיל חברה - לא נבחרה להמשך בחינה · משפחה 3: טקסטיל פונקציונלי וכיסויים · הצעה משיקה</div>',
    '<div class="kicker">חלק 1 | פרופיל חברה · משפחה 3: טקסטיל פונקציונלי וכיסויים · הצעה משיקה - להמשך בחינת M&amp;A בזכות הסל הרחב</div>')
rep('s-permali', '<h1 class="title">Permali - חברת קומפוזיטים ומיגון מתקדמים החופפת לעולמות הליבה של פלסן; הפחתת החתימה - יישום משיק נישתי ומבוסס</h1>',
    '<h1 class="title">Permali - מעניינת לבחינה בזכות סל רחב של מיגון, שרידות וקומפוזיטים, מעבר להפחתת החתימה</h1>')
rep('s-permali', 'מעניינת לא רק כשחקנית נישה בהפחתת חתימה, אלא כחברת קומפוזיטים ומיגון החופפת ישירות לעולמות הליבה של פלסן <span class="dim">(תצפית אנליטית - לא המלצת רכישה)</span></li>',
    '<b>העניין האסטרטגי הוא הסל הרחב</b> - מיגון בליסטי, שרידות וקומפוזיטים, כולל מיגון אווירי / מוטס, החופף לעסקי המיגון של פלסן; הפחתת החתימה נותרת חלק צר / משיק <span class="dim">(תצפית - לא המלצת רכישה)</span></li>')
rep('s-permali', '<div class="pf-evidence" style="top: 826px; ">', '<div class="pf-evidence" style="top: 842px; ">')
rep('s-permali', '<div class="ev-item"><b>ההבחנה:</b> Permali כחברה - מסחרית ומבוססת, עם פעילות ביטחונית רחבה ומתמשכת; העדות הפומבית הספציפית לניהול חתימה - מוגבלת</div>',
    '<div class="ev-item"><b>ההבחנה:</b> Permali כחברה - מסחרית ומבוססת, עם פעילות ביטחונית רחבה ומתמשכת במיגון יבשתי, אווירי וימי; העדות הפומבית הספציפית לניהול חתימה - מוגבלת, ו-Dust Skirts הם יישום נישתי</div>')

# ---- 6. Ametrine: management caveat, status "for discussion" ----
rep('s-ametrine', '<div class="kicker">חלק 1 | פרופיל חברה · משפחה 2: טכנולוגיות פלטפורמה מתקדמות / אקטיביות · ליבת העסק</div>',
    '<div class="kicker">חלק 1 | פרופיל חברה · משפחה 2: טכנולוגיות פלטפורמה מתקדמות / אקטיביות · ליבת העסק - סטטוס: לדיון</div>')
a_ = cur['s-ametrine'].index('<div class="icap2"><b>כיסוי / מחבוא: Vehicle Hide.</b>')
b_ = cur['s-ametrine'].index('</div>\n      </div>\n    </div>\n  </div>', a_) + len('</div>\n      </div>')
cur['s-ametrine'] = (cur['s-ametrine'][:b_] + '\n      <div class="pf-note dq" style="margin-top:8px; padding:8px 18px 9px;"><div class="nlbl">סטטוס: לדיון</div>'
                     'התאמה גבוהה, אך ניסיון קודם של פלסן עם החברה היה חלש <span class="dim">(מידע מההנהלה - לא עדות פומבית)</span></div>'
                     + cur['s-ametrine'][b_:])

# ---- 7. methodology: what the database holds ----
rep('s-mm-method', '<div class="dbh">מאגר האירועים המאוחד - המקור היחיד לכל הנתונים הכמותיים בפרק זה</div>',
    '<div class="dbh">מאגר מאוחד - הפחתת חתימה</div>')
rep('s-mm-method', 'הסכם מסגרת או הזמנה בפועל.</div>', 'הסכם מסגרת או הזמנה בפועל בנושא הפחתת חתימה.</div>')

# ---- 8. final summary: the revised five ----
a_ = cur['s-mm-conclusion'].index('    <div class="r"><div class="n">CBG Systems')
b_ = cur['s-mm-conclusion'].index('  </div>\n\n  <div class="ftr">')
cur['s-mm-conclusion'] = cur['s-mm-conclusion'][:a_] + '''    <div class="r"><div class="n">CBG Systems<small>אוסטרליה</small></div><div class="p">MCS לרכב עם חוזים על <span dir="ltr">LAND 8116</span> ו-<span dir="ltr">LAND 400</span></div><div class="m">זכויות IP / רישוי דורשות בירור</div></div>
    <div class="r"><div class="n">Ravelin Defense<small>ארה״ב</small></div><div class="p">התאמה אסטרטגית גבוהה לפלסן ו-TactiCam לרכב</div><div class="m">גדולה, בבעלות PE ופחות נגישה לעסקה</div></div>
    <div class="r"><div class="n">Spectralx<small>ישראל</small></div><div class="p">ניהול חתימה בליבת העסק ו-Armadillo עם רכש מדווח</div><div class="m">פערים מסחריים וטכנולוגיים עדיין דורשים אימות</div></div>
    <div class="r"><div class="n">Permali<small>בריטניה</small></div><div class="p">סל רחב של מיגון, שרידות וקומפוזיטים עם חפיפה לעולמות פלסן</div><div class="m">הפחתת חתימה היא תחום צר / משיק יחסית בעסק</div></div>
    <div class="r"><div class="n">Ametrine Technologies <span class="tag">לדיון</span><small>ישראל / ארה״ב</small></div><div class="p">התאמה גבוהה ו-Flint כפתרון לפלטפורמה</div><div class="m">לדיון: ניסיון קודם של פלסן עם החברה היה חלש</div></div>
''' + cur['s-mm-conclusion'][b_:]
rep('s-mm-conclusion', '<div class="sum-cos" style="top: 486px;">', '<div class="sum-cos" style="top: 478px;">')
rep('s-mm-conclusion', 'חמש החברות מוצגות להמשך בחינה - לא כהמלצת רכישה.',
    'חמש החברות מוצגות להמשך בחינה - לא כהמלצת רכישה; סטטוס "לדיון" וניסיון העבר - מידע מההנהלה, לא עדות פומבית.')

ORDER = ['s-cover', 's-vectors', 's-div-sm', 's-evolution', 's-scope', 's-table',
         's-cbg', 's-ravelin-a', 's-ravelin-b', 's-spectralx', 's-permali', 's-ametrine',
         's-div-mm', 's-mm-method', 's-mm-glance', 's-mm-activity', 's-mm-broader', 's-mm-comp',
         's-mm-prog-1', 's-mm-prog-2', 's-mm-prog-3', 's-div-sum', 's-mm-conclusion',
         's-div-apx', 's-plasan-fit', 's-spectrum', 's-landscape',
         's-sterlite', 's-amd', 's-eltics', 's-stg', 's-shieldex']
assert set(ORDER) == set(cur), set(ORDER) ^ set(cur)
out = ''.join('\n<!-- ====== %02d · %s ====== -->\n' % (n, k) + cur[k] for n, k in enumerate(ORDER, 1))
parts = re.split(r'(<[^>]+>)', out)
out = ''.join(p if p.startswith('<') else p.replace('—', '-').replace('–', '-') for p in parts)

css = '''
/* ---------- opening slide: the two work vectors ---------- */
.vec { position: absolute; right: var(--m-side); left: var(--m-side); top: 296px;
  display: grid; grid-template-columns: 1fr 1fr; column-gap: 48px; }
.vec .p { background: var(--c-fill); border-top: 6px solid var(--c-primary); padding: 42px 48px 48px; min-height: 380px; }
.vec .p.alt { border-top-color: var(--c-slate-mid); }
.vec .lbl { font-size: 24px; font-weight: 700; color: var(--c-slate-mid); }
.vec .hd { font-size: 40px; font-weight: 800; color: var(--c-primary); line-height: 1.3; margin-top: 6px; }
.vec .p.alt .hd { color: var(--c-slate); }
.vec .tx { font-size: 30px; line-height: 1.48; color: var(--c-text); margin-top: 26px;
  padding-top: 24px; border-top: 1px solid var(--c-border); }
.vec-line { position: absolute; right: var(--m-side); left: var(--m-side); top: 778px;
  text-align: center; font-size: 28px; color: var(--c-text-muted); }

/* ---------- "for discussion" status (amber), alongside go / no-go ---------- */
.ovw-table .dq { display: inline-block; font-weight: 700; color: #8F6200;
  background: #FBEFD2; padding: 1px 9px; border-radius: 3px; }
.ovw-table .rsn.dq { color: #8F6200; }
.fun-box.final .fdq { font-size: 24px; font-weight: 700; color: #F5D98A; }
#s-scope .fun-box .fn { line-height: 1.24; }
.pf-note.dq { border-right: 6px solid var(--c-amber); background: #FBF6E8; }
.pf-note.dq .nlbl { color: #8F6200; }
#s-mm-conclusion .sum-cos .r { padding: 8px 0; }
.sum-cos .tag { display: inline-block; font-size: 24px; font-weight: 700; color: #8F6200;
  background: #FBEFD2; padding: 0 10px; border-radius: 3px; margin-right: 8px; vertical-align: 2px; }
'''
head = head.replace('</style>', css + '</style>')
io.open(T, 'w', encoding='utf-8').write(head + out + '\n' + script + '\n')
print('assembled', len(ORDER), 'slides from HEAD')
