import fastify from 'fastify';
import JSZip from 'jszip';

import { handleScreenshots } from '../src/screenshots';

jest.mock('fastify');
jest.mock('JSZip');

const siteUrl = 'https://www.pwabuilder.com';

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

describe('screenshots.ts', () => {
  it('handleScreenshots() screenshots', () => {
    const server = fastify();
    const zip = new JSZip();

    return handleScreenshots(
      server,
      zip,
      {
        ...mockManifest,
        screenshots: [
          {
            src: 'https://www.pwabuilder.com/assets/screenshots/screen1.png',
            sizes: '2880x1800',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      siteUrl
    ).then(operations => {
      expect(Array.isArray(operations)).toBeTruthy();
    });
  });

  it('handleScreenshots() screenshots but bad screenshot', () => {
    const server = fastify();
    const zip = new JSZip();

    return handleScreenshots(
      server,
      zip,
      {
        ...mockManifest,
        screenshots: [
          {
            src: 'https://www.example.com/assets/screenshots/screen1.png',
            sizes: '2880x1800',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      siteUrl
    ).then(operations => {
      expect(Array.isArray(operations)).toBeTruthy();
    });
  });

  it('handleScreenshots() empty screenshots', () => {
    const server = fastify();
    const zip = new JSZip();

    return handleScreenshots(
      server,
      zip,
      {
        ...mockManifest,
      },
      siteUrl
    ).then(operations => {
      expect(Array.isArray(operations)).toBeTruthy();
    });
  });
});
