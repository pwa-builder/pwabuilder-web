import { FastifyInstance } from "fastify";
import JSZip from "jszip";
import fetch from "node-fetch";
import { handleImages } from "./images";
import {
  FilesAndEdit,
  copyFiles,
  copyFile,
} from "./copy";
import { webAppManifestSchema } from "./schema";
import { serviceWorkerId, serviceWorkerService } from "./constants";

function schema(server: FastifyInstance) {
  return {
    querystring: {
      type: "object",
      properties: {
        siteUrl: { type: "string" },
        hasServiceWorker: { type: "boolean" },
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
        const hasServiceWorker = (request.query as WebQuery).hasServiceWorker;
        const manifest = request.body as WebAppManifest;
        const results = await Promise.all([
          ...(await handleImages(server, zip, manifest, siteUrl, "ios")),
          ...copyFiles(zip, manifest, filesAndEdits),
          ...(await handleServiceWorker(zip, manifest, hasServiceWorker)),
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
  "web/next-steps.md": copyFile,
  "manifest.json": async (zip, manifest, filePath) => {
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

// Fetches service worker, if the service worker exists in the repo, skip this step.
async function handleServiceWorker(zip: JSZip, manifest: WebAppManifest, hasServiceWorker = false): Promise<Array<OperationResult>> {
  try {
    const results: Array<OperationResult> = [];
    if (!hasServiceWorker) {
      const response = await fetch(`${serviceWorkerService}?id=${serviceWorkerId}`, {
        method: "GET"
      });
      const swZip = await new JSZip().loadAsync(await response.arrayBuffer())

      const fileList: Array<string> = []
      swZip.forEach((relPath) => fileList.push(relPath));

      for (const filePath of fileList) {
        const contents = swZip.file(filePath)?.async("arraybuffer")
        if (contents) {
          zip.file(filePath, await contents)
          results.push({
            filePath,
            success: true
          })
        } else {
          // should be impossible scenario
          results.push({
            filePath,
            success: false,
            error: new Error("Failed to find item in service worker zip"),
          })
        }
      }
    }

    return results;
  } catch (error) {
    return [{
      filePath: "serviceWorker.js",
      success: false,
      error,
    }, {
      filePath: "serviceWorker-register.js",
      success: false,
      error,
    }];
  }
}