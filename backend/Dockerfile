# Imagen de desarrollo del sitio publico y la API. Los settings de produccion llegan con el primer despliegue.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

COPY requirements.txt .
RUN python -m pip install -r requirements.txt

COPY . .

# El codigo queda en solo lectura; el usuario de la app solo necesita crear db.sqlite3 en /app.
RUN useradd --create-home --uid 1000 app && chown app:app /app
USER app

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py runserver 0.0.0.0:8000"]
