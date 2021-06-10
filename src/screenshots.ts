import JSZip from "jszip";
import Jimp from "jimp";
import { FastifyInstance } from "fastify";

import { handleUrl, isBase64 } from "./images";

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
        const url = handleUrl(screenshotEntry.src, siteUrl);
        const screenshot = await Jimp.read(url);

        filePath = `screenshots/${handleScreenshotName(
          screenshotEntry,
          screenshot,
          i
        )}`;
        const screenshotMIME = screenshot.getMIME();

        operations.push(
          (async () => {
            try {
              zip.file(
                filePath,
                await screenshot.getBufferAsync(screenshotMIME)
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
              errror: e as Error,
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
    return screenshot.src.split("/").pop() ?? generic;
  }
}
