# Guía de Despliegue Autónomo 24/7 en VPS - Radar

Esta guía explica paso a paso cómo desplegar **Radar** en un servidor VPS (Ubuntu/Debian) para que funcione de manera 100% autónoma 24/7. El equipo de trabajo solo accederá a la dirección URL web para consultar métricas y descargar reportes.

---

## 🎯 Objetivo de la Arquitectura en VPS
- **Backend & Scheduler (APScheduler)**: Ejecución 24/7 en segundo plano. Sincroniza métricas cada hora y genera reportes los viernes 22:00.
- **Base de Datos (PostgreSQL)**: Persistencia de datos históricos.
- **Frontend (Nginx + React)**: Servidor web rápido donde el equipo ingresa, analiza y descarga PDFs/PowerPoints.
- **Cero Fricción para el Equipo**: Credenciales y tokens se configuran **una sola vez** en el archivo `.env` del VPS por el administrador.

---

## 📋 Pasos de Despliegue en el VPS

### 1. Clonar o Copiar la Carpeta del Proyecto al VPS
```bash
git clone https://github.com/tu-usuario/radar.git /opt/radar
cd /opt/radar
```

### 2. Configurar el Archivo `.env` en el Servidor
Crea o edita el archivo `.env` en el servidor con las llaves de producción:

```env
# Configuración del Sistema
APP_NAME=Radar
APP_ENV=production
DEBUG=False
SECRET_KEY=clave_super_secreta_de_produccion

# Credenciales de Meta (Configuradas 1 sola vez por el Admin)
FACEBOOK_PAGE_ACCESS_TOKEN=tu_token_de_pagina_larga_duracion
INSTAGRAM_ACCOUNT_ID=tu_instagram_business_id
INSTAGRAM_ACCESS_TOKEN=tu_token_instagram

# Llave del Motor de IA (Gemini u OpenAI)
AI_PROVIDER=gemini
GEMINI_API_KEY=tu_gemini_api_key_real
AI_MODEL_NAME=gemini-2.5-flash

# Programador 24/7
SCHEDULER_ENABLED=True
WEEKLY_REPORT_CRON_DAY=fri
WEEKLY_REPORT_CRON_HOUR=22
WEEKLY_REPORT_CRON_MINUTE=00
```

---

### 3. Iniciar Servicios Autónomos con Docker Compose
```bash
cd /opt/radar/docker
docker compose up --build -d
```

Verifica que los 4 contenedores estén en estado `Up`:
```bash
docker compose ps
```

---

### 4. Configurar Dominio y Certificado SSL (HTTPS Gratis con Certbot)

Para que tu equipo acceda mediante un dominio seguro (ej. `https://radar.tuempresa.com`):

```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
```

Crea el archivo de configuración `/etc/nginx/sites-available/radar`:
```nginx
server {
    server_name radar.tuempresa.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Activa el sitio y genera el certificado SSL:
```bash
sudo ln -s /etc/nginx/sites-available/radar /etc/nginx/sites-enabled/
sudo certbot --nginx -d radar.tuempresa.com
```

---

## 👥 Experiencia del Equipo Final
1. Tu equipo ingresa a `https://radar.tuempresa.com`.
2. Observa directamente el Dashboard con KPIs, comparativas y análisis de IA.
3. Descarga con 1 clic reportes en **PDF, PowerPoint, JSON y CSV**.
4. **Cero solicitudes de tokens o claves** para los usuarios del equipo.
