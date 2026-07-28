import asyncio
import os
import sys
from dotenv import load_dotenv

# Ensure root dir is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
load_dotenv()

from backend.connectors.facebook.connector import FacebookConnector
from backend.connectors.instagram.connector import InstagramConnector
from backend.connectors.youtube.connector import YouTubeConnector
from backend.connectors.tiktok.connector import TikTokConnector
from backend.ai.engine import AIEngine


async def test_live_all():
    print("=" * 60)
    print(" AFRI-K LIVE API CONNECTORS DIAGNOSTIC SUITE")
    print("=" * 60)

    # 1. Test Facebook
    fb_token = os.getenv("FACEBOOK_PAGE_ACCESS_TOKEN", "")
    print("\n1. Facebook Connector:")
    if not fb_token or "mock" in fb_token:
        print("   [MODO MOCK] Sin token real de Facebook (FACEBOOK_PAGE_ACCESS_TOKEN)")
    else:
        try:
            fb = FacebookConnector(access_token=fb_token)
            auth = await fb.authenticate()
            print(f"   Autenticación: {'[OK] Éxito' if auth else '[FAIL] Fallo'}")
            profile = await fb.get_profile()
            print(f"   Perfil Obtenido: {profile.name} (@{profile.username}) - {profile.followers_count:,} seguidores")
            posts = await fb.get_posts()
            print(f"   Publicaciones obtenidas: {len(posts)} publicaciones")
        except Exception as e:
            print(f"   [ERROR] Al conectar con Facebook Graph API: {e}")

    # 2. Test Instagram
    ig_token = os.getenv("INSTAGRAM_ACCESS_TOKEN", "") or fb_token
    print("\n2. Instagram Connector:")
    if not ig_token or "mock" in ig_token:
        print("   [MODO MOCK] Sin token real de Instagram (INSTAGRAM_ACCESS_TOKEN)")
    else:
        try:
            ig = InstagramConnector(access_token=ig_token)
            auth = await ig.authenticate()
            print(f"   Autenticación: {'[OK] Éxito' if auth else '[FAIL] Fallo'}")
            profile = await ig.get_profile()
            print(f"   Perfil Obtenido: {profile.name} (@{profile.username}) - {profile.followers_count:,} seguidores")
            posts = await ig.get_posts()
            print(f"   Publicaciones obtenidas: {len(posts)} publicaciones")
        except Exception as e:
            print(f"   [ERROR] Al conectar con Instagram Graph API: {e}")

    # 3. Test YouTube
    yt_key = os.getenv("YOUTUBE_API_KEY", "")
    print("\n3. YouTube Connector:")
    if not yt_key or "mock" in yt_key:
        print("   [MODO MOCK] Sin API Key real de YouTube (YOUTUBE_API_KEY)")
    else:
        try:
            yt = YouTubeConnector(api_key=yt_key)
            auth = await yt.authenticate()
            print(f"   Autenticación: {'[OK] Éxito' if auth else '[FAIL] Fallo'}")
            profile = await yt.get_profile()
            print(f"   Canal Obtenido: {profile.name} - {profile.followers_count:,} suscriptores")
            posts = await yt.get_posts()
            print(f"   Videos/Shorts obtenidos: {len(posts)} contenidos")
        except Exception as e:
            print(f"   [ERROR] Al conectar con YouTube Data API v3: {e}")

    # 4. Test TikTok
    tt_token = os.getenv("TIKTOK_ACCESS_TOKEN", "")
    print("\n4. TikTok Connector:")
    if not tt_token or "mock" in tt_token:
        print("   [MODO MOCK] Sin Token real de TikTok (TIKTOK_ACCESS_TOKEN)")
    else:
        try:
            tt = TikTokConnector(access_token=tt_token)
            auth = await tt.authenticate()
            print(f"   Autenticación: {'[OK] Éxito' if auth else '[FAIL] Fallo'}")
            profile = await tt.get_profile()
            print(f"   Cuenta Obtenida: {profile.name} (@{profile.username}) - {profile.followers_count:,} seguidores")
            posts = await tt.get_posts()
            print(f"   Videos obtenidos: {len(posts)} contenidos")
        except Exception as e:
            print(f"   [ERROR] Al conectar con TikTok Display API: {e}")

    # 5. Test AI Engine (Gemini / OpenAI)
    ai_key = os.getenv("GEMINI_API_KEY", "") or os.getenv("OPENAI_API_KEY", "")
    provider = os.getenv("AI_PROVIDER", "gemini")
    print(f"\n5. Motor de Inteligencia con IA ({provider.upper()}):")
    if not ai_key or "mock" in ai_key:
        print(f"   [MODO HEURÍSTICO DEDICADO] Sin clave real de {provider.upper()}")
    else:
        try:
            engine = AIEngine(provider=provider, api_key=ai_key)
            print(f"   Motor de IA configurado exitosamente con proveedor {provider.upper()}")
        except Exception as e:
            print(f"   [ERROR] Al inicializar el proveedor de IA: {e}")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    asyncio.run(test_live_all())
