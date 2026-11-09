# Informe detallado de simplificación de T4

**Martín (C) · Grupo 8 · 9/11/2026 · Rama `t4/contrato-express-python`**

Se aplicó ponytail: reducir duplicación y navegación innecesaria, conservando los requisitos del contrato y sus escenarios de prueba. Comparación contra `cbbca20`, versión publicada antes de estos cambios.

## Resultado principal

La carpeta `contracts/` pasó de **36 a 16 archivos: 55,56 % menos archivos**. Sus líneas pasaron de **1.584 a 1.181: 25,44 % menos líneas**. Los ejemplos JSON externos pasaron de **25 a 6: 76 % menos archivos de ejemplo**.

La reducción se concentra en las copias de ejemplos y su inventario. No se eliminaron campos del contrato, esquemas, controles de seguridad ni escenarios importantes de prueba. El protocolo conserva su contenido; cambió la ubicación de los ejemplos de error y la forma de probar casos repetidos.

Estos porcentajes corresponden a `contracts/`, no al repositorio entero. No representan una mejora medida de rendimiento, latencia, memoria o seguridad.

## Cambios

- Se conservaron seis ejemplos JSON externos: cuatro válidos de entrada/salida y dos inválidos representativos.
- Los diez errores mantienen exactamente sus cuerpos, ahora como ejemplos inline de OpenAPI. Se eliminaron sus diez archivos duplicados.
- Los otros nueve casos inválidos se construyen desde ejemplos válidos dentro de los tests: rol `system`, esquema externo, estado comercial en contexto, puntaje, vendedor, propiedad `__proto__`, presupuesto sin moneda, email inválido y pregunta desconocida.
- Se retiró `manifest.json`. Cada test recorre `valid/` e `invalid/` y selecciona el esquema por el prefijo explícito del archivo; rechaza nombres desconocidos y carpetas vacías.
- Se quitó el segundo registro de recursos y la construcción de JSON Pointers largos en los tests. Una base local `$id` permite validar directamente los esquemas de respuesta declarados en OpenAPI, manteniendo la resolución local y la correspondencia HTTP/código.
- Se valida todo esquema encontrado sin exigir una cantidad exacta en el test. Los cinco archivos existentes permanecen sin cambios.
- Se actualizó el README y se identificaron el informe original y la revisión previa como documentos históricos para no mantener copias del código vigente.

## Antes y después, con porcentajes

| Medida | Antes | Después | Diferencia | Variación |
| --- | ---: | ---: | ---: | --- |
| Archivos dentro de `contracts/` | 36 | 16 | −20 | **55,56 % de reducción** |
| Líneas dentro de `contracts/` | 1.584 | 1.181 | −403 | **25,44 % de reducción** |
| Ejemplos JSON externos, sin contar el manifiesto | 25 | 6 | −19 | **76 % de reducción** |
| Líneas del manifiesto | 152 | 0 | −152 | 100 % de reducción |
| Líneas de OpenAPI | 327 | 367 | +40 | 12,23 % de aumento |
| Líneas del archivo de tests | 166 | 170 | +4 | 2,41 % de aumento |
| Tests contractuales | 10 | 11 | +1 | 10 % de aumento |
| Esquemas | 5 | 5 | 0 | Sin cambios |
| Dependencias directas | 4 | 4 | 0 | Sin cambios |

El contrato ocupa **403 líneas menos** y tiene **20 archivos menos**. Las cifras excluyen entornos, cachés e informes de `docs/`. OpenAPI crece 40 líneas porque contiene los errores antes separados en diez archivos. El test crece cuatro líneas al hacer explícitos los casos antes escondidos en fixtures; se simplificó su mecanismo, no se buscó reducir assertions.

### De dónde salen las 403 líneas menos

| Parte de `contracts/` | Líneas antes | Líneas después | Cambio neto |
| --- | ---: | ---: | ---: |
| Ejemplos e inventario `manifest.json` | 597 | 148 | −449 |
| Cinco esquemas | 314 | 314 | 0 |
| OpenAPI | 327 | 367 | +40 |
| Tests | 166 | 170 | +4 |
| README | 137 | 139 | +2 |
| Compatibilidad T3 | 39 | 39 | 0 |
| Dependencias de pruebas | 4 | 4 | 0 |
| **Total** | **1.584** | **1.181** | **−403** |

Se retiraron 449 líneas de ejemplos e inventario y se agregaron 46 entre OpenAPI, tests y README. El ahorro neto es `449 − 46 = 403` líneas. La sección de ejemplos, incluyendo el manifiesto, disminuyó **75,21 %** en líneas.

### Cómo se calculó

```text
Reducción (%) = (cantidad anterior − cantidad actual) / cantidad anterior × 100

Archivos: (36 − 16) / 36 × 100 = 55,56 %
Líneas:   (1.584 − 1.181) / 1.584 × 100 = 25,44 %
Ejemplos: (25 − 6) / 25 × 100 = 76 %
```

