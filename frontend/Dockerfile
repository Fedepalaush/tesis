########################
# ① Etapa de build SPA
########################
FROM node:21-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci          # reproducible y más rápido que ‘npm install’
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

# --- Directorio donde montaremos los estáticos de Django ---
#    (no se crea aquí porque vendrá como volumen)
VOLUME ["/static"]

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
