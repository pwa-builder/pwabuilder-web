import { FastifyInstance } from 'fastify';

export function generateObjectFromFormData<T>(
  busboyBody: any,
  server?: FastifyInstance
): WebAppManifest {
  server?.log.info(busboyBody);

  const manifest = {} as WebAppManifest;
  const keys = Object.keys(busboyBody);
  const length = keys.length;
  for (let index = 0; index < length; index++) {
    // the fastify-multipart mapper adds the buffer fields as strings, or arrays of strings for our usage.
    const key = keys[index] as keyof WebAppManifest;
    const formField = busboyBody[key] as BusBoyItem | Array<BusBoyItem>;

    server?.log.info(key);

    if (Array.isArray(formField)) {
      manifest[key] = (formField as Array<BusBoyItem>).map(item =>
        parseValues(item.value)
      );
    } else {
      server?.log.info((formField as BusBoyItem).value);

      if ((<string>formField.value).startsWith('{')) {
        manifest[key] = JSON.stringify(formField.value);
      } else {
        manifest[key] = formField.value;
      }
    }

    server?.log.info(manifest[key]);
  }

  return manifest;
}

function parseValues(field: string): any {
  const trimmed = field.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return JSON.parse(field);
  } else {
    return field;
  }
}
