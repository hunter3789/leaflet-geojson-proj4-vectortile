# leaflet-geojson-proj4-vectortile

It is a open-source leaflet plugin which generate the vector tiles(canvas) for geojson data in proj4 coordinates.
(support only for polygon and multipolygon at this time)

## Dependency
- [leaflet] (https://leafletjs.com/)
- [proj4js] (https://github.com/proj4js/proj4js)
- [proj4leaflet] (https://kartena.github.io/Proj4Leaflet/)

## Demo

[DEMO] (https://hunter3789.github.io/leaflet-geojson-proj4-vectortile/example/demo.html)
- geojson data is from https://geojson-maps.ash.ms/

## Installation and setup

- Quick use:

```js
<script src="[path to js]/leaflet-geojson-proj4-vectortile.js"></script>
```

## Usage
0. Slice geojson data by longitude (**if needed, for certain projection, usually don't need**)
```
var newGeojson = sliceGeojson(geojson, longitude);

// projection(example) : "+proj=eqc +lat_0=0 +lat_ts=0 +lon_0=126 +x_0=0 +y_0=0 +ellps=WGS84 +units=m +no_defs"
```
1. **Calculate min/max bounds of each polygons from geojson**
```
getGeojsonBounds(map, geojson);
```
2. **Draw Tiles (draw polygons in which boundaries and tiles overlap.)**

```
L.geoJson.projvt(geojson, options).addTo(map);

// options(example) : {tileSize:512, pane:pane, color: "black", fillColor: "#ffffe5", weight: 1, simplify:true, tolerance:1}
```
- **select proper tileSize** for better performance
- simplify option is for polyline simplification, tolerance option is smooth parameter.

## License

[LICENSE](LICENSE)
