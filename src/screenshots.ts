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

    const manifestScreenshots = getManifestScreenshots(siteUrl, manifest);

    const length = manifest.screenshots.length ?? 0;
    for (let i = 0; i < length; i++) {
      const screenshotEntry = manifest.screenshots[i];
      const screenshot = await manifestScreenshots[i];
      const screenshotMIME = screenshot.getMIME();
      const filePath = `screenshots/${handleScreenshotName(
        screenshotEntry,
        i
      )}`;

      operations.push(
        (async () => {
          try {
            zip.file(filePath, await screenshot.getBufferAsync(screenshotMIME));

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
    }

    return operations;
  } catch (e) {
    server.log.error(e);
    return operations;
  }
}

function getManifestScreenshots(
  baseUrl: string,
  manifest: WebAppManifest
): Array<Promise<Jimp>> {
  return manifest.screenshots.map((imageInfo) => {
    const url = handleUrl(imageInfo.src, baseUrl);
    return Jimp.read(url);
  });
}

function handleScreenshotName(
  screenshot: ManifestImageResource,
  index = 0
): string {
  const generic = `screenshot-${index}-${screenshot.sizes}.png`;

  if (isBase64(screenshot.src)) {
    return generic;
  } else {
    return screenshot.src.split("/").pop() ?? generic;
  }
}
