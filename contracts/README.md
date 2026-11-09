# Contrato Express–Python — T4

**Versión 0.1.0-draft. Responsable: Martín (C). Pendiente de revisión de Claudio (T3) y Facu (consumidor Express).**

Este directorio describe una API futura. No registra rutas en Express/Python, no implementa un proveedor, no genera JWT, no conecta una BD y no ejecuta llamadas HTTP. Los ejemplos son datos sintéticos; no son un adaptador de IA falso de T7.

## Documentos y ejecución de pruebas

- [OpenAPI 3.1](ai-gateway.openapi.yaml): método, ruta, seguridad, encabezados, cuerpos, respuestas y ejemplos.
- [Esquemas JSON](schemas/): JSON Schema Draft 2020-12, independientes del lenguaje.
- [Ejemplos válidos](examples/valid/) e [inválidos](examples/invalid/): casos representativos, sin inventario duplicado.
- [Compatibilidad pendiente con T3](T3_COMPATIBILIDAD.md): campos compartidos y decisiones que Claudio debe confirmar.
- [Pruebas](tests/test_contract.py): validador OpenAPI, esquemas, ejemplos y límites, sin API en ejecución.

Los tests recorren todos los JSON de ambas carpetas: `valid/` debe aceptarse e `invalid/` rechazarse. El prefijo `request-`, `response-` o `error-` identifica el esquema; un prefijo desconocido hace fallar la prueba. Los errores HTTP están como ejemplos inline en OpenAPI. Los demás casos negativos se construyen en los tests a partir de un ejemplo válido, conservando sus comprobaciones sin copiar el cuerpo completo a otro archivo.

Desde la raíz del repositorio, en PowerShell, con Python 3.13:

```powershell
python -m venv contracts/.venv
.\contracts\.venv\Scripts\python.exe -m pip install -r contracts/requirements-test.txt
.\contracts\.venv\Scripts\python.exe -B -m unittest discover -s contracts/tests -v
```

En Linux/macOS, usar `contracts/.venv/bin/python` en los dos últimos comandos. El entorno local `.venv/` ya está excluido por el `.gitignore` existente; no se modifica el entorno del backend Python ni sus dependencias de ejecución. La instalación necesita acceso al registro de paquetes; los tests usan documentos y referencias locales. Se fijan las versiones de las dependencias directas de pruebas; no es un lockfile completo de dependencias transitivas.

## Operación y responsabilidades

El endpoint objetivo es `POST /v1/structured-completions` en `http://ai-gateway:3100`, interno en desarrollo. El endpoint y ese servicio todavía no se implementan en esta tarea. En un despliegue distinto de desarrollo se debe usar un transporte protegido, por ejemplo TLS; el JWT firmado no cifra el contenido.

La única tarea de esta versión es `real_estate_assistance`. En cada turno produce un mensaje conversacional, los datos básicos extraídos, un resumen y la clave de una pregunta de seguimiento si corresponde. `lane` admite `live` y `batch` para mantener la separación prevista; T4 no implementa colas ni prioridades.

Express conserva las reglas comerciales, el puntaje y la persistencia. El supervisor asigna manualmente vendedores. Python recibe mensajes/contexto y propone datos y texto: su respuesta no es una autorización para guardar información, cambiar estados, notificar ni asignar vendedores.

## Entrada

`request.schema.json` exige estos campos y rechaza propiedades adicionales:

| Campo | Contrato de transporte |
| --- | --- |
| `task` | Solo `real_estate_assistance`. |
| `lane` | `live` o `batch`. |
| `messages` | Entre 1 y 40 mensajes ordenados; `role` solo `lead` o `assistant`; `content` no vacío, máximo 4.000 caracteres. No se aceptan mensajes `system` del cliente. |
| `context` | Datos básicos conocidos por Express: contacto, necesidades, presupuesto y urgencia. Misma estructura que `extracted_data`; todos los campos presentes, con `null` para desconocidos. |
| `json_schema` | Exactamente `{"$ref":"urn:leadqual:ai:result:v1"}`. Identificador de un esquema local conocido, no una URL descargable. |
| `max_tokens` | Entero entre 1 y 2.048: límite de salida solicitado, no medición de consumo. |

La representación de datos compartidos está centralizada en `lead-data.schema.json`. Los campos y límites se proponen para este borrador técnico; no son nuevas reglas inmobiliarias aprobadas ni un modelo SQL. No se incorporan intención de compra/alquiler, catálogo de propiedades o lógica comercial de operaciones.

