"""Rebuild the Crownfall wiki from template.html + articles.json + did-you-know.json.
Writes the shipped artifact to client/public/wiki/index.html (served at /wiki/).
Usage: python3 build.py  (or, from client/, npm run build:wiki)"""
import json, re, os
D = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(D, "..", "public", "wiki", "index.html")
arts = json.load(open(os.path.join(D, "articles.json"), encoding="utf-8"))
dyk = json.load(open(os.path.join(D, "did-you-know.json"), encoding="utf-8"))
ids = {a["id"] for a in arts}
blob = json.dumps(arts, ensure_ascii=False)
broken = sorted(set(re.findall(r'data-to=\\"([^"\\]+)', blob)) - ids)
if broken: print("warning, links to missing articles:", broken)
safe = lambda x: json.dumps(x, ensure_ascii=False).replace("</", "<\\/")
html = open(os.path.join(D, "template.html"), encoding="utf-8").read()
html = html.replace("__DATA__", safe(arts)).replace("__DYK__", safe(dyk))
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, "w", encoding="utf-8").write(html)
print(f"built {OUT}: {len(arts)} articles, {len(html.encode())//1024} KB")
