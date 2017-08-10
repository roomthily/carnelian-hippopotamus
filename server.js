var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var moment = require('moment'),
    wmsclient = require('wms-client'),
    jimp = require('jimp'), 
    drawing = require('./code/quickdraw2svg.js');


app.use(express.static('public'));
app.use(express.static('views'));

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/svg", (request, response) => {
  var set = request.query.set || 'backgrounds';
  var type = request.query.type || undefined;
  
  var svg = drawing.draw(set, type);
  
  response.set('Content-type', "image/svg+xml");
  response.send(svg);
});

server.listen(8080);

// for viirs wms-t active fire data
//   https://firms.modaps.eosdis.nasa.gov/web-services/#firms-wms-t
// to the service:
//   https://firms.modaps.eosdis.nasa.gov/wms-t/viirs/?SERVICE=WMS&VERSION=1.1.1&REQUEST=GETCAPABILITIES
// 
// for the date range, push the "latest"
// wms layer out as getmap. or as getcapabilities
// plus the date

// theoretically this starts in nov, 2000
// but the satellite didn't go up until 2011
var start_date = '2017-07-01';
var end_date = moment();

const base_url = 'https://firms.modaps.eosdis.nasa.gov/wms-t/viirs/';

// some params to run
const layer = 'VIIRS_Hotspots';
// for the western u.s.
const bbox = '-125.388903,31.449299,-97.044171,49.053721';
const srs = 'EPSG:4326';
const width = 500;
const height = 500;
const type = 'image/png';

io.sockets.on('connect', (socket, next) => {
  console.log('socket connection'); 
  
  var wms = wmsclient(base_url);
  
  // WE ARE FAKING IT. 
  var the_date = moment(start_date);
  var interval = setInterval(function() {
    var data = {};
    
    if (end_date.isSameOrBefore(the_date)) {
      // restart the stream
      console.log('restarting');
      the_date = moment(start_date);
    } else {
      // move up a day
      the_date.add(1, "days");
    }
    
    // generate the url
    data.url = base_url;
    data.time = the_date.format('YYYY-MM-DD');
    
    // add the image as base64 to
    // see the map witohut a client api.
    var map = wms.getMap({
      layers: layer,
      srs: srs,
      bbox: bbox,
      width: width,
      height: height,
      version:"1.1.1",
      format: type,
      time: data.time
    }, function(err, img) {
      // return as buffer
      if (err) {
        console.log('image error:', err);
      }
      
      jimp.read(img, function(err, jmg) {
        jmg.getBase64(jimp.MIME_PNG, (jerr, base64) => {
          if (jerr) {
            console.log('image error:', jerr);
            return;
          }

          data.datauri = base64;
          socket.emit('imagery', data);
        });
      });
    });
    
  }, 5000);
  
  socket.on('update', (data) => {
    console.log('updating the range', data);
    
    // this has the potential to be hilariously bad
    start_date = start_date === data.mindate ? data.mindate : start_date;
    
    end_date = end_date.format('YYYY-MM-DD') !== data.maxdate ? moment(data.maxdate) : end_date;
  });
})

/**
some info on the base map wms request options

functional url: 
https://firms.modaps.eosdis.nasa.gov/wms-t/viirs/?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&layers=VIIRS_Hotspots&time=2017-08-01&format=image/png&crs=EPSG:4326&width=500&height=500&bbox=-125.388903,31.449299,-97.044171,49.053721


national map (super ugly)
http://basemap.nationalmap.gov/arcgis/services/USGSImageryTopo/MapServer/WMSServer?request=GetMap&service=WMS&format=image/png8&crs=EPSG:4326&bbox=31.449299,-125.388903,49.053721,-97.044171&width=500&height=500&layers=0&styles=default&version=1.3.0

the one we're using from the osm wiki:
http://ows.mundialis.de/services/service?version=1.1.1&request=getmap&service=wms&format=image/png&srs=EPSG:4326&width=500&height=500&bbox=-125.388903,31.449299,-97.044171,49.053721&layers=TOPO-WMS&styles=

**/

