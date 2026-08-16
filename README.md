# Juntos · CoderCup MVP

Juntos es un MVP que conecta personas, grupos y comunidades con propuestas de Wellness cercanas y accesibles.

## Qué hace

1. El explorador o entidad completa un formulario en la landing.
2. La landing procesa la solicitud y puede integrarse con un backend/automatización.
3. El backend puede normalizar la información, buscar compatibilidad, guardar el registro y responder con JSON.
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
- Backend/automatización posible: n8n Cloud.
- Base simple posible: Google Sheets.

## Configuración segura

No hardcodear secretos, API keys, tokens, passwords ni credenciales en `index.html`, `resultados.html` ni en ningún archivo que termine en el navegador.

Los archivos `.env` y `.env.*` están ignorados por Git mediante `.gitignore` (excepto un eventual `.env.example` sin valores reales).

Si JUNTOS vuelve a conectarse con n8n u otro servicio externo:

1. Guardar tokens o credenciales únicamente como variables de entorno del backend o de Vercel.
2. No exponer secretos mediante JavaScript del frontend: todo código que llega al navegador debe considerarse público.
3. Si el webhook requiere protección, autenticación o puede ejecutar acciones sensibles, llamarlo desde una función server-side/API route y no directamente desde el navegador.
4. No usar la URL de un webhook como si fuera un secreto o mecanismo de autenticación.
5. Revisar la política `Content-Security-Policy` de `vercel.json` si se agrega un nuevo dominio externo que deba recibir requests.
6. Si un secreto llega a subirse por error, eliminarlo del repo no alcanza: hay que revocarlo/rotarlo inmediatamente y, si corresponde, limpiar también el historial de Git.

## Video demo

Reemplazar el placeholder:

```html
https://LINK-AL-VIDEO-DE-CODER
```

por el enlace real al video demo cuando esté grabado. Ese enlace debe ser público y no contener credenciales.
