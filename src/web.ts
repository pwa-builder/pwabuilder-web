import { FastifyInstance } from "fastify";
import JSZip from "jszip";
import { tempAppName } from "./constants";
import { handleImages } from "./images";
import {
  FilesAndEdit,
  copyFiles,
  copyFile,
  copyAndEditFile,
  copyFolder,
} from "./copy";
import { webAppManifestSchema } from "./schema";

function schema(server: FastifyInstance) {
  return {
    querystring: {
      type: "object",
      properties: {
        siteUrl: { type: "string" },
      },
    },
    body: webAppManifestSchema(server),
    response: {
      // 200 response is file a so no json schema
      400: {
        type: "object",
        properties: {
          message: { type: "string" },
          errMessage: { type: "string" },
        },
      },
    },
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function web(server: FastifyInstance) {
  return server.route({
    method: "POST",
    url: "/",
    schema: schema(server),
    handler: async function (request, reply) {
      try {
        const zip = new JSZip();
        const siteUrl = (request.query as WebQuery).siteUrl as string;
        const manifest = request.body as WebAppManifest;

        // TODO change the boilerplate here
        const results = await Promise.all([
          ...(await handleImages(server, zip, manifest, siteUrl, "ios")),
          ...copyFiles(zip, manifest, filesAndEdits),
        ]);

        const errors = results.filter((result) => !result.success);
        if (errors.length > 0) {
          throw Error(errors.map((result) => result.filePath).toString());
        }

        // Send Stream
        reply
          .type("application/zip")
          .send(await zip.generateAsync({ type: "nodebuffer" }));
      } catch (err) {
        server.log.error(err);

        reply.status(400).send({
          message: "failed to create your macos project",
          errMessage: err.message,
        });
      }
    },
  });
}

// Object that holds the files and edit functions to those files.
const filesAndEdits: FilesAndEdit = {
  "MacOSpwa/AppDelegate.swift": copyFile,
  "MacOSpwa/Extension.swift": copyFile,
  "MacOSpwa/Info.plist": copyFile,
  "MacOSpwa/MacOSpwa.entitlements": copyFile,
  "MacOSpwa/Manifest.swift": copyFile,
  "MacOSpwa/ViewController.swift": copyFile,
  "MacOSpwa.xcodeproj/project.pbxproj": copyAndEditFile(
    async (content, manifest) => {
      const name = `name = `;
      const productName = `productName = `;
      const testName = `name = `;
      const uiTestName = `name = `;
      const product_name = `PRODUCT_NAME = `;
      const test_host = `(BUILT_PRODUCTS_DIR)/`;

      return (
        content
          .replace(`${name}${tempAppName}`, `${name}${manifest.short_name}`)
          .replace(
            `${productName}${tempAppName}`,
            `${name}${manifest.short_name}`
          )
          .replace(
            `${name}${tempAppName}`,
            `${productName}${manifest.short_name}`
          )
          .replace(
            `${testName}${tempAppName + "Tests"}`,
            `${testName}${manifest.short_name + "Tests"}`
          )
          .replace(
            `${uiTestName}${tempAppName}`,
            `${uiTestName}${manifest.short_name}`
          )
          // two of these
          .replace(
            `${product_name}${tempAppName}`,
            `${product_name}${manifest.short_name}`
          )
          .replace(
            `${product_name}${tempAppName}`,
            `${product_name}${manifest.short_name}`
          )
          // two of these
          .replace(
            `${test_host}${tempAppName}`,
            `${test_host}${manifest.short_name}`
          )
          .replace(
            `${test_host}${tempAppName}`,
            `${test_host}${manifest.short_name}`
          )
      );
    }
  ),
  "project/": copyFolder,
  "MacOSpwa/MacOSpwa.xcdatamodeld/": copyFolder,
  "MacOSpwa.xcodeproj/": copyFolder,
  "MacOSpwa/Assets.xcassets/Contents.json": copyFile,
  "MacOSpwa/Base.lproj/Main.storyboard": copyAndEditFile(
    async (content, manifest) => {
      const titleBase = `menuItem title="`;
      const subMenuTitle = `key="submenu" title="`;
      const aboutTitle = `title="About `;
      const hideTitle = `title="Hide `;
      const quitTitle = `title="Quit `;
      const menuTitle = `menuItem title="`;

      return content
        .replace(
          `${titleBase}${tempAppName}`,
          `${titleBase}${manifest.short_name}`
        )
        .replace(
          `${subMenuTitle}${tempAppName}`,
          `${subMenuTitle}${manifest.short_name}`
        )
        .replace(
          `${aboutTitle}${tempAppName}`,
          `${aboutTitle}${manifest.short_name}`
        )
        .replace(
          `${hideTitle}${tempAppName}`,
          `${hideTitle}${manifest.short_name}`
        )
        .replace(
          `${quitTitle}${tempAppName}`,
          `${quitTitle}${manifest.short_name}`
        )
        .replace(
          `${menuTitle}${tempAppName + "Help"}`,
          `${menuTitle}${manifest.short_name + "Help"}`
        );
    }
  ),
  "MacOSpwa/manifest.json": async (zip, manifest, filePath) => {
    try {
      zip.file(filePath, JSON.stringify(manifest, undefined, 2));
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
  },
};
