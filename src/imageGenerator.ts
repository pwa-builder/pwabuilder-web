import JSZip from "jszip";
import Jimp from "jimp";
import FormData from "form-data";
import fetch from "got";
import { FastifyInstance } from "fastify";

export async function getGeneratedIconZip(
  server: FastifyInstance,
  image: Jimp,
  platform: string
): Promise<JSZip | undefined> {
  try {
    const form = new FormData();
    form.append("fileName", await image.getBufferAsync(image.getMIME()), {
      contentType: image.getMIME(),
    });
    form.append("padding", "0.3");
    form.append("colorOption", "transparent");
    form.append("platform", platform);

    const response = await fetch.post(
      "https://appimagegenerator-prod.azurewebsites.net/api/image",
      {
        body: form,
      }
    );

    return JSZip.loadAsync(response.read());
  } catch (err) {
    server.log.error(err);
  }
}
