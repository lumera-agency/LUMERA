#!/usr/bin/env python3
"""
HTML fragment → JSX, for porting static markup into components (website-v2 → Next).

  python3 scripts/html2jsx.py <file.html> <start-line> <end-line> [--indent N]

- class/for/tabindex/… → className/htmlFor/tabIndex; SVG attributes → camelCase; style="--i:0" → style object
- data-i18n="a.b"        → the element's text becomes {t("a.b")}
- data-i18n-html="a.b"   → the element's content becomes {t.rich("a.b", rich)}
- data-i18n-attr="x:a.b" → attribute x = {t("a.b")}
  (keys follow src/messages: a key that is also a parent lives under ".text")
- comments → {/* */}; void and childless SVG elements self-close
"""
import json, re, sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MESSAGES = json.loads((ROOT / "src/messages/uk.json").read_text())

def resolve(key: str) -> str:
    """flat key from v2 → the path in the nested messages"""
    node = MESSAGES
    for part in key.split("."):
        if not isinstance(node, dict) or part not in node:
            return key  # unknown: leave it (a check will flag it)
        node = node[part]
    return key + ".text" if isinstance(node, dict) and "text" in node else key

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
SVG_SELF = {"path", "circle", "rect", "line", "polyline", "polygon", "ellipse", "use", "stop", "feturbulence", "fecolormatrix", "feblend"}
RENAME = {
    "class": "className", "for": "htmlFor", "tabindex": "tabIndex", "readonly": "readOnly", "maxlength": "maxLength",
    "autocomplete": "autoComplete", "inputmode": "inputMode", "enterkeyhint": "enterKeyHint", "crossorigin": "crossOrigin",
    "srcset": "srcSet", "colspan": "colSpan", "rowspan": "rowSpan", "autofocus": "autoFocus", "spellcheck": "spellCheck",
    "novalidate": "noValidate", "formnovalidate": "formNoValidate", "hreflang": "hrefLang", "fetchpriority": "fetchPriority",
    "viewbox": "viewBox", "preserveaspectratio": "preserveAspectRatio", "pathlength": "pathLength", "gradientunits": "gradientUnits",
    "gradienttransform": "gradientTransform", "patternunits": "patternUnits", "basefrequency": "baseFrequency", "numoctaves": "numOctaves",
    "stitchtiles": "stitchTiles", "stdDeviation": "stdDeviation", "xlink:href": "href", "fill-rule": "fillRule", "clip-rule": "clipRule",
    "clip-path": "clipPath", "stroke-width": "strokeWidth", "stroke-linecap": "strokeLinecap", "stroke-linejoin": "strokeLinejoin",
    "stroke-dasharray": "strokeDasharray", "stroke-dashoffset": "strokeDashoffset", "stroke-opacity": "strokeOpacity",
    "fill-opacity": "fillOpacity", "stop-color": "stopColor", "stop-opacity": "stopOpacity", "text-anchor": "textAnchor",
    "dominant-baseline": "dominantBaseline", "font-size": "fontSize", "font-weight": "fontWeight", "vector-effect": "vectorEffect",
    "color-interpolation-filters": "colorInterpolationFilters",
}
BOOLEAN = {"hidden", "disabled", "required", "checked", "open", "inert", "multiple", "selected", "autofocus", "novalidate", "readonly", "playsinline", "muted", "loop", "autoplay", "defer", "async"}
DROP = {"xmlns", "xmlns:xlink"}

def js_string(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)

def style_object(css: str) -> str:
    items = []
    for decl in filter(None, (d.strip() for d in css.split(";"))):
        prop, _, value = decl.partition(":")
        prop = prop.strip()
        key = prop if prop.startswith("--") else re.sub(r"-([a-z])", lambda m: m.group(1).upper(), prop)
        items.append(f"{js_string(key)}: {js_string(value.strip())}")
    return "{{ " + ", ".join(items) + " } as React.CSSProperties}"

class Node:
    def __init__(self, tag, attrs, parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, attrs, parent, []

class Builder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.root = Node("#root", [])
        self.cur = self.root
    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.cur)
        self.cur.children.append(node)
        if tag not in VOID:
            self.cur = node
    def handle_startendtag(self, tag, attrs):
        self.cur.children.append(Node(tag, attrs, self.cur))
    def handle_endtag(self, tag):
        n = self.cur
        while n is not self.root and n.tag != tag:
            n = n.parent
        if n is not self.root:
            self.cur = n.parent
    def handle_data(self, data):
        self.cur.children.append(data)
    def handle_entityref(self, name):
        self.cur.children.append(f"&{name};")
    def handle_charref(self, name):
        self.cur.children.append(f"&#{name};")
    def handle_comment(self, data):
        self.cur.children.append(("comment", data))

