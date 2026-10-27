# Extracts storyboard vector art into /app/frontend/public/art
import xml.etree.ElementTree as ET, pymupdf as fitz, re, sys
NS='http://www.w3.org/2000/svg'; XL='http://www.w3.org/1999/xlink'
ET.register_namespace('',NS); ET.register_namespace('xlink',XL)
ET.register_namespace('inkscape','http://www.inkscape.org/namespaces/inkscape')
PDF=sys.argv[1] if len(sys.argv)>1 else '/tmp/wh/s.pdf'
doc=fitz.open(PDF); cache={}
def page(p,tp):
    k=(p,tp)
    if k not in cache: cache[k]=doc[p].get_svg_image(text_as_path=tp)
    return cache[k]
def refs(el):
    out=set()
    for e in el.iter():
        for k,v in e.attrib.items():
            out|=set(re.findall(r'url\(#([^)]+)\)',v))
            if k==f'{{{XL}}}href' and v.startswith('#'): out.add(v[1:])
    return out
def extract(name,p,keep,box,tp=True):
    r=ET.fromstring(page(p,tp)); defs=list(r)[0]; g=list(r)[1]
    for i,k in enumerate(list(g)):
        if i not in keep: g.remove(k)
    if not tp:
        for par in r.iter():
            for c in list(par):
                if c.tag==f'{{{NS}}}text': par.remove(c)
    byid={d.get('id'):d for d in defs.iter() if d.get('id')}
    need=refs(g); todo=list(need)
    while todo:
        i=todo.pop(); e=byid.get(i)
        if e is None: continue
        for n in refs(e)-need: need.add(n); todo.append(n)
    for d in list(defs):
        if d.get('id') not in need and not (refs(d)&need) and not any(x.get('id') in need for x in d.iter()): defs.remove(d)
    x0,y0,x1,y1=box
    r.set('viewBox',f'{x0} {y0} {x1-x0} {y1-y0}'); r.set('width',f'{x1-x0}'); r.set('height',f'{y1-y0}')
    s=ET.tostring(r,encoding='unicode')
    open(f'/app/frontend/public/art/{name}.svg','w').write(s); print(name,len(s)//1024,'KB')
R=range
A=[
 ('welcome-cameo',0,set(R(2,47)),[8,36,286,318],False),
 ('steps',0,{48,49,50,51},[30,458,262,512],True),
 ('divider',0,{57,58,59,60,61},[14,380,270,414],True),
 ('heart',0,{62},[16,20,36,40],True),
 ('seal-w',1,{49,50,51},[230,50,284,104],True),
 ('heart-done',1,{9},[72,20,90,38],True),
 ('heart-now',1,{11},[114,16,138,40],True),
 ('heart-empty',1,{12},[140,20,158,36],True),
 ('floral-card',1,{42,43,44},[8,62,48,98],True),
 ('slider-track',2,{19,20,21},[30,154,263,170],True),
 ('hoop-small',2,set(R(48,56)),[108,532,194,620],True),
 ('corner-ochre',2,{2,3,4,5},[222,0,294,96],True),
 ('weave-hoop',3,set(R(12,32)),[0,50,294,345],False),
 ('loom',3,{10},[50,450,242,552],True),
 ('meet-cameo',4,set(R(5,20)),[8,74,286,334],False),
 ('wax-seal',4,{37},[208,660,260,712],True),
 ('vow-strip',4,{32},[16,375,276,392],True),
 ('letter-header',5,set(R(31,40)),[16,341,276,392],True),
 ('stamp',5,{49,50,51},[206,348,272,424],True),
 ('corner-wedgwood',5,set(R(6,11)),[222,0,294,78],True),
]
for a in A: extract(*a)
