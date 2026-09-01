#!/usr/bin/env python3
"""Assemble deck.html from deck_template.html by inlining the Inter font.

deck_template.html is the editable source (contains the @@FONT_B64@@ token);
deck.html is the generated, fully self-contained deliverable.
"""
import base64
import pathlib

root = pathlib.Path(__file__).parent
font = root / "assets" / "fonts" / "inter-latin.woff2"
b64 = base64.b64encode(font.read_bytes()).decode()
tpl = (root / "deck_template.html").read_text()
assert "@@FONT_B64@@" in tpl, "font token missing from template"
(root / "deck.html").write_text(tpl.replace("@@FONT_B64@@", b64))
print("deck.html written")
