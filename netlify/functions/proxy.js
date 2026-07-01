export async function handler(event) {
  const targetUrl = event.queryStringParameters?.url;

  if (!targetUrl) {
    return {
      statusCode: 400,
      body: 'Missing url',
    };
  }

  try {
    const response = await fetch(targetUrl);
    const body = await response.text();

    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': response.headers.get('content-type') || 'text/plain',
      },
      body,
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 502,
      body: 'Proxy request failed',
    };
  }
}
