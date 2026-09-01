# ==============================================================================
# 📊 META BUSINESS SUITE EXPORT IMPORTER & PARSER (CSV / EXCEL / TSV)
# ==============================================================================

import io
import re
import csv
import logging
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timezone
import pandas as pd
from backend.database.meta_reports_db import MetaReportsDB

logger = logging.getLogger("radar.services.meta_suite_importer")

# In-memory store for fast access
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
    if not s or s == "--":
        return 0
    s = re.sub(r"[^\d.,\-]", "", s)
    if not s:
        return 0

    # Handle European/Latin American number format (e.g. 1.802.964 or 93.380)
    if "." in s and "," in s:
        s = s.replace(".", "").replace(",", ".")
        try:
            return int(float(s))
        except Exception:
            return 0
    elif "." in s and s.count(".") > 1:
        s = s.replace(".", "")
        try:
            return int(s)
        except Exception:
            return 0
    elif "," in s and s.count(",") > 1:
        s = s.replace(",", "")
        try:
            return int(s)
        except Exception:
            return 0
    elif "." in s:
        parts = s.split(".")
        if len(parts) == 2 and len(parts[1]) == 3:
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
        return datetime.now(timezone.utc)
    if isinstance(val, datetime):
        return val
    s = str(val).strip()
    if not s:
        return datetime.now(timezone.utc)

    spanish_months = {
        "ene": "01", "feb": "02", "mar": "03", "abr": "04", "may": "05", "jun": "06",
        "jul": "07", "ago": "08", "sep": "09", "oct": "10", "nov": "11", "dic": "12",
        "enero": "01", "febrero": "02", "marzo": "03", "abril": "04", "mayo": "05", "junio": "06",
        "julio": "07", "agosto": "08", "septiembre": "09", "octubre": "10", "noviembre": "11", "diciembre": "12",
    }

    lowered = s.lower()
    for m_name, m_num in spanish_months.items():
        if m_name in lowered:
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
        "%m/%d/%Y %H:%M:%S",
        "%m/%d/%Y %H:%M",
        "%m/%d/%Y",
        "%d/%m/%Y %H:%M:%S",
        "%d/%m/%Y %H:%M",
        "%d/%m/%Y",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d",
    ]:
        try:
            return datetime.strptime(s, fmt)
        except Exception:
            continue

    return datetime.now(timezone.utc)


