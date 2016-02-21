'use strict';

var path = require('path'),
    util = require('util');

var manifoldjsLib = require('manifoldjs-lib');

var PlatformBase = manifoldjsLib.PlatformBase,
    manifestTools = manifoldjsLib.manifestTools,
    fileTools = manifoldjsLib.fileTools;

var constants = require('./constants');

function Platform (packageName, platforms) {

  var self = this;

  PlatformBase.call(this, constants.platform.id, constants.platform.name, packageName, __dirname);

  // save platform list
  self.platforms = platforms;

  // override create function
  self.create = function (w3cManifestInfo, rootDir, options, callback) {

    self.info('Generating the ' + constants.platform.name + ' app...');

    // if the platform dir doesn't exist, create it
    var platformDir = path.join(rootDir, constants.platform.id);
    self.debug('Creating the ' + constants.platform.name + ' app folder...');
    return fileTools.mkdirp(platformDir)
      // download icons to the app's folder
      .then(function () {
        return self.downloadIcons(w3cManifestInfo.content, w3cManifestInfo.content.start_url, platformDir);
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
        var manifestFilePath = path.join(platformDir, 'manifest.json');
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

  self.addManifestIcon = function (manifest, fileName, size) {
    if (!manifest.icons) {
      manifest.icons = [];
    }
    
    manifest.icons.push({ 'src': fileName, 'sizes': size.toLowerCase().trim()});
  };
}

util.inherits(Platform, PlatformBase);

module.exports = Platform;
