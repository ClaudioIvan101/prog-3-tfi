# Plan de implementación — Etapa 1 del TPI inmobiliario

**Grupo 8 · Revisión del 6 de noviembre de 2026**

**Estado del documento:** plan con T1 documentada y T2 revisada el 8/11; T3–T10 pendientes. Su existencia no acredita implementación ni autoriza fusiones.

**Integrantes confirmados:** **Facu (A), Claudio (B), Martín (C)**.

### Actualización T1/T2 — 8 de noviembre de 2026

Se ejecutaron únicamente el registro de decisiones T1 y la revisión T2. Los acuerdos vigentes están en [DECISIONES_CONFIRMADAS_T1.md](./DECISIONES_CONFIRMADAS_T1.md) y la evidencia técnica en [REVISION_PR_2_T2.md](./REVISION_PR_2_T2.md).

Estos acuerdos prevalecen sobre las propuestas del 6/11 que siguen abajo como antecedente: alcance inmobiliario básico sin reglas adicionales de compra/alquiler; estados de lead en español; JWT y tres roles; IA para conversar, extraer información y resumir; puntaje calculado por Express; asignación manual del supervisor; notificaciones desde Express con Mailpit; Python dedicado a IA. El modelo detallado de la sección 4 y las especificaciones posteriores siguen siendo propuestas pendientes de T3 en adelante, no decisiones aprobadas ni trabajo ejecutado.

El PR #2 ya estaba fusionado al iniciar esta revisión: merge `a1fdb6c464c229504cc1c3e3e2b243a336c15ad9`, del 7/11. Las referencias de este plan a un PR abierto describen la situación del 6/11. No se realizó ninguna fusión ni actualización del clon de trabajo durante T1/T2.

**Estado de tareas:** T1 documentada con las confirmaciones del equipo; T2 revisada con límites de verificación explícitos; **T3–T10 no ejecutadas**. No hay autorización para avanzar a T3.

## 1. Objetivo y límites

Cerrar la etapa **«Definir el sistema y preparar el entorno»**: un proyecto reproducible, un modelo inmobiliario documentado, contratos acordados, PostgreSQL con migraciones y datos ficticios, y un primer adaptador de IA falso que permita trabajar sin proveedor externo.

La referencia principal es `Plan_de_trabajo.pdf` (referencia privada local, no versionada), especialmente la etapa 1 de la página 4 y la arquitectura, modelo y contrato de las páginas 6–9. El usuario confirmó que el dominio definitivo es **inmobiliario**: las referencias del PDF a servicios digitales no definen los campos del proyecto.

En esta etapa se decide y prepara la base. **No se implementan CRUD comerciales, login, permisos operativos, scoring, asignaciones, envío de notificaciones, proveedor LLM real, integración comercial Express–Python, worker, cola, recalificación ni métricas de negocio.** Las decisiones y esquemas necesarios para esas funcionalidades sí se documentan.

El formulario es un canal de captación; no se construye una interfaz visual ni un catálogo de propiedades. Se conserva el canal de mensajería simulada como parte del alcance futuro.

## 2. Estado real que se toma como punto de partida

Se consultaron el clon local, las referencias remotas y el PR el **6/11/2026**. El árbol de trabajo local está limpio.

