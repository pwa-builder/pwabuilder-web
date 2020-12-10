import * as path from "path";
import walk from "klaw";
import { promises as fs } from "fs";
import JSZip from "jszip";

type EditCallback = (
  fileContent: string,
  manifest: WebAppManifest
) => Promise<string>;

const ROOT = "src/assets";

export type CopyAndEditFunction = (
  zip: JSZip,
  manifest: WebAppManifest,
  filePath: string
) => Promise<OperationResult>;

export type FilesAndEdit = {
  [filePath: string]: CopyAndEditFunction;
};

// Copies files and new manifest into the zip.
export function copyFiles(
  zip: JSZip,
  manifest: WebAppManifest,
  filesAndEdits: FilesAndEdit
): Array<Promise<OperationResult>> {
  const operations = [];

  for (const key of Object.keys(filesAndEdits)) {
    operations.push(filesAndEdits[key](zip, manifest, key));
  }

  return operations;
}

export async function copyFile(
  zip: JSZip,
  manifest: WebAppManifest,
  filePath: string
): Promise<OperationResult> {
  try {
    const fileBuffer = await getFileBufferAndEdit(path.join(ROOT, filePath));
    if (fileBuffer instanceof Error) {
      throw fileBuffer;
    }

    zip.file(filePath, fileBuffer);

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
}

export function copyAndEditFile(editCb: EditCallback): CopyAndEditFunction {
  return async (zip: JSZip, manifest: WebAppManifest, filePath: string) => {
    try {
      const fileBuffer = await getFileBufferAndEdit(
        path.join(ROOT, filePath),
        editCb,
        manifest
      );
      if (fileBuffer instanceof Error) {
        throw fileBuffer;
      }

      zip.file(filePath, fileBuffer);

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
  };
}

export async function getFileBufferAndEdit(
  path: string,
  editCb?: EditCallback,
  manifest?: WebAppManifest
): Promise<Buffer | Error> {
  try {
    const buf = await fs.readFile(path);
    const str = buf.toString("utf-8");

    if (editCb && manifest) {
      return Buffer.from(await editCb(str, manifest));
    }

    return Buffer.from(str);
  } catch (error) {
    return error;
  }
}

export async function copyFolder(
  zip: JSZip,
  manifest: WebAppManifest,
  folderPath: string
): Promise<OperationResult> {
  let relativePath = folderPath;
  try {
    for await (const current of walk(path.join(ROOT, folderPath), {
      queueMethod: "shift",
    })) {
      const filePath = (current as walk.Item).path;
      const { stats } = current as walk.Item;
      relativePath = path.relative(ROOT, filePath);

      if (stats.isDirectory()) {
        continue;
      }

      // path reltative to folderpath
      zip.file(relativePath, fs.readFile(filePath));
    }
    return {
      filePath: folderPath,
      success: true,
    };
  } catch (error) {
    return {
      filePath: relativePath,
      success: false,
      error,
    };
  }
}
