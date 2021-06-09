import * as Url from "url";

export function isBase64(uri: string): boolean {
  return uri.startsWith("data:") && uri.indexOf("base64") !== -1;
}

export function handleUrl(url: string, baseUrl: string): string {
  if (isBase64(url)) {
    return url;
  } else {
    return new Url.URL(url, baseUrl).toString();
  }
}
