/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as Url from "url";
import JSZip from "jszip";
import Jimp from "jimp";
import { getGeneratedIconZip } from "./imageGenerator";
import { FastifyInstance } from "fastify";
import * as appiconsetJson from "./assets/MacOSpwa/Assets.xcassets/AppIcon.appiconset/Contents.json";

/*
  Handle Images

  1. Clears the icon manifest entries and the same for the json entry that controls the xcode project
  2. Create lists of promises for the jimp wrapped images that will be passed back to the main function for resolution
  3. While creating those promises, edit the asset lists to incorporate the image size meta data properly and only have relevant entries within the manifest proper.
  4. Write the manifest changes.

 */
export async function handleImages(
  server: FastifyInstance,
  zip: JSZip,
  manifest: WebAppManifest,
  siteUrl: string,
  platform: string
): Promise<Array<Promise<OperationResult>>> {
  try {
    const operations: Array<Promise<OperationResult>> = [];

    // Clear the two entries that require the correct pathing, add entries based on what is returned in the generated.
    const appIconContents = { ...appiconsetJson };

    //each image needs to be copied into two places, a manifest changes and also json write changes in the assets folder
    const largestImgEntry = getLargestImgManifestEntry(manifest);
    const genIconZip = await getGeneratedIconZip(
      server,
      await getLargestImg(siteUrl, largestImgEntry),
      platform
    ).then((zip) => zip);
    const manifestIcons = await getIconsFromManifest(siteUrl, manifest);
    const genIconsStr = await genIconZip?.file("icons.json")?.async("string");
    let genIconsList: Array<ManifestImageResource> = [];

    if (genIconsStr) {
      genIconsList = JSON.parse(genIconsStr)["icons"];
    }

    manifest.icons = [];

    /*
      1. Attempt to grab icon from manifest
      2. If that fails grab it from the generated icon list
      3. Push an operation into the list to be returned.
      4. Edit the manifest entry
      5. Add entry to the Contents.json
     */
    for (const iconEntry of genIconsList) {
      let iconP = manifestIcons.get(iconEntry.sizes);

      if (!manifestIcons) {
        const iconResouceBuffer = (await genIconZip!
          .file(iconEntry.src)
          ?.async("nodebuffer")) as Buffer;
        iconP = Jimp.read(iconResouceBuffer);
      }

      const icon = await iconP!;
      const iconName = `${iconEntry.sizes}.` + icon.getExtension();
      const iconMIME = icon.getMIME();
      const filePath = `MacOSpwa/Assets.xcassets/${iconName}`;

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
              error,
            };
          }
        })()
      );

      appIconContents.images
        .map((entry, i) => {
          if (entry.size === iconEntry.sizes) {
            return i;
          }
        })
        .filter((entry) => typeof entry === "number")
        .forEach((index) => {
          appIconContents.images[index as number].filename = iconName;
        });

      manifest.icons.push({
        src: filePath,
        sizes: iconEntry.sizes,
        type: iconMIME,
        purpose: "any",
      });
    }

    zip.file(
      "MacOSpwa/Assets.xcassets/AppIcon.appiconset/Contents.json",
      JSON.stringify(appIconContents, undefined, 2)
    );

    return operations;
  } catch (error) {
    server.log.error(error);
    return [];
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
  const url = new Url.URL(manifestEntry.src, baseUrl).toString();
  return Jimp.read(url);
}

export function getIconsFromManifest(
  baseUrl: string,
  manifest: WebAppManifest
): Map<string, Promise<Jimp>> {
  const manifestMap: Map<string, Promise<Jimp>> = new Map();

  manifest.icons.forEach((imageInfo) => {
    const url = new Url.URL(imageInfo.src, baseUrl).toString();
    const jimp = Jimp.read(url);
    const sizes = imageInfo.sizes.split(" ");

    sizes.forEach((size) => {
      manifestMap.set(size, jimp);
    });
  });

  return manifestMap;
}

function sizeOf(size: string): number {
  return Number(size.split("x")[0]);
}
