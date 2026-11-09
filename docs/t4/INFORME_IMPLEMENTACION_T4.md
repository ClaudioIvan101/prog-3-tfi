# Informe de implementación T4 — Contrato Express–Python

**Martín (Integrante C) · Grupo 8 · Implementación: 8/11/2026 · Revisión para publicación: 9/11/2026**

## Resultado y alcance

Se implementó una base documental y verificable del contrato interno de IA: OpenAPI 3.1, cinco esquemas JSON, ejemplos inmobiliarios válidos/inválidos y pruebas automáticas de documentos. El contrato sigue en **0.1.0-draft**, pendiente de revisión de Claudio con T3 y de Facu para Express. No se afirma que T3 lo haya aprobado ni que la etapa 1 esté completa.

La IA conversa, extrae información y resume. Express calcula puntajes mediante reglas y el supervisor asigna vendedores manualmente. Los datos compartidos se limitan a contacto, necesidades, presupuesto y urgencia; no se agregaron reglas de compra/alquiler, estados operativos, campañas o vendedores al gateway.

No se implementaron proveedor de IA, adaptador falso, cliente HTTP, rutas nuevas en las aplicaciones, autenticación operativa, persistencia, migraciones ni otras tareas. Describir un endpoint en OpenAPI no registra ese endpoint en un servidor.

## Sincronización, ramas y documentos previos

