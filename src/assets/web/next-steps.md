# Next steps for building your Progressive Web App (PWA)
You've successfully generated a web manifest and service worker for your web app. Once you add these to your app, you'll be a PWA that can be published to app stores. 😎 (Don't have an app yet? Check out our [PWA Starter Kit](https://github.com/pwa-builder/pwa-starter/))

Your next steps:
1. **Upload `manifest.json`** to your server
2. **Upload `pwabuilder-sw.js`** to your server
3. **Upload the `images` folder** to your server
4. **Add a manifest link tag** to your HTML
5. **Add a service worker registration snippet** to your HTML

Each step is explained below.

## 1. Upload `manifest.json` to your server

Your zip file contains `manifest.json` - this is your [web manifest](https://www.w3.org/TR/appmanifest/) that contains metadata about your app, such as name, description, and more. 

Upload `manifest.json` to the root directory of your web server, e.g. https://myawesomepwa.com/manifest.json.

## 2. Upload `pwabuilder-sw.js` to your server

Your zip file contains `pwabuilder-sw.js` - this is your [service worker](https://web.dev/codelab-service-workers/) that can provide advanced functionality to your web app. For example, service workers can enable your app to work offline, do push notifications, cache your app's files for faster load times, and more.

Upload `pwabuilder-sw.js` to the root directory of your web server, e.g. https://myawesomepwa.com/pwabuilder-sw.js.

## 3. Upload the `images` folder to your server

Your zip file contains a `images` folder containing all the image resources for your app. These images are referenced in your web manifest.

Upload the `images` folder to the root directory of your web server. When you're done, you should have working URLs like https://myawesomepwa.com/images/app-icon-512x512.png

## 4. Add a manifest link tag to your HTML

Now that you've uploaded your web manifest file, your HTML page should load it. 

In the `<head>` section of your HTML, add the following code:

```html
<link rel="manifest" href="manifest.json" />
```

## 5. Add a service worker registration snippet to your HTML

Now that you've uplaoded your service worker file, your HTML page should register your service worker.

In the `<head>` section of your HTML, add the following code:

```html
<script type="module">
   import 'https://cdn.jsdelivr.net/npm/@pwabuilder/pwaupdate';
   const el = document.createElement('pwa-update');
   document.body.appendChild(el);
</script>
```

## Congrats, you're a PWA!

If you've followed all these steps, congratulations, you're a Progressive Web App (PWA)! 😎

To verify your app is a PWA, run your URL through [PWABuilder](https://pwabuilder.com) again. PWABuilder will report a score for your manifest and service worker, acknowledging your PWA status.

## Publish your PWA to app stores

As a PWA, your app can be published to App Stores like Microsoft Store (Windows), Google Play (Android), and more. Run your app URL through PWABuilder and follow the steps to publish to app stores.

## Need more help?

If you're otherwise stuck, we're here to help. You can [open an issue](https://github.com/pwa-builder/pwabuilder/issues) and we'll help walk you through it.
