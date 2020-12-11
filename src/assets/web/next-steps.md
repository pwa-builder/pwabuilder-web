# Configuring the manifest in your site

1. Upload the manifest.json and the images to the root path of your site.

2. Reference the manifest in your page with a link tag `<link rel="manifest" href="manifest.json"></link>`

3. Redeploy your site and test it in the different devices.

## Adding the service worker to you site, if you do not have one

1. Place the service worker code in your repository.

2. If you desire to use our pwa-update component for a nice optional UI to ask the user if they want to install your component. We've included a simple script alonside our service worker for use, pwabuiler-sw-register.js with [Github link for documentation](https://github.com/pwa-builder/pwa-update). We also have a web component to drop into your project for a nice install UI ([Github link](https://github.com/pwa-builder/pwa-install)).

3. If you would like to incorporate your service worker into the build step, [our starter is a good resource for use with a simple build system like rollup](https://github.com/pwa-builder/pwa-starter/blob/master/rollup.config.js), or if your web app is a React, Angular, or Vue app. You can find a how to incorporate it through their respective interfaces and sites.

4. If you would rather include the service worker code manually, here's a snippet below that you can incorporate into a javascript module. 

```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('<add-path-here>/pwabuilder-sw.js');
  });
```
