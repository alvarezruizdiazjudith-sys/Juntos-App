# Juntos · CoderCup MVP

Juntos es un MVP que convierte intereses individuales y comunitarios en demanda colectiva organizada.

## Qué hace

1. La persona o entidad completa un formulario en la landing.
2. La landing envía los datos a un Webhook de n8n Cloud.
3. n8n normaliza, clasifica, detecta oportunidad y guarda el registro en Google Sheets.
4. n8n responde con JSON.
5. La web muestra una página de resultados personalizada.

## Stack

- Frontend: HTML, CSS y JavaScript.
- Deploy frontend: Vercel.
- Backend/automatización: n8n Cloud.
- Base simple: Google Sheets.

## Archivos

```text
index.html
resultados.html
README.md
```

## Configuración

En `index.html`, reemplazar:

```js
const N8N_WEBHOOK_URL = "https://TU-N8N-CLOUD.app.n8n.cloud/webhook/juntos-demo";
```

por la URL real de producción del Webhook de n8n Cloud.

Para test local se puede abrir `index.html` directamente en el navegador, pero para la demo final se recomienda deployar en Vercel.
