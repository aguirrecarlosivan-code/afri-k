# Checklist de Despliegue en Producción & Pruebas en Vivo - Radar

Este documento guía el proceso completo de validación local, configuración de APIs reales y despliegue seguro en tu servidor VPS.

---

## 📋 Lista de Verificación Paso a Paso

### 1. Validación Local Completada ✅
- [x] Backend FastAPI corriendo en puerto `8000`.
- [x] Frontend React 18 + Vite compilado y servido por Nginx en puerto `80`.
- [x] Proxy Nginx redirigiendo `/api/v1/` al backend en contenedor (`http://radar_backend:8000/api/`).
- [x] Endpoints REST retornando respuestas `200 OK`.
- [x] Servidor de descargas directas en PDF, PPTX, JSON y CSV validado.
- [x] Suite de 20 pruebas unitarias en verde (`pytest`).

---

## 🔑 2. Configuración de Credenciales de Producción (`.env`)

En tu servidor VPS, crea o edita el archivo `/opt/radar/.env` sustituyendo los valores de prueba por tus claves oficiales:

```ini
# Base de Datos PostgreSQL
POSTGRES_USER=radar_user
POSTGRES_PASSWORD=cambiar_por_password_compleja_aqui
POSTGRES_DB=radar_db
DATABASE_URL=postgresql+asyncpg://radar_user:cambiar_por_password_compleja_aqui@postgres:5432/radar_db

# Redis Cache
REDIS_URL=redis://redis:6379/0

# Meta Connectors (Facebook & Instagram Graph API v21.0)
META_APP_ID=tu_app_id_meta
META_APP_SECRET=tu_app_secret_meta
FACEBOOK_PAGE_ACCESS_TOKEN=tu_token_de_pagina_facebook
INSTAGRAM_ACCOUNT_ID=tu_instagram_business_account_id

# YouTube Data API v3
YOUTUBE_API_KEY=AIzaSy_tu_clave_de_google_cloud

# TikTok Display API
TIKTOK_CLIENT_KEY=tu_client_key_tiktok
TIKTOK_ACCESS_TOKEN=tu_access_token_tiktok

# Motor de Inteligencia con IA (Gemini u OpenAI)
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy_tu_gemini_key
OPENAI_API_KEY=
```

---

## 🖥️ 3. Pasos de Instalación en el VPS (Servidor Linux Ubuntu/Debian)

### Paso A: Preparar el servidor VPS
```bash
# 1. Actualizar paquetes del sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar Docker y Docker Compose
sudo apt install -y docker.io docker-compose git

# 3. Habilitar inicio automático de Docker
sudo systemctl enable --now docker
```

### Paso B: Desplegar la Aplicación Radar
```bash
# 1. Clonar el repositorio en /opt/radar
sudo git clone <tu-repo-url> /opt/radar
cd /opt/radar

# 2. Crear archivo de credenciales .env
sudo cp .env.example .env
sudo nano .env   # Editar con tus claves reales

# 3. Levantar contenedores Docker en segundo plano
cd docker
sudo docker-compose up --build -d
```

### Paso C: Verificar que todos los contenedores están saludables
```bash
sudo docker-compose ps
```
Deberías ver 4 contenedores en estado `Up`:
- `radar_postgres`
- `radar_redis`
- `radar_backend`
- `radar_frontend`

---

## 🔒 4. Configurar Certificado SSL Gratuito (HTTPS con Let's Encrypt)

Para que tu equipo acceda de forma segura vía `https://radar.tudominio.com`:

```bash
# 1. Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# 2. Generar y aplicar certificado SSL
sudo certbot --nginx -d radar.tudominio.com
```

---

## 🩺 5. Comandos de Mantenimiento y Logs en Producción

- **Ver logs del Backend**:
  ```bash
  sudo docker logs -f radar_backend
  ```
- **Ver logs de Sincronización Automática (Scheduler)**:
  ```bash
  sudo docker exec -it radar_backend tail -n 100 /app/logs/scheduler.log
  ```
- **Reiniciar la Plataforma**:
  ```bash
  sudo docker-compose restart
  ```
