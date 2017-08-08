var random = require('random-js')(),
    fs = require('fs');

function _get_line(filename, word_filter) {
  
  var data = fs.readFileSync(filename, 'utf8');
  var lines = data.split("\n");
  
  if (word_filter) {
    lines = lines.filter(line => {
      return JSON.parse(line).word === word_filter;
    });
  }
  
  return random.pick(lines);
}

const flatten = (arr) => arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
const dim = (arr) => Math.max(...arr);

function _dim(arr) {
  var f = flatten(arr);
  return dim(f);
}

function _to_svg(line) {
  var data = JSON.parse(line);
  
  var drawing = data.drawing;
  /*
    this is an array of arrays so
    
    - the set of paths
    [
      - the array of point value arrays
      [
        - x values
        [],
        - y values
        []
      ]
    ]
  */
  
  var max_dim = _dim(drawing);
  
  var polylines = [];
  drawing.forEach(arr => {
    var polyline = [];
    var x = arr[0];
    var y = arr[1];
    for (var i = 0; i< x.length; i++) {
      polyline.push([x[i], y[i]].join(','));
    }
    
    polylines.push('<polyline fill="none" stroke="black" points="'+polyline.join(" ")+'" />');
  });
  
  return '<svg width="'+max_dim+'" height="'+max_dim+'" xmlns="http://www.w3.org/2000/svg">'+polylines.join('')+'</svg>';
}

module.exports = {
  draw: function(set, type=undefined) {
    var line = _get_line(`./public/qd-${set}-partial.ndjson`, type);
    return _to_svg(line);
  }
};