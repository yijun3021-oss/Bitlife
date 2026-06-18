#!/usr/bin/env python3
"""Download BitLife Fandom wiki pages through the MediaWiki API.

The script stores one JSON file per page plus a manifest. It uses only the
Python standard library so it can run in the bundled Codex runtime.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, Iterable


API_ENDPOINT = "https://bitlife-life-simulator.fandom.com/api.php"
USER_AGENT = "bitliffe-wiki-downloader/1.0 (personal research)"


def safe_filename(value: str) -> str:
    value = value.replace(" ", "_")
    value = re.sub(r"[^A-Za-z0-9_\-\.]+", "", value)
    return value[:180] or "untitled"


def api_get(params: dict[str, Any], retries: int = 3) -> dict[str, Any]:
    encoded = urllib.parse.urlencode(params, doseq=True)
    request = urllib.request.Request(
        f"{API_ENDPOINT}?{encoded}",
        headers={
            "Accept": "application/json",
            "Referer": "https://bitlife-life-simulator.fandom.com/",
            "User-Agent": USER_AGENT,
        },
    )

    last_error: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                body = response.read().decode("utf-8")
                return json.loads(body)
        except Exception as exc:  # noqa: BLE001 - keep retries broad for network flakes.
            last_error = exc
            if attempt == retries:
                break
            time.sleep(1.5 * attempt)
    raise RuntimeError(f"API request failed after {retries} attempts: {last_error}")


def get_namespaces() -> list[int]:
    data = api_get(
        {
            "action": "query",
            "format": "json",
            "meta": "siteinfo",
            "siprop": "namespaces",
        }
    )
    namespaces = data.get("query", {}).get("namespaces", {})
    return sorted(int(ns) for ns in namespaces if int(ns) >= 0)


def page_filename(page: dict[str, Any]) -> str:
    return f"{page.get('pageid', 'missing')}_{safe_filename(page.get('title', 'untitled'))}.json"


def extract_content(page: dict[str, Any]) -> str:
    revisions = page.get("revisions") or []
    if not revisions:
        return ""
    revision = revisions[0]
    slots = revision.get("slots") or {}
    main = slots.get("main") or {}
    return main.get("content") or main.get("*") or revision.get("*") or ""


def iter_pages(namespace: int, limit: int = 0) -> Iterable[dict[str, Any]]:
    params: dict[str, Any] = {
        "action": "query",
        "format": "json",
        "formatversion": "2",
        "generator": "allpages",
        "gaplimit": "50",
        "gapnamespace": namespace,
        "prop": "revisions",
        "rvprop": "ids|timestamp|user|content",
        "rvslots": "main",
    }
    yielded = 0

    while True:
        data = api_get(params)
        for page in data.get("query", {}).get("pages", []):
            page["content"] = extract_content(page)
            yield page
            yielded += 1
            if limit and yielded >= limit:
                return

        continuation = data.get("continue")
        if not continuation:
            return
        params.update(continuation)
        time.sleep(0.2)


def load_existing_manifest(output_dir: Path) -> list[dict[str, Any]]:
    manifest_path = output_dir / "manifest.json"
    if not manifest_path.exists() or manifest_path.stat().st_size == 0:
        return []
    try:
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []
    return data if isinstance(data, list) else []


def write_manifest(output_dir: Path) -> None:
    pages_dir = output_dir / "pages"
    manifest: list[dict[str, Any]] = []
    for path in sorted(pages_dir.glob("*.json")):
        try:
            page = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        manifest.append(
            {
                "pageid": page.get("pageid"),
                "title": page.get("title"),
                "ns": page.get("ns"),
                "file": str(path.relative_to(output_dir)).replace(os.sep, "/"),
            }
        )
    (output_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def parse_namespaces(value: str, all_namespaces: bool) -> list[int]:
    if all_namespaces:
        return get_namespaces()
    return [int(part.strip()) for part in value.split(",") if part.strip()]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", default="wiki_dump")
    parser.add_argument("--limit", type=int, default=0, help="Limit total pages (0 = no limit)")
    parser.add_argument(
        "--namespaces",
        default="0",
        help="Comma-separated MediaWiki namespaces to download. Default: 0 (main articles).",
    )
    parser.add_argument(
        "--all-namespaces",
        action="store_true",
        help="Download all non-negative namespaces, including files, templates, and categories.",
    )
    parser.add_argument(
        "--refresh",
        action="store_true",
        help="Overwrite existing page JSON files instead of skipping them.",
    )
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    pages_dir = output_dir / "pages"
    pages_dir.mkdir(parents=True, exist_ok=True)

    namespaces = parse_namespaces(args.namespaces, args.all_namespaces)
    existing = {item.get("pageid") for item in load_existing_manifest(output_dir)}
    saved = 0
    skipped = 0

    print(f"Downloading namespaces: {', '.join(map(str, namespaces))}")
    for namespace in namespaces:
        print(f"Namespace {namespace}: listing and fetching pages...")
        for page in iter_pages(namespace):
            if args.limit and saved >= args.limit:
                break
            pageid = page.get("pageid")
            path = pages_dir / page_filename(page)
            if not args.refresh and (pageid in existing or path.exists()):
                skipped += 1
                continue
            path.write_text(json.dumps(page, ensure_ascii=False, indent=2), encoding="utf-8")
            saved += 1
            if saved % 50 == 0:
                print(f"Saved {saved} new pages ({skipped} skipped)...")
        if args.limit and saved >= args.limit:
            break

    write_manifest(output_dir)
    manifest_count = len(load_existing_manifest(output_dir))
    print(f"Done. Saved {saved} new pages, skipped {skipped}, manifest has {manifest_count} pages.")


if __name__ == "__main__":
    main()