La base se leyó desde Git, commit `cbbca20156523cde10e6a1f9c7043f82005bed66`. El después se midió sobre los archivos locales de `contracts/`. Se cuentan líneas físicas, incluidas líneas vacías y comentarios, con `splitlines()`, usando el mismo criterio en ambas versiones. Se excluyen `.venv/`, `__pycache__/` y los informes de `docs/` para que agregar esta explicación no distorsione la medición del contrato.

## Cómo quedó la estructura

```text
contracts/
├── ai-gateway.openapi.yaml
├── README.md
├── T3_COMPATIBILIDAD.md
├── requirements-test.txt
├── schemas/
│   ├── lead-data.schema.json
│   ├── request.schema.json
│   ├── result.schema.json
│   ├── response.schema.json
│   └── error.schema.json
├── examples/
│   ├── valid/
│   │   ├── request-complete.json
│   │   ├── request-partial.json
│   │   ├── response-complete.json
│   │   └── response-follow-up.json
│   └── invalid/
│       ├── request-missing-field.json
│       └── response-budget-type.json
└── tests/
    └── test_contract.py
```

### Función de cada parte

| Parte | Responsabilidad actual |
| --- | --- |
| OpenAPI | Describe el futuro POST interno, autenticación, encabezados, entrada, salida y errores. Ahora contiene directamente los diez ejemplos de error. |
| `lead-data.schema.json` | Mantiene una sola definición de contacto, necesidades, presupuesto y urgencia. |
| `request.schema.json` | Valida los mensajes, contexto, tarea, carril, esquema permitido y límite de tokens de entrada. |
| `result.schema.json` | Valida conversación, extracción, resumen y seguimiento, sin decisiones comerciales. |
| `response.schema.json` | Envuelve el resultado con uso de tokens, modelo y duración. |
| `error.schema.json` | Define la estructura común de los errores. |
| Cuatro ejemplos válidos | Permiten leer solicitudes completas/parciales y respuestas completas/con seguimiento. |
| Dos ejemplos inválidos | Muestran un campo obligatorio ausente y un presupuesto con tipo incorrecto. |
| `test_contract.py` | Recorre los ejemplos, valida el contrato y genera las variaciones inválidas sin guardar copias completas. |
| README | Fuente vigente para comprender y ejecutar las pruebas del contrato. |
| Compatibilidad T3 | Registra qué debe revisar Claudio antes de considerar definitivo el contrato. |
| `requirements-test.txt` | Conserva las cuatro dependencias de validación existentes, sin agregar ninguna. |

## Cómo se eliminaron las duplicaciones

### Ejemplos de error

Antes cada respuesta HTTP referenciaba un archivo como `error-401.json`. Había diez archivos con la misma forma y distinto código. Ahora cada respuesta OpenAPI incluye ese mismo valor como ejemplo inline: se consulta junto al estado HTTP que lo utiliza.

No se unificaron todos los errores bajo un código genérico ni se eliminaron los controles de correspondencia HTTP/código. Se conservan 400, 401, 403, 409, 413, 429, 500, 502, 503 y 504.

### Casos inválidos

Antes varios JSON repetían toda la solicitud o respuesta para modificar una sola propiedad. Ahora los tests parten de un ejemplo válido y cambian el dato que se quiere rechazar.

| Escenario original | Dónde se comprueba ahora |
| --- | --- |
| Falta un campo obligatorio | Archivo `request-missing-field.json`, recorrido automático. |
| Presupuesto con tipo incorrecto | Archivo `response-budget-type.json`, recorrido automático. |
| Mensaje con rol `system` | Tabla de casos inválidos de solicitud. |
| Esquema externo no permitido | Tabla de casos inválidos de solicitud. |
| Estado comercial enviado en contexto | Tabla de casos inválidos de solicitud. |
| Puntaje calculado por la IA | Prueba de propiedades comerciales prohibidas. |
| Vendedor asignado por la IA | Prueba de propiedades comerciales prohibidas. |
| Objeto `__proto__` inesperado | Prueba de propiedades inesperadas en varios niveles. |
| Presupuesto sin moneda | Prueba de respuesta inválida. |
| Email mal formado | Prueba de respuesta inválida. |
| Pregunta de seguimiento desconocida | Prueba de catálogo de seguimiento. |

Los cuatro ejemplos positivos de solicitud/respuesta se conservan como archivos. Los diez errores positivos se conservan en OpenAPI. Así, los **25 escenarios originales** siguen representados: `6 archivos + 10 ejemplos inline + 9 variaciones generadas`.

### Retiro del manifiesto

Ya no se mantiene una lista paralela de archivos. Los tests recorren `valid/` e `invalid/`; el prefijo `request-`, `response-` o `error-` indica qué esquema aplicar. Un nombre no reconocido o una carpeta esperada vacía hace fallar la prueba. Esto mantiene el descubrimiento sencillo y visible, sin introducir un sistema configurable de fixtures.

### Simplificación del validador de respuestas OpenAPI

Antes se construían rutas internas largas con JSON Pointer y se mantenía un segundo registro del documento OpenAPI. Ahora se valida el esquema de cada respuesta directamente, utilizando `$id` como base local para sus referencias.

