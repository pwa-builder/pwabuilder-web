/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { generateObjectFromFormData } from '../src/utils';

describe('generateObjectFromFormData()', () => {
  it('bus boy parsed manifest (normal scenario)', () => {
    const mockManifestIcons = [
      {
        src: 'a.png',
        type: 'image/png',
        sizes: '512x512',
        purpose: 'any',
      },
      {
        src: 'b.png',
        type: 'image/png',
        sizes: '16x16 32x32',
        purpose: 'any',
      },
    ];
    const mockManifestScreenshots = [
      {
        src: 'c.png',
        type: 'image/png',
        sizes: '512x512',
        purpose: 'any',
      },
      {
        src: 'd.png',
        type: 'image/png',
        sizes: '16x16 32x32',
        purpose: 'any',
      },
    ];

    const mockManifestBusBoyed: BusBoyWebAppManifestLike = {
      dir: { fieldname: 'dir', value: 'ltr' },
      name: { fieldname: 'name', value: 'mock' },
      icons: mockManifestIcons.map(icon => {
        return {
          fieldname: 'icons',
          value: JSON.stringify(icon),
        };
      }),
      screenshots: mockManifestScreenshots.map(screenshot => {
        return {
          fieldname: 'screenshots',
          value: JSON.stringify(screenshot),
        };
      }),
      categories: [
        { fieldname: 'categories', value: 'books' },
        { fieldname: 'categories', value: 'blog' },
      ],
      prefer_related_applications: {
        fieldname: 'prefer_related_applications',
        value: 'true',
      },
    };

    const parsedManifest: WebAppManifest =
      generateObjectFromFormData(mockManifestBusBoyed);

    expect(parsedManifest.dir).toBe('ltr');
    expect(parsedManifest.prefer_related_applications).toBe(true);
    expect(parsedManifest.categories).toStrictEqual(['books', 'blog']);

    expect(parsedManifest.icons).toStrictEqual(mockManifestIcons);
    expect(parsedManifest.screenshots).toStrictEqual(mockManifestScreenshots);
  });

  it('prefer_related_applications false', () => {
    const mockManifestBusBoyed: BusBoyWebAppManifestLike = {
      prefer_related_applications: {
        fieldname: 'prefer_related_applications',
        value: 'false',
      },
    };

    const parsedManifest = generateObjectFromFormData(mockManifestBusBoyed);
    expect(parsedManifest.prefer_related_applications).toBe(false);
  });

  it('categories 1 element', () => {
    const mockManifestBusBoyed: BusBoyWebAppManifestLike = {
      categories: { fieldname: 'categories', value: 'books' },
    };

    const parsedManifest = generateObjectFromFormData(mockManifestBusBoyed);
    expect(parsedManifest.categories).toStrictEqual(['books']);
  });

  it('icons 1 element', () => {
    const icon = {
      src: 'a.png',
      type: 'image/png',
      sizes: '512x512',
      purpose: 'any',
    };

    const mockManifestBusBoyed: BusBoyWebAppManifestLike = {
      icons: {
        fieldname: 'icons',
        value: JSON.stringify(icon),
      },
    };

    const parsedManifest = generateObjectFromFormData(mockManifestBusBoyed);
    expect(parsedManifest.icons).toStrictEqual([icon]);
  });

  it('screenshots 1 element', () => {
    const screenshot = {
      src: 'd.png',
      type: 'image/png',
      sizes: '16x16 32x32',
      purpose: 'any',
    };

    const mockManifestBusBoyed: BusBoyWebAppManifestLike = {
      screenshots: {
        fieldname: 'icons',
        value: JSON.stringify(screenshot),
      },
    };

    const parsedManifest = generateObjectFromFormData(mockManifestBusBoyed);
    expect(parsedManifest.screenshots).toStrictEqual([screenshot]);
  });

  it('shortcuts 1 element', () => {
    const shortcut = {
      name: 'a',
      short_name: 'a',
      description: 'desc',
      url: 'www.example.com',
      icons: [
        {
          src: 'a.png',
          sizes: '16x16',
        },
      ],
    };

    const mockManifestBusBoyed: BusBoyWebAppManifestLike = {
      shortcuts: {
        fieldname: 'shortcuts',
        value: JSON.stringify(shortcut),
      },
    };

    const parsedManifest = generateObjectFromFormData(mockManifestBusBoyed);
    expect(parsedManifest.shortcuts).toStrictEqual([shortcut]);
  });

  it('handle number (no element exists atm)', () => {
    const parsedManifest = generateObjectFromFormData({
      test: { fieldname: 'test', value: '1' },
    } as BusBoyWebAppManifestLike);

    expect(parsedManifest.test).toBe(1);
  });
});
