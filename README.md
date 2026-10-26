# Proyecto inmobiliario — Programación IV

El repositorio contiene dos backends independientes: Express y Python.
Actualmente incluyen la base HTTP y verificaciones de estado; todavía no hay
persistencia ni funcionalidades de gestión inmobiliaria.

## Backend Express

Requiere Node.js 22.9 o superior. Desde la raíz del repositorio:

```bash
cd express
npm ci
npm start
```

La API estará disponible en `http://localhost:3000`; el estado se consulta en
`GET /health`. Opcionalmente, copiar `express/.env.example` a `express/.env`
antes de iniciarla para configurar `HOST`, `PORT` y `NODE_ENV`.

Pruebas: ejecutar `npm test` desde `express/`.

## Backend Python

Verificado con Python 3.13, sin dependencias externas. Desde la raíz:

```bash
cd python
python -m backend
```

El estado se consulta en `http://127.0.0.1:8000/health`.
Pruebas: ejecutar `python -m unittest discover -s tests -v` desde `python/`.
Este backend toma `HOST` y `PORT` del entorno del proceso; no carga `.env`.

Detener cualquiera de los servidores con Ctrl+C.

## Documentación

- [Estructura y configuración de Express](express/README.md)
- [Uso y límites del backend Python](python/README.md)
- [Controles de seguridad pendientes](express/docs/security.md)
