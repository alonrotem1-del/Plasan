#!/usr/bin/env python3
"""Assemble deck.html from deck_template.html.

- Inlines the Inter font (@@FONT_B64@@ token).
- Auto-numbers the .pageno footer tabs by actual slide order, so slides can
  be added/removed/reordered in the template without touching numbering.
deck_template.html is the editable source; deck.html is generated.
"""
import base64
import pathlib
import re

root = pathlib.Path(__file__).parent
font = root / "assets" / "fonts" / "inter-latin.woff2"
b64 = base64.b64encode(font.read_bytes()).decode()
tpl = (root / "deck_template.html").read_text()
assert "@@FONT_B64@@" in tpl, "font token missing from template"
html = tpl.replace("@@FONT_B64@@", b64)

# inline referenced images as data URIs (keeps deck.html self-contained)
def img_token(m):
    p = root / "assets" / "images" / m.group(1)
    return "data:image/jpeg;base64," + base64.b64encode(p.read_bytes()).decode()
html = re.sub(r"@@IMG:([\w.-]+)@@", img_token, html)

counter = 0
def number(_m):
    global counter
    counter += 1
    return f'<div class="pageno">{counter}</div>'
html = re.sub(r'<div class="pageno">\s*</div>', number, html)

(root / "deck.html").write_text(html)
print(f"deck.html written — {counter} slides numbered")
