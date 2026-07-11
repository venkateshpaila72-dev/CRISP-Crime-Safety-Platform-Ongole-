"""
Extracts a representative image URL from an already-fetched article page.
Tries Open Graph / Twitter Card meta tags first (most reliable, used by
essentially every news outlet for their share-preview image), then falls
back to the first reasonably large <img> in the article body.
"""

from urllib.parse import urljoin

from bs4 import BeautifulSoup

MIN_FALLBACK_IMG_WIDTH = 300  # skip tiny icons/logos when falling back


def extract_image_url(html: str, page_url: str) -> str | None:
    try:
        soup = BeautifulSoup(html, "html.parser")
    except Exception:
        return None

    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):
        return urljoin(page_url, og_image["content"].strip())

    twitter_image = soup.find("meta", attrs={"name": "twitter:image"})
    if twitter_image and twitter_image.get("content"):
        return urljoin(page_url, twitter_image["content"].strip())

    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src")
        if not src:
            continue
        width = img.get("width")
        try:
            if width and int(width) < MIN_FALLBACK_IMG_WIDTH:
                continue
        except ValueError:
            pass
        return urljoin(page_url, src.strip())

    return None