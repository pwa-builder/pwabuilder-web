import JSZip from "jszip";

export async function writeFile(
  zip: JSZip,
  content: string,
  filePath: string
): Promise<OperationResult> {
  try {
    zip.file(filePath, content);

    return {
      success: true,
      filePath,
    };
  } catch (e) {
    return {
      success: false,
      filePath,
      error: e as Error,
    };
  }
}