| Elemento | Evidencia actual | Consecuencia para la etapa 1 |
| --- | --- | --- |
| `main` | Commit `42f23fa419915a767e75187ba18a5046087c841b`. Express ESM y Python WSGI independientes; Compose con PostgreSQL 16 y Mailpit. | Preservar las APIs mínimas y sus pruebas. No atribuir a `main` los cambios del PR. |
| [PR #2](https://github.com/ClaudioIvan101/prog-3-tfi/pull/2) | Abierto, sin fusionar; rama `config`, commit `5c26ce6b56e32568d895df1cc126fc9daa92cd16`. Añade Dockerfile Express, servicio `core-api`, `pg`, Zod, pool, validación PostgreSQL y CI con BD. | Reutilizar esta infraestructura como base de trabajo propuesta, sujeta a revisión. No rehacerla. |
| Pool PostgreSQL | `express/src/infra/postgres.js` exporta `createPostgresPool`; el servidor no lo consume. | Falta composición, comprobación de BD y cierre del pool. Un test SQL exitoso no equivale a una API conectada. |
| Modelo y persistencia | Servicios, repositorios y migraciones de negocio siguen vacíos; no hay tablas de dominio. | Definir primero el modelo; implementar únicamente la base de esquema acordada. |
| Usuarios de ejemplo | `GET /users` devuelve datos fijos; `POST /users` devuelve 501. | Conservar comportamiento y tests. No convertir estas rutas en CRUD durante esta etapa. |
| Python | Solo health y errores HTTP mínimos; biblioteca estándar, sin proveedor IA. | Conservar el servidor local; agregar contenedor y adaptador falso aislado, sin proveedor real. |
| Documentación del PR | `brain/Architecture.md` todavía menciona CommonJS y un antiguo `get.post(...)` que no aparece en el entrypoint actual. | Corregir el contexto desactualizado al ejecutar las tareas documentales; no tratar ese error histórico como un fallo vigente. |
| CI del PR | [Ejecución 41691781060](https://github.com/ClaudioIvan101/prog-3-tfi/actions/runs/41691781060): resultado exitoso para el commit revisado. No hay revisiones formales registradas en el PR al consultar. | Conservar las pruebas existentes y añadir aceptación de infraestructura; un CI verde no cierra toda la etapa. |

**Límite de la verificación actual:** no se reinstalaron dependencias ni se repitieron las suites en esta revisión. El informe del 4/11 registró 21 pruebas Express y 15 Python aprobadas en `main`; son evidencia anterior. Se volvió a comprobar que el motor Linux de Docker no está disponible en este equipo. El arranque de contenedores y las futuras pruebas de cierre deberán ejecutarse con Docker activo.

## 3. Decisiones que deben quedar escritas antes de programar

Estas son propuestas concretas para acordar entre los tres. No son comportamientos ya implementados.

| Decisión | Propuesta para cerrar etapa 1 | Responsable / revisión |
| --- | --- | --- |
| Dominio | Captación inmobiliaria: intención de compra/alquiler, tipo de inmueble, zona, presupuesto con moneda, plazo y datos de contacto. Datos desconocidos permanecen ausentes o `null`, nunca cero por defecto. | B / A y Martín |
| Express | Propietario de usuarios, campañas, leads, conversaciones, reglas, puntajes, asignaciones y persistencia comercial. | A / B |
| Python | Gateway sin BD propia: interpretación estructurada y acceso futuro al proveedor. No calcula puntajes ni decide asignaciones. | Martín / A |
| Notificaciones | Responsabilidad de Express, con puerto SMTP; Mailpit será el destino de desarrollo. Su registro transaccional y entrega se implementarán después. | A / Martín |
| Autenticación | Documentar la estrategia JWT asimétrico corto y rotación de refresh del PDF; cuentas internas con roles administrador, supervisor y vendedor. El lead no inicia sesión. Definir matriz de acceso y manejo seguro de su conversación pública. | A / B y Martín |
| Servicio a servicio | Contrato con JWT de servicio, emisor/audiencia, expiración y encabezados requeridos. Solo diseño y ejemplos ficticios en esta etapa. | Martín / A |
| Asignación | Proponer asignación por supervisor a vendedor activo; cualquier automatismo posterior debe tener política explícita. La IA nunca elige vendedor. | B / A |
| Estructura | Mantener `express/`, `python/`, `compose.yaml`, ESM y tests existentes. Adaptar la arquitectura hexagonal dentro de las carpetas actuales. | A / Martín |

Registrar estas decisiones en documentos propios del proyecto y ADR breves con alternativas. No es necesario implementar ahora las decisiones técnicas de concurrencia y worker previstas para etapas posteriores. Tampoco se deben renumerar las decisiones de herramientas que ya existen en `brain/Decisions/` como si fueran ADR del producto.

La evaluación específica de Python y cualquier diferencia con la consigna docente original deben quedar como consulta docente identificada. No se dispone de esa consigna para afirmar que ya fue contrastada. Si una respuesta cambia el contrato o el modelo, se resuelve antes de dar por aceptados esos entregables.

## 4. Modelo de datos inicial

**Responsable B, revisión A y Martín.** Entregable futuro: `docs/modelo.md` con diagrama de relaciones, diccionario de campos, nulabilidad, restricciones y transiciones permitidas.

### Base a materializar mediante migraciones de etapa 1

| Tabla propuesta | Campos y relaciones mínimos |
| --- | --- |
| `users` | UUID, nombre, correo único normalizado, hash de contraseña, rol cerrado, estado y fechas. No almacenar contraseñas en texto plano. |
| `campaigns` | UUID, nombre, descripción, objetivo, estado y fechas. |
| `campaign_channels` | Campaña y canal permitido; par único para permitir varios canales por campaña. |
| `leads` | UUID, contacto, campaña opcional, canal, intención, tipo de inmueble, zona, presupuesto mínimo/máximo, moneda, plazo y estado inicial. |
| `conversations` | UUID, lead obligatorio, estado, inicio y última actividad. |
| `messages` | UUID, conversación obligatoria, emisor, contenido y fecha. |

Reglas que deben quedar comprobadas en la BD o documentadas donde requieran lógica de aplicación futura:

- Un lead sin campaña es válido; una campaña inexistente no lo es. Su origen no se inventa.
- Un lead tiene varias conversaciones; cada conversación tiene varios mensajes.
- Presupuesto usa decimal y moneda explícita. No mezclar ARS y USD ni admitir montos negativos; mínimo no puede superar máximo cuando ambos existen.
- Roles, emisores y estados usan valores cerrados. Fechas con zona horaria; contacto y presupuesto desconocidos no se convierten en información ficticia.
- No se impone unicidad global del correo del lead: repetir un contacto puede ser legítimo. La política de duplicados se documenta aparte.
- Evitar borrados en cascada que eliminen historial accidentalmente. Documentar la política de baja y conservación.
- Estados de lead confirmados el 8/11: `nuevo`, `en calificación`, `calificado`, `no calificado`, `asignado`, `cerrado`. No se fijan aquí identificadores técnicos ni transiciones. Los estados de conversación de la propuesta anterior siguen pendientes de definición; no se aprobaron por extensión.

### Modelo previsto, sin implementación funcional en esta etapa

Documentar reglas versionadas, calificaciones con desglose y versión, historial de asignaciones, notificaciones y tareas de recalificación. No implementar sus tablas operativas, cola ni servicios hasta que se concrete su caso de uso. Así se deja definido el modelo completo del PDF sin adelantar las etapas 3–5.

También se documentan los invariantes: la IA no otorga puntajes; una calificación conserva su versión de reglas; una asignación y su notificación pendiente deberán registrarse consistentemente; los reintentos no deben duplicar efectos.

## 5. Arquitectura hexagonal respetando el código existente

**Responsable A, revisión Martín.** El dominio no debe importar Express, `pg`, variables de entorno ni clientes HTTP.

Estructura incremental propuesta; los nombres son destinos futuros, no archivos creados:

```text
express/
  src/
    domain/                 Tipos, contratos de puertos e invariantes acordados
    services/               Casos de uso cuando comience la etapa 2
    infra/postgres.js       Pool existente del PR
    infra/ai/               Doble del puerto IA para tests locales
    composition.js          Construcción única de dependencias
    app.js                  Configuración HTTP; conserva rutas y middleware
    server.js               Arranque y cierre de recursos
  database/
    migrations/             Cambios SQL versionados
    seeds/                  Datos ficticios de desarrollo/prueba
python/
  backend/                  Conservar WSGI actual; puerto y proveedor falso aislados
contracts/
  ai-gateway.openapi.yaml
  schemas/
  examples/
docs/
  modelo.md
  api.md
  adr/
```

Trabajo de etapa 1:

1. Definir puertos mínimos para persistencia e interpretación IA con JSDoc/contratos claros. No generar repositorios CRUD ni clases vacías para cada entidad.
2. Crear una raíz de composición que reutilice `createPostgresPool` y pueda inyectar dependencias falsas en tests. Importar la app para probarla no debe abrir sockets ni conexiones.
3. Conectar el pool al ciclo de vida del servidor y a readiness; cerrar HTTP y pool ante SIGTERM con un plazo acotado.
4. Conservar respuestas existentes de `/`, `/health`, usuarios de ejemplo, errores y cabeceras. Los tests vigentes deben seguir comprobando esos contratos.
5. Agregar `/ready`: en Express verifica acceso a PostgreSQL y esquema aplicado; en Python verifica configuración del modo falso. `/health` continúa indicando solo actividad del proceso. Express no dependerá todavía de una llamada IA para estar listo.

La migración de carpetas a `services/*` y los workspaces del árbol objetivo del PDF se difieren mediante una decisión explícita: no son necesarios para demostrar separación de dependencias en etapa 1. No se agrega `packages/platform/` ni un worker vacío.

## 6. Contrato Express–Python y primer adaptador falso

**Responsable Martín; A revisa el consumidor Express y B los ejemplos inmobiliarios.**

Entregables futuros: OpenAPI, esquema JSON compartido y ejemplos válidos/inválidos. El contrato describe el endpoint objetivo del PDF: **`POST /v1/structured-completions`**, sin implementarlo por HTTP en esta etapa.

| Aspecto | Definición a fijar |
| --- | --- |
| Entrada | `task`, `lane` (`live`/`batch`), `messages`, `json_schema`, `max_tokens`; límites de tamaño y campos admitidos. En esta etapa solo se ejercita la tarea inmobiliaria de extracción mediante tests. |
| Encabezados | `Authorization` con JWT de servicio, `Idempotency-Key`, `X-Request-Id`, `X-Deadline`; formato y semántica de cada uno. |
| Salida | `data`, `usage`, `model`, `latency_ms`. Dentro de `data`: intención, tipo de inmueble, zona, presupuesto con moneda, plazo, campos faltantes y `next_question_key` de catálogo cerrado. |
| Datos faltantes | Ausencia/`null` explícitos según el esquema. No completar supuestos ni marcar datos declarados como verificados. |
| Restricciones | No admitir `score`, decisión de asignación, herramientas ni acciones comerciales en la respuesta IA. |
| Errores | 400 entrada inválida, 401/403 credenciales, 409 conflicto de idempotencia, 429 límite, 502 salida/proveedor inválido, 503 no disponible y 504 plazo excedido. Definir cuerpo uniforme con código y correlación. |
| Idempotencia futura | Misma clave y contenido: mismo resultado; misma clave con contenido distinto: conflicto. Se documenta, no se implementa su almacenamiento. |

Los valores numéricos de límites, presupuesto de tokens y deadline deben quedar fijados en el contrato antes de codificarlo. No se agregan librerías de JWT ni proveedor real solo para validar el diseño.

### Adaptador falso de etapa 1

- Martín prepara un proveedor falso **en proceso**, con fixtures deterministas que cumplan el esquema; no es un modelo que interprete lenguaje libre.
- A prepara el doble del puerto IA para los tests de Express usando los mismos ejemplos contractuales. No agrega un cliente HTTP ni una ruta comercial para demostrarlo.
- Escenarios mínimos: datos inmobiliarios completos, datos parciales, salida inválida y proveedor no disponible. Los fallos se seleccionan en pruebas, no mediante una puerta especial en la API pública.
- Misma entrada/fixture produce el mismo resultado; `model` identifica al falso y `usage` no representa consumo real. Los campos temporales se fijan o se normalizan en los tests.
- No necesita claves, red externa ni pagos. Las pruebas validan los ejemplos contra un esquema compartido con una herramienta compatible; no basta con comprobar que las claves existen. Si se añade una dependencia de validación, debe declararse y fijarse de forma reproducible.

La integración HTTP real, JWT operativo, reintentos, cuotas y proveedor LLM quedan para la etapa 4. Esta separación permite cerrar el contrato y trabajar con IA falsa desde la etapa 1 sin adelantar el recorrido comercial.

## 7. Docker Compose, migraciones y datos de prueba

### Entorno reproducible

**A mantiene Compose y Express; Martín agrega el contenedor Python; B verifica persistencia.**

- Partir de `compose.yaml` y del Dockerfile Express del PR #2; mantener Node 22, PostgreSQL 16 y Python 3.13.
- Añadir `ai-gateway` con el backend WSGI existente, modo falso y puerto interno 3100. Ajustar HOST/PORT para Docker sin cambiar los valores locales por defecto.
- Mantener PostgreSQL, SMTP y Python sin puertos publicados. `core-api` usa loopback 3000; la interfaz Mailpit continúa en loopback 8025 como excepción local de desarrollo.
- Añadir healthchecks y un paso de migración que termine correctamente antes de considerar lista la API. La creación de migraciones no debe depender de SQL ejecutado manualmente dentro del contenedor.
- El Dockerfile Express actual copia `src/` y tests, pero no `database/`: deberá incluir los archivos necesarios para migrar y sembrar desde la imagen.
- Conservar el volumen PostgreSQL. Repetir preparación o reiniciar no debe exigir borrar datos ni ejecutar `down -v`.
- Mantener `.env.example` actualizado y ficticio; validar configuración requerida, sin registrar valores sensibles. Usar credenciales de desarrollo y test separadas.

### Migraciones

**B implementa; A revisa ejecución y Martín prueba fallos.**

Propuesta mínima: SQL versionado en la carpeta existente, ejecutor Node con `pg`, tabla de versiones/checksums y una transacción por migración. Serializar ejecuciones de migración, por ejemplo con un advisory lock PostgreSQL, para evitar dos ejecutores sobre el mismo esquema.

Primera entrega: tablas base de la sección 4, claves foráneas, restricciones e índices justificados por correo y relaciones. No incluir lógica de calificación, disparadores de negocio ni la cola futura.

La segunda ejecución no aplica cambios ya registrados. Una migración aplicada no se reescribe; una corrección se agrega como otra versión. Si una migración falla, no deja su versión marcada como exitosa ni cambios parciales de esa transacción.

### Datos ficticios

**B prepara; Martín revisa casos inmobiliarios; A verifica seguridad.**

- Usuarios sintéticos con los tres roles; cuentas deshabilitadas para uso real y sin contraseñas en texto plano.
- Dos campañas con canales asociados; al menos tres leads: con campaña, sin campaña y con información parcial.
- Una conversación con mensajes ficticios. Presupuesto y moneda explícitos donde existan.
- IDs estables para repetir el seed sin duplicar registros. Un conflicto inesperado debe informarse; no sobrescribir datos ajenos para hacer pasar la preparación.
- Seed explícito solo para desarrollo/test. No ejecutar automáticamente sobre una BD de producción ni truncar tablas.

## 8. Reparto y orden de trabajo

Las tareas pueden ejecutarse después de aprobar el plan. Las revisiones son de otro integrante; no se asigna a Martín toda la infraestructura además de Python.

| Orden / tarea | Responsable | Revisor | Depende de | Entrega verificable |
| --- | --- | --- | --- | --- |
| T1. Acordar dominio, estados, autenticación, notificaciones y consultas docentes | A + B + Martín; A registra | Los tres | Nada | Decisiones sin contradicciones; alcance de etapa 1 aceptado. |
| T2. Revisar PR #2 y conservar lo reutilizable | A | B | Nada | Checklist sobre pool, CI, Dockerfile y documentación. Separar conceptualmente herramientas `factory/` del producto; no borrarlas ni mezclarlas con nuevas funcionalidades. |
| T3. Modelo y contratos de persistencia | B | A y Martín | T1 | `docs/modelo.md`, diccionario, relaciones y restricciones. |
| T4. Contrato IA y fixtures inmobiliarios | Martín | A y B | T1 | OpenAPI, esquema y ejemplos de éxito/error. |
| T5. Composición y ciclo de vida Express | A | Martín | T2, contratos mínimos T3/T4 | Pool reutilizado, dependencias inyectables, `/ready`, SIGTERM y regresión HTTP. |
| T6. Migraciones y seed | B | A; Martín prueba fallos | T3, T2 | BD vacía reproducible, repetición sin duplicados y fallo transaccional comprobado. |
| T7. Adaptadores IA falsos y tests de contrato | Martín: Python; A: doble Express | B | T4 | Mismos fixtures, validación de esquema y ninguna llamada externa. |
| T8. Compose completo de preparación | A: integración; Martín: Docker Python | B | T5, T6, T7 | Arranque de ambos backends, BD preparada y puertos restringidos. |
| T9. Comandos comunes, CI y README | A: comandos; B: tests BD; Martín: tests Python | Revisión cruzada | T5–T8 | Un procedimiento reproducible desde clon limpio; CI comprueba la base de etapa 1. |
| T10. Verificación personal y cierre | A, B y Martín, cada uno | Otro integrante | T9 | Tres registros individuales de preparación y pruebas. |

Después de T1, modelo y contrato IA pueden avanzar en paralelo. El esquema debe quedar acordado antes de escribir migraciones; Compose se valida después de reunir las piezas. No se fija una fecha de cierre sin conocer disponibilidad y resultados.

## 9. Pruebas de aceptación propuestas

**Todas las pruebas siguientes son pendientes; no se presentan como ejecutadas.**

| ID | Prueba | Resultado exigido | Responsable |
| --- | --- | --- | --- |
| P01 | Reejecutar suites existentes | Contratos HTTP actuales conservados; no eliminar assertions para obtener verde. | A y Martín |
| P02 | Importar dominio y app en un proceso aislado | Sin conexiones ni escucha al importar; dominio sin dependencias Express/pg/HTTP. | A |
| P03 | Preparar desde clon limpio y BD vacía | Construcción de imágenes, migraciones, seed y ambos healthchecks correctos, sin SQL manual. | Los tres |
| P04 | Migrar dos veces | La segunda ejecución no altera versiones ni duplica esquema. | B |
| P05 | Migración deliberadamente inválida en BD descartable | Rollback de esa migración, salida no cero y versión sin registrar. | Martín |
| P06 | Restricciones de esquema | Rechazar correo interno duplicado, FK inexistente, rol inválido y presupuesto incoherente; aceptar campaña y presupuesto desconocidos. | B |
| P07 | Sembrar dos veces | Mismos IDs y cantidades; datos parciales y lead sin campaña presentes; ningún dato real. | B |
| P08 | Validar contrato y fixtures | Ejemplos válidos pasan; campos extra, score arbitrario y tipos erróneos se rechazan. | Martín y A |
| P09 | Ejecutar falso sin red externa ni API key | Respuesta determinista conforme al esquema; escenarios inválido/no disponible comprobables. | Martín |
| P10 | Configuración ausente o inválida | Proceso falla de forma controlada, sin imprimir secretos; los defaults locales existentes siguen documentados. | A y Martín |
| P11 | BD detenida después del arranque | Express `/health` sigue informando actividad; `/ready` responde 503. Al restaurarla, recupera 200 si esquema y conexión son válidos. | A |
| P12 | SIGTERM de ambas APIs | Salida dentro del plazo acordado, conexiones cerradas y sin contenedores que necesiten SIGKILL. | Martín y A |
| P13 | Reiniciar Compose con volumen existente | Datos ficticios conservados; no requiere eliminación del volumen. | B |
| P14 | Inspeccionar puertos e imagen | BD, SMTP y Python internos; PDF, secretos y `.env` excluidos de imágenes/repositorio. | A |
| P15 | Ejecutar comando común local y CI | Código de salida no cero ante fallo de cualquier backend, contrato o migración. BD de tests aislada de desarrollo. | Los tres |

Comandos objetivo propuestos para T9: `npm run setup`, `npm run dev` y `npm test` desde la raíz. Hoy **no existen** esos comandos comunes: se deben añadir como envoltorios pequeños, multiplataforma, preservando `npm test` de Express y `python -m unittest` de Python. No requieren convertir el proyecto entero en workspaces. `setup` nunca sobrescribe un `.env` existente; la preparación requiere completar las variables locales previamente.

Los tests unitarios y de contrato siguen pudiendo ejecutarse sin servicios externos; el comando completo usa PostgreSQL descartable para migraciones e integración. CI debe probar también la construcción/arranque de las imágenes de etapa 1, además de las suites actuales. No necesita un proveedor de IA real.

## 10. Condición de cierre y siguiente paso

La etapa 1 se considera terminada cuando:

- [ ] Dominio inmobiliario, estados y responsabilidades documentados y revisados por los tres.
- [ ] Estrategias de autenticación y notificación decididas; dudas docentes que afecten esta base resueltas.
- [ ] Modelo inicial, esquema y contrato IA coherentes entre sí.
- [ ] Separación hexagonal mínima y composición comprobadas, sin CRUD comercial agregado.
- [ ] Compose inicia ambos backends y dependencias; migraciones y seed son repetibles.
- [ ] Adaptador IA falso funciona sin red externa y cumple el contrato compartido.
- [ ] Comandos comunes y pruebas de aceptación pasan con evidencia conservada.
- [ ] A, B y Martín levantaron personalmente el entorno y pueden explicar sus decisiones.
- [ ] Cada cambio recibió revisión de otro integrante. Una fusión futura requiere su decisión explícita; este plan no la realiza.

**Primer bloque de implementación recomendado para después:** T1 y T2. Acordar el modelo y revisar el PR #2 antes de crear tablas o cambiar la composición. La integración comercial comienza recién en la etapa 2; no forma parte del cierre aquí definido.

## Fuentes y trazabilidad

- PDF confirmado por el usuario: `C:/Users/juanm/Downloads/Plan_de_trabajo.pdf`; copia junto a este documento. SHA-256: `7BCBBF09C13F8E1D17682BC697E2D3C94AD004377449E73EC5E9D776F7A5A38A`.
- [Árbol de main revisado](https://github.com/ClaudioIvan101/prog-3-tfi/tree/42f23fa419915a767e75187ba18a5046087c841b).
- [Diferencias exactas de config respecto de main](https://github.com/ClaudioIvan101/prog-3-tfi/compare/42f23fa419915a767e75187ba18a5046087c841b...5c26ce6b56e32568d895df1cc126fc9daa92cd16).
- [Pool PostgreSQL propuesto en el PR](https://github.com/ClaudioIvan101/prog-3-tfi/blob/5c26ce6b56e32568d895df1cc126fc9daa92cd16/express/src/infra/postgres.js).
- [Compose propuesto en el PR](https://github.com/ClaudioIvan101/prog-3-tfi/blob/5c26ce6b56e32568d895df1cc126fc9daa92cd16/compose.yaml).
- [Backend Python actual](https://github.com/ClaudioIvan101/prog-3-tfi/tree/42f23fa419915a767e75187ba18a5046087c841b/python/backend).
- `ESTADO_PROYECTO.md` (informe anterior local, no incluido en este PR), fechado 4/11/2026, utilizado solo como antecedente y contrastado con las referencias actuales.

**Registro de cambios documentales:** el 6/11 se creó este plan fuera del clon. El 8/11 se actualizó exclusivamente para registrar T1/T2 y enlazar sus dos documentos. No se modificaron código, configuración, ramas, PDF ni informe anterior; no se implementaron funcionalidades ni se realizó la fusión del PR.