def text_jsx(s: str) -> str:
    return s.replace("{", "{'{'}").replace("}", "{'}'}")

def attrs_jsx(node: Node):
    out, i18n, i18n_html = [], None, None
    attr_keys = {}
    for k, v in node.attrs:  # first: which attributes get translated (they may come after the plain ones)
        if k == "data-i18n-attr":
            for pair in v.split(";"):
                a, _, key = pair.partition(":")
                attr_keys[a.strip()] = key.strip()
    for k, v in node.attrs:
        if k == "data-i18n":
            i18n = v; continue
        if k == "data-i18n-html":
            i18n_html = v; continue
        if k == "data-i18n-attr":
            continue
        if k in DROP:
            continue
        name = RENAME.get(k, k)
        if k in attr_keys:
            continue
        if name == "tabIndex" and v and v.lstrip("-").isdigit():
            out.append(f"tabIndex={{{int(v)}}}")
        elif k == "style" and v:
            out.append(f"style={style_object(v)}")
        elif v is None or (k in BOOLEAN and v in ("", k)):
            out.append(name if not name.startswith(("data-", "aria-")) else f'{name}=""')
        else:
            out.append(f"{name}={js_string(v)}")
    for a, key in attr_keys.items():
        out.append(f"{RENAME.get(a, a)}={{t({js_string(resolve(key))})}}")
    return out, i18n, i18n_html

def emit(node, depth, lines, ind):
    pad = " " * (ind + depth * 2)
    if isinstance(node, tuple):
        body = node[1].strip().replace("*/", "* /")
        lines.append(f"{pad}{{/* {body} */}}")
        return
    if isinstance(node, str):
        text = node
        if not text.strip():
            if "\n" not in text and text:
                lines.append(pad + '{" "}')  # a space between inline elements
            return
        body = text_jsx(re.sub(r"\s+", " ", text.strip()))
        lead = '{" "}' if text[0] in " \t" and "\n" not in text.split(text.strip())[0] else ""
        tail = '{" "}' if text[-1] in " \t" and "\n" not in text.split(text.strip())[-1] else ""
        lines.append(pad + lead + body + tail)
        return
    attrs, i18n, i18n_html = attrs_jsx(node)
    keys = dict(node.attrs)
    attrs = [a for a in attrs if not a.startswith(("data-price-line", "data-preset-label"))]
    head = f"<{node.tag}" + ("" if not attrs else " " + " ".join(attrs))
    kids = node.children
    if "data-preset-label" in keys and keys.get("data-cfg-preset"):
        lines.append(f"{pad}{head}>{{presetLabel({js_string(keys['data-cfg-preset'])})}}</{node.tag}>")
        return
    if i18n:
        args = ", prices" if "data-price-line" in keys else ""
        lines.append(f"{pad}{head}>{{t({js_string(resolve(i18n))}{args})}}</{node.tag}>")
        return
    if i18n_html:
        lines.append(f"{pad}{head}>{{t.rich({js_string(resolve(i18n_html))}, rich)}}</{node.tag}>")
        return
    if node.tag in VOID or (not kids and node.tag in SVG_SELF):
        lines.append(f"{pad}{head} />")
        return
    if not kids:
        lines.append(f"{pad}{head}></{node.tag}>")
        return
    # inline: only text and inline children on one line
    simple = all(isinstance(k, str) and "\n" not in k for k in kids)
    if simple:
        lines.append(f"{pad}{head}>{text_jsx(''.join(kids))}</{node.tag}>")
        return
    lines.append(f"{pad}{head}>")
    for k in kids:
        emit(k, depth + 1, lines, ind)
    lines.append(f"{pad}</{node.tag}>")

def main():
    args = sys.argv[1:]
    path, a, b = args[0], int(args[1]), int(args[2])
    ind = int(args[args.index("--indent") + 1]) if "--indent" in args else 0
    src = "\n".join(Path(path).read_text().split("\n")[a - 1 : b])
    builder = Builder()
    builder.feed(src)
    lines = []
    for k in builder.root.children:
        if isinstance(k, str) and not k.strip():
            continue  # indentation before and after the fragment
        emit(k, 0, lines, ind)
    print("\n".join(lines))

if __name__ == "__main__":
    main()
