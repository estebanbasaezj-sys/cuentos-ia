Requerimiento funcional — App “Cuentos IA” (MVP)
1. Visión general

Construir una aplicación móvil/web (PWA) que permita a padres generar cuentos personalizados para sus hijos usando IA para texto, imágenes e (opcional) audio TTS. El objetivo del MVP es validar demanda y retención ofreciendo una experiencia rápida, segura y emocionalmente resonante.

Objetivos del MVP

Generar cuentos personalizados (texto) y 4–6 ilustraciones por cuento.

Guardar cuentos en una biblioteca personal.

Descargar / compartir cuento en PDF (link privado).

Control parental y filtros básicos de contenido.

Modelo freemium: 1 cuento gratuito/día, suscripción para generar ilimitado y estilos premium.

2. Actores / Roles

Padre / Madre (Usuario adulto) — crea cuentos, gestiona biblioteca, paga suscripción.

Niño (Beneficiario) — no se registra; datos mínimos (nombre/apodo, edad aproximada).

Administrador (Backoffice) — revisa reports, moderación manual, dashboards de uso.

Sistema IA / Servicios externos — LLM para texto, image-gen para ilustraciones, TTS para audio, pasarela de pagos.

3. Alcance MVP (funcionalidades clave)

Onboarding y registro

Registro con email / OAuth (Google / Apple).

Parental gate para acciones sensibles (compra, compartir). No se requiere DOB del niño.

Crear cuento (flow principal)

Inputs: nombre/apodo del niño, edad aproximada (0–2, 3–5, 6–8...), tema (lista + campo libre), tono (tierno/divertido/educativo), longitud (corto/medio), 2–3 rasgos opcionales (mascota, color favorito).

Botón “Generar cuento”.

Proceso en background con barra de progreso; mostrar placeholder “Generando…”.

Resultado: texto del cuento dividido por páginas (4–8), 4–6 imágenes (una por página o por escena), opción “leer en voz alta” (TTS).

Editor ligero

Permitir editar el texto generado (WYSIWYG básica).

Re-generar imágenes para páginas modificadas.

Biblioteca

Listado de cuentos generados, filtros, búsqueda por nombre/tema/fecha.

Detalle cuento: ver, editar, descargar PDF, compartir link privado, eliminar.

Descarga / Compartir

Generar PDF estético (portada con nombre, páginas con imagen+texto).

Compartir mediante link privado con expiración configurable (p.ej. 7 días).

Monetización

Freemium: 1 cuento gratuito por día; ver contador.

Suscripción mensual (ej.: opción local en CLP + internacional).

Pago por cuento premium (opcional).

Integración con Stripe y/o Transbank (Webpay) para Chile.

Moderación y seguridad

Filtros automáticos de contenido (lista de palabras prohibidas, checks de violencia/sexualidad/peligro).

Sistema de flags: usuario puede reportar cuento; reportes van al backoffice.

Log de generación (prompt usado, outputs) para auditoría (retener X días).

Parental controls & privacidad

Consentimiento explícito del adulto al crear cuenta.

Minimizar datos del niño (no recolectar ubicación exacta, DNI, fotos del niño).

Función “Eliminar datos” para borrar cuentos y metadatos del usuario.

Backoffice mínimo

Dashboard: número de cuentos generados, usuarios activos, reportes de flags.

Queue de moderación manual (casos flagged).

Analytics y medición

Eventos: cuenta creada, cuento generado, cuento guardado, descarga PDF, suscripción, share.

Métricas: conversiones, retención D1/D7, ARPU.

4. Historias de usuario (ejemplos con criterios de aceptación)

US-001 (Crear cuento): Como padre quiero generar un cuento indicando nombre y tema para obtener un cuento personalizado con imágenes para leer al niño.

CA: Al enviar inputs válidos, el sistema devuelve cuento dividido en páginas + 4 imágenes en máximo 60–120s; botón “leer” reproduce TTS.

US-002 (Editar cuento): Como padre quiero editar frases del cuento para ajustar detalles antes de descargar.

CA: Cambios guardados y posibilidad de regenerar imágenes solo para páginas alteradas.

US-003 (Descargar PDF): Como padre quiero descargar el cuento en PDF para guardar/compartir.

CA: PDF genera formato con portada y el conteindo paginado; se descarga en <30s.

US-004 (Compartir link privado): Como padre quiero generar un link privado que expire en 7 días.

CA: Link accesible sin login hasta la expiración; opción revocar link.

US-005 (Freemium): Como usuario no suscrito quiero generar 1 cuento gratis por día.

CA: El contador de cuentos gratuitos se reinicia a las 00:00 horario del usuario; si intenta generar extras, se muestra upsell modal.

