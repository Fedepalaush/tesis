########################
# ① Etapa de build SPA
########################
FROM node:20-alpine AS builder

# Install Python and build dependencies for native modules (canvas)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build   # genera ‘dist/’

########################
# ② Etapa Nginx final
########################
FROM nginx:1.25-alpine

# --- Copiamos el artefacto SPA ---
COPY --from=builder /app/dist/ /var/www/frontend/

# --- Copiamos la configuración de Nginx ---
COPY nginx.conf /etc/nginx/conf.d/default.conf

# --- Montamos el volumen donde estarán los estáticos de Django ---
VOLUME ["/static"]

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
