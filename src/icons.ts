/* eslint-disable @typescript-eslint/no-non-null-assertion */
import JSZip from "jszip";
import Jimp from "jimp";
import { FastifyInstance } from "fastify";

import { handleUrl } from "./images";
import { servicesVersion } from "typescript";
// import { getGeneratedIconZip } from "./imageGenerator";

/*
  Handle Images

  1. Clears the icon manifest entries and the same for the json entry that controls the xcode project
  2. Create lists of promises for the jimp wrapped images that will be passed back to the main function for resolution
  3. While creating those promises, edit the asset lists to incorporate the image size meta data properly and only have relevant entries within the manifest proper.
  4. Write the manifest changes.

 */
export async function handleIcons(
  server: FastifyInstance,
  zip: JSZip,
  manifest: WebAppManifest,
  siteUrl: string
  // platform: string
): Promise<Array<Promise<OperationResult>>> {
  const operations: Array<Promise<OperationResult>> = [];
  try {
    if (!manifest.icons) {
      return operations;
    }

    // TODO add or remove the generated icons.
    //each image needs to be copied into two places, a manifest changes and also json write changes in the assets folder
    // const largestImgEntry = getLargestImgManifestEntry(manifest);
    // const genIconZip = await getGeneratedIconZip(
    //   server,
    //   await getLargestImg(siteUrl, largestImgEntry),
    //   platform
    // ).then((zip) => zip);

    // const genIconsStr = await genIconZip?.file("icons.json")?.async("string");
    // let genIconsList: Array<ManifestImageResource> = [];

    // if (genIconsStr) {
    //   genIconsList = JSON.parse(genIconsStr)["icons"];

    //   server.log.info(
    //     "handleImages(): genIconsList = " + JSON.stringify(genIconsList)
    //   );
    // }

    // manifest.icons = [];

    /*
      1. Attempt to grab icon from manifest
      2. If that fails grab it from the generated icon list
      3. Push an operation into the list to be returned.
      4. Edit the manifest entry
      5. Add entry to the Contents.json
     */
    const length = manifest.icons.length ?? 0;
    for (let i = 0; i < length; i++) {
      const iconEntry = manifest.icons[i];
      let filePath = iconEntry.src;

      try {
        const url = handleUrl(iconEntry.src, siteUrl);
        const icon = await Jimp.read(url);

        const iconName = `${iconEntry.sizes}.` + icon.getExtension();
        const iconMIME = icon.getMIME();
        filePath = `images/${iconName}`;

        operations.push(
          (async () => {
            try {
              zip.file(filePath, await icon.getBufferAsync(iconMIME));

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
  } catch (error) {
    server.log.error(error);
    return operations;
  }
}

export function getLargestImgManifestEntry(
  manifest: WebAppManifest
): ManifestImageResource {
  let largestIndex = 0;
  let largestSize = 0;

  manifest.icons.forEach((icon, index) => {
    icon.sizes.split(" ").forEach((size) => {
      const currentSize = sizeOf(size);
      if (currentSize > largestSize) {
        largestIndex = index;
        largestSize = currentSize;
      }
    });
  });

  return manifest.icons[largestIndex];
}

export function getLargestImg(
  baseUrl: string,
  manifestEntry: ManifestImageResource
): Promise<Jimp> {
  const url = handleUrl(manifestEntry.src, baseUrl);
  return Jimp.read(url);
}

function sizeOf(size: string): number {
  return Number(size.split("x")[0]);
}