US-006 (Flagging): Como padre quiero reportar un cuento generado que me parece inapropiado.

CA: Reporte crea ticket en backoffice con ID y contenido del cuento; usuario recibe confirmación.

5. Requerimientos funcionales detallados
5.1 Frontend (Web PWA + posible app nativa posterior)

Pantallas:

Splash / Landing

Registro/Login (email, Google, Apple)

Onboarding (preferencias)

Crear cuento (formulario + historial prompts)

Generación (progress UI)

Resultado cuento (paginas carousel)

Editor de texto (inline)

Biblioteca (listado)

Detalle cuento (descargar, compartir, editar, borrar)

Pagina de pago / billing

Perfil / settings (delete data, parental settings)

Validaciones:

Campos obligatorios: nombre/apodo, edad aprox, tema.

Length limits: tema <= 100 chars; nombre <= 30.

UX:

Tiempo de generación mostrado.

Mensajes claros en caso de fallo (retry).

Parental gate (ej. marcar “Soy mayor de 18” + reCAPTCHA en acciones de pago/compartir).

5.2 Backend / APIs (propuestas)

Autenticación: JWT via Auth service.

Endpoints (ejemplos):

POST /api/v1/auth/signup {email,password} -> 201, userId

POST /api/v1/auth/login {email,password} -> token

POST /api/v1/stories {userId, child:{name,age_group}, theme, tone, length, traits[]} -> 202 (job queued) -> returns jobId

GET /api/v1/stories/{storyId} -> 200 {story metadata, pages:[{text, imageUrl}], pdfUrl?}

PUT /api/v1/stories/{storyId} {pages edits} -> 200 (re-generate images if pages changed)

POST /api/v1/stories/{storyId}/generate-pdf -> 202 (pdf job) -> 200 {pdfUrl}

POST /api/v1/stories/{storyId}/share {expires_in_days} -> 201 {shareUrl, token}

POST /api/v1/stripe/webhook -> handle payments

POST /api/v1/report {storyId, userId, reason} -> 201

GET /api/v1/admin/reports -> list flagged items (admin only)

GET /api/v1/usage -> metrics for user

Jobs/Queue:

Story generation should be asynchronous (jobs queued). Use Redis + worker pool.

Rate limits:

Default free user: 1/story per 24h; enforced server-side.

5.3 Integraciones externas

LLM/Text generation: OpenAI (ChatGPT/GPT-like) or similar. Use prompts control and temperature low for consistent output.

Image generation: image-gen API (DALL·E / other) with fixed style options. Cache results.

TTS: Amazon Polly / Google Cloud TTS / ElevenLabs (si licencia comercial) — Spanish (latam) voices.

Payments: Stripe + Transbank (Webpay) for Chile.

Storage / CDN: S3 (AWS) + CloudFront or equivalent for images/PDFs.

Auth: Firebase Auth or Auth0.

Monitoring: Sentry for error tracking; Prometheus + Grafana for metrics.

reCAPTCHA for parental gate / anti-bot.

5.4 Modelo de datos (tablas clave)

users (id, email, password_hash, name, created_at, country, is_subscribed, subscription_provider, subscription_id)

stories (id, user_id, title, child_name, child_age_group, theme, tone, length, traits JSON, status enum [queued, generating, ready, failed], created_at, updated_at, flagged_count)

pages (id, story_id, page_number, text, image_url, image_meta JSON)

pdfs (id, story_id, url, generated_at, size)

shares (id, story_id, share_token, expires_at, created_at, revoked boolean)

reports (id, story_id, user_id, reason, created_at, status)

jobs (id, type, payload JSON, status, result, created_at, updated_at)

audit_logs (id, user_id, action, payload, created_at)

5.5 Prompts y templates (ejemplos que debe contener el repo)

Prompt base (texto):

Eres un escritor de cuentos infantiles. Genera un cuento de {length} páginas para un niño de {age_group} llamado {child_name}. Tema: {theme}. Tono: {tone}. Incluir la mascota {pet} si se indicó. Cada página debe tener 2–4 oraciones claras, vocabulario adecuado a la edad, y terminar con una frase que conecte a la siguiente página. Evita violencia, sexualidad, instrucciones peligrosas y referencias reales de contacto.


Prompt imagen por página:

Genera una descripción detallada para una ilustración estilo {style} para la página {page_number} del cuento. Escena: {scene_summary}. Personajes: {child_name} (niño/niña, edad ~{age}), mascota: {pet if any}. Ambiente: colores cálidos, estilo ilustrativo infantil, sin texto en la imagen. Tamaño 1024x1024.

