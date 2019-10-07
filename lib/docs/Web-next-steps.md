# Configuring the manifest in your site

1. Upload the Web Manifest, Service Worker and any images to the root path of your site.

2. Reference the manifest in your root page with a link tag:

	````
	<link rel="manifest" href="manifest.webmanifest"></link>
	````

3. Register your service worker by putting the following code in your root page:

```
<script>
if ("serviceWorker" in navigator) {
  if (navigator.serviceWorker.controller) {
    console.log("[PWA Builder] active service worker found, no need to register");
  } else {
    // Register the service worker
    navigator.serviceWorker
      .register("pwabuilder-sw.js", {
        scope: "./"
      })
      .then(function (reg) {
        console.log("[PWA Builder] Service worker has been registered for scope: " + reg.scope);
      });
  }
}
</script>
```

4. Redeploy your site and test it in the different devices.
