# Compatibilidad con T3 — acuerdos confirmados y pendientes

**Martín (C), T4 · Actualización: 9/11/2026 · Estado: compatibilidad parcial confirmada, contrato en borrador.**

Al preparar el borrador original no había un modelo T3 versionado para contrastar nombres reales. Ahora el usuario comunicó los acuerdos alcanzados con Claudio: moneda `ARS`, `USD` o `null`; información desconocida como `null`; monto conocido con moneda desconocida permitido; conservación de valores previos cuando Python no aporta datos y cuidado de no asociar un monto nuevo a una moneda anterior. Esta confirmación es parcial, no una aprobación de todos los campos o del contrato completo. No se contactó a Claudio mediante herramientas.

Los nombres siguientes son del documento JSON de transporte, **no columnas SQL aprobadas**. Una modificación del esquema compartido actualiza tanto `context` de entrada como `extracted_data` de salida. No se modifican archivos de Claudio.

| Ruta JSON | Correspondencia básica prevista | Representación de transporte del borrador | Claudio debe confirmar |
| --- | --- | --- | --- |
| `contacto` | Datos de contacto del lead | Objeto o `null`; nombre/email/teléfono presentes, cada uno puede ser `null`. | Nombres, obligatoriedad, normalización y qué contacto se admite. |
| `contacto.nombre` | Nombre declarado | Texto de hasta 120 caracteres o `null`. | Campo de T3 equivalente; no se separa apellido por inferencia. |
| `contacto.email` | Correo declarado | Email de hasta 254 caracteres o `null`. | Política de validación; un formato válido no demuestra titularidad. |
| `contacto.telefono` | Teléfono declarado | Texto de hasta 40 caracteres o `null`. | Formato y normalización; no se agrega unicidad. |
| `necesidades` | Necesidades inmobiliarias | Texto de hasta 2.000 caracteres o `null`. | Equivalencia con el campo de T3 y campos adicionales solo si se acuerdan. |
| `presupuesto` | Presupuesto declarado | Objeto `{monto, moneda}` o `null`. | Si T3 representa un monto, un rango u otra estructura; ajustar aquí antes de congelar. |
| `presupuesto.monto` | Monto conocido | Número JSON entre 0 y 10^12; límite técnico provisional. | Precisión decimal, límites de dominio y forma de convertir a PostgreSQL. No calcular dinero con floats por este contrato. |
| `presupuesto.moneda` | Moneda del monto | Solo `ARS`, `USD` o `null`. La propiedad está presente aunque su valor sea desconocido. | Catálogo y nulabilidad confirmados; sin moneda por defecto. |
| `urgencia` | Urgencia/plazo declarado | Texto de hasta 300 caracteres o `null`. | Si T3 usa texto, fecha o categorías. No se calcula una prioridad comercial. |

Los límites numéricos y de longitud son elecciones técnicas propuestas para acotar el contrato. No se presentan como nuevos requisitos del negocio. Un monto desconocido es `presupuesto=null`, no cero. Si se declara cero, se conserva como cero y no se decide su calificación.

## Decisiones confirmadas con Claudio

- `{"monto":100000,"moneda":null}` es válido. No se transforma automáticamente en ARS ni en USD. La ausencia de la propiedad `moneda` no equivale a `null`: el objeto mantiene sus campos obligatorios.
- La IA puede preguntar por la moneda con la clave existente `presupuesto`, que permanece en `missing_fields` mientras esté incompleto.
- Un `null` de Python no borra un valor previo. La regla alcanza campos de contacto y los objetos completos cuando son `null`.
- La excepción al mantenimiento de la moneda previa es un cambio de monto sin moneda correspondiente: el nuevo monto queda con moneda `null`, evitando reutilizar la moneda anterior. Si monto y moneda son conocidos, se consideran como un par.
- Estos comportamientos de conservación se implementarán en Express, no en el gateway ni en los tests de T4. La tabla de casos concretos está en [el README](README.md#conservación-de-datos-en-la-futura-integración-express).

## Datos que no se envían al gateway

- Campaña, estado del lead, puntaje, reglas y vendedor asignado permanecen bajo control de Express.
- No se incluyen IDs de tablas ni un `lead_id` cuya forma T3 aún no definió. La correlación del intercambio se hace con `X-Request-Id`.
- Los estados acordados (`nuevo`, `en calificación`, `calificado`, `no calificado`, `asignado`, `cerrado`) no se traducen ni se cambian desde la IA.
- No se agregan operaciones de compra/alquiler, cálculos de comisiones, catálogo de propiedades ni automatismos de asignación.
- No se agregan datos de facturación o empresa procedentes de borradores de otro dominio.

## Decisiones pendientes de revisión conjunta

1. Claudio: correspondencia de cada ruta con el modelo T3, contacto, urgencia, precisión y límites del monto; moneda y reglas de conservación ya están confirmadas.
2. Claudio + Facu: qué datos son necesarios en cada turno, minimización de contacto y validación antes de guardar.
3. Facu + Martín: perfil JWT de servicio, límites temporales y política de errores del consumidor.
4. Martín + Facu: catálogo de preguntas de seguimiento y modo de presentar texto seguro.
5. Los tres: aceptación de versión estable después de validar los ejemplos actualizados.

Cuando el modelo T3 esté disponible, contrastar los puntos restantes, modificar solo el contrato de Martín que corresponda y volver a ejecutar sus tests. Un cambio incompatible con un consumidor publicado requerirá una nueva versión; este borrador aún puede ajustarse mediante revisión. **Los acuerdos anteriores están confirmados, pero la compatibilidad completa y el carácter definitivo siguen pendientes de revisión del equipo.**
