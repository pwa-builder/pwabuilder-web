import JSZip from 'jszip';
import Jimp from 'jimp';
import { FastifyInstance } from 'fastify';

import { getJimp, isBase64 } from './images';

export async function handleScreenshots(
  server: FastifyInstance,
  zip: JSZip,
  manifest: WebAppManifest,
  siteUrl: string
): Promise<Array<Promise<OperationResult>>> {
  const operations: Array<Promise<OperationResult>> = [];
  try {
    if (!manifest.screenshots) {
      return operations;
    }

    const length = manifest.screenshots.length ?? 0;
    for (let i = 0; i < length; i++) {
      const screenshotEntry = manifest.screenshots[i];
      let filePath = screenshotEntry.src;

      try {
        const screenshot = await getJimp(screenshotEntry, siteUrl);

        if (!screenshot) {
          server.log.error(
            "the service wasn't able to generate the screenshot"
          );
          operations.push(
            (async () => {
              return {
                filePath,
                success: false,
              };
            })()
          );
          continue;
        }
        const width = screenshot.bitmap.width;
        const height = screenshot.bitmap.height;

        filePath = `screenshots/${handleScreenshotName(
          screenshotEntry,
          screenshot,
          i
        )}`;
        manifest.screenshots[i].src = filePath;

        const screenshotMIME = screenshot.getMIME();

        operations.push(
          (async () => {
            try {
              zip.file(
                filePath,
                await screenshot
                  .quality(100)
                  .resize(width, height)
                  .getBufferAsync(screenshotMIME)
              );

              return {
                filePath,
                success: true,
              };
            } catch (error) {
              return {
                filePath,
                success: false,
                error: error as Error,
              };
            }
          })()
        );
      } catch (e) {
        operations.push(
          (async () => {
            return {
              filePath,
              success: false,
              error: e as Error,
            };
          })()
        );
      }
    }

    return operations;
  } catch (e) {
    server.log.error(e);
    return operations;
  }
}

function handleScreenshotName(
  screenshot: ManifestImageResource,
  jimp: Jimp,
  index = 0
): string {
  const generic = `screenshot-${index}-${
    screenshot.sizes
  }.${jimp.getExtension()}`;

  if (isBase64(screenshot.src)) {
    return generic;
  } else {
    return screenshot.src.split('/').pop() ?? generic;
  }
}
