# -*- coding: utf-8 -*-
"""Build the 31-slide deck from the committed base (HEAD) so the pass is re-runnable.

Order of operations matters: structural swaps first, then the targeted wording
edits, then the three global cleanups (Land-core, footer mark, dashes) which
touch text nodes only - never tags, attributes or the stylesheet.
"""
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
for p in re.split(r'(?=<div class="slide-wrap">)', body)[1:]:
    cur[re.search(r'id="(s-[a-z0-9-]+)"', p).group(1)] = p.rstrip() + '\n'
assert len(cur) == 29, len(cur)
for k in ('s-ravelin-a', 's-ravelin-b', 's-div-sum', 's-mm-conclusion',
          's-mm-activity', 's-mm-broader', 's-mm-comp', 's-mm-prog-1', 's-mm-prog-2', 's-mm-prog-3'):
    cur[k] = io.open(D + k + '.html', encoding='utf-8').read()
    assert 'מצגת עבודה' not in cur[k], k


def rep(k, a, b, n=1):
    assert cur[k].count(a) == n, (k, a[:70], cur[k].count(a))
    cur[k] = cur[k].replace(a, b)


# 1. slide 5: the five shortlisted companies
rep('s-table', '<span class="go">להעמקה</span>', '<span class="go">להמשך בחינת M&amp;A</span>', 5)
rep('s-table', 'הסטטוס הוא החלטת סינון להמשך העבודה, לא שלילת יכולת',
    'הסטטוס הוא החלטת סינון להמשך בחינת M&amp;A, לא שלילת יכולת ולא המלצת רכישה')
rep('s-table', 'וחמש שנבחרו להמשך בחינה</h1>', 'וחמש שנבחרו להמשך בחינת M&amp;A</h1>')
# 4. slide 12: plain-language metrics + the event definition; nothing about the 28
rep('s-mm-method', '<div class="dbl">אירועי מחזור חיים שנשמרו</div>', '<div class="dbl">אירועים צבאיים</div>')
rep('s-mm-method', '<div class="dbl">אירועי <span dir="ltr">Land-core</span></div>', '<div class="dbl">אירועים במיקוד יבשתי</div>')
rep('s-mm-method', '<div class="dbl">תוכניות / משפחות רכש נבדלות</div>', '<div class="dbl">תוכניות נבדלות</div>')
rep('s-mm-method',
    '<div class="mm-fn" style="top: 900px;">28 אירועים נוספים נשמרו במאגר כאירועי הקשר בלבד, ואינם נכללים במדדי ה-<span dir="ltr">Land-core</span> המוצגים בפרק זה.</div>',
    '<div class="mm-fn" style="top: 900px; color: var(--c-text-muted);"><b>אירוע</b> = אבן דרך פומבית בפעילות השוק - כגון <span dir="ltr">RFI, RFQ, RFP</span> / מכרז, ניסוי או בחינה, בחירת ספק, הסכם מסגרת או הזמנה בפועל.</div>')
# 6. slide 13: the methodological sentence goes; the scope caveat in plain Hebrew
rep('s-mm-glance', '  <div class="mm-fn" style="top: 892px;">אין לשלב את התחזית החיצונית עם נתוני הרכש שנצפו בעבודה זו לכדי חישוב אחד — מדובר בשני מקורות בעלי מתודולוגיה ותכלית שונות.</div>\n', '')
rep('s-mm-glance', '<div class="gl">אירועי <span dir="ltr">Land-core</span></div>', '<div class="gl">אירועים במיקוד יבשתי</div>')
rep('s-mm-glance', 'תיחום המחקר החיצוני רחב יותר מתיחום ה-<span dir="ltr">Land-core</span> בעבודה זו.',
    'תיחום המחקר החיצוני רחב יותר מהניתוח במיקוד יבשתי בעבודה זו.')
rep('s-mm-glance', '<div class="gl">תוכניות / משפחות רכש נבדלות</div>', '<div class="gl">תוכניות נבדלות</div>')

ORDER = ['s-cover', 's-div-sm', 's-evolution', 's-scope', 's-table',
         's-cbg', 's-sterlite', 's-ravelin-a', 's-ravelin-b', 's-spectralx', 's-ametrine',
         's-div-mm', 's-mm-method', 's-mm-glance', 's-mm-activity', 's-mm-broader', 's-mm-comp',
         's-mm-prog-1', 's-mm-prog-2', 's-mm-prog-3', 's-div-sum', 's-mm-conclusion',
         's-div-apx', 's-plasan-fit', 's-spectrum', 's-landscape',
         's-amd', 's-eltics', 's-stg', 's-shieldex', 's-permali']
assert set(ORDER) - set(cur) == set(), set(ORDER) - set(cur)
out = ''.join('\n<!-- ====== %02d · %s ====== -->\n' % (n, k) + cur[k] for n, k in enumerate(ORDER, 1))

