import fastify from 'fastify';
import JSZip from 'jszip';

import {
  handleIcons,
  getLargestImgManifestEntry,
  getLargestImg,
} from '../src/icons';

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

describe('icons', () => {
  it('handleIcons() icons', () => {
    const server = fastify();
    const zip = new JSZip();

    return handleIcons(
      server,
      zip,
      {
        ...mockManifest,
        icons: [
          {
            src: 'https://www.pwabuilder.com/assets/icons/icon_512.png',
            sizes: '512x512',
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

  it('handleIcons() icons but bad icon', () => {
    const server = fastify();
    const zip = new JSZip();

    return handleIcons(
      server,
      zip,
      {
        ...mockManifest,
        icons: [
          {
            src: 'https://www.example.com/assets/icons/icon_512.png',
            sizes: '512x512',
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

  it('handleIcons() no icons', () => {
    const server = fastify();
    const zip = new JSZip();

    return handleIcons(server, zip, mockManifest, siteUrl).then(operations => {
      expect(Array.isArray(operations)).toBeTruthy();
    });
  });

  it('getLargestImgManifestEntry() manifest is empty', () => {
    const image = getLargestImgManifestEntry(mockManifest);

    expect(image).toBeUndefined();
  });

  it('getLargestImgManifestEntry() manifest is single value', () => {
    const image = getLargestImgManifestEntry({
      ...mockManifest,
      icons: [
        {
          src: 'a',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
      ],
    });

    expect(image.src).toBe('a');
  });

  it('getLargestImgManifestEntry() manifest gets largest value', () => {
    const image = getLargestImgManifestEntry({
      ...mockManifest,
      icons: [
        {
          src: 'a',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: 'b',
          sizes: '64x64',
          type: 'image/png',
          purpose: 'any',
        },
      ],
    });

    expect(image.src).toBe('a');
  });

  it('getLargestImg() happy', () => {
    return getLargestImg('https://www.pwabuilder.com', {
      src: 'https://www.pwabuilder.com/assets/icons/icon_512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    }).then(jimp => {
      expect(jimp).toBeTruthy();
      expect(jimp.bitmap.height).toBe(512);
      expect(jimp.bitmap.width).toBe(512);
    });
  });
});
