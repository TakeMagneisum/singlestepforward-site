# Greater London boundaries

Source: Greater London Authority, Statistical GIS Boundary Files for London.
The archive describes the borough layer as 2011 boundaries. Retrieved 23 November 2026.

https://data.london.gov.uk/dataset/statistical-gis-boundary-files-for-london-20od9

https://data.london.gov.uk/download/20od9/9ba8c833-6370-4b11-abdc-314aa020d5e0/statistical-gis-boundaries-london.zip

Open Government Licence v2. The GLA requests these credits:

- Contains National Statistics data © Crown copyright and database right [2015].
- Contains Ordnance Survey data © Crown copyright and database right [2015].

To regenerate locally, extract the archive and run the following from the website root. The Python script uses the GEOS C library (3.12 or later), simplifying shared edges together while retaining exterior edges.

```sh
ogr2ogr -f GeoJSON /tmp/london-27700.json path/to/ESRI/London_Borough_Excluding_MHW.shp
python3 scripts/build-london-map.py /tmp/london-27700.json
```

The generated file contains SVG paths keyed by GSS code. The crosswalk in `assets/explore-map.js` associates each code with an exact finder registry ID. For another region, source and document its geometry separately, provide its own code-to-guide mapping and validate both sides before enabling it. Guide search includes registry records whether they have geometry or not.
