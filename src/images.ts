import { FastifyInstance } from 'fastify';
import Jimp from 'jimp';
import * as Url from 'url';

export function isBase64(uri: string): boolean {
  return uri.startsWith('data:') && uri.indexOf('base64') !== -1;
}

export function handleUrl(url: string, baseUrl: string): string {
  if (isBase64(url)) {
    return url.split(',').pop() as string;
  } else {
    return new Url.URL(url, baseUrl).toString();
  }
}

export async function getJimp(
  image: ManifestImageResource,
  baseUrl: string,
  server?: FastifyInstance
): Promise<Jimp | undefined> {
  try {
    const url: string = handleUrl(image.src, baseUrl);

    if (isBase64(image.src)) {
      const imgBuf = Buffer.from(image.src.split(',')[1], 'base64');
      return Jimp.read(imgBuf);
    }

    return Jimp.read(url);
  } catch (e) {
    server?.log.info(e);
  }

  return undefined;
}
