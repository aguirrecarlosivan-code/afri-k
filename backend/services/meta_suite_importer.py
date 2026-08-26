# ==============================================================================
# 📊 META BUSINESS SUITE EXPORT IMPORTER & PARSER (CSV / EXCEL)
# ==============================================================================

import io
import re
import csv
import logging
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime
import pandas as pd

logger = logging.getLogger("radar.services.meta_suite_importer")

# In-memory store for uploaded Meta Business Suite real records
IMPORTED_META_SUITE_POSTS: List[Dict[str, Any]] = []


def _clean_str(val: Any) -> str:
    if val is None or pd.isna(val):
        return ""
    return str(val).strip()


def _clean_number(val: Any) -> int:
    if val is None or pd.isna(val):
        return 0
    if isinstance(val, (int, float)):
        return int(val)
    s = str(val).strip()
    if not s:
        return 0
    # Remove currency or percentage symbols if any
    s = re.sub(r"[^\d.,\-]", "", s)
    if not s:
        return 0
    # Handle European/Latin American number format (e.g. 1.802.964 or 93.380)
    if "." in s and "," in s:
        # e.g. 1.802.964,50 -> 1802964
        s = s.replace(".", "").replace(",", ".")
        try:
            return int(float(s))
        except Exception:
            return 0
    elif "." in s and s.count(".") > 1:
        # e.g. 1.802.964
        s = s.replace(".", "")
        try:
            return int(s)
        except Exception:
            return 0
    elif "," in s and s.count(",") > 1:
        # e.g. 1,802,964
        s = s.replace(",", "")
        try:
            return int(s)
        except Exception:
            return 0
    elif "." in s:
        # Determine if dot is thousands separator or decimal:
        parts = s.split(".")
        if len(parts) == 2 and len(parts[1]) == 3:
            # likely thousands separator e.g. 93.380
            s = s.replace(".", "")
            try:
                return int(s)
            except Exception:
                return 0
        else:
            try:
                return int(float(s))
            except Exception:
                return 0
    elif "," in s:
        parts = s.split(",")
        if len(parts) == 2 and len(parts[1]) == 3:
            # likely thousands separator e.g. 93,380
            s = s.replace(",", "")
            try:
                return int(s)
            except Exception:
                return 0
        else:
            try:
                return int(float(s.replace(",", ".")))
            except Exception:
                return 0
    try:
        return int(s)
    except Exception:
        return 0


def _parse_date(val: Any) -> datetime:
    if val is None or pd.isna(val):
        return datetime.utcnow()
    if isinstance(val, datetime):
        return val
    s = str(val).strip()
    if not s:
        return datetime.utcnow()

    # Common Meta Suite date formats in Spanish and English
    # e.g., "24 de ago. a las 12:26", "24/08/2026 12:26", "2026-08-24 12:26:00"
    spanish_months = {
        "ene": "01", "feb": "02", "mar": "03", "abr": "04", "may": "05", "jun": "06",
        "jul": "07", "ago": "08", "sep": "09", "oct": "10", "nov": "11", "dic": "12",
        "enero": "01", "febrero": "02", "marzo": "03", "abril": "04", "mayo": "05", "junio": "06",
        "julio": "07", "agosto": "08", "septiembre": "09", "octubre": "10", "noviembre": "11", "diciembre": "12",
    }

    lowered = s.lower()
    for m_name, m_num in spanish_months.items():
        if m_name in lowered:
            # Try to match patterns like "24 de ago" or "24 ago"
            match = re.search(r"(\d{1,2})\s+(?:de\s+)?([a-z]+)", lowered)
            if match:
                day = int(match.group(1))
                time_match = re.search(r"(\d{1,2}):(\d{2})", lowered)
                hour = int(time_match.group(1)) if time_match else 12
                minute = int(time_match.group(2)) if time_match else 0
                if "p. m." in lowered or "pm" in lowered or "p" in lowered:
                    if hour < 12:
                        hour += 12
                return datetime(2026, int(m_num), day, hour, minute)

    for fmt in [
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d",
        "%d/%m/%Y %H:%M:%S",
        "%d/%m/%Y %H:%M",
        "%d/%m/%Y",
        "%m/%d/%Y %H:%M:%S",
        "%m/%d/%Y %H:%M",
        "%m/%d/%Y",
    ]:
        try:
            return datetime.strptime(s, fmt)
        except Exception:
            continue

    return datetime.utcnow()