# 12. footer: project name + page number only
out = out.replace('<div class="proj">פלסן סאסא — הפחתת חתימה | מצגת עבודה</div>', '<div class="proj">פלסן סאסא - הפחתת חתימה</div>')
out = out.replace('<div class="src">מצגת עבודה</div>', '<div class="src"></div>')
# 5. Land-core left anywhere in running text - the safety net after the contextual rewrites
for a_, b_ in [('115 אירועי <span dir="ltr">Land-core</span>', '115 אירועים במיקוד יבשתי'),
               ('אירועי ה-<span dir="ltr">Land-core</span>', 'האירועים במיקוד יבשתי'),
               ('אירועי <span dir="ltr">Land-core</span>', 'אירועים במיקוד יבשתי'),
               ('משפחות <span dir="ltr">Land-core</span>', 'תוכניות במיקוד יבשתי'),
               ('ב-<span dir="ltr">Land-core</span>', 'במיקוד יבשתי'),
               ('<span dir="ltr">Land-core</span>', 'מיקוד יבשתי')]:
    out = out.replace(a_, b_)
# 13. dashes: text nodes only
parts = re.split(r'(<[^>]+>)', out)
out = ''.join(p if p.startswith('<') else p.replace('—', '-').replace('–', '-') for p in parts)

css = '''
/* ---------- summary slide: market conclusion + companies for further M&A review ---------- */
.sum-band { position: absolute; right: var(--m-side); left: var(--m-side);
  background: var(--c-primary); color: #fff; padding: 26px 44px 24px; }
.sum-band .fl { font-size: 24px; font-weight: 700; color: rgba(255,255,255,.72); margin-bottom: 8px; }
.sum-band .fx { font-size: 32px; font-weight: 800; line-height: 1.4; }
.sum-band .fs { font-size: 26px; font-weight: 600; color: rgba(255,255,255,.88); margin-top: 14px;
  padding-top: 12px; border-top: 1px solid rgba(255,255,255,.32); }
.sum-cos { position: absolute; right: var(--m-side); left: var(--m-side); }
.sum-cos .h { font-size: 30px; font-weight: 800; color: var(--c-primary);
  border-bottom: 3px solid var(--c-primary); padding-bottom: 6px; }
.sum-cos .r { display: grid; grid-template-columns: 290px 1fr 1fr; column-gap: 30px;
  align-items: center; padding: 10px 0; border-top: 1px solid var(--c-hairline); }
.sum-cos .r.hd { border-top: none; padding: 10px 0 4px; font-size: 22px; font-weight: 700; color: var(--c-text-muted); }
.sum-cos .r.hd div { border-right: none; padding-right: 0; }
.sum-cos .n { font-size: 26px; font-weight: 800; color: var(--c-primary); line-height: 1.2; }
.sum-cos .n small { display: block; font-size: 22px; font-weight: 500; color: var(--c-text-muted); margin-top: 2px; }
.sum-cos .p, .sum-cos .m { font-size: 24px; line-height: 1.34; color: var(--c-text);
  padding-right: 16px; border-right: 5px solid var(--c-primary); }
.sum-cos .m { border-right-color: var(--c-red); }
#s-div-sum .sd-sub .st, #s-mm-conclusion .kicker { font-size: 24px; }

/* 2026 keeps each series' own colour; the partial year is written under the label */
.mm-duo .dx div.ytd { color: var(--c-text); }
.mm-duo .dx div small { display: block; font-size: 24px; font-weight: 600; color: var(--c-slate-mid);
  line-height: 1.2; margin: 2px -14px 0; white-space: nowrap; }
.mm-sm .sx div.ytd { color: var(--c-text-muted); font-weight: 400; }
/* composition table: the procurement abbreviations sit under the Hebrew label */
.mm-comp td small { display: block; font-size: 24px; font-weight: 500; color: var(--c-text-muted);
  line-height: 1.2; margin-top: 2px; }
'''
head = head.replace('</style>', css + '</style>')
for rule in ['.mm-duo .dc.ytd .b.ord { background: #2E7C99; }\n', '.mm-duo .dc.ytd .b.prg { background: #9BA9B6; }\n',
             '.mm-sm .sc.ytd .sn { color: var(--c-slate-mid); }\n', '.mm-sm .sc.ytd .sb { background: var(--c-slate-mid); }\n',
             '.mm-comp .ytd { background: #E4E9EE; }\n', '.mm-comp tr.tot .ytd { background: var(--c-slate-mid); }\n']:
    assert head.count(rule) == 1, rule
    head = head.replace(rule, '')
io.open(T, 'w', encoding='utf-8').write(head + out + '\n' + script + '\n')
print('assembled', len(ORDER), 'slides from HEAD')
