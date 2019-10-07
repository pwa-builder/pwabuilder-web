'use strict';

var path = require('path'),
    util = require('util'),
    Q = require('q');

var pwabuilderLib = require('pwabuilder-lib');

var CustomError = pwabuilderLib.CustomError,
    PlatformBase = pwabuilderLib.PlatformBase,
    manifestTools = pwabuilderLib.manifestTools,
    fileTools = pwabuilderLib.fileTools,
    utils = pwabuilderLib.utils;

var constants = require('./constants');

function Platform (packageName, platforms) {

  var self = this;

  PlatformBase.call(this, constants.platform.id, constants.platform.name, packageName, __dirname);

  // save platform list
  self.platforms = platforms;

  // override create function
  self.create = function (w3cManifestInfo, rootDir, options, href, callback) {
    if (w3cManifestInfo.format !== pwabuilderLib.constants.BASE_MANIFEST_FORMAT) {
      return Q.reject(new CustomError('The \'' + w3cManifestInfo.format + '\' manifest format is not valid for this platform.'));
    }

    self.info('Generating the ' + constants.platform.name + ' app...');

    // if the platform dir doesn't exist, create it
    var platformDir = self.getOutputFolder(rootDir);
    self.debug('Creating the ' + constants.platform.name + ' app folder...');
    return fileTools.mkdirp(platformDir)
      // download icons to the app's folder
      .then(function () {
        return self.downloadIcons(w3cManifestInfo.content, w3cManifestInfo.content.start_url, self.getOutputImagesInfo(platformDir));
      })
      // copy the documentation
      .then(function () {
        return self.copyDocumentation(platformDir);
      })
      // write generation info (telemetry)
      .then(function () {
        return self.writeGenerationInfo(w3cManifestInfo, platformDir);
      })
      // persist the platform-specific manifest
      .then(function () {
        self.debug('Copying the ' + constants.platform.name + ' manifest to the app folder...');
        var manifestFilePath = path.join(rootDir, 'manifest.json');
        return manifestTools.writeToFile(w3cManifestInfo, manifestFilePath);
      })
      .nodeify(callback);
  };

  self.getManifestIcons = function (manifest) {
    return (manifest.icons || []).map(function (icon) { return icon.src; });
  };

  self.getManifestIcon = function (manifest, size) {
    size = size.trim().toLowerCase();
    return (manifest.icons || []).find(function (icon) {
      return icon.sizes.split(/\s+/).find(function (iconSize) {
        return iconSize.toLowerCase() === size;
      });
    });
  };

  self.getEmbeddedIconFilename = function(manifest, iconFromGetManifestIcons) {
    var result;

    manifest.icons.forEach(function(iconInfo) {
      if (iconInfo.src === iconFromGetManifestIcons) {
        result = iconInfo.fileName;
      }
    });

    if (!result) {
      result = utils.newGuid() + '.webPlatform.png';
    }

    return result;
  };

  self.updateEmbeddedIconUri = function(manifest, iconFromGetManifestIcons, uri) {
    (manifest.icons || []).map(function(icon) {
      if (icon.src === iconFromGetManifestIcons) {
        icon.src = uri;
        icon.type = icon.type || 'image/png';

        delete(icon.fileName);
      }
    });
  };

  self.addManifestIcon = function (manifest, fileName, size) {
    if (!manifest.icons) {
      manifest.icons = [];
    }

    manifest.icons.push({ 'src': fileName, 'sizes': size.toLowerCase().trim()});
  };
}

util.inherits(Platform, PlatformBase);

module.exports = Platform;
