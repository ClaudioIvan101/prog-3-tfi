# T2 — Revisión del PR #2 y base reutilizable

**Grupo 8 · 8 de noviembre de 2026 · Facu (A), Claudio (B), Martín (C)**

## Resultado

El [PR #2](https://github.com/ClaudioIvan101/prog-3-tfi/pull/2) prepara Express en Docker, configura PostgreSQL, agrega una fábrica de pool y pruebas contra BD real. Es una base reutilizable de infraestructura de desarrollo. **Ya fue fusionado por el equipo antes de esta revisión**, por lo que no corresponde volver a integrarlo ni hacer cherry-pick de sus cambios.

Se puede conservar lo incorporado, con los límites documentados abajo. No demuestra persistencia comercial, integración Python ni cierre de etapa 1. La carga considerada es desarrollo académico local y CI, no producción.

## Referencias exactas y situación del clon

| Referencia | Estado verificado |
| --- | --- |
| Base original del PR | `42f23fa419915a767e75187ba18a5046087c841b` |
| Cabeza del PR, rama `config` | `5c26ce6b56e32568d895df1cc126fc9daa92cd16` |
| `main` remoto actual | `a1fdb6c464c229504cc1c3e3e2b243a336c15ad9` |
| Fusión registrada por GitHub | 7/11/2026, **20:31:22, hora argentina**; PR cerrado y fusionado. |
| Contenido `main` vs. cabeza del PR | `git diff 5c26ce6 a1fdb6c --exit-code`: código 0; árboles iguales. |
| Revisiones formales del PR | La herramienta de GitHub devuelve una lista vacía de reviews. No se acredita revisión humana formal con el merge solamente. |
| Clon del usuario en `prog-3-tfi/` | Permanece limpio en `42f23fa`; no se ejecutó pull, checkout, merge, reset ni fetch en él. |

La revisión y los tests se hicieron en un clon temporal independiente del remoto, cuyo contenido coincide con la cabeza del PR. Los informes previos que describen el PR abierto son antecedentes fechados y no el estado actual.

## Qué podemos conservar de lo ya integrado

| Grupo de archivos | Evaluación | Evidencia y límite |
| --- | --- | --- |
| `express/package.json` y lockfile | Conservar `pg` y Zod. | `npm ci --ignore-scripts` instala correctamente; auditoría sin vulnerabilidades reportadas al revisar. No se cambiaron Express ni el contrato de las rutas. |
| `express/src/config/database-env.js` | Conservar. | Valida textos obligatorios, puerto 1–65535 y contraseña sin recortarla; los errores nombran variables sin imprimir valores. Tests de configuración aprobados. |
| `express/src/infra/postgres.js` | Conservar como fábrica de infraestructura. | Pool con máximo 10 conexiones y tiempos acotados; prueba real de consulta en CI. **No es todavía una dependencia utilizada por el servidor.** |
| `compose.yaml` | Conservar como entorno parcial de desarrollo. | Incluye BD, Mailpit y Express; puertos Express/Mailpit en loopback, PostgreSQL/SMTP internos y volumen persistente. Configuración Compose válida; ejecución local no comprobada. |
| `express/Dockerfile` y `.dockerignore` | Conservar como imagen inicial de la API. | Node 22, instalación por lockfile y usuario `node`. Copia entrypoint, fuentes y tests. No contiene todavía archivos de migración/seed ni un ejecutor para ellos. |
| `.github/workflows/tests.yml` | Conservar. | Node 22, Python 3.13 y PostgreSQL 16 de prueba; ejecuta las suites de backends. No construye ni arranca las imágenes del Compose del proyecto. |
| Tests PostgreSQL agregados | Conservar la consulta SQL y tests de validación. | La consulta verifica `SELECT 1` y nombre de BD; no verifica tablas, migraciones ni reglas de negocio. Hay duplicación de tests de configuración, señalada abajo. |
| Cambios en `src/config/env.js` y `src/app.js` | Compatibles con la base revisada. | No se detectó cambio funcional de rutas por este diff; pasan los tests HTTP y de arranque. |
| `brain/`, `factory/`, `.codex/`, `.agents/`, `.atl/` | Separar del producto al evaluar la entrega. | Son herramientas/contexto de desarrollo ya fusionados. No se invocó la factory ni se borró nada. Sus pruebas no demuestran funcionalidades del TPI. |
| `AGENTS.md` | Contexto de trabajo, no funcionalidad comercial. | Se respeta el alcance explícito T1/T2; no convierte esta revisión en permiso para implementar ni fusionar. |

## Hallazgos que requieren seguimiento

### Deben corregirse para que la documentación de preparación sea confiable

1. **P2 — El README describe un Compose anterior.**
   - **Qué es:** `README.md`, líneas 13–23, presenta solo PostgreSQL y Mailpit y afirma que las APIs no están incluidas.
   - **Problema:** `compose.yaml`, líneas 22–43, ya construye y publica `core-api`. Quien siga el README recibe información incorrecta de los servicios que arranca.
   - **Corrección mínima propuesta:** actualizar la lista de servicios y explicar la diferencia entre disponibilidad de BD, pool probado y persistencia de la API.
   - **Si se omite:** el equipo puede confundir infraestructura integrada con integración funcional o arrancar servicios sin conocer lo publicado. No se editó el README en esta tarea.

2. **P2 — El contexto de arquitectura contiene afirmaciones obsoletas.**
   - **Qué es:** `brain/Architecture.md`, líneas 8 y 16–18; `brain/Project.md`, línea 8; `factory/README.md`, línea 59.
   - **Problema:** describen CommonJS y, en Architecture, un antiguo `get.post(...)`. `express/package.json` declara ESM y `express/index.js` solo importa el servidor.
   - **Corrección mínima propuesta:** actualizar esos pasajes como documentación en un cambio posterior explícito, sin reescribir la arquitectura ni alterar las rutas de ejemplo.
   - **Si se omite:** una persona o asistente puede intentar corregir un error que ya no existe. No es un fallo actual de arranque.

### Límites para aceptar la base y mejoras pequeñas

3. **P2 — La prueba SQL requiere configuración que el flujo local de tests no prepara.**
   - **Qué es:** `express/tests/integration/dbConnection.test.js`, líneas 9–23, usa variables `PG*` del proceso; `package.json`, línea 8, ejecuta `node --test`.
   - **Problema:** el README indica ejecutar `npm test`, pero ese comando no carga el `.env` opcional usado por `npm start`, ni provee una BD. Compose tampoco publica PostgreSQL en el host. Con un clon limpio y ese procedimiento local, la nueva prueba no puede pasar sin preparación adicional.
   - **Corrección mínima propuesta:** documentar el comando de tests con BD y variables explícitas, o usar el contenedor apropiado; la unificación de comandos se mantiene pendiente de T9. No saltar silenciosamente el test SQL.
   - **Si se omite:** CI puede pasar mientras un integrante obtiene una suite fallida siguiendo las instrucciones locales. Esta revisión no modifica scripts ni infraestructura.

4. **P3 — Tres verificaciones de configuración están duplicadas y etiquetadas como integración.**
   - **Qué es:** `tests/integration/databaseEnv.test.js`, líneas 13–31, repite casos de `tests/unit/databaseEnv.test.js` sin abrir una conexión.
   - **Problema:** cuenta como integración algo que vuelve a ejecutar validación pura; no aporta evidencia adicional de BD.
   - **Corrección mínima propuesta:** consolidar los casos únicos como unitarios y conservar `dbConnection.test.js` para integración real.
   - **Si se omite:** crece el mantenimiento y se sobreestima el alcance de pruebas. Es una mejora menor; no bloquea conservar el código.

### Trabajo posterior identificado, sin ejecutarlo

- `createPostgresPool` solo tiene un consumidor actual: `dbConnection.test.js`. Conectar el servidor, agregar `/ready` y cerrar el pool corresponde a **T5**, no a T2.
- Tablas, migraciones y seed siguen ausentes. Su definición/implementación corresponde a **T3/T6**. No se crearon contratos de persistencia ni SQL.
- El Dockerfile no copia `database/`; deberá adaptarse cuando exista el mecanismo de migraciones, no se agrega ahora un ejecutor vacío.
- Python sigue fuera de Compose y no hay adaptador IA falso. Permanecen **T7/T8**; no se agregaron endpoints ni proveedores.
- El registro `.atl/skill-registry.md` incluye rutas absolutas de otra instalación (`C:\Users\Usuario\...`); no acredita que esas skills estén disponibles aquí. Las pruebas de factory validan algunos contratos locales, no esas dependencias del entorno ni un ciclo completo con agentes.

## Pruebas ejecutadas y evidencia

**Fecha:** 8/11/2026. **Versión local:** Node 24.14.1 y Python 3.13.5. La imagen/CI de Express usa Node 22; no se presenta la ejecución local en Node 24 como una prueba del Dockerfile Node 22.

Directorio temporal de la revisión: `C:/Users/juanm/AppData/Local/Temp/grupo8-t1-t2-e70852e13764437bb2d6bb099bab4b20`.

| Verificación | Comando / contexto | Resultado observado |
| --- | --- | --- |
| Instalación Express | En `express/`: `npm.cmd ci --ignore-scripts --no-audit --no-fund` | Correcta, 83 paquetes instalados. |
| Suite Express local | En `express/`: `npm.cmd test`, con valores PG ficticios y destino deliberadamente no disponible `127.0.0.1:1` | **28 aprobadas, 1 fallida**, de 29; salida 1. Falla únicamente la consulta SQL con `ECONNREFUSED`. No se declara suite completa aprobada localmente. |
| Suite Python | En `python/`: `python -B -m unittest discover -s tests -v` | **15/15 aprobadas**. |
| Contratos auxiliares factory | En raíz: `python -B -m unittest discover -s factory/tests -v` | **4/4 aprobadas**; una de estas pruebas ejecuta también la suite de dashboard. No inicia agentes ni jobs. |
| Dashboard auxiliar | En raíz: `node --test factory/tests/dashboard.test.mjs` | **7/7 aprobadas**. Es la suite incluida en el test anterior, comprobada también directamente; no contar como 11 casos independientes de factory. |
| Auditoría npm | En `express/`: `npm.cmd audit --omit=dev --json` | **0 vulnerabilidades reportadas**, salida 0. No equivale a auditoría de seguridad de la aplicación. |
| Compose | `docker compose -f compose.yaml config --quiet`, con `POSTGRES_*` ficticios solo en el proceso | Válido, salida 0; no se imprimieron credenciales de usuario. |
| Disponibilidad Docker | `docker info --format '{{.ServerVersion}}'` | Motor Linux no disponible: pipe `dockerDesktopLinuxEngine` inexistente. No se ejecutó build/up ni se arrancó Docker Desktop. |
| CI del PR | [Run 41691781060](https://github.com/ClaudioIvan101/prog-3-tfi/actions/runs/41691781060), cabeza `5c26ce6` | Jobs Express y Python exitosos. Logs Express: **29 tests, 29 pass, 0 fail**, incluida consulta PostgreSQL. Evidencia remota histórica, no nueva ejecución lanzada por esta revisión. |
| Equivalencia y conservación | Diff entre cabeza del PR y `main` remoto; status de clones | Árboles iguales. Sin cambios de fuentes en el clon temporal ni modificaciones en el clon del usuario. |

Se eligió un destino SQL ficticio no disponible para no conectar los tests a una BD existente del usuario. Se comprobó el resto de la suite y el fallo de conexión se mantuvo visible. La integración SQL exitosa está respaldada por los logs de CI, no por una conexión local simulada.

## Dictamen de integración

**Conservar la infraestructura ya fusionada.** No se detectó una regresión funcional en los tests disponibles que justifique revertir el PR. La validación del arranque Docker queda pendiente; los resultados locales no permiten certificar un clon limpio completo.

Antes de usar los documentos del repositorio como procedimiento del equipo, corregir los hallazgos 1 y 2 y aclarar el flujo local de tests del hallazgo 3. Esas correcciones están propuestas, no ejecutadas. No reintroducir los commits del PR en `main` ni dar T3–T10 por terminadas.

**T2 entregada:** revisión de archivos, evidencias y clasificación de lo reutilizable. No se emitió aprobación formal en GitHub, no se enviaron comentarios al equipo, no se lanzaron workflows, no se actualizaron ramas y no se cambió código.

## Fuentes verificables

- [Diff exacto del PR](https://github.com/ClaudioIvan101/prog-3-tfi/compare/42f23fa419915a767e75187ba18a5046087c841b...5c26ce6b56e32568d895df1cc126fc9daa92cd16).
- [Merge registrado en main](https://github.com/ClaudioIvan101/prog-3-tfi/commit/a1fdb6c464c229504cc1c3e3e2b243a336c15ad9).
- [Pool PostgreSQL](https://github.com/ClaudioIvan101/prog-3-tfi/blob/5c26ce6b56e32568d895df1cc126fc9daa92cd16/express/src/infra/postgres.js#L4-L26) y [servidor](https://github.com/ClaudioIvan101/prog-3-tfi/blob/5c26ce6b56e32568d895df1cc126fc9daa92cd16/express/src/server.js#L1-L24).
- [README desactualizado](https://github.com/ClaudioIvan101/prog-3-tfi/blob/5c26ce6b56e32568d895df1cc126fc9daa92cd16/README.md#L13-L23) y [Compose actual](https://github.com/ClaudioIvan101/prog-3-tfi/blob/5c26ce6b56e32568d895df1cc126fc9daa92cd16/compose.yaml#L22-L43).
- [Prueba SQL](https://github.com/ClaudioIvan101/prog-3-tfi/blob/5c26ce6b56e32568d895df1cc126fc9daa92cd16/express/tests/integration/dbConnection.test.js#L5-L26), [configuración unitaria](https://github.com/ClaudioIvan101/prog-3-tfi/blob/5c26ce6b56e32568d895df1cc126fc9daa92cd16/express/tests/unit/databaseEnv.test.js) y [configuración duplicada](https://github.com/ClaudioIvan101/prog-3-tfi/blob/5c26ce6b56e32568d895df1cc126fc9daa92cd16/express/tests/integration/databaseEnv.test.js).
- [Contexto de arquitectura](https://github.com/ClaudioIvan101/prog-3-tfi/blob/5c26ce6b56e32568d895df1cc126fc9daa92cd16/brain/Architecture.md#L8-L18) y [entrypoint ESM](https://github.com/ClaudioIvan101/prog-3-tfi/blob/5c26ce6b56e32568d895df1cc126fc9daa92cd16/express/index.js).
- [Decisiones T1 confirmadas](./DECISIONES_CONFIRMADAS_T1.md) y [plan de referencia](./PLAN_IMPLEMENTACION_ETAPA_1.md).

**No comprobado:** build/arranque Docker, envío SMTP, ejecución de un job completo de factory ni funcionalidades de negocio. No se cambiaron implementación ni configuración para sortear estas limitaciones.
