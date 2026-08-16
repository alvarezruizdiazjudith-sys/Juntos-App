# Juntos · CoderCup MVP

Juntos es un MVP que conecta personas, grupos y comunidades con propuestas de Wellness cercanas y accesibles.

## Qué hace

1. El explorador o entidad completa un formulario en la landing.
2. La landing envía los datos a un Webhook de n8n Cloud.
3. n8n normaliza la información, busca compatibilidad, guarda el registro en Google Sheets y responde con JSON.
4. La web muestra una página de resultados personalizada con opciones demo.

## Audiencias

- **Explorador:** busca actividades cerca de su casa, barrio o trabajo.
- **Grupos:** se juntan para acceder mejor.
- **Entidades:** sociedades de fomento, asociaciones barriales, clubes o municipios que quieren diseñar propuestas para su comunidad.

## Pricing conceptual

| Plan | Concepto | Para quién | Lógica de precio |
|---|---|---|---|
| **Explorador** | Voy por mi cuenta | 1 persona | Precio estándar |
| **Manada** | Nos juntamos para acceder mejor | 3–8 personas | Descuento grupal |
| **Comunidad+** | Somos muchos y negociamos juntos | 9+ personas | Mejor precio / beneficios extra |

## Stack

- Frontend: HTML, CSS y JavaScript.
- Deploy frontend: Vercel.
- Backend/automatización: n8n Cloud.
- Base simple: Google Sheets.

## Configuración

En `index.html`, reemplazar:

```js
const N8N_WEBHOOK_URL = "https://TU-N8N-CLOUD.app.n8n.cloud/webhook/juntos-demo";
```

por la URL real de producción del Webhook de n8n Cloud.

También reemplazar:

```html
https://LINK-AL-VIDEO-DE-CODER
```

por el enlace real al video demo de Coderhouse cuando esté grabado.
