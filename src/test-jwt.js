const crypto = require('crypto').webcrypto;

async function test() {
  const secret = 'mysecret';
  
  // sign
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { sub: 'admin', iat: Math.floor(Date.now() / 1000), type: 'session' };
  const encoder = new TextEncoder();
  
  const stringifiedHeader = JSON.stringify(header);
  const stringifiedPayload = JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) });

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

  const token = `${base64Header}.${base64Payload}.${base64Signature}`;
  console.log('Token:', token);

  // verify
  const parts = token.split('.');
  
  const [vHeader, vPayload, vSignature] = parts;
  const vData = encoder.encode(`${vHeader}.${vPayload}`);
  const vKey = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['verify']
  );
  
  // Missing padding fix: you can add padding to atob
  try {
    const rawSig = vSignature.replace(/-/g, '+').replace(/_/g, '/');
    console.log("Raw sig length:", rawSig.length);
    const decodedSig = atob(rawSig);
    const sigUint8 = new Uint8Array(decodedSig.split('').map(c => c.charCodeAt(0)));
    const isValid = await crypto.subtle.verify('HMAC', vKey, sigUint8, vData);
    console.log('IsValid:', isValid);
  } catch (e) {
    console.error('Verify error:', e.message);
  }
}

test();
