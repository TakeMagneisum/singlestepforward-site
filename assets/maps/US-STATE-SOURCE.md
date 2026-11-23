# US state map data

Source is the U.S. Census Bureau’s 2024 Cartographic Boundary Files, state layer at 1:20,000,000 scale.

- [2024 Cartographic Boundary Files](https://www.census.gov/geographies/mapping-files/2024/geo/carto-boundary-file.html)
- [State shapefile ZIP](https://www2.census.gov/geo/tiger/GENZ2024/shp/cb_2024_us_state_20m.zip)

The map includes all 50 states and the District of Columbia. Alaska and the main Hawaiian islands are shown in separately scaled insets. Puerto Rico uses the existing territory view. Coverage comes from the guide registry’s country and stateCode values.

To regenerate the local SVG path data, extract the Census archive and run from the repository root with Python and GDAL installed.

```sh
python3 scripts/build-us-state-map.py /path/to/cb_2024_us_state_20m.shp
node scripts/validate-explore-map.cjs
```
