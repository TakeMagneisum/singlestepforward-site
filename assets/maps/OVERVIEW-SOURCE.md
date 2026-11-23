# World and Caribbean overview data

Made with Natural Earth, Admin 0 Map Units, version 5.1.1. Natural Earth releases these vector data in the public domain.

- [Terms of use](https://www.naturalearthdata.com/about/terms-of-use/)
- [World source, 1:110m](https://naturalearth.s3.amazonaws.com/110m_cultural/ne_110m_admin_0_map_units.zip)
- [Caribbean source, 1:50m](https://naturalearth.s3.amazonaws.com/50m_cultural/ne_50m_admin_0_map_units.zip)

Routes identify guide categories. The boundary polygons are for orientation. Add guide records to the existing resource registry. Group geographic features by the same country or territory code when adding an overview. Guide counts are calculated at runtime from the registry.

To regenerate, extract the two archives and use GDAL and Python from the repository root. Replace the example shapefile paths with your extracted paths.

```sh
ogr2ogr -f GeoJSON /tmp/ssf-world.json path/to/ne_110m_admin_0_map_units.shp
ogr2ogr -f GeoJSON /tmp/ssf-caribbean.json path/to/ne_50m_admin_0_map_units.shp -clipsrc -88 8 -58 28
python3 scripts/build-overview-maps.py /tmp/ssf-world.json /tmp/ssf-caribbean.json
node scripts/validate-explore-map.cjs
```

The Greater London boundary source is documented in LONDON-SOURCE.md.
