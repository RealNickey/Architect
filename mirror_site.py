#!/usr/bin/env python3
"""
Mirror https://www.gtarchitects.in/ into ./original-site/
- Downloads 6 HTML pages preserving names
- Parses HTML for src/href/srcset/url() assets
- Downloads same-origin assets preserving folder structure
- Parses CSS files for url() references (fonts, images) recursively
- Tries common files: sitemap.xml, robots.txt, favicon.ico
- Prints summary + failures
"""
import os
import re
import sys
import time
import urllib.request
import urllib.parse
import urllib.error
from pathlib import Path

BASE_URL = "https://www.gtarchitects.in/"
BASE_HOST = urllib.parse.urlparse(BASE_URL).netloc.lower()  # www.gtarchitects.in
ALLOWED_HOSTS = {BASE_HOST, "gtarchitects.in", "www.gtarchitects.in"}

OUT_DIR = Path(__file__).parent / "original-site"

PAGES = ["index.html", "about.html", "services.html", "portfolio.html", "gallery.html", "contact.html"]
COMMON_FILES = ["sitemap.xml", "robots.txt", "favicon.ico"]

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"

downloaded = {}   # full_url_noFrag -> local Path
downloaded_bytes = {}  # full_url -> size
failed = []       # (url, referrer, error)
external_skipped = set()
visited_pages = set()

# Regexes
RE_SRC_HREF = re.compile(r'''(?:src|href|data-src|data-original|data-lazy-src|poster|content)\s*=\s*["']([^"']+)["']''', re.IGNORECASE)
RE_URL_CSS = re.compile(r'''url\(\s*["']?([^"'\)\s]+)["']?\s*\)''', re.IGNORECASE)
RE_SRCSET = re.compile(r'''srcset\s*=\s*["']([^"']+)["']''', re.IGNORECASE)
# catch JS-embedded local paths like "images/xyz.jpg"
RE_JS_LOCAL = re.compile(r'''["']((?:css|js|images|img|fonts|assets|uploads|media|files|videos?|audio)/[^"'\)\s\?#]+(?:\?[^"'\)\s#]*)?)["']''', re.IGNORECASE)

SKIP_PREFIXES = ("data:", "mailto:", "tel:", "javascript:", "skype:", "whatsapp:", "#")

def is_skippable(u: str) -> bool:
    s = u.strip()
    if not s or s == "#":
        return True
    low = s.lower()
    for p in SKIP_PREFIXES:
        if low.startswith(p):
            return True
    return False

def quote_url(url: str) -> str:
    """Percent-encode path/query so filenames with spaces like 'Alias Residence -1.jpg' fetch correctly."""
    try:
        parts = urllib.parse.urlsplit(url)
        # preserve / % : @ etc in path; encode spaces and other unsafe chars
        qpath = urllib.parse.quote(parts.path, safe="/%:@!$&'()*+,;=")
        # keep query safe chars, encode spaces etc.
        qquery = urllib.parse.quote(parts.query, safe="=&%:@!$'()*+,;/")
        return urllib.parse.urlunsplit((parts.scheme, parts.netloc, qpath, qquery, parts.fragment))
    except Exception:
        return url

def fetch_bytes(url: str, timeout=20, retries=2):
    url = quote_url(url)
    last_err = None
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*", "Referer": BASE_URL})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read(), r.headers.get_content_type() if hasattr(r.headers, "get_content_type") else ""
        except Exception as e:
            last_err = e
            time.sleep(0.5 * attempt)
    raise last_err

def url_to_local_path(url: str):
    """Map same-origin URL to local path under OUT_DIR. Returns Path or None if not mappable."""
    p = urllib.parse.urlparse(url)
    path = urllib.parse.unquote(p.path or "")
    # strip leading /
    rel = path.lstrip("/")
    if not rel or rel.endswith("/"):
        # directory URL -> index file (avoid clobbering main pages; only for assets discovery)
        rel = (rel + "index.html").lstrip("/")
    # remove dangerous parts
    # Prevent absolute drive / traversal
    parts = []
    for part in rel.split("/"):
        if part in ("", "."):
            continue
        if part == "..":
            continue
        parts.append(part)
    rel = "/".join(parts)
    if not rel:
        return None
    return OUT_DIR / Path(*rel.split("/"))

