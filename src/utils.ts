import { FastifyInstance } from 'fastify';

export function generateObjectFromFormData(
  busboyBody: WebAppManifest,
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

    // handle arrays of 2+ elements.
    if (Array.isArray(formField)) {
      manifest[key] = (formField as Array<BusBoyItem>).map(item =>
        parseValues(item.value)
      );
      // need behavior to handle single elements of array elements.
    } else if (
      key === 'icons' ||
      key === 'screenshots' ||
      key === 'shortcuts'
    ) {
      manifest[key] = [JSON.parse(formField.value)];
      //single elements of the categories array
    } else if (key === 'categories') {
      manifest[key] = [formField.value];
    } else {
      if ((<string>formField.value).startsWith('{')) {
        manifest[key] = parseValues(formField.value);
      } else if (formField.value === 'true') {
        // support for true and false
        manifest[key] = true;
      } else if (formField.value === 'false') {
        manifest[key] = false;
      } else if (parseInt(formField.value)) {
        // check if number, then use number to handle floats
        manifest[key] = Number(formField.value);
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
