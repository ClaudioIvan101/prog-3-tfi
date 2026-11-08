# T1 — Decisiones confirmadas de la etapa 1

**TPI inmobiliario · Grupo 8 · 8 de noviembre de 2026**

Referencia: [PLAN_IMPLEMENTACION_ETAPA_1.md](./PLAN_IMPLEMENTACION_ETAPA_1.md). Fuente de aprobación: confirmación del equipo comunicada por el usuario en este chat, incluida la ratificación de los nombres de estados. Este registro documenta acuerdos; no acredita funcionalidades implementadas.

## Equipo y alcance autorizado

| Integrante | Identificación | Responsabilidad prevista por el plan para T1/T2 |
| --- | --- | --- |
| Facu | A | Registro de decisiones y revisión técnica del PR #2. |
| Claudio | B | Participación en decisiones y revisión humana del resultado T2. |
| Martín | C | Participación en decisiones, con foco en límites de Python e IA. |

La revisión realizada por el asistente no sustituye una revisión formal de Claudio ni una firma individual de cada integrante.

Se autorizaron únicamente **T1: documentar acuerdos** y **T2: revisar PR #2 y preparar informe de integración con pruebas**. No se inició T3, no se diseñaron tablas, migraciones, contratos de persistencia ni transiciones de estados; tampoco se ejecutaron las tareas T4–T10.

## Acuerdos vigentes

| ID | Decisión confirmada | Límite del acuerdo |
| --- | --- | --- |
| D01 | Integrantes: Facu (A), Claudio (B), Martín (C). | Se reemplazan las identificaciones incompletas del plan anterior. |
| D02 | Dominio inmobiliario básico. | Sin lógica comercial adicional de compra/alquiler. La propuesta anterior no obliga a agregar reglas, cálculos ni campos especiales para esas operaciones. |
| D03 | Estados de lead en español, con los seis nombres de la siguiente sección. | No se aprueban automáticamente estados de conversación, transiciones o valores técnicos de BD/API. |
| D04 | Autenticación JWT y roles `administrador`, `supervisor`, `vendedor`. | No se implementan login ni permisos. Algoritmo, vencimientos, refresh y matriz detallada de acceso no quedan confirmados solo por aprobar JWT. |
| D05 | La IA conversa, extrae información y genera resúmenes. | No calcula puntajes, modifica reglas ni asigna vendedores. No se implementan proveedor ni conversaciones en T1/T2. |
| D06 | Express calcula el puntaje mediante reglas. | Los criterios, pesos y umbrales no se inventan en este registro. |
| D07 | El supervisor asigna vendedores manualmente. | No se incorpora asignación automática ni selección por IA. |
| D08 | Express emite las notificaciones; Mailpit se usa en pruebas. | Mailpit es infraestructura de pruebas, no evidencia de envío implementado. |
| D09 | Python procesa IA; Express administra el negocio. | Se conserva la separación de responsabilidades. No se implementa comunicación HTTP entre APIs todavía. |

## Estados de lead confirmados

1. `nuevo`
2. `en calificación`
3. `calificado`
4. `no calificado`
5. `asignado`
6. `cerrado`

La lista fue ratificada expresamente por el usuario durante esta revisión. El orden sirve para enumerar los nombres; **no representa una máquina de estados ni permite inferir transiciones**. El mapeo a identificadores técnicos y las reglas de cambio corresponden a trabajo posterior autorizado.

## Qué reemplaza del plan anterior

- Las referencias a servicios digitales quedan desplazadas por el dominio inmobiliario confirmado.
- La propuesta de intención compra/alquiler no autoriza agregar lógica comercial adicional.
- Los nombres ingleses de estados de leads se sustituyen por los españoles confirmados. No se traduce código existente porque no hay implementación autorizada de esos estados.
- La IA incluye conversación, extracción y resumen; cualquier contrato posterior debe contemplar esas responsabilidades y excluir puntajes y asignaciones.
- La asignación por supervisor y las notificaciones desde Express dejan de ser propuestas abiertas.
- JWT queda confirmado; sus detalles criptográficos y de sesión del PDF siguen como diseño de referencia, no como decisiones adicionales aprobadas por inferencia.

## Pendientes identificados sin avanzar a T3

La consigna docente original y las expectativas específicas de Python no se verificaron con el profesor. No se afirma que esa consulta esté resuelta. El modelo, las reglas, la matriz de permisos, la representación técnica de estados y el contrato detallado siguen pendientes de las tareas correspondientes.

**Resultado T1:** acuerdos del equipo registrados y discrepancias con propuestas anteriores identificadas. Esto no equivale a completar la etapa 1 ni habilita la siguiente tarea.

Documentación guardada junto al plan y fuera del repositorio, siguiendo la ubicación de los entregables anteriores. No se modificó el PDF, no se publicó contenido ni se creó un commit.
