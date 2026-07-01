export default async function handler(req, res) {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    res.status(400).send('Missing url');
    return;
  }

  try {
    const response = await fetch(targetUrl);
    const body = await response.text();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(response.status).send(body);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(502).send('Proxy request failed');
  }
}
