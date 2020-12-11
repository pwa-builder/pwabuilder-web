/// <reference lib="dom" />
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./utils.d.ts" />

type MIME_TYPE = string;
type SpaceSeparatedList = string;

interface WebAppManifest {
  dir: "ltr" | "rtl" | "auto";
  lang: string;
  name: string;
  short_name: string;
  description: string;
  icons: Array<ManifestImageResource>;
  screenshots: Array<ManifestImageResource>;
  categories: Array<string>;
  iarc_rating_id: string;
  start_url: string;
  display: "fullscreen" | "standalone" | "minimal-ui" | "browser";
  orientation:
    | "any"
    | "natural"
    | "landscape"
    | "portrait"
    | "portrait-primary"
    | "portrait-secondary"
    | "landscape-primary"
    | "landscape-secondary";
  theme_color: string;
  background_color: string;
  scope: string;
  related_applications: Array<Unsupported>;
  prefer_related_applications: "true" | "false";
  shortcuts: Array<Unsupported>;
}

interface ManifestImageResource {
  src: string;
  sizes: string | SpaceSeparatedList;
  type: MIME_TYPE;
  purpose: "monochrome" | "maskable" | "any" | SpaceSeparatedList;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Unsupported {}

interface WebQuery {
  siteUrl: string;
  hasServiceWorker: boolean;
}
