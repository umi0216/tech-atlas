#!/usr/bin/env python3
"""Build a standalone HTML from the same GitHub Pages source. Python stdlib only."""
from pathlib import Path
import base64
import re

root = Path(__file__).resolve().parents[1]
html = (root / 'index.html').read_text(encoding='utf-8')
css = (root / 'app.css').read_text(encoding='utf-8')
font = base64.b64encode((root / 'assets/atlas-sans.woff2').read_bytes()).decode('ascii')
css = css.replace("url('./assets/atlas-sans.woff2')", "url('data:font/woff2;base64," + font + "')")
icon = base64.b64encode((root / 'assets/favicon.svg').read_bytes()).decode('ascii')
html = html.replace('./assets/favicon.svg', 'data:image/svg+xml;base64,' + icon)
planet = base64.b64encode((root / 'assets/orbital-world.webp').read_bytes()).decode('ascii')
html = html.replace('./assets/orbital-world.webp', 'data:image/webp;base64,' + planet)
html = re.sub(r'\s*<link rel="preload"[^>]+>', '', html)
html = html.replace('<link rel="stylesheet" href="./app.css">', '<style>\n' + css + '\n</style>')
for name in ['data.js', 'app.js']:
    script = (root / name).read_text(encoding='utf-8').replace('</script', '<\\/script')
    html = html.replace(f'<script src="./{name}"></script>', '<script>\n' + script + '\n</script>')
out = root / 'dist/tech-atlas-standalone.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding='utf-8')
print(out)
