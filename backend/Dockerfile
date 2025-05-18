# Dockerfile para el backend de la aplicación
FROM python:3.9-slim-buster

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Make entrypoint.sh executable
RUN chmod +x entrypoint.sh

# Healthcheck
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD curl --fail http://0.0.0.0:8000/api/ 

# Run entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]

# CMD original (ajústalo a tu framework)
#CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
