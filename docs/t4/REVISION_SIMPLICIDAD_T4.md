# Revisión de simplicidad de T4

> Revisión histórica de `cbbca20`, previa a los cambios autorizados. Su ejecución y comparación se registran en [INFORME_SIMPLIFICACION_T4.md](INFORME_SIMPLIFICACION_T4.md); los conteos siguientes describen el antes.

**TPI inmobiliario · Grupo 8 · Martín (C) · 9 de noviembre de 2026**

**Referencia revisada:** rama `t4/contrato-express-python`, commit `cbbca20`, publicado como [Draft PR #5](https://github.com/ClaudioIvan101/prog-3-tfi/pull/5). Este informe registra una revisión estática de ese contenido; no consulta ni certifica cambios remotos posteriores.

**Método:** ponytail y ponytail-review. Criterio indicado por el usuario: implementar lo mínimo para cumplir el plan y la consigna, respetando la arquitectura hexagonal, la seguridad y las pruebas importantes. El código debe poder comprenderse y defenderse por estudiantes universitarios.

**Alcance autorizado:** informar. No se implementan las simplificaciones, no se modifica el contrato, no se cambian tests y no se realizan commits, push ni merge por este informe.

## Resultado

T4 cumple una función necesaria: definir y comprobar el intercambio de información entre Express y Python antes de implementar la integración. La mayor oportunidad de simplificación está en los ejemplos repetidos, su manifiesto, algunos detalles de las pruebas y la documentación duplicada.

No se recomienda reescribir T4, reemplazar los validadores estándar ni eliminar requisitos del plan. Tampoco se necesita agregar clases, fábricas, interfaces genéricas o nuevas capas para reducir estos archivos.

La compatibilidad con el modelo T3 sigue pendiente de Claudio. Publicar el borrador y pasar sus pruebas no convierte el contrato en definitivo.

## Evidencia del estado revisado

| Elemento | Cantidad actual | Observación |
| --- | --- | --- |
| Archivos agregados por T4 | 37 | Contrato, esquemas, ejemplos, pruebas y documentación. Este informe es posterior y no integra ese conteo. |
| Esquemas JSON | 5 | Separan datos compartidos, solicitud, resultado, respuesta y error. |
| Ejemplos JSON | 25 | 14 válidos y 11 inválidos. |
| Ejemplos de error válidos | 10 | Mismo cuerpo básico, con distinto código. |
| Manifiesto | 152 líneas | Enumera ejemplos, esquema, resultado esperado y motivo. |
| Pruebas contractuales | 166 líneas | Incluyen validación del documento y casos positivos/negativos. |
| OpenAPI | 327 líneas | Declara una operación futura y sus respuestas. |
| README del contrato | 137 líneas | Explica protocolo, ejecución, seguridad y límites. |
| Informe de implementación | 323 líneas | Incluye copias de ejemplos y bloques de código para estudio. |

Las cantidades describen el contenido inspeccionado. Reducir líneas o archivos no es un objetivo por sí mismo: cualquier reducción debe conservar el comportamiento requerido y los escenarios relevantes de prueba.

## 1. Reducir ejemplos repetidos

**Prioridad: alta.** Fuentes: [ejemplos válidos](../../contracts/examples/valid/) y [ejemplos inválidos](../../contracts/examples/invalid/).

**Qué existe:** diez archivos de error repiten la misma estructura. Varios ejemplos inválidos copian una respuesta completa para cambiar un tipo o agregar `score`, `vendedor_id` o una propiedad inesperada.

**Problema concreto:** cuando Claudio cambie un campo compartido, habrá que actualizar múltiples copias de la misma respuesta para que cada caso siga fallando por el motivo que pretende comprobar. Si no se hace, un test puede seguir rechazando el ejemplo por otro error y dar una impresión incorrecta de cobertura.

**Simplificación propuesta:** conservar ejemplos externos representativos de solicitud completa/parcial, respuesta completa/con seguimiento y casos inválidos de entrada y salida. Construir los casos repetidos en una tabla dentro del test, a partir de copias de un ejemplo válido.

**Qué debe conservarse:** todos los escenarios de seguridad y validación importantes. Mover un caso a Python no autoriza eliminarlo. Si se retira un archivo referenciado desde OpenAPI, hay que ajustar también esa referencia y conservar ejemplos accesibles en la documentación.

**Beneficio:** menos documentos que deben cambiar juntos y casos de prueba más pequeños y explícitos.

## 2. Retirar el manifiesto si la convención de ejemplos lo hace innecesario

**Prioridad: alta.** Fuentes: [manifest.json de la versión revisada](https://github.com/ClaudioIvan101/prog-3-tfi/blob/cbbca20156523cde10e6a1f9c7043f82005bed66/contracts/examples/manifest.json) y [test de ejemplos](../../contracts/tests/test_contract.py).

**Qué existe:** un archivo adicional enumera cada ejemplo, el esquema que le corresponde, su validez y una descripción. Las carpetas `valid/` e `invalid/` y los prefijos `request-`, `response-` y `error-` ya aportan buena parte de esa información.

**Problema concreto:** agregar o renombrar un ejemplo exige modificar dos lugares. El manifiesto agrega 152 líneas de inventario y una comprobación para mantener ese inventario sincronizado.

**Simplificación propuesta:** recorrer las carpetas conocidas y usar una convención corta y explícita para seleccionar el esquema. Los motivos de los casos construidos en Python pueden quedar junto a la tabla de pruebas.

**Qué debe conservarse:** comprobar todos los ejemplos existentes, rechazar nombres desconocidos y evitar omisiones silenciosas. No reemplazar el manifiesto por un sistema de descubrimiento genérico o configurable.

**Beneficio:** un archivo menos. Se eliminarían las 152 líneas actuales del manifiesto, aunque parte de la información y la selección de esquemas deberá permanecer en los tests; el ahorro neto se medirá al implementar.

## 3. Hacer más directas algunas pruebas

**Prioridad: media.** Fuente: [test_contract.py](../../contracts/tests/test_contract.py).

**Qué existe:** para comprobar ejemplos asociados a respuestas, el test construye referencias internas como `#/paths/~1v1~1structured-completions/post/responses/...`. También exige que haya exactamente cinco esquemas.

**Problema concreto:** la navegación interna de OpenAPI agrega dificultad para explicar el test. Por otra parte, agregar un esquema válido haría fallar la comprobación de cantidad aunque todos los contratos siguieran siendo correctos.

**Simplificación propuesta:** distinguir claramente tres verificaciones: documento OpenAPI válido, ejemplos conformes a sus esquemas y código de error correspondiente al estado HTTP. Validar todos los esquemas encontrados sin fijar su cantidad exacta.

**Qué debe conservarse:** validación real de referencias, comprobación de formatos y correspondencia HTTP/código. No debilitar las assertions para obtener un test más corto ni limitarse a comprobar que el JSON se puede leer.

**Beneficio:** pruebas más cercanas a las reglas que un estudiante debe explicar. La resolución local de esquemas y el uso de bibliotecas estándar tienen una función concreta y se conservan donde sean necesarios.

## 4. Reducir documentación que deba mantenerse duplicada

**Prioridad: media.** Fuentes: [README](../../contracts/README.md) e [informe de implementación](INFORME_IMPLEMENTACION_T4.md).

**Qué existe:** el informe reproduce ejemplos JSON y bloques de tests que ya están en los archivos originales. Es útil para estudiar, pero no debe confundirse con otra fuente vigente del contrato.

**Problema concreto:** si se modifica un esquema o test, sus copias explicativas pueden quedar desactualizadas. La misma información termina requiriendo mantenimiento en varios lugares.

**Simplificación propuesta:** conservar el informe como registro histórico fechado; usar enlaces al código para futuras actualizaciones. El README debe concentrar cómo usar y probar el contrato, y el documento de compatibilidad debe conservar las preguntas pendientes para Claudio.

**Qué debe conservarse:** la explicación necesaria para la defensa y la trazabilidad del trabajo solicitado por el usuario. No borrar el informe ni la advertencia de compatibilidad pendiente solo para reducir archivos.

**Beneficio:** una fuente vigente para cada regla y menos copias de código para sincronizar.

## 5. Evitar decisiones anticipadas más específicas de lo necesario

**Prioridad: media.** Fuente: [seguridad, idempotencia y timeouts del README](../../contracts/README.md).

**Qué existe:** propuestas de JWT de 60 segundos, tolerancia de reloj de 5 segundos y retención de idempotencia de 24 horas, además de límites de conexión y proveedor. El documento las identifica como propuestas técnicas.

**Problema concreto:** si Facu acuerda otra política de autenticación o la integración exige otros tiempos, habrá que revisar estas cifras y sus referencias. Son compromisos de diseño adicionales que aún deben justificarse con el equipo.

**Simplificación propuesta:** mantener los controles exigidos y registrar los parámetros concretos en un único lugar, diferenciando requisitos confirmados de valores provisionales. Acordarlos con Facu antes de congelar el contrato; no agregar ahora infraestructura para configurarlos dinámicamente.

**Qué debe conservarse:** verificación de identidad y autorización del servicio, expiración, límites temporales, formato de los encabezados y reglas de reintentos. Simplificar no significa dejar peticiones sin límite o aceptar tokens sin verificar.

**Beneficio:** menos decisiones arbitrarias y menos lugares para ajustar cuando se implemente la comunicación real.

## Elementos que no conviene eliminar

| Elemento | Motivo para conservarlo |
| --- | --- |
| OpenAPI y esquemas compartidos | Cumplen el objetivo de T4 y permiten acordar el intercambio entre lenguajes. |
| Tipos, propiedades obligatorias y límites | Validan datos en una frontera entre servicios. |
| Objetos cerrados | Rechazan campos inesperados; no equivalen por sí solos a protección completa contra prompt injection. |
| Diferencia entre `null` y cero | Evita convertir información desconocida en un valor inventado. |
| Exclusión de puntajes, vendedores y estados de la IA | Conserva las responsabilidades acordadas de Express y supervisor. |
| Ejemplos positivos y negativos representativos | Permiten comprender y probar el contrato. |
| Pruebas de formatos y correspondencia de errores | Detectan contratos incompatibles y ejemplos incorrectos. |
| Validadores estándar | Evitan mantener una implementación casera de JSON Schema u OpenAPI. |
| Pendientes con Claudio | El modelo T3 aún debe confirmar la representación compartida. |

El PDF de referencia incluye explícitamente `task`, `lane`, `json_schema`, `max_tokens`, `data`, `usage`, `model`, `latency_ms`, JWT de servicio, `Idempotency-Key`, `X-Request-Id` y `X-Deadline`. No se recomienda quitarlos por simplicidad sin revisar primero ese requisito con el equipo y la consigna.

Los cinco esquemas y las dependencias actuales no se consideran redundantes solo por su cantidad. Reducirlos debe justificarse por una mejora concreta, sin duplicar definiciones o sustituir bibliotecas por lógica propia.

## Arquitectura hexagonal

La simplificación propuesta afecta documentos, ejemplos y tests de contrato. No requiere mover reglas de negocio a Python ni hacer depender el dominio de Express, HTTP o PostgreSQL.

T4 no necesita un framework de puertos, clases base, fábricas genéricas ni adaptadores vacíos. Cuando se implemente la integración, el cliente HTTP será un adaptador y la lógica comercial seguirá separada. Por ahora, describir y validar la frontera entre servicios es suficiente.

## Orden recomendado si se autoriza una implementación posterior

1. Reducir copias de ejemplos conservando sus casos de prueba y referencias necesarias.
2. Retirar el manifiesto si una convención sencilla resulta suficiente.
3. Simplificar los tests de navegación y eliminar la dependencia de la cantidad exacta de esquemas.
4. Delimitar documentos históricos y documentación vigente.
5. Acordar parámetros pendientes con Facu y compatibilidad de campos con Claudio.

No se fija una meta artificial de archivos o líneas. El resultado debe medirse contra la versión actual y comprobar que los escenarios importantes siguen presentes.

## Verificación y límites de este informe

- Se inspeccionaron contrato, esquemas, ejemplos, referencias, pruebas y documentación de T4, contrastándolos con el plan local y los acuerdos confirmados previamente por el usuario.
- El árbol de trabajo estaba limpio antes de crear este Markdown. El único cambio de esta solicitud es este informe.
- No se repitieron las suites en esta revisión estática. La validación del 9/11 previa a publicar T4 registró 10 pruebas contractuales y 15 del backend Python aprobadas; se cita como antecedente, no como una nueva ejecución.
- No se verificaron una integración HTTP, proveedor IA, autenticación operativa ni compatibilidad definitiva con T3; no están implementados o confirmados por esta revisión.
- La consigna docente original no está disponible para contrastarla directamente. No se presenta ninguna reducción como autorizada por el profesor.

**Dictamen:** conservar la base de T4 y simplificar primero la duplicación de ejemplos y su manifiesto. Mantener requisitos, validaciones y pruebas importantes. No congelar el contrato antes de la revisión de Claudio.