`json_schema` conserva el campo previsto por el plan, restringido a un esquema registrado: el gateway futuro deberá resolver ese URN internamente a `result.schema.json`. Nunca debe buscar referencias proporcionadas por el lead en la red. El URI no es la ubicación del archivo. Aceptar otros esquemas exige una nueva versión/revisión del contrato.

Límite del cuerpo: **100 KiB (102.400 bytes UTF-8)** antes de procesarlo; error 413 si se excede. La longitud de strings en JSON Schema se mide en caracteres; no sustituye el límite de bytes del parser. Ese control del parser queda documentado, no implementado por T4.

## Salida, conversación y seguimiento

`response.schema.json` exige:

| Campo | Significado |
| --- | --- |
| `data.assistant_message` | Mensaje conversacional propuesto, no vacío, máximo 2.000 caracteres. |
| `data.extracted_data` | Datos conocidos/propuestos tras el turno, con la misma estructura compartida de `context`. Son declarados y deben validarse antes de incorporarlos al negocio. |
| `data.summary` | Resumen propuesto del contexto, no vacío, máximo 2.000 caracteres. No convierte declaraciones en hechos verificados. |
| `data.next_question_key` | `contacto`, `necesidades`, `presupuesto`, `urgencia` o `null`. Catálogo técnico inicial sujeto a revisión con T3. |
| `data.missing_fields` | Lista sin duplicados de grupos básicos faltantes/incompletos, como máximo cuatro. |
| `usage` | `input_tokens` y `output_tokens`: enteros no negativos informados por el proveedor futuro. Los ejemplos usan cero y no afirman consumo real. |
| `model` | Identificador del modelo/proveedor futuro; los ejemplos declaran que no son un proveedor real. |
| `latency_ms` | Duración total de la operación, entero de 0 a 15.000 ms. No mide solo el tiempo del modelo. |

Una pregunta de seguimiento se elige con `next_question_key`. Cuando no se requiere otra pregunta, es `null`; los campos faltantes pueden permanecer pendientes aunque se detenga el diálogo. La implementación futura deberá comprobar que una clave no nula corresponde a un grupo de `missing_fields`. Express puede usar plantillas propias por clave para presentar la pregunta. El ejemplo `response-follow-up.json` muestra el texto y la clave de presupuesto.

No hay campos `score`, `puntaje`, `vendedor_id`, `estado`, herramientas o acciones. Los objetos están cerrados también en niveles internos. Se rechazan propiedades extra como `__proto__`; esto valida la forma del documento, no constituye una defensa completa contra prompt injection ni un análisis de seguridad de las aplicaciones.

Las inferencias deben contrastarse con el contexto y el mensaje original. JSON Schema comprueba estructura y tipos; no demuestra veracidad de un resumen, seguridad del lenguaje generado, consistencia entre `missing_fields` y datos, ni que un monto no haya sido inventado. Esos controles semánticos se implementarán en la integración futura.

## Autenticación entre servicios

OpenAPI declara `serviceJwt` obligatorio a nivel global: `Authorization: Bearer <JWT de servicio>`. No es un token de administrador/supervisor/vendedor ni el JWT de un visitante. Python futuro deberá verificar la firma antes de confiar en claims y no registrar el token.

**Perfil técnico propuesto para revisión con Facu**, no aprobación adicional inferida de T1:

- Algoritmo permitido `RS256`, nunca el algoritmo elegido libremente desde el token.
- Claims: `iss=core-api`, `aud=ai-gateway`, `sub=core-api`, `scope` contiene `ai:structured-completions`, `iat`, `nbf` y `exp` obligatorios.
- Vigencia máxima de 60 segundos y tolerancia de reloj de 5 segundos. Clave pública/configuración confiable en Python; clave privada únicamente en el emisor. No se guardan claves en este directorio.
- 401 para token ausente, inválido o vencido; `WWW-Authenticate: Bearer`. 403 para una identidad válida sin alcance permitido. Los controles no dependen solo de que Docker tenga una red interna.

T4 prueba que la seguridad está declarada en OpenAPI; **no prueba criptografía, verificación de claims ni emisión de tokens**.

## Encabezados, idempotencia y timeouts

Los nombres HTTP se interpretan sin distinguir mayúsculas/minúsculas. OpenAPI declara estos encabezados obligatorios:

