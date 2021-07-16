import { isBase64, handleUrl, getJimp } from '../src/images';

describe('image.ts', () => {
  const base64String =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';

  it('isBase64() returns true when data: and base64 exist', () => {
    expect(isBase64('data:base64')).toBeTruthy();
  });

  it('isBase64() returns false when "data:" DNE', () => {
    expect(isBase64('base64')).toBeFalsy();
  });

  it('isBase64() returns false when "base64" DNE', () => {
    expect(isBase64('data:')).toBeFalsy();
  });

  it('isBase64() returns false when "data:" and "base64" DNE', () => {
    expect(isBase64('')).toBeFalsy();
  });

  it('handleUrl() base64 string', () => {
    expect(handleUrl(base64String, 'https://www.pwabuilder.com')).toBe(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII='
    );
  });

  it('handleUrl() absolute url', () => {
    expect(
      handleUrl(
        'https://www.pwabuilder.com/assets/icons/icon_512.png',
        'https://www.pwabuilder.com'
      )
    ).toBe('https://www.pwabuilder.com/assets/icons/icon_512.png');
  });

  it('handleUrl() relative url', () => {
    expect(
      handleUrl('assets/icons/icon_512.png', 'https://www.pwabuilder.com')
    ).toBe('https://www.pwabuilder.com/assets/icons/icon_512.png');
  });

  it('getJimp() base64', () => {
    return getJimp(
      {
        src: base64String,
        type: 'image/png',
        sizes: '512x512',
        purpose: 'any',
      },
      'https://www.pwabuilder.com'
    ).then(jimp => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(jimp).toBeTruthy();
    });
  });

  it('getJimp() absolute url', () => {
    return getJimp(
      {
        src: 'https://www.pwabuilder.com/assets/icons/icon_512.png',
        type: 'image/png',
        sizes: '512x512',
        purpose: 'any',
      },
      'https://www.pwabuilder.com'
    ).then(jimp => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(jimp).toBeTruthy();
    });
  });

  it('getJimp() relative url', () => {
    return getJimp(
      {
        src: 'assets/icons/icon_512.png',
        type: 'image/png',
        sizes: '512x512',
        purpose: 'any',
      },
      'https://www.pwabuilder.com'
    ).then(jimp => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(jimp).toBeTruthy();
    });
  });

  it('getJimp() bad url', () => {
    return getJimp(
      {
        src: 'assets/icons/icon_512.png',
        type: 'image/png',
        sizes: '512x512',
        purpose: 'any',
      },
      'https://www.example.com'
    )
      .then(jimp => {
        expect(jimp).toBeUndefined();
      })
      .catch((reason: Error) => {
        expect(reason.message).toBe('Could not find MIME for Buffer <null>');
      });
  });
});