6. Requerimientos no-funcionales

Seguridad: HTTPS, encriptación de datos en reposo (S3) y en tránsito, almacenamiento seguro de tokens; cumplimiento básico de GDPR/LPD local (no recolectar datos sensibles).

Escalabilidad: arquitectura basada en microservices o servicios desacoplados; workers para generación; cache CDN.

Disponibilidad: 99% para servicios críticos (auth, generación de historias asincrónica puede degradarse).

Latencia: Respuestas síncronas <200ms para consultas simples; generación de cuento total <120s en promedio (dependiente de servicios).

Logs / Auditoría: registrar prompts usados y outputs (retener X días según política de privacidad).

Cost control: cachear imágenes y cuentos; límite de regeneraciones por free users; monitor costo por token/image.

7. Reglas de moderación y privacidad

Filtros automáticos en el pipeline antes de entregar cuento: lista negra de términos + classifier de seguridad (violence/sexual content/hate/ self-harm). Si classifier excede threshold, devolver mensaje de error y encolar para revisión manual.

No almacenar fotos de menores. Evitar almacenar DOB exacta; usar rangos de edad.

Política de eliminación: permitir al usuario borrar su cuenta y todos sus cuentos (GDPR-like) con confirmación.

Consentimiento: confirmar que adulto es quien crea la cuenta.

8. Backoffice / Operaciones

Panel admin básico:

Ver tickets/reportes

Revisar y aprobar/rechazar contenidos flagged

Export CSV de métricas

Control de estilos/vozes disponibles

Logs de costos IA por día para controlar gasto.

9. QA / Pruebas de aceptación (mínimas)

Tests unitarios para endpoints principales.

E2E flow: crear cuenta -> generar cuento -> editar -> descargar PDF -> compartir link -> report.

Seguridad: pruebas de inyección prompt, XSS en campos de texto, manejo de tokens.

Performance: load test para workers/queue.

10. Roadmap MVP → V1

MVP (6–10 semanas): Flows básicos, generación texto+imágenes, biblioteca, PDF, freemium limit, pagos, backoffice minimal.

V1 (3 meses): TTS, multi-estilos imagen, publicación automática (opcional), multi-idioma, packs premium, integración con impresión on-demand.

Escala: personalización avanzada, personajes recurrentes, partnerships (editoriales, colegios).

11. Consideraciones legales y comerciales

Revisar términos de uso y licencia de los modelos de IA seleccionados para uso comercial.

Definir política de precios en CLP y/o USD; impuestos locales.

Incluir cláusula de contenido generado por IA y responsabilidad limitada en T&C.

12. Estimación de esfuerzo (orientativa)

Equipo mínimo: 1 PM/PO, 1 diseñador UX/UI (parte time), 1 frontend dev (PWA), 1 backend dev (API + workers), 1 devops (parte time), 1 QA (parte time). Opcional freelance para prompts y curación editorial.

Tiempo: 6–10 semanas para MVP (si se tienen prompts e integración de APIs listos).

Coste estimado (desarrollo inicial): USD 15k–40k (varía por in-house vs agencia, coste de generación IA en pruebas).

13. Entregables para el equipo técnico

Este requerimiento funcional (documento).

Wireframes de pantallas (hero, crear cuento, resultado, biblioteca, pago).

Lista de prompts iniciales (text + image + TTS) con versiones de control (ve más abajo).

Spec API (endpoints list + sample payloads) — puede usarse para swagger.

DB schema (SQL DDL básico).

Plan de pruebas (QA) y checklist de lanzamiento.

Plantilla de mensajes de error / UX copy (i18n: español Chile).

Anexos útiles (Prompts iniciales — 3 plantillas)

Noche (tierno)
Prompt texto (LLM):

Eres un escritor de cuentos infantiles. Escribe un cuento de 6 páginas para un niño de {age_group} llamado {child_name}. Tema: "noche/ir a dormir". Tono: tierno y calmado. Incluye la mascota {pet} si está. Cada página: 2–3 oraciones, lenguaje simple, final feliz y una frase que invite a cerrar los ojos. Evita violencia o temas inquietantes.


Aventura (divertido)

Eres un escritor de cuentos infantiles. Escribe un cuento de 6 páginas para un niño de {age_group} llamado {child_name}. Tema: "aventura en el bosque/espacio". Tono: divertido y dinámico. Incluye elementos sorpresa, personajes simpáticos y un aprendizaje simple (valentía/amistad). Cada página: 2–4 oraciones.


Consuelo (educativo/emocional)

Eres un escritor de cuentos infantiles. Escribe un cuento de 6 páginas para un niño de {age_group} 