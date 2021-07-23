import fastify from 'fastify';
import web from '../src/web';
import plugins from '../src/plugins';

import { createNewFormDataWithManifest } from '../src/formdata';

jest.mock('JSZip');
jest.mock('got');

// @ts-ignore
const mockManifest: WebAppManifest = {
  dir: 'ltr',
  lang: 'en',
  name: 'mock',
  short_name: 'mock',
  start_url: '/',
  display: 'browser',
  orientation: 'any',
  theme_color: '#ffffff',
  background_color: '#ffffff',
  scope: '.',
  description: 'this is a mock',
  icons: [],
  screenshots: [],
  categories: [],
  iarc_rating_id: 'ignore',
  prefer_related_applications: true,
};

describe('web.ts', () => {
  it('POST / - happy', () => {
    const server = web(fastify());

    return server
      .inject({
        method: 'POST',
        url: '/',
        query: {
          siteUrl: 'https://www.pwabuilder.com',
          hasServiceWorker: 'false',
          swId: '1',
        },
        payload: mockManifest,
      })
      .then(response => {
        expect(response.statusCode).toBe(200);
      });
  });

  it('POST /form - happy', () => {
    let server = plugins(fastify());
    server = web(server);

    const form = createNewFormDataWithManifest(mockManifest);

    return server
      .inject({
        method: 'POST',
        url: '/form',
        query: {
          siteUrl: 'https://www.pwabuilder.com',
          hasServiceWorker: 'false',
          swId: '1',
        },
        headers: form.getHeaders(),
        payload: form,
      })
      .then(response => {
        expect(response.statusCode).toBe(200);
      });
  });
});