def is_same_origin(url: str) -> bool:
    try:
        h = urllib.parse.urlparse(url).netloc.lower()
    except Exception:
        return False
    if not h:
        return True  # relative -> will be joined to base so same origin
    # strip port
    h = h.split(":")[0]
    return h in ALLOWED_HOSTS

def download_asset(full_url: str, referrer: str):
    # strip fragment
    full_url, _frag = urllib.parse.urldefrag(full_url.strip())
    if not full_url or is_skippable(full_url):
        return None
    # normalize scheme-relative //host/path
    if full_url.startswith("//"):
        full_url = "https:" + full_url
    if full_url in downloaded:
        return downloaded[full_url]
    parsed = urllib.parse.urlparse(full_url)
    # only http/https
    if parsed.scheme and parsed.scheme not in ("http", "https"):
        return None
    if not is_same_origin(full_url):
        external_skipped.add(full_url)
        return None
    # ensure absolute URL
    if not parsed.netloc:
        # shouldn't happen (callers urljoin first), but guard
        full_url = urllib.parse.urljoin(BASE_URL, full_url)
    local_path = url_to_local_path(full_url)
    if local_path is None:
        failed.append((full_url, referrer, "unmappable path"))
        return None
    # resume: skip if file already exists with content
    if local_path.exists() and local_path.stat().st_size > 0:
        # record without re-downloading (but still count)
        downloaded[full_url] = local_path
        downloaded_bytes[full_url] = local_path.stat().st_size
        print(f"  [SKIP-EXISTS] {full_url} -> {local_path.relative_to(OUT_DIR)} ({local_path.stat().st_size} bytes)", flush=True)
        return local_path
    # skip if file already exists from previous run with content
    cache_key = full_url
    try:
        data, _ctype = fetch_bytes(full_url)
    except Exception as e:
        failed.append((full_url, referrer, f"{type(e).__name__}: {e}"))
        return None
    try:
        local_path.parent.mkdir(parents=True, exist_ok=True)
        local_path.write_bytes(data)
        downloaded[cache_key] = local_path
        downloaded_bytes[cache_key] = len(data)
        print(f"  [OK] {full_url} -> {local_path.relative_to(OUT_DIR)} ({len(data)} bytes)", flush=True)
        return local_path
    except Exception as e:
        failed.append((full_url, referrer, f"write error: {e}"))
        return None

def extract_asset_urls(html_text: str, page_url: str):
    urls = []
    for m in RE_SRC_HREF.finditer(html_text):
        u = m.group(1).strip()
        if is_skippable(u):
            continue
        # skip pure fragments
        if u.startswith("#"):
            continue
        # skip external google fonts css? keep for external log but don't download
        abs_url = urllib.parse.urljoin(page_url, u)
        urls.append(abs_url)
    for m in RE_SRCSET.finditer(html_text):
        srcset_val = m.group(1)
        for part in srcset_val.split(","):
            part = part.strip().split()[0] if part.strip() else ""
            if not part or is_skippable(part):
                continue
            urls.append(urllib.parse.urljoin(page_url, part))
    for m in RE_URL_CSS.finditer(html_text):
        # inline style url()
        u = m.group(1).strip()
        if is_skippable(u):
            continue
        urls.append(urllib.parse.urljoin(page_url, u))
    for m in RE_JS_LOCAL.finditer(html_text):
        u = m.group(1).strip()
        if is_skippable(u):
            continue
        urls.append(urllib.parse.urljoin(page_url, u))
    return urls

