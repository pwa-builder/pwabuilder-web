import FormData from 'form-data';

export function createNewFormDataWithManifest(
  manifest: WebAppManifest
): FormData {
  const form = new FormData();

  const keys = Object.keys(manifest);
  const length = keys.length;

  for (let i = 0; i < length; i++) {
    const key = keys[i] as keyof WebAppManifest;
    let val = manifest[key];

    if (Array.isArray(val)) {
      const arrLength = val.length;
      for (let j = 0; j < arrLength; j++) {
        let arrVal = val[j];

        // want to stringify both objects and nested arrays, this is to prevent form nesting which is a deprecated but functional use. maps and sets shouldn't be in the manifest object.
        if (typeof arrVal === 'object') {
          arrVal = JSON.stringify(arrVal);
        }

        form.append(key as string, arrVal);
      }
    } else {
      if (typeof val === 'object') {
        val = JSON.stringify(val);
      }

      if (val === null || val === undefined || val === '') {
        continue;
      }

      form.append(key as string, val);
    }
  }

  return form;
}
