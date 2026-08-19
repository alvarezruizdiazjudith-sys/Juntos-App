export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(500).json({
      error: 'Falta configurar N8N_WEBHOOK_URL en Vercel.'
    });
  }

  try {
    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(req.body || {})
    });

    const text = await n8nResponse.text();
    let data = {};

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!n8nResponse.ok) {
      return res.status(502).json({
        error: 'n8n rechazó la solicitud.',
        status: n8nResponse.status,
        details: data
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error conectando con n8n:', error);
    return res.status(502).json({
      error: 'No se pudo conectar con n8n.'
    });
  }
}
