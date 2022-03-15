/*
 (c) 2022, Chang-jae, Lee
 leaflet vector tile plugin for geojson in proj4 coordinates
 https://github.com/hunter3789/leaflet-geojson-proj4-vectortile
*/
L.GeoJSON.ProjVT = L.GridLayer.extend({
  options: {
  },

  initialize: function (geojson, options) {
    options.stroke = options.stroke !== undefined ? options.stroke : true;
    options.color = options.color !== undefined ? options.color : "#000000";
    options.weight = options.weight !== undefined ? options.weight : 1;
    options.opacity = options.opacity !== undefined ? options.opacity : 1;
    options.fill = options.fill !== undefined ? options.fill : true;
    options.fillColor = options.fillColor !== undefined ? options.fillColor : "#ffffff";
    options.fillOpacity = options.fillOpacity !== undefined ? options.fillOpacity : 1;
    options.simplify = options.simplify !== undefined ? options.simplify : false;
    options.tolerance = options.tolerance !== undefined ? options.tolerance : 0.5;

    L.setOptions(this, options);
    L.GridLayer.prototype.initialize.call(this, options);

    this.data = geojson;
  },

  createTile: function (coords) {
    var geojson = this.data;
    var tile = L.DomUtil.create('canvas', 'leaflet-tile');
    var ctx = tile.getContext('2d');
    var size = this.getTileSize()
    tile.width = size.x
    tile.height = size.y
  
    var map = this._map;
    var nwPoint = coords.scaleBy(size)
    var resolution = 1/map.options.crs._scales[0];
    var ratio = resolution*map.options.crs._scales[coords.z];

    for (var i=0; i<geojson.features.length; i++) {
      if (geojson.features[i].properties.xmin == undefined || geojson.features[i].properties.ymin == undefined || geojson.features[i].properties.xmax == undefined || geojson.features[i].properties.ymax == undefined) {
        continue;
      }

      var xmin = geojson.features[i].properties.xmin*ratio;
      var ymin = geojson.features[i].properties.ymin*ratio;

      var xmax = geojson.features[i].properties.xmax*ratio;
      var ymax = geojson.features[i].properties.ymax*ratio;

      if (xmax < nwPoint.x || xmin > nwPoint.x + tile.width || ymax < nwPoint.y || ymin > nwPoint.y + tile.height) {
        continue;
      }

      this.drawTile(ctx, coords, i, nwPoint, this.options);
    }

    return tile;
  },

  drawTile: function (ctx, coords, i, nwPoint, options) {
    var geojson = this.data;
    var map = this._map;

    ctx.strokeStyle = options.color;
    ctx.lineWidth = options.weight;
    ctx.fillStyle = options.fillColor;
    ctx.beginPath();

    if (geojson.features[i].geometry.type == "MultiPolygon") {
      for (var j=0; j<geojson.features[i].geometry.coordinates.length; j++) {
        for (var k=0; k<geojson.features[i].geometry.coordinates[j].length; k++) {
          var polygon = [];
          for (var l=0; l<geojson.features[i].geometry.coordinates[j][k].length; l++) {
            var point = map.project(L.latLng([geojson.features[i].geometry.coordinates[j][k][l][1], geojson.features[i].geometry.coordinates[j][k][l][0]]), coords.z);
            polygon.push(point);
          }

          if (options.simplify == true) {
            polygon = L.LineUtil.simplify(polygon, options.tolerance);
          }

          for (var n = 0; n < polygon.length; n ++) {
            if (n==0) {
              ctx.moveTo(polygon[n].x - nwPoint.x, polygon[n].y - nwPoint.y);
            }
            else {
              ctx.lineTo(polygon[n].x - nwPoint.x, polygon[n].y - nwPoint.y);
            }
          }
        }
      }
    }
    else if (geojson.features[i].geometry.type == "Polygon") {
      for (var j=0; j<geojson.features[i].geometry.coordinates.length; j++) {
        var polygon = [];
        for (var k=0; k<geojson.features[i].geometry.coordinates[j].length; k++) {
          var point = map.project(L.latLng([geojson.features[i].geometry.coordinates[j][k][1], geojson.features[i].geometry.coordinates[j][k][0]]), coords.z);
          polygon.push(point);
        }

        if (options.simplify == true) {
          polygon = L.LineUtil.simplify(polygon, options.tolerance);
        }

        for (var n = 0; n < polygon.length; n++) {
          if (n==0) {
            ctx.moveTo(polygon[n].x - nwPoint.x, polygon[n].y - nwPoint.y);
          }
          else {
            ctx.lineTo(polygon[n].x - nwPoint.x, polygon[n].y - nwPoint.y);
          }
        }
      }
    }

    ctx.closePath();
    if (options.fill) {
      ctx.globalAlpha = options.fillOpacity;
      ctx.fill();
    }
    if (options.stroke && options.weight !== 0) {
      ctx.globalAlpha = options.opacity;
      ctx.stroke();
    }
  },

});