Se conserva el registro local de los cinco esquemas y `FormatChecker`. No se sustituyeron bibliotecas estándar por un validador propio ni se agregaron helpers genéricos nuevos.

## Documentación y arquitectura

El README quedó como referencia vigente. El informe de implementación original y la revisión de simplicidad tienen una nota de registro histórico: sus conteos y bloques describen el antes, no el código actual. Este documento explica el después sin volver a copiar todo el código.

La separación hexagonal no cambió. Este trabajo sigue definiendo la frontera de comunicación: no agrega dependencias HTTP al dominio ni traslada decisiones comerciales a Python. No se crearon clases base, fábricas, proveedores o adaptadores vacíos.

## Requisitos y seguridad conservados

Se comparó OpenAPI antes/después normalizando los ejemplos externos a inline: ambos documentos resultan iguales en contenido. También se comprobó que los cinco esquemas y `requirements-test.txt` no cambiaron.

Se conservan JWT de servicio, encabezados, deadlines, errores y sus códigos, límites, propiedades cerradas, formatos, `null` frente a cero y prohibición de puntajes/asignaciones/estados desde la IA. No se agregó ninguna dependencia, abstracción de producción ni configuración nueva. Tampoco se modificaron Express, Python, Docker, CI o archivos de Claudio.

La política técnica de JWT, tiempos e idempotencia permanece propuesta para revisión con Facu. No se cambiaron sus valores unilateralmente. **La compatibilidad con T3 sigue pendiente de Claudio y el contrato continúa en borrador.**

## Pruebas ejecutadas

Se ejecutaron las suites antes y después de la simplificación:

| Suite o comprobación | Antes | Después |
| --- | --- | --- |
| Contratos: `python -B -m unittest discover -s contracts/tests -v` con el entorno de contratos | 10 aprobadas | 11 aprobadas |
| Python: `python -B -m unittest discover -s tests -v` desde `python/` | 15 aprobadas | 15 aprobadas |
| Express: `npm.cmd test` desde `express/` | 28 aprobadas, 1 fallida | 28 aprobadas, 1 fallida |
| Factory: `python -B -m unittest discover -s factory/tests -v` | 4 aprobadas | 4 aprobadas |
| Dashboard: `node --test factory/tests/dashboard.test.mjs` | 7 aprobadas | 7 aprobadas |
| `pip check` del entorno contractual | Sin cambios de dependencias | Sin incompatibilidades |

El test de factory ya ejecuta los siete tests de dashboard internamente; su ejecución directa adicional no representa siete casos distintos.

Se reprodujeron además los **25 ejemplos originales desde Git** contra los validadores actuales: todos mantuvieron su resultado esperado. La suite permanente conserva sus escenarios entre seis archivos, diez ejemplos inline y nueve variaciones generadas, además de los controles de límites y seguridad ya existentes.

**Límite de entorno:** Docker no tiene disponible su motor Linux. Para no conectar a una BD del usuario, Express se probó con variables PG ficticias y destino deliberadamente no disponible `127.0.0.1:1`. El único fallo, antes y después, es `dbConnection.test.js` por `ECONNREFUSED`. No se ocultó ni omitió ese test; no se afirma que la suite completa Express ni una integración SQL hayan pasado localmente. Se instalaron las dependencias existentes con `npm ci --ignore-scripts`, sin cambiar su lockfile.

Los controles de formato del contrato no verifican firma JWT, cumplimiento de deadlines reales ni veracidad del texto de IA; esas funciones todavía no están implementadas.

La cantidad de métodos de prueba pasó de 10 a 11 porque se separó una comprobación explícita de presupuesto sin moneda y email inválido. No se usa ese aumento como medida de cobertura: la evidencia principal es conservar los escenarios y sus resultados, además de comprobar que esquemas y protocolo no cambiaron.

Para defender el cambio: **«Reduje un 25,44 % las líneas de la carpeta del contrato y un 55,56 % sus archivos, eliminando copias de ejemplos e inventario. Conservé los cinco esquemas y los 25 escenarios originales; las pruebas contractuales pasaron. La integración SQL no pudo validarse localmente por falta de PostgreSQL disponible».**

## Estado de entrega

La simplificación se preparó inicialmente como cambios locales. El 9/11 el usuario autorizó su commit, push y presentación para revisión desde `t4/contrato-express-python`. Al verificar GitHub se constató que el equipo ya había fusionado el PR #5; estos cambios se presentan en un PR nuevo hacia `main`, sin realizar otra fusión. La revisión previa existente se conservó y solo se le agregó una referencia a este resultado.

La publicación no acredita aprobación de Claudio ni compatibilidad definitiva con T3. Mantener el contrato en borrador hasta esa validación y revisar esta simplificación antes de integrarla a `main`.

Documentación vigente: [README del contrato](../../contracts/README.md), [tests](../../contracts/tests/test_contract.py) y [compatibilidad con T3](../../contracts/T3_COMPATIBILIDAD.md).
