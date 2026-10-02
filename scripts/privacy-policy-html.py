"""Regenerate frontend/public/privacy-policy.html from docs/PRIVACY_POLICY.md.

Run from the repo root: python scripts/privacy-policy-html.py
Handles the small Markdown subset the policy uses (headings, paragraphs, lists,
tables, bold, code, links). Blockquotes are editor notes and are left out.
"""
import re, html, sys
md = open('docs/PRIVACY_POLICY.md', encoding='utf-8').read()

def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'`(.+?)`', r'<code>\1</code>', t)
    t = re.sub(r'(https?://[^\s<)]+[^\s<).,])', r'<a href="\1">\1</a>', t)
    t = re.sub(r'(?<![\w/@])(support@medalarmapp\.com)', r'<a href="mailto:\1">\1</a>', t)
    return t

blocks = re.split(r'\n\s*\n', md.strip())
title = blocks[0].lstrip('# ').strip()
updated = blocks[1].strip()
out = [f'    <section class="card">\n      <p>{inline(updated)}</p>\n      <h1>{inline(title)}</h1>']
for b in blocks[2:]:
    lines = b.split('\n')
    if b.startswith('>'):
        continue  # internal note for the editor, not for the public page
    if b.startswith('## '):
        out.append('    </section>\n    <section class="card">')
        out.append(f'      <h2>{inline(b[3:].strip())}</h2>')
    elif lines[0].startswith('|'):
        rows = [r for r in lines if not re.match(r'^\|\s*-', r)]
        cells = [[c.strip() for c in r.strip('|').split('|')] for r in rows]
        t = ['      <table>', '        <thead><tr>' + ''.join(f'<th>{inline(c)}</th>' for c in cells[0]) + '</tr></thead>', '        <tbody>']
        t += ['          <tr>' + ''.join(f'<td>{inline(c)}</td>' for c in r) + '</tr>' for r in cells[1:]]
        t += ['        </tbody>', '      </table>']
        out.append('\n'.join(t))
    elif lines[0].startswith('- '):
        items, cur = [], None
        for l in lines:
            if l.startswith('- '):
                if cur is not None: items.append(cur)
                cur = l[2:].strip()
            else:
                cur += ' ' + l.strip()
        items.append(cur)
        out.append('      <ul>\n' + '\n'.join(f'        <li>{inline(i)}</li>' for i in items) + '\n      </ul>')
    else:
        out.append(f'      <p>{inline(" ".join(l.strip() for l in lines))}</p>')
out.append('    </section>')
body = '\n'.join(out)

page = open('frontend/public/privacy-policy.html', encoding='utf-8').read()
head = page[:page.index('<body>')]
if 'table {' not in head:
    head = head.replace('  </style>', """    table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
    th, td { text-align: left; vertical-align: top; padding: 8px 10px;
      border-bottom: 1px solid color-mix(in srgb, var(--muted) 24%, transparent); }
    th { color: var(--text); }
    td { color: var(--muted); }
    .table-wrap { overflow-x: auto; }
  </style>""")
body = body.replace('      <table>', '      <div class="table-wrap"><table>').replace('      </table>', '      </table></div>')
open('frontend/public/privacy-policy.html', 'w', encoding='utf-8', newline='').write(
    head + '<body>\n  <!-- Generated from docs/PRIVACY_POLICY.md; edit that file and regenerate. -->\n  <main>\n' + body + '\n  </main>\n</body>\n</html>\n')
print('sections:', body.count('<section'), 'tables:', body.count('<table>'), 'TO FILL:', body.count('[TO FILL'))