L.geoJson.projvt = function (geojson, options) {
    return new L.GeoJSON.ProjVT(geojson, options);
};



// function: calculate bounds of each polygons at certain map projection
(function () { 'use strict';


function getGeojsonBounds(map, geojson) {
  for (var i=0; i<geojson.features.length; i++) {
    var xmax = null;
    var ymax = null;
    var xmin = null;
    var ymin = null;

    if (geojson.features[i].geometry.type == "MultiPolygon") {
      for (var j=0; j<geojson.features[i].geometry.coordinates.length; j++) {
        for (var k=0; k<geojson.features[i].geometry.coordinates[j].length; k++) {
          for (var l=0; l<geojson.features[i].geometry.coordinates[j][k].length; l++) {
            if (geojson.features[i].geometry.coordinates[j][k][l][1] >= 90) {
              geojson.features[i].geometry.coordinates[j][k][l][1] = 89.999999;
            }

            if (geojson.features[i].geometry.coordinates[j][k][l][1] <= -90) {
              geojson.features[i].geometry.coordinates[j][k][l][1] = -89.999999;
            }

            var point = map.project(L.latLng([geojson.features[i].geometry.coordinates[j][k][l][1], geojson.features[i].geometry.coordinates[j][k][l][0]]), 0);

            if (xmax <= point.x || xmax === null) {
              xmax = point.x;
            }

            if (xmin >= point.x || xmin === null) {
              xmin = point.x;
            }

            if (ymax <= point.y || ymax === null) {
              ymax = point.y;
            }

            if (ymin >= point.y || ymin === null) {
              ymin = point.y;
            }
          }
        }
      }

      geojson.features[i].properties.xmax = xmax;
      geojson.features[i].properties.xmin = xmin;
      geojson.features[i].properties.ymax = ymax;
      geojson.features[i].properties.ymin = ymin;
    }
    else if (geojson.features[i].geometry.type == "Polygon") {
      for (var j=0; j<geojson.features[i].geometry.coordinates.length; j++) {
        for (var k=0; k<geojson.features[i].geometry.coordinates[j].length; k++) {
          if (geojson.features[i].geometry.coordinates[j][k][1] >= 90) {
            geojson.features[i].geometry.coordinates[j][k][1] = 89.999999;
          }

          if (geojson.features[i].geometry.coordinates[j][k][1] <= -90) {
            geojson.features[i].geometry.coordinates[j][k][1] = -89.999999;
          }

          var point = map.project(L.latLng([geojson.features[i].geometry.coordinates[j][k][1], geojson.features[i].geometry.coordinates[j][k][0]]), 0);

          if (xmax <= point.x || xmax === null) {
            xmax = point.x;
          }

          if (xmin >= point.x || xmin === null) {
            xmin = point.x;
          }

          if (ymax <= point.y || ymax === null) {
            ymax = point.y;
          }

          if (ymin >= point.y || ymin === null) {
            ymin = point.y;
          }
        }
      }

      geojson.features[i].properties.xmax = xmax;
      geojson.features[i].properties.xmin = xmin;
      geojson.features[i].properties.ymax = ymax;
      geojson.features[i].properties.ymin = ymin;
    }

  }

  return geojson;
}


// export as AMD module / Node module / browser or worker variable
if (typeof define === 'function' && define.amd) define(function() { return getGeojsonBounds; });
else if (typeof module !== 'undefined') {
    module.exports = getGeojsonBounds;
    module.exports.default = getGeojsonBounds;
} else if (typeof self !== 'undefined') self.getGeojsonBounds = getGeojsonBounds;
else window.getGeojsonBounds = getGeojsonBounds;

})();