- Se verificó `git status`: el clon estaba limpio en `main`, commit `42f23fa`.
- Se ejecutó `git pull --ff-only origin main`: avance por fast-forward a `a1fdb6c464c229504cc1c3e3e2b243a336c15ad9`, sin conflictos ni un nuevo commit de merge. El PR #2 ya estaba integrado; no se reaplicó.
- Se creó la rama de trabajo y, por indicación del usuario, se quitó el prefijo inicial. Nombre actual: **`t4/contrato-express-python`**.
- T1/T2 se publicaron por separado en **`docs/etapa1-t1-t2`**, commit `7560bf4`, con exactamente tres Markdown. El [PR #4](https://github.com/ClaudioIvan101/prog-3-tfi/pull/4) reemplazó al #3, que GitHub cerró automáticamente al renombrar su rama. No se fusionó ese PR.
- Los documentos T1/T2 permanecen separados de la rama T4; no se copiaron sus cambios aquí ni se volvió a publicarlos. Durante T4 se consultaron los originales locales autorizados.
- Al cierre inicial del 8/11, T4 permanecía local y sin commit, push o PR. El 9/11 el usuario autorizó su publicación mediante commit y Draft Pull Request desde `t4/contrato-express-python` hacia `main`, sin fusionar. No se modificaron archivos existentes de Claudio ni las aplicaciones.

## Archivos y función de cada bloque

| Archivo o carpeta | Función |
| --- | --- |
| `contracts/ai-gateway.openapi.yaml` | Describe un único POST futuro, autenticación, encabezados, respuestas y referencias a los esquemas. |
| `contracts/schemas/lead-data.schema.json` | Única definición de los campos compartidos. Su cambio alcanza entrada y salida por referencias. |
| `contracts/schemas/request.schema.json` | Contrato de entrada: tarea, carril, mensajes, contexto, esquema permitido y límite de tokens. |
| `contracts/schemas/result.schema.json` | Mensaje conversacional, extracción, resumen, clave de seguimiento y grupos faltantes. |
| `contracts/schemas/response.schema.json` | Envuelve el resultado con uso de tokens, identificación del modelo y duración. |
| `contracts/schemas/error.schema.json` | Forma cerrada del error, sin stack o detalles del proveedor. |
| `contracts/examples/valid/` | Dos solicitudes, dos respuestas y diez errores HTTP válidos. |
| `contracts/examples/invalid/` | Once casos rechazables: omisiones, roles, esquemas externos, decisiones de negocio, presupuesto, email, seguimiento y propiedades peligrosas. |
| `contracts/examples/manifest.json` | Declara para cada ejemplo el esquema, resultado esperado y motivo. Los tests comprueban que no falten archivos. |
| `contracts/tests/test_contract.py` | Valida OpenAPI y JSON Schema; comprueba ejemplos, errores por estado HTTP, límites, formatos y campos excluidos. |
| `contracts/requirements-test.txt` | Versiones directas de los validadores de desarrollo. No cambia dependencias de ejecución. |
| `contracts/README.md` | Explica protocolo, límites, seguridad, errores, timeouts y comandos de pruebas. |
| `contracts/T3_COMPATIBILIDAD.md` | Correspondencia provisional y decisiones que Claudio debe confirmar. |
| Este informe | Registra alcance, evidencia y conceptos de defensa. |

## Estructura de carpetas agregada

```text
prog-3-tfi/
├── contracts/
│   ├── examples/
│   │   ├── invalid/
│   │   │   ├── request-business-state.json
│   │   │   ├── request-external-schema.json
│   │   │   ├── request-missing-field.json
│   │   │   ├── request-system-role.json
│   │   │   ├── response-budget-type.json
│   │   │   ├── response-budget-without-currency.json
│   │   │   ├── response-invalid-email.json
│   │   │   ├── response-prototype-field.json
│   │   │   ├── response-score.json
│   │   │   ├── response-unknown-question.json
│   │   │   └── response-vendor.json
│   │   ├── valid/
│   │   │   ├── error-400.json
│   │   │   ├── error-401.json
│   │   │   ├── error-403.json
│   │   │   ├── error-409.json
│   │   │   ├── error-413.json
│   │   │   ├── error-429.json
│   │   │   ├── error-500.json
│   │   │   ├── error-502.json
│   │   │   ├── error-503.json
│   │   │   ├── error-504.json
│   │   │   ├── request-complete.json
│   │   │   ├── request-partial.json
│   │   │   ├── response-complete.json
│   │   │   └── response-follow-up.json
│   │   └── manifest.json
│   ├── schemas/
│   │   ├── error.schema.json
│   │   ├── lead-data.schema.json
│   │   ├── request.schema.json
│   │   ├── response.schema.json
│   │   └── result.schema.json
│   ├── tests/
│   │   └── test_contract.py
│   ├── README.md
│   ├── T3_COMPATIBILIDAD.md
│   ├── ai-gateway.openapi.yaml
│   └── requirements-test.txt
└── docs/
    └── t4/
        └── INFORME_IMPLEMENTACION_T4.md
```

Las carpetas existentes `express/`, `python/`, `brain/`, `factory/` y la configuración de Docker/CI se conservan. En esta rama no se incorporan las tres publicaciones documentales del PR #4 para evitar mezclar cambios independientes.

## Bloques principales con código real

### 1. Declaración de seguridad en OpenAPI

Este extracto del documento declara un Bearer JWT obligatorio; no implementa un verificador:

```yaml
security:
- serviceJwt: []
components:
  securitySchemes:
    serviceJwt:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: 'JWT de servicio RS256: iss=core-api, aud=ai-gateway, sub=core-api,
        scope contiene ai:structured-completions, exp/iat/nbf. Perfil técnico propuesto
        para revisión; no autenticación implementada.'
```

El perfil RS256, sus claims y vencimientos son una propuesta técnica del borrador que Facu debe revisar. El JWT entre servicios es distinto de los roles de usuarios. La implementación futura deberá verificar firma, emisor, audiencia, alcance y tiempo; estos tests solo validan su declaración.

### 2. Reutilización de datos compartidos

Extractos reales de las propiedades de entrada y resultado:

```json
{
  "request.context": {
    "$ref": "./lead-data.schema.json"
  },
  "result.extracted_data": {
    "$ref": "./lead-data.schema.json"
  }
}
```

Ambas referencias apuntan al mismo archivo local. Evitan duplicar la definición entre Express y Python. El catálogo de campos queda centralizado para ajustarlo cuando Claudio entregue T3.

### 3. Entrada inmobiliaria con datos incompletos

Ejemplo válido completo de `request-partial.json`:

```json
{
  "task": "real_estate_assistance",
  "lane": "live",
  "messages": [
    {
      "role": "lead",
      "content": "Necesito asesoramiento inmobiliario. No tengo definido el presupuesto."
    }
  ],
  "context": {
    "contacto": null,
    "necesidades": null,
    "presupuesto": null,
    "urgencia": null
  },
  "json_schema": {
    "$ref": "urn:leadqual:ai:result:v1"
  },
  "max_tokens": 1024
}
```

`null` significa desconocido. No se inventa presupuesto cero. El `json_schema` acepta únicamente el URN acordado; el gateway futuro lo resolverá a un esquema conocido, sin descargar URLs aportadas por el lead. Los roles del historial son datos, nunca instrucciones `system` del cliente.

### 4. Salida de conversación, extracción, resumen y seguimiento

Ejemplo válido completo de `response-follow-up.json`:

```json
{
  "data": {
    "assistant_message": "¿Qué presupuesto y moneda tenés previstos?",
    "extracted_data": {
      "contacto": null,
      "necesidades": "Asesoramiento inmobiliario",
      "presupuesto": null,
      "urgencia": null
    },
    "summary": "El interesado solicita asesoramiento. Contacto, presupuesto y urgencia aún desconocidos.",
    "next_question_key": "presupuesto",
    "missing_fields": [
      "contacto",
      "presupuesto",
      "urgencia"
    ]
  },
  "usage": {
    "input_tokens": 0,
    "output_tokens": 0
  },
  "model": "contract-example-not-a-provider",
  "latency_ms": 0
}
```

El texto y resumen son propuestas, no hechos verificados. `next_question_key` pertenece a un catálogo cerrado que el consumidor puede asociar a plantillas. `usage=0`, `latency_ms=0` y el nombre de modelo de este ejemplo son valores sintéticos; no representan una llamada realizada.

### 5. Registro local de esquemas y validador

Bloque real de las pruebas:

```python
ROOT = Path(__file__).resolve().parents[1]
SCHEMAS = list((ROOT / "schemas").glob("*.schema.json"))
REGISTRY = Registry().with_resources(
    (path.as_uri(), Resource.from_contents(json.loads(path.read_text(encoding="utf-8"))))
    for path in SCHEMAS
)


def read(relative):
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def validator(relative):
    # Solo recursos registrados localmente: los tests no descargan referencias.
    return Draft202012Validator(
        {"$ref": (ROOT / relative).as_uri()},
        registry=REGISTRY,
        format_checker=FormatChecker(),
    )
```

Se usa un validador estándar de JSON Schema, no un parser de validación casero. `Registry` contiene los recursos locales y `FormatChecker` activa verificaciones como email, UUID y fecha. Las pruebas no necesitan un proveedor ni una BD. El validador OpenAPI también comprueba las referencias del YAML a los archivos JSON.

### 6. Prueba negativa de acciones comerciales y propiedades extra

Bloque real de prueba:

```python
    def test_closed_objects_reject_business_actions_and_prototype_properties(self):
        check = validator("schemas/response.schema.json")
        original = read("examples/valid/response-complete.json")
        for property_name in ("score", "puntaje", "vendedor_id", "estado", "__proto__", "constructor"):
            for location in ((), ("data",), ("data", "extracted_data")):
                with self.subTest(property=property_name, location=location):
                    changed = copy.deepcopy(original)
                    target = changed
                    for key in location:
                        target = target[key]
                    target[property_name] = "no permitido"
                    self.assertFalse(check.is_valid(changed))
```

La prueba muta una respuesta válida y comprueba que se rechazan propiedades de negocio o inesperadas en varios niveles. `additionalProperties: false` cierra los objetos: no es una afirmación de que toda prompt injection esté contenida, ni verifica el significado del texto generado.

## Límites del protocolo documentados

- Cuerpo máximo 100 KiB UTF-8; 1–40 mensajes de hasta 4.000 caracteres; salida solicitada de 1–2.048 tokens.
- Deadline absoluto UTC: hasta 15 segundos; conexión propuesta de hasta 2 segundos y proveedor de hasta 10 segundos dentro del tiempo restante.
- `X-Request-Id` correlaciona intentos; `Idempotency-Key` identifica la operación lógica; no son intercambiables.
- Se definió la semántica futura de repetición de claves y conflicto, sin implementar almacenamiento ni concurrencia.
- Errores 400, 401, 403, 409, 413, 429, 500, 502, 503 y 504, cada uno con su código y ejemplo. Las pruebas rechazan que un cuerpo de error declare un código incompatible con el HTTP.
- Los controles temporales dinámicos, límites de bytes, firma JWT, reintentos, datos veraces y coherencia semántica están documentados para la implementación posterior. No se presentan como garantías que ya estén ejecutándose.

## Pruebas ejecutadas

Fecha de la ejecución: 8/11/2026. Python 3.13.5. Validadores instalados en un entorno aislado temporal; no se instalaron en el backend.

| Comprobación | Resultado |
| --- | --- |
| `python -B -m unittest discover -s contracts/tests -v`, con el Python del entorno de contratos, desde la raíz | **10/10 aprobadas**, con subcasos de 25 fixtures: 14 válidos y 11 inválidos. |
| Validador OpenAPI 3.1 y referencias locales | Aprobado dentro de la suite. |
| Cinco esquemas Draft 2020-12 y ejemplos enlazados por OpenAPI | Aprobados dentro de la suite. |
| Rechazo de campos extra, puntajes, vendedores y estados; formatos, límites y faltantes | Aprobado dentro de la suite. |
| `python -B -m unittest discover -s tests -v`, desde `python/` | **15/15 aprobadas**; backend existente sin modificaciones. |
| `python -m pip check`, en el entorno aislado de contratos | Sin dependencias incompatibles. |
| Enlaces Markdown locales de contratos | Correctos. |
| Estado Git y alcance | Únicamente archivos nuevos bajo `contracts/` y `docs/t4/`; aplicaciones y archivos versionados de base sin cambios. |

La primera invocación de las pruebas del backend se hizo desde la raíz con `-s python/tests` y falló con seis errores de importación de `backend`. Se corrigió el directorio de ejecución a `python/` y pasaron las 15 pruebas; no fue necesario cambiar código.

### Revisión para publicación — 9/11/2026

Se volvió a consultar `origin/main`: sigue en `a1fdb6c`, sin divergencia respecto de la base de T4. Se revisaron contrato, esquemas, pruebas, ejemplos y documentación antes de preparar el commit. No se detectaron bloqueos técnicos para publicar este borrador en Draft; la validación humana de T3 sigue pendiente.

Se repitieron las **10 pruebas contractuales** (incluyen 25 fixtures: 14 válidos y 11 inválidos) y las **15 pruebas del backend Python** desde `python/`: todas aprobadas. `pip check` no reportó dependencias incompatibles. El alcance comprobado contiene 37 archivos nuevos exclusivamente en `contracts/` y `docs/t4/`; no incluye los documentos T1/T2 del PR #4 ni cambios de aplicaciones.

El carácter Draft y la correspondencia pendiente con Claudio deben quedar explícitos en el PR. Publicar el borrador no congela el contrato ni acredita compatibilidad con un modelo T3 todavía no disponible en la base revisada.

No se ejecutaron de nuevo Express, PostgreSQL, Docker ni llamadas HTTP del contrato: sus fuentes/configuración no se tocaron y el endpoint de T4 todavía no existe. Tampoco se presenta el CI histórico de otro PR como validación de estos archivos nuevos.

### Cómo repetir la suite T4

Desde la raíz, en PowerShell:

```powershell
python -m venv contracts/.venv
.\contracts\.venv\Scripts\python.exe -m pip install -r contracts/requirements-test.txt
.\contracts\.venv\Scripts\python.exe -B -m unittest discover -s contracts/tests -v
```

Los tests no están añadidos al workflow actual de Claudio/Facu ni al comando común T9. Se ejecutan con el comando específico de T4, sin modificar CI de otras tareas.

## Coordinación pendiente con Claudio

Revisar [T3_COMPATIBILIDAD.md](../../contracts/T3_COMPATIBILIDAD.md). Deben confirmarse nombres/normalización de contacto, representación de presupuesto, precisión/moneda, urgencia, nulabilidad y qué datos necesitan compartirse. No se crearon columnas, restricciones ni estados nuevos en el modelo. El límite de monto y las longitudes son propuestas de transporte, no reglas comerciales definitivas.

Para ajustar el borrador: cambiar el esquema compartido, actualizar ejemplos afectados y ejecutar la suite completa de contratos; revisar los consumidores antes de marcar una versión estable. **No congelar este contrato hasta la revisión de Claudio.**

## Conceptos que Martín debe poder defender

| Concepto | Explicación que debés poder dar |
| --- | --- |
| Contrato primero | Se acuerda cómo se hablan dos servicios antes de implementar sus endpoints o proveedores. |
| OpenAPI vs. JSON Schema | OpenAPI describe HTTP; JSON Schema define tipos, propiedades, restricciones y nulabilidad de los documentos. |
| `$ref` y recursos locales | Compartir una definición evita inconsistencias; referencias controladas no son URLs libres del usuario. |
| Datos vs. decisiones | IA propone texto y datos; Express decide puntaje y guarda; el supervisor asigna. |
| `null` vs. cero | Ausencia de información no equivale a un valor declarado de cero. |
| Validación sintáctica vs. semántica | Un JSON válido no demuestra que la IA diga la verdad o que la pregunta corresponda a los datos faltantes. |
| Objetos cerrados | `additionalProperties: false` rechaza campos no permitidos incluso en estructuras internas. |
| JWT de servicio | Identifica y autoriza al servicio emisor, no al lead; declarar Bearer no verifica firmas. |
| Deadline vs. timeout | Deadline es el límite absoluto de la operación; cada espera debe respetar el tiempo restante. |
| Correlación vs. idempotencia | Request ID permite rastrear; la clave de idempotencia evita efectos duplicados cuando se implemente. |
| Ejemplos positivos y negativos | Los casos inválidos prueban que el validador rechaza lo que el contrato prohíbe, no solo que acepta el caso feliz. |
| Compatibilidad con T3 | El contrato de transporte no dicta columnas SQL y requiere revisión antes de quedar estable. |

### Preguntas de práctica

1. ¿Por qué una respuesta con `puntaje` debe rechazarse aunque sea JSON correcto?
2. ¿Qué cambiarías si Claudio define el presupuesto como rango en lugar de un monto?
3. ¿Qué prueba valida OpenAPI y cuál valida un ejemplo contra un esquema?
4. ¿Por qué los tests de formatos de encabezados no prueban que se respete un deadline real?
5. ¿Qué queda pendiente para hacer una llamada real entre Express y Python?

**Cierre:** base técnica de T4 revisada y probada para su publicación en un Draft PR autorizado el 9/11. La compatibilidad con T3 de Claudio continúa pendiente. No fusionar ni considerar definitiva la versión `0.1.0-draft`.