def parse_css_urls(css_text: str, css_url: str):
    urls = []
    for m in RE_URL_CSS.finditer(css_text):
        u = m.group(1).strip().strip("'\"")
        if not u or is_skippable(u):
            continue
        # skip data URIs already handled
        urls.append(urllib.parse.urljoin(css_url, u))
    # also @import
    for m in re.finditer(r'''@import\s+(?:url\(\s*["']?([^"'\)]+)["']?\s*\)|["']([^"']+)["'])''', css_text, re.IGNORECASE):
        u = m.group(1) or m.group(2)
        if u and not is_skippable(u.strip()):
            urls.append(urllib.parse.urljoin(css_url, u.strip()))
    return urls

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Base: {BASE_URL}")
    print(f"Out : {OUT_DIR}")
    print(f"Python mirroring start\n")

    html_contents = {}  # page_url -> text

    # 1. Download main pages
    print("== 1. Downloading HTML pages ==")
    for page in PAGES:
        page_url = urllib.parse.urljoin(BASE_URL, page)
        local_path = OUT_DIR / page
        try:
            data, _ctype = fetch_bytes(page_url)
            local_path.parent.mkdir(parents=True, exist_ok=True)
            local_path.write_bytes(data)
            downloaded[page_url] = local_path
            downloaded_bytes[page_url] = len(data)
            visited_pages.add(page_url)
            print(f"  [OK] {page_url} -> {page} ({len(data)} bytes)")
            try:
                html_contents[page_url] = data.decode("utf-8", errors="ignore")
            except Exception:
                html_contents[page_url] = ""
        except Exception as e:
            failed.append((page_url, "(main page)", f"{type(e).__name__}: {e}"))
            print(f"  [FAIL] {page_url} : {e}")

    # Also fetch root "/" to discover any differences (save separately for inspection, don't overwrite index.html)
    try:
        root_url = BASE_URL
        if root_url not in visited_pages:
            data, _ = fetch_bytes(root_url)
            # compare with index.html; save as _root.html only if different
            idx_path = OUT_DIR / "index.html"
            if idx_path.exists():
                existing = idx_path.read_bytes()
                if data != existing:
                    p = OUT_DIR / "_root.html"
                    p.write_bytes(data)
                    print(f"  [NOTE] root / differs from index.html, saved as _root.html ({len(data)} bytes)")
                    downloaded[root_url] = p
                    downloaded_bytes[root_url] = len(data)
                    try:
                        html_contents[root_url] = data.decode("utf-8", errors="ignore")
                    except Exception:
                        pass
    except Exception as e:
        print(f"  [WARN] could not fetch root / : {e}")

    # 2. Extract assets from HTML
    print("\n== 2. Extracting asset URLs from HTML ==")
    all_asset_urls = []
    for page_url, html in html_contents.items():
        urls = extract_asset_urls(html, page_url)
        print(f"  {page_url}: found {len(urls)} raw refs")
        all_asset_urls.extend([(u, page_url) for u in urls])

    # Deduplicate preserving order
    seen = set()
    uniq_assets = []
    for u, ref in all_asset_urls:
        key, _ = urllib.parse.urldefrag(u)
        if key not in seen:
            seen.add(key)
            uniq_assets.append((key, ref))
    print(f"  Total unique refs: {len(uniq_assets)}")

    # 3. Download same-origin assets (first pass)
    print("\n== 3. Downloading assets (pass 1: HTML refs) ==")
    css_files = []  # (url, local_path)
    extra_html_pages = []
    for url, ref in uniq_assets:
        # Detect additional same-origin HTML pages to mirror (thoroughness)
        parsed = urllib.parse.urlparse(url)
        path_low = parsed.path.lower()
        if is_same_origin(url) and (path_low.endswith(".html") or path_low.endswith(".htm")):
            # strip query/frag for check
            if url not in downloaded and url not in visited_pages and url not in [p for p in html_contents]:
                # queue for download as page
                extra_html_pages.append((url, ref))
                continue
        lp = download_asset(url, ref)
        if lp is not None and lp.suffix.lower() == ".css":
            # reconstruct full url key
            css_files.append((url, lp))

    # Download extra discovered HTML pages (one level) + extract their assets
    if extra_html_pages:
        print(f"\n== 3b. Extra discovered HTML pages: {len(extra_html_pages)} ==")
        for url, ref in extra_html_pages:
            if url in downloaded:
                continue
            lp = download_asset(url, ref)
            if lp is not None and lp.suffix.lower() in (".html", ".htm"):
                try:
                    html = lp.read_text(encoding="utf-8", errors="ignore")
                    html_contents[url] = html
                    print(f"  [PAGE] discovered {url}")
                    # extract nested assets immediately (pass 1b)
                    for nu in extract_asset_urls(html, url):
                        key, _ = urllib.parse.urldefrag(nu)
                        if key not in seen:
                            seen.add(key)
                            parsed2 = urllib.parse.urlparse(key)
                            if is_same_origin(key) and parsed2.path.lower().endswith((".html", ".htm")):
                                if key not in downloaded:
                                    lp2 = download_asset(key, url)
                                    if lp2 is not None and lp2.suffix.lower() == ".css":
                                        css_files.append((key, lp2))
                                continue
                            lp2 = download_asset(key, url)
                            if lp2 is not None and lp2.suffix.lower() == ".css":
                                css_files.append((key, lp2))
                except Exception as e:
                    failed.append((url, ref, f"read discovered page: {e}"))

    # 4. Parse CSS files for url() refs (recursive, 2 levels)
    print("\n== 4. Parsing CSS for url() refs ==")
    # Also include any .css downloaded but not in css_files list (e.g. from extra pages)
    for key, lp in list(downloaded.items()):
        if isinstance(lp, Path) and lp.suffix.lower() == ".css" and key not in [c[0] for c in css_files]:
            css_files.append((key, lp))
    print(f"  CSS files to scan: {len(css_files)}")
    # dedupe css list
    seen_css = set()
    uniq_css = []
    for u, lp in css_files:
        if u not in seen_css:
            seen_css.add(u)
            uniq_css.append((u, lp))
    css_files = uniq_css

    level2_css = []
    for css_url, css_path in css_files:
        try:
            css_text = css_path.read_text(encoding="utf-8", errors="ignore")
        except Exception as e:
            failed.append((css_url, "(css read)", str(e)))
            continue
        refs = parse_css_urls(css_text, css_url)
        print(f"  {css_url}: {len(refs)} url() refs")
        for r in refs:
            key, _ = urllib.parse.urldefrag(r)
            if key in seen:
                continue
            seen.add(key)
            lp = download_asset(key, css_url)
            if lp is not None and lp.suffix.lower() == ".css":
                level2_css.append((key, lp))
    # one more level for @imported css
    for css_url, css_path in level2_css:
        try:
            css_text = css_path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        for r in parse_css_urls(css_text, css_url):
            key, _ = urllib.parse.urldefrag(r)
            if key in seen:
                continue
            seen.add(key)
            download_asset(key, css_url)

    # 5. Scan JS files for embedded local paths (best-effort thoroughness)
    print("\n== 5. Scanning JS for embedded asset paths ==")
    js_files = [(k, v) for k, v in downloaded.items() if isinstance(v, Path) and v.suffix.lower() == ".js"]
    print(f"  JS files: {len(js_files)}")
    for js_url, js_path in js_files:
        try:
            js_text = js_path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        # find url(...) inside JS + quoted local paths
        candidates = []
        for m in RE_URL_CSS.finditer(js_text):
            u = m.group(1).strip()
            if not is_skippable(u):
                candidates.append(urllib.parse.urljoin(js_url, u))
        for m in RE_JS_LOCAL.finditer(js_text):
            u = m.group(1).strip()
            if not is_skippable(u):
                candidates.append(urllib.parse.urljoin(js_url, u))
        for c in candidates:
            key, _ = urllib.parse.urldefrag(c)
            if key in seen:
                continue
            seen.add(key)
            download_asset(key, js_url)

    # 6. Common files
    print("\n== 6. Trying common files ==")
    for cf in COMMON_FILES:
        url = urllib.parse.urljoin(BASE_URL, cf)
        if url in downloaded or url in seen:
            continue
        seen.add(url)
        # don't clutter failures for optional files? still record
        lp = download_asset(url, "(common)")
        if lp is None and url not in downloaded:
            # download_asset already appended to failed or external; print note
            print(f"  [MISS] {url}")

    # 7. Summary
    print("\n================ SUMMARY ================")
    total_files = 0
    total_bytes = 0
    all_files = []
    for dirpath, dirnames, filenames in os.walk(OUT_DIR):
        for f in filenames:
            fp = Path(dirpath) / f
            rel = fp.relative_to(OUT_DIR)
            sz = fp.stat().st_size
            all_files.append((str(rel), sz))
            total_files += 1
            total_bytes += sz
    all_files.sort()
    print(f"Files on disk in original-site/: {total_files}")
    print(f"Total size: {total_bytes} bytes ({total_bytes/1024:.1f} KB, {total_bytes/1024/1024:.2f} MB)")
    print(f"Downloaded via script (this run, incl. skipped-existing logic): {len(downloaded)}")
    print(f"Failed: {len(failed)}")
    for u, ref, err in failed:
        print(f"  FAIL: {u} (ref: {ref}) -> {err}")
    print(f"External skipped (not mirrored): {len(external_skipped)}")
    for u in sorted(external_skipped)[:50]:
        print(f"  EXT: {u}")
    if len(external_skipped) > 50:
        print(f"  ... and {len(external_skipped)-50} more")
    print("\nFile list:")
    for rel, sz in all_files:
        print(f"  {rel} ({sz})")
    return 0

if __name__ == "__main__":
    sys.exit(main())
