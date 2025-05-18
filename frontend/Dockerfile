FROM node:alpine

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Install nginx
RUN apk update && apk add nginx

# Copy static files to nginx directory
RUN rm -rf /usr/share/nginx/html/*
RUN cp -r dist/. /usr/share/nginx/html/

# Copy nginx configuration
RUN cp nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]