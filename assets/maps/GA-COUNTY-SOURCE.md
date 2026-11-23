# Georgia county map data

The map uses the U.S. Census Bureau’s 2024 Cartographic Boundary File for counties and equivalents at 1:5,000,000 scale. It includes all 159 Georgia counties and uses the five-digit Census GEOID in county URLs.

- [U.S. Census Bureau 2024 Cartographic Boundary Files](https://www.census.gov/geographies/mapping-files/2024/geo/carto-boundary-file.html)
- [County shapefile archive](https://www2.census.gov/geo/tiger/GENZ2024/shp/cb_2024_us_county_5m.zip)

The map depicts counties. Each guide and listing describes its own coverage. Chatham and Liberty link to their county guides. Fulton and DeKalb link to the existing Atlanta city guide because the city spans parts of both counties. See [City of Atlanta parcel geography](https://gis.atlantaga.gov/dpcd/rest/services/AdministrativeArea/TaxParcel/MapServer).

To regenerate the names and projected SVG paths after extracting the archive, run the following from the repository root with Python and GDAL installed.

```sh
python scripts/build-georgia-county-map.py /path/to/cb_2024_us_county_5m.shp
```

County names are available separately from geometry so the county list works if SVG data cannot load. The guide crosswalk is in `assets/explore-map.js`. Guide records come from the existing registry. Run `node scripts/validate-explore-map.cjs` after changing the crosswalk or geographic files.
