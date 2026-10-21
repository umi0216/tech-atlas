#!/usr/bin/env python3
"""Embed both current and legacy frontends using their checked-in local assets."""
from pathlib import Path
import base64
import re
root=Path(__file__).resolve().parents[1]
out=root/'dist';out.mkdir(exist_ok=True)
def embed(name,css_name,scripts):
 html=(root/name).read_text()
 css=(root/css_name).read_text()
 for font in ['atlas-sans.woff2','atlas-universe-sans.woff2']:
  if font in css:
   data=base64.b64encode((root/'assets'/font).read_bytes()).decode()
   css=css.replace("url('./assets/"+font+"')","url('data:font/woff2;base64,"+data+"')")
 for filename,mime in [('favicon.svg','image/svg+xml'),('orbital-world.webp','image/webp')]:
  ref='./assets/'+filename
  if ref in html:html=html.replace(ref,'data:'+mime+';base64,'+base64.b64encode((root/'assets'/filename).read_bytes()).decode())
 html=re.sub(r'\s*<link rel="preload"[^>]+>','',html)
 html=re.sub(r'<link rel="stylesheet" href="\./'+re.escape(css_name)+r'(?:\?[^\"]*)?">',lambda _:'<style>\n'+css+'\n</style>',html)
 for script in scripts:
  content=(root/script).read_text().replace('</script','<\\/script')
  html=re.sub(r'<script src="\./'+re.escape(script)+r'(?:\?[^\"]*)?"></script>',lambda _:'<script>\n'+content+'\n</script>',html)
 return html
(out/'tech-atlas-standalone.html').write_text(embed('index.html','universe.css',['data.js','build/universe.js']))
(out/'legacy.html').write_text(embed('legacy.html','app.css',['data.js','app.js','motion.js']).replace('href="./index.html"','href="./tech-atlas-standalone.html"'))
print(out/'tech-atlas-standalone.html')
print('Optional original SVG map and milestones:',out/'legacy.html')
