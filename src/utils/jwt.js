export async function signJwt(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encoder = new TextEncoder();
  const stringifiedHeader = JSON.stringify(header);
  const stringifiedPayload = JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) }); // 24h expiry

  const base64Header = btoa(stringifiedHeader).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const base64Payload = btoa(stringifiedPayload).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const data = encoder.encode(`${base64Header}.${base64Payload}`);
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${base64Header}.${base64Payload}.${base64Signature}`;
}

function decodeBase64Url(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  base64 += '='.repeat((4 - base64.length % 4) % 4);
  return atob(base64);
}

export async function verifyJwt(token, secret) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const encoder = new TextEncoder();
  const data = encoder.encode(`${header}.${payload}`);

  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['verify']
  );

  try {
    const decodedSig = decodeBase64Url(signature);
    const sigUint8 = new Uint8Array(decodedSig.split('').map(c => c.charCodeAt(0)));
    const isValid = await crypto.subtle.verify('HMAC', key, sigUint8, data);

    if (!isValid) return null;

    const decodedPayload = JSON.parse(decodeBase64Url(payload));
    if (decodedPayload.exp && Date.now() / 1000 > decodedPayload.exp) return null;

    return decodedPayload;
  } catch (e) {
    console.error('JWT Verification Error:', e);
    return null;
  }
}
