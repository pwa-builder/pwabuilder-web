import { FastifyInstance } from "fastify";
import JSZip from "jszip";
import fetch from "got";
import { handleIcons } from "./icons";
import { FilesAndEdit, copyFiles, copyFile } from "./copy";
import { webAppManifestSchema } from "./schema";
import { DefaultServiceWorkerId, serviceWorkerService } from "./constants";
import { handleScreenshots } from "./screenshots";

function schema(server: FastifyInstance) {
  return {
    querystring: {
      type: "object",
      properties: {
        siteUrl: { type: "string" },
        hasServiceWorker: { type: "boolean" },
        swId: { type: "number" },
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
        const siteUrl = guardSiteUrl(
          (request.query as WebQuery).siteUrl as string
        );
        const swId = (request.query as WebQuery).swId as number;
        const hasServiceWorker = (request.query as WebQuery).hasServiceWorker;
        const manifest = request.body as WebAppManifest;

        const results = await Promise.all([
          ...(await handleIcons(server, zip, manifest, siteUrl)),
          ...(await handleScreenshots(server, zip, manifest, siteUrl)),
          ...copyFiles(zip, manifest, filesAndEdits),
          ...(await handleServiceWorker(zip, manifest, hasServiceWorker, swId)),
        ]);

        const errors = results.filter((result) => !result.success);
        if (errors.length > 0) {
          throw Error(errors.map((result) => result.filePath).toString());
        }

        server.log.info({ results, errors });

        // Send Stream
        reply
          .type("application/zip")
          .send(await zip.generateAsync({ type: "nodebuffer" }));
      } catch (err) {
        server.log.error(err);

        reply.status(400).send({
          message: "failed to create your web project",
          errMessage: (err as Error).message,
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
        error: error as Error,
      };
    }
  },
};

// Fetches service worker, if the service worker exists in the repo, skip this step.
async function handleServiceWorker(
  zip: JSZip,
  manifest: WebAppManifest,
  hasServiceWorker = false,
  swId = DefaultServiceWorkerId
): Promise<Array<OperationResult>> {
  try {
    const results: Array<OperationResult> = [];
    if (!hasServiceWorker) {
      const serviceWorker = await fetch.get(
        `${serviceWorkerService}?id=${swId}`
      );

      const swZip = await new JSZip().loadAsync(serviceWorker.rawBody);
      const fileList: Array<string> = [];

      swZip.forEach((relPath) => fileList.push(relPath));

      for (const filePath of fileList) {
        const contents = swZip.file(filePath)?.async("arraybuffer");
        if (contents) {
          zip.file(filePath, await contents);
          results.push({
            filePath,
            success: true,
          });
        } else {
          // should be impossible scenario
          results.push({
            filePath,
            success: false,
            error: new Error("Failed to find item in service worker zip"),
          });
        }
      }
    }

    return results;
  } catch (error) {
    return [
      {
        filePath: "serviceWorker.js",
        success: false,
        error: error as Error,
      },
      {
        filePath: "serviceWorker-register.js",
        success: false,
        error: error as Error,
      },
    ];
  }
}

function guardSiteUrl(siteUrl: string): string {
  const protocol = "https://";
  if (!siteUrl.startsWith(protocol)) {
    return protocol + siteUrl;
  }

  return siteUrl;
}