class MetaSuiteImporter:
    """
    Parses and ingests official Meta Business Suite export files (CSV, TSV, Excel).
    Normalizes exact columns and persists all records into SQLite MetaReportsDB.
    """

    @classmethod
    def parse_file(cls, filename: str, file_bytes: bytes) -> List[Dict[str, Any]]:
        df = None
        lower_fn = filename.lower()

        if lower_fn.endswith((".csv", ".tsv", ".txt")):
            for enc in ["utf-8-sig", "utf-8", "latin-1", "cp1252"]:
                for sep in ["\t", ",", ";"]:
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

        def find_col(*candidates) -> Optional[str]:
            for c in candidates:
                for norm_key, orig_col in col_map.items():
                    if c in norm_key:
                        return orig_col
            return None

        # Exact column matchers for Meta Business Suite
        id_col = find_col("identificador de la publicación", "identificador de la publicacion", "identificador", "post id", "id")
        page_col = find_col("nombre de la página", "nombre de la pagina", "nombre", "page name")
        title_col = find_col("título", "titulo", "mensaje", "texto", "publicación", "publicacion", "description", "title", "caption", "post message")
        duration_col = find_col("duración (segundos)", "duracion (segundos)", "duración", "duracion", "duration")
        date_col = find_col("hora de publicación", "hora de publicacion", "fecha de publicación", "fecha", "hora", "published", "created", "date", "time", "timestamp")
        url_col = find_col("enlace permanente", "enlace", "url", "link", "permalink")
        type_col = find_col("tipo de publicación", "tipo de publicacion", "tipo de contenido", "tipo", "formato", "type", "content type", "media type")
        
        comments_col = find_col("comentarios", "comments")
        impressions_col = find_col("impresiones", "impressions")
        interaction_col = find_col("interacciones", "interacción", "interaccion", "interactions", "engagement", "actions", "total interactions")
        followers_col = find_col("seguimientos netos", "net follows", "nuevos seguidores", "seguidores netos", "followers gained")
        likes_col = find_col("reacciones", "reactions", "me gusta", "likes")
        saves_col = find_col("veces que se guardó", "veces que se guardo", "saves")
        shares_col = find_col("veces que se compartió", "veces que se compartio", "shares", "compartidos", "compartir")
        views_col = find_col("visualizaciones", "reproducciones", "vistas", "views")
        reach_col = find_col("espectadores", "viewers", "alcance", "personas alcanzadas", "reach")
        watch_time_col = find_col("segundos reproducidos", "tiempo de reproducción", "watch time")

        parsed_posts: List[Dict[str, Any]] = []

        for idx, row in df.iterrows():
            text = _clean_str(row[title_col]) if title_col else ""
            if not text:
                text = f"Publicación #{idx + 1} de Once Noticias"

            dt = _parse_date(row[date_col]) if date_col else datetime.now(timezone.utc)
            page_name = _clean_str(row[page_col]) if page_col else "Once Noticias"

            raw_type = _clean_str(row[type_col]).lower() if type_col else "post"
            if "reel" in raw_type or "carrete" in raw_type:
                post_type = "reel"
            elif "video" in raw_type:
                post_type = "video"
            elif "enlace" in raw_type or "link" in raw_type:
                post_type = "enlace"
            elif "foto" in raw_type or "imagen" in raw_type or "photo" in raw_type or "image" in raw_type:
                post_type = "foto"
            else:
                post_type = "post"

            views = _clean_number(row[views_col]) if views_col else 0
            reach = _clean_number(row[reach_col]) if reach_col else 0
            interactions = _clean_number(row[interaction_col]) if interaction_col else 0
            likes = _clean_number(row[likes_col]) if likes_col else 0
            comments = _clean_number(row[comments_col]) if comments_col else 0
            shares = _clean_number(row[shares_col]) if shares_col else 0
            saves = _clean_number(row[saves_col]) if saves_col else 0
            followers_gained = _clean_number(row[followers_col]) if followers_col else 0
            duration_sec = _clean_number(row[duration_col]) if duration_col else 0
            watch_time_sec = float(_clean_number(row[watch_time_col]) if watch_time_col else 0.0)

            raw_id = _clean_str(row[id_col]) if id_col else ""
            url = _clean_str(row[url_col]) if url_col else ""

            # Extract stable unique ID
            if raw_id and not raw_id.endswith("E+15"):
                post_id = raw_id
            elif "posts/" in url:
                post_id = url.split("posts/")[-1].split("/")[0].split("?")[0]
            elif "reel/" in url:
                post_id = f"reel_{url.split('reel/')[-1].split('/')[0].split('?')[0]}"
            elif raw_id:
                post_id = f"meta_{raw_id}_{int(dt.timestamp())}"
            else:
                post_id = f"meta_suite_{idx+1}_{int(dt.timestamp())}"

            if not url:
                url = f"https://www.facebook.com/OnceNoticiasTV/posts/{post_id}"

            # If interactions not explicitly given, calculate
            if interactions == 0:
                interactions = likes + comments + shares + saves
            if reach == 0 and views > 0:
                reach = int(views * 0.85)

            # Detect platform
            platform = "facebook"
            if "instagram" in lower_fn or "instagram" in page_name.lower() or "instagram.com" in url.lower():
                platform = "instagram"

            parsed_posts.append({
                "id": post_id,
                "page_name": page_name,
                "platform": platform,
                "type": post_type,
                "published_at": dt.isoformat(),
                "text": text,
                "url": url,
                "duration_sec": duration_sec,
                "watch_time_sec": watch_time_sec,
                "source_type": "meta_suite",
                "report_filename": filename,
                "metrics": {
                    "views": views,
                    "impressions": views if views > 0 else reach,
                    "reach": reach,
                    "total_interactions": interactions,
                    "likes": likes,
                    "comments": comments,
                    "shares": shares,
                    "saves": saves,
                    "followers_gained": followers_gained,
                },
            })

        # Persist into SQLite MetaReportsDB
        MetaReportsDB.upsert_posts(parsed_posts, default_source="meta_suite", report_filename=filename)

        global IMPORTED_META_SUITE_POSTS
        IMPORTED_META_SUITE_POSTS = parsed_posts
        logger.info(f"Successfully ingested and persisted {len(parsed_posts)} real posts from Meta Suite ({filename}).")
        return parsed_posts