// function: slice geojson data by longitude
(function () { 'use strict';


function sliceGeojson(geojson, lon_0) {
  var data = JSON.parse(JSON.stringify(geojson));
  lon_0 -= 180.0;
  if (lon_0 < -180.0) {
    lon_0 += 360.0;
  }

  var ok;

  for (var i=0; i<data.features.length; i++) {
    for (var j=0; j<data.features[i].geometry.coordinates.length; j++) {
      for (var k=0; k<data.features[i].geometry.coordinates[j].length; k++) {
        if (data.features[i].geometry.type == "MultiPolygon") {
          ok = 0;
          for (var l=0; l<data.features[i].geometry.coordinates[j][k].length; l++) {
            if (l == 0) continue;
            else if (data.features[i].geometry.coordinates[j][k][l-1][0] >= lon_0 && data.features[i].geometry.coordinates[j][k][l][0] < lon_0) {
              ok = 1;
              break;
            }
          }

          if (ok == 1) {
            var n1 = data.features[i].geometry.coordinates[j].length;
            data.features[i].geometry.coordinates[j][n1] = [];
            for (var l=0; l<data.features[i].geometry.coordinates[j][k].length; l++) {
              if (data.features[i].geometry.coordinates[j][k][l][0] >= lon_0) {
                var n2 = data.features[i].geometry.coordinates[j][n1].length;
                data.features[i].geometry.coordinates[j][n1][n2] = data.features[i].geometry.coordinates[j][k][l];
                data.features[i].geometry.coordinates[j][k].splice(l,1);
                l--;
              }
            }
          }
        }
        else if (data.features[i].geometry.type == "Polygon") {
          if (k==0) continue;
          else if (data.features[i].geometry.coordinates[j][k-1][0] >= lon_0 && data.features[i].geometry.coordinates[j][k][0] < lon_0) {
           ok = 1;
           break;
          }
        }
      }


      if (ok == 1 && data.features[i].geometry.type == "Polygon") {
        var polygon1 = [];
        var polygon2 = [];

        for (var k=0; k<data.features[i].geometry.coordinates[j].length; k++) {
          var n1 = polygon1.length;
          var n2 = polygon2.length;
          if (data.features[i].geometry.coordinates[j][k][0] >= lon_0) {
            polygon1[n1] = data.features[i].geometry.coordinates[j][k];
          }
          else {
            polygon2[n2] = data.features[i].geometry.coordinates[j][k];
          }
          data.features[i].geometry.coordinates[j].splice(k,1)
          k--;
        }

        data.features[i].geometry.type = "MultiPolygon";
        data.features[i].geometry.coordinates[j][0] = polygon1;
        data.features[i].geometry.coordinates[j][1] = polygon2;
      }
    }
  }

  return data;
}


// export as AMD module / Node module / browser or worker variable
if (typeof define === 'function' && define.amd) define(function() { return sliceGeojson; });
else if (typeof module !== 'undefined') {
    module.exports = sliceGeojson;
    module.exports.default = sliceGeojson;
} else if (typeof self !== 'undefined') self.sliceGeojson = sliceGeojson;
else window.sliceGeojson = sliceGeojson;

})();