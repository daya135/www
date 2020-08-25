//import Map from 'ol/Map.js';
//import View from 'ol/View.js';
//import TileLayer from 'ol/layer/Tile.js';
//import { OSM, TileArcGISRest } from 'ol/source.js';
//
//var url = 'https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/' +
//  'Specialty/ESRI_StateCityHighway_USA/MapServer';
//
//var layers = [
//  new TileLayer({
//      source: new OSM()
//  }),
//  new TileLayer({
//      extent: [-13884991, 2870341, -7455066, 6338219],
//      source: new TileArcGISRest({
//          url: url
//      })
//  })
//];
//var map = new Map({
//  layers: layers,
//  target: 'map',
//  view: new View({
//      center: [-10997148, 4569099],
//      zoom: 4
//  })
//});
        console.log('为啥是乱码？？')
        var aesjs = require('aes-js');
         // An example 128-bit key
        var key = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ];
         
        // Convert text to bytes
        var text = 'TextMustBe16Byte';
        var textBytes = aesjs.utils.utf8.toBytes(text);
         
        var aesEcb = new aesjs.ModeOfOperation.ecb(key);
        var encryptedBytes = aesEcb.encrypt(textBytes);
         
        // To print or store the binary data, you may convert it to hex
        var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
        console.log(encryptedHex);
        // "a7d93b35368519fac347498dec18b458"
         
        // When ready to decrypt the hex string, convert it back to bytes
        var encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
         
        // Since electronic codebook does not store state, we can
        // reuse the same instance.
        //var aesEcb = new aesjs.ModeOfOperation.ecb(key);
        var decryptedBytes = aesEcb.decrypt(encryptedBytes);
         
        // Convert our bytes back into text
        var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
        console.log(decryptedText);
        // "TextMustBe16Byte"