| Encabezado | Semántica del borrador |
| --- | --- |
| `Content-Type` | `application/json`; cuerpo UTF-8. |
| `Authorization` | Bearer JWT de servicio, según el perfil anterior. |
| `Idempotency-Key` | Clave opaca de 1–128 caracteres ASCII alfanuméricos, guion o guion bajo. Identifica una operación lógica, sin datos personales. |
| `X-Request-Id` | UUID de correlación de ese intento; se refleja en respuestas cuando es válido. No es ID de lead ni clave de idempotencia. |
| `X-Deadline` | Fecha absoluta RFC3339 UTC terminada en `Z`. El tiempo restante al recibir debe ser positivo y no mayor que 15 segundos. |

Ejemplo ficticio de encabezados, con fecha que debe recalcularse en cada llamada futura:

```http
Authorization: Bearer <JWT_SERVICIO>
Content-Type: application/json
Idempotency-Key: operacion-001
X-Request-Id: 8e76b390-b948-4a72-9db7-82af3325c910
X-Deadline: 2026-11-08T15:00:15Z
```

El plazo total incluye conexión, espera, proveedor y validación. Propuesta: conexión máxima 2 segundos, proveedor máximo 10 segundos o el tiempo restante si es menor; nunca superar el deadline total de 15 segundos. Deadline ya vencido produce 504; formato inválido o plazo futuro superior al máximo produce 400. `latency_ms` no reemplaza estos controles.

Ante un fallo de transporte con resultado desconocido, conservar la misma clave de idempotencia y cuerpo para evitar duplicar trabajo. Mismo emisor, clave y cuerpo normalizado: reutilizar el resultado terminal disponible durante 24 horas; misma clave con otro cuerpo: 409. Una operación todavía en curso también responde 409 sin iniciar otra ejecución. Un intento nuevo usa JWT, deadline y correlación vigentes; esos encabezados no forman parte de la identidad del cuerpo. El registro de claves, concurrencia, normalización y retención **no se implementan en T4**.

No reintentar automáticamente 400/401/403/409/413. Para 429/503 respetar `Retry-After` (1–60 segundos) únicamente si hay presupuesto temporal; de lo contrario devolver el fallo a Express. El consumidor no tiene reintentos automáticos en este borrador. El gateway futuro puede hacer **como máximo un intento adicional** para corregir salida inválida si cabe en el mismo deadline y presupuesto; si persiste, devolver 502. Esto es un límite contractual propuesto, no un bucle implementado.

## Errores

El cuerpo común es `{"error":{"code":"…","message":"…","request_id":"UUID o null"}}`. `request_id=null` se admite cuando no llegó un identificador válido. Mensajes sin stack, prompts, secretos ni respuestas crudas del proveedor. Los errores pueden dejar el campo como `null`; solo se refleja un encabezado válido. No se interpreta un error como puntaje cero ni como lead descartado.

| HTTP | Código | Caso previsto |
| --- | --- | --- |
| 400 | `INVALID_REQUEST` | JSON, esquema, encabezados, tarea o límites inválidos. |
| 401 | `UNAUTHENTICATED` | Falta token o no supera verificación. |
| 403 | `FORBIDDEN` | Servicio autenticado sin autorización. |
| 409 | `IDEMPOTENCY_CONFLICT` | Misma clave con cuerpo distinto u operación en curso. |
| 413 | `PAYLOAD_TOO_LARGE` | Cuerpo superior a 100 KiB. |
| 429 | `RATE_LIMITED` | Límite de consumo o concurrencia; `Retry-After`. |
| 500 | `INTERNAL_ERROR` | Fallo inesperado interno, sin detalles sensibles. |
| 502 | `INVALID_PROVIDER_RESPONSE` | Salida del proveedor sigue siendo inválida tras el límite de corrección. |
| 503 | `SERVICE_UNAVAILABLE` | Proveedor/gateway no disponible; `Retry-After`. |
| 504 | `DEADLINE_EXCEEDED` | Deadline agotado o timeout de la operación. |

El código de error debe corresponder al HTTP; OpenAPI restringe esa correspondencia y las pruebas rechazan ejemplos cruzados. Los fallos inesperados no deben filtrarse como respuestas exitosas.

## Qué queda pendiente

Claudio debe confirmar campos y representaciones con T3; Facu debe revisar el consumidor y el perfil técnico de seguridad. Solo entonces podrá congelarse la primera versión estable. No se implementan ahora proveedor, fake, cliente HTTP, endpoint, JWT, reintentos, idempotencia persistida, scoring ni asignación.

Referencias técnicas: [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0.html), [validación JSON Schema](https://python-jsonschema.readthedocs.io/en/stable/validate/) y [validador OpenAPI](https://openapi-spec-validator.readthedocs.io/en/latest/). Se eligió OpenAPI 3.1 para compartir esquemas Draft 2020-12 sin duplicar modelos por lenguaje.
