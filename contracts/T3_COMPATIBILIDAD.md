# Correspondencia propuesta con T3 — pendiente de Claudio

**Martín (C), T4 · 8/11/2026 · Estado: borrador revisable.**

Al sincronizar `origin/main` en `a1fdb6c`, no había modelo T3 versionado, ni `docs/modelo.md`, tablas o migraciones de negocio para verificar nombres reales. El usuario autorizó avanzar solo con campos básicos y dejar la compatibilidad pendiente de Claudio. No se contactó a Claudio ni se afirma que ya revisó el contrato.

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
| `presupuesto.moneda` | Moneda del monto | Tres letras mayúsculas; ejemplos USD y ARS, sin imponer monedas de negocio. | Catálogo permitido. El patrón no verifica códigos ISO reales. |
| `urgencia` | Urgencia/plazo declarado | Texto de hasta 300 caracteres o `null`. | Si T3 usa texto, fecha o categorías. No se calcula una prioridad comercial. |

Los límites numéricos y de longitud son elecciones técnicas propuestas para acotar el contrato. No se presentan como nuevos requisitos del negocio. Un monto desconocido es `presupuesto=null`, no cero. Si se declara cero, se conserva como cero y no se decide su calificación.

## Datos que no se envían al gateway

- Campaña, estado del lead, puntaje, reglas y vendedor asignado permanecen bajo control de Express.
- No se incluyen IDs de tablas ni un `lead_id` cuya forma T3 aún no definió. La correlación del intercambio se hace con `X-Request-Id`.
- Los estados acordados (`nuevo`, `en calificación`, `calificado`, `no calificado`, `asignado`, `cerrado`) no se traducen ni se cambian desde la IA.
- No se agregan operaciones de compra/alquiler, cálculos de comisiones, catálogo de propiedades ni automatismos de asignación.
- No se agregan datos de facturación o empresa procedentes de borradores de otro dominio.

## Decisiones pendientes de revisión conjunta

1. Claudio: correspondencia de cada ruta con el modelo T3, nulabilidad, presupuesto y urgencia.
2. Claudio + Facu: qué datos son necesarios en cada turno, minimización de contacto y validación antes de guardar.
3. Facu + Martín: perfil JWT de servicio, límites temporales y política de errores del consumidor.
4. Martín + Facu: catálogo de preguntas de seguimiento y modo de presentar texto seguro.
5. Los tres: aceptación de versión estable después de validar los ejemplos actualizados.

Cuando T3 esté disponible, revisar este cuadro, modificar solo el contrato de Martín que corresponda y volver a ejecutar sus tests. Un cambio incompatible con un consumidor publicado requerirá una nueva versión; antes de publicar, este borrador puede ajustarse mediante revisión. **T4 tiene una base técnica implementada, pero la compatibilidad T3 y el carácter definitivo siguen pendientes de Claudio.**
