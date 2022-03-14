# leaflet-geojson-proj4-vectortile

It is a open-source leaflet plugin which generate the vector tiles for geojson data in proj4 coordinates.
(support only for polygon and multipolygon at this time)

## Dependency
- [leaflet] (https://leafletjs.com/)
- [proj4js] (https://github.com/proj4js/proj4js)
- [proj4leaflet] (https://kartena.github.io/Proj4Leaflet/)
- [simplify.js(optional)] (https://github.com/mourner/simplify-js) / JavaScript polyline simplification library by Vladimir Agafonkin, extracted from Leaflet.


## Demo

[DEMO] (https://hunter3789.github.io/leaflet-geojson-proj4-vectortile/example/demo.html)

## Installation and setup

- Quick use:

```js
<script src="[path to js]/leaflet-geojson-proj4-vectortile.js"></script>
```

## Usage
1. Calculate min/max bounds of each polygons
```
getGeojsonBounds(map, geojson);
```


2. Draw Tiles

```
L.geoJson.projvt(geojson, options).addTo(map);

options(example) : 
{tileSize:512, pane:pane, color: "black", fillColor: "#ffffe5", weight: 1, simplify:true, tolerance:1, highestQuality:true}
```

- select proper tileSize for better performance
- if options.simplify is true, you need simplify.js(optional) / tolerance and highestQuality options are also for simplification(optional).


3. Slice geojson data by longitude(for certain projection)
```
var newGeojson = sliceGeojson(geojsonData, longitude);
```

## License

[LICENSE](LICENSE)
