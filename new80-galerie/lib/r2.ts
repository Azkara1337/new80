import { AwsClient } from 'aws4fetch';

// Serveur uniquement : utilise les secrets R2.
function client() {
  return new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    service: 's3',
    region: 'auto',
  });
}

function objectUrl(key: string) {
  const path = key.split('/').map(encodeURIComponent).join('/');
  return new URL(`https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET}/${path}`);
}

/** URL signée (15 min) pour envoyer un fichier directement du navigateur vers R2. */
export async function presignPut(key: string) {
  const url = objectUrl(key);
  url.searchParams.set('X-Amz-Expires', '900');
  const signed = await client().sign(new Request(url, { method: 'PUT' }), { aws: { signQuery: true } });
  return signed.url;
}

export async function deleteObjects(keys: string[]) {
  const c = client();
  await Promise.all(keys.filter(Boolean).map((k) => c.fetch(objectUrl(k), { method: 'DELETE' })));
}
