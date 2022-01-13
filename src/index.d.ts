/// <reference lib="dom" />
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./utils.d.ts" />

type MIME_TYPE = string;
type SpaceSeparatedList = string;

interface WebAppManifest {
  dir: 'ltr' | 'rtl' | 'auto';
  lang: string;
  name: string;
  short_name: string;
  description: string;
  icons: Array<ManifestImageResource>;
  screenshots: Array<ManifestImageResource>;
  categories: Array<string>;
  iarc_rating_id: string;
  start_url: string;
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  orientation:
    | 'any'
    | 'natural'
    | 'landscape'
    | 'portrait'
    | 'portrait-primary'
    | 'portrait-secondary'
    | 'landscape-primary'
    | 'landscape-secondary';
  theme_color: string;
  background_color: string;
  scope: string;
  related_applications?: Array<Unsupported>;
  prefer_related_applications: boolean;
  shortcuts?: Array<Unsupported>;

  [key: string]: any;
}

interface ManifestImageResource {
  src: string;
  sizes: string | SpaceSeparatedList;
  type: MIME_TYPE;
  purpose: 'monochrome' | 'maskable' | 'any' | SpaceSeparatedList;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Unsupported {}

interface WebQuery {
  siteUrl: string;
  hasServiceWorker: boolean;
  swId: number;
}

// form data is represents objects as text versions of the objects, the only exception to this is the arrays which can contain strings or arrays.
interface BusBoyItem {
  fieldname: string;
  value: string;
}

interface BusBoyWebAppManifestLike {
  dir: BusBoyItem;
  lang: BusBoyItem;
  name: BusBoyItem;
  short_name: BusBoyItem;
  description: BusBoyItem;
  icons: Array<BusBoyItem> | BusBoyItem;
  screenshots: Array<BusBoyItem> | BusBoyItem;
  categories: Array<BusBoyItem> | BusBoyItem;
  iarc_rating_id: BusBoyItem;
  start_url: BusBoyItem;
  display: BusBoyItem;
  orientation: BusBoyItem;
  theme_color: BusBoyItem;
  background_color: BusBoyItem;
  scope: BusBoyItem;
  related_applications?: Array<BusBoyItem> | BusBoyItem;
  prefer_related_applications: BusBoyItem;
  shortcuts?: Array<BusBoyItem> | BusBoyItem;

  [key: string]: any;
}

type WebAppManifestGestalt = WebAppManifest | BusBoyWebAppManifestLike;