class MetaSuiteImporter:
    """
    Parses and ingests Meta Business Suite export files (CSV / Excel).
    Converts exact columns from Meta Content Library into normalized records.
    """

    @classmethod
    def parse_file(cls, filename: str, file_bytes: bytes) -> List[Dict[str, Any]]:
        df = None
        lower_fn = filename.lower()

        if lower_fn.endswith(".csv"):
            # Try different encodings and separators with dtype=str to preserve exact thousands formatting
            for enc in ["utf-8-sig", "utf-8", "latin-1", "cp1252"]:
                for sep in [",", ";", "\t"]:
                    try:
                        df = pd.read_csv(io.BytesIO(file_bytes), encoding=enc, sep=sep, dtype=str)
                        if len(df.columns) > 2 and len(df) > 0:
                            break
                    except Exception:
                        continue
                if df is not None and len(df.columns) > 2 and len(df) > 0:
                    break
        elif lower_fn.endswith((".xlsx", ".xls")):
            try:
                df = pd.read_excel(io.BytesIO(file_bytes), dtype=str)
            except Exception as e:
                logger.error(f"Error reading Excel file: {e}")
                raise ValueError(f"No se pudo leer el archivo Excel: {e}")

        if df is None or len(df) == 0:
            raise ValueError("El archivo está vacío o el formato no es compatible.")

        # Normalize column names for matching
        col_map = {}
        for col in df.columns:
            norm_col = str(col).lower().strip()
            norm_col = re.sub(r"[\s_]+", " ", norm_col)
            col_map[norm_col] = col

        # Helper to find column from candidates
        def find_col(*candidates) -> Optional[str]:
            for c in candidates:
                for norm_key, orig_col in col_map.items():
                    if c in norm_key:
                        return orig_col
            return None

        title_col = find_col("título", "titulo", "mensaje", "texto", "publicación", "publicacion", "description", "title", "caption", "post message")
        date_col = find_col("hora de publicación", "fecha de publicación", "fecha", "hora", "published", "created", "date", "time", "timestamp")
        type_col = find_col("tipo de contenido", "tipo", "formato", "type", "content type", "media type")
        views_col = find_col("visualizaciones", "reproducciones", "vistas", "views", "impressions", "impresiones")
        reach_col = find_col("espectadores", "alcance", "personas alcanzadas", "reach", "unique viewers")
        interaction_col = find_col("interacción", "interaccion", "interacciones", "engagement", "actions", "total interactions")
        likes_col = find_col("reacciones", "me gusta", "likes", "reactions")
        comments_col = find_col("comentarios", "comments")
        shares_col = find_col("veces que se compartió", "veces que se compartio", "compartidos", "compartir", "shares")
        followers_col = find_col("seguimientos netos", "nuevos seguidores", "seguidores netos", "followers gained", "net followers")
        url_col = find_col("enlace permanente", "enlace", "url", "link", "permalink", "id")

        parsed_posts: List[Dict[str, Any]] = []

        for idx, row in df.iterrows():
            text = _clean_str(row[title_col]) if title_col else ""
            if not text:
                text = f"Publicación #{idx + 1} de Meta Business Suite"

            dt = _parse_date(row[date_col]) if date_col else datetime.utcnow()

            raw_type = _clean_str(row[type_col]).lower() if type_col else "video"
            if "reel" in raw_type or "carrete" in raw_type:
                post_type = "reel"
            elif "video" in raw_type:
                post_type = "video"
            elif "foto" in raw_type or "imagen" in raw_type or "photo" in raw_type or "image" in raw_type:
                post_type = "post"
            else:
                post_type = "video"

            views = _clean_number(row[views_col]) if views_col else 0
            reach = _clean_number(row[reach_col]) if reach_col else 0
            interactions = _clean_number(row[interaction_col]) if interaction_col else 0
            likes = _clean_number(row[likes_col]) if likes_col else 0
            comments = _clean_number(row[comments_col]) if comments_col else 0
            shares = _clean_number(row[shares_col]) if shares_col else 0
            followers_gained = _clean_number(row[followers_col]) if followers_col else 0
            url = _clean_str(row[url_col]) if url_col else f"https://www.facebook.com/185059331531730/posts/{idx+1}"

            # Fallbacks if some metrics are inferred
            if interactions == 0 and (likes > 0 or comments > 0 or shares > 0):
                interactions = likes + comments + shares
            if likes == 0 and interactions > 0:
                likes = max(0, interactions - comments - shares)
            if reach == 0 and views > 0:
                reach = int(views * 0.85)

            # Platform detection
            platform = "facebook"
            if "instagram" in lower_fn or "instagram" in url.lower() or "@" in text:
                platform = "instagram"

            parsed_posts.append({
                "id": f"meta_suite_{idx+1}_{int(dt.timestamp())}",
                "platform": platform,
                "type": post_type,
                "published_at": dt.isoformat(),
                "text": text,
                "url": url if url.startswith("http") else f"https://www.facebook.com/185059331531730/posts/{url}",
                "metrics": {
                    "views": views,
                    "impressions": views if views > 0 else reach,
                    "reach": reach if reach > 0 else views,
                    "total_interactions": interactions,
                    "likes": likes,
                    "comments": comments,
                    "shares": shares,
                    "followers_gained": followers_gained,
                },
            })

        global IMPORTED_META_SUITE_POSTS
        IMPORTED_META_SUITE_POSTS = parsed_posts
        logger.info(f"Successfully imported {len(parsed_posts)} real posts from Meta Suite ({filename}).")
        return parsed_posts
