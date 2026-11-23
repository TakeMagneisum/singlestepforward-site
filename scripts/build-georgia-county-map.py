"""Generate Georgia county names and SVG paths from Census 2024 county 1:5m data.

Run with Python and GDAL (ogr2ogr) installed, passing the extracted .shp file.
"""
import json
from pathlib import Path
import subprocess
import sys

features = json.loads(subprocess.check_output([
    "ogr2ogr", "-f", "GeoJSON", "-where", "STATEFP = '13'",
    "-t_srs", "EPSG:5070", "/vsistdout/", str(Path(sys.argv[1]).resolve()),
]))["features"]

names = {}
polygons = {}
for feature in features:
    fields = feature["properties"]
    geometry = feature["geometry"]
    coordinates = geometry["coordinates"]
    geoid = fields["GEOID"]
    assert geoid not in names
    names[geoid] = fields["NAMELSAD"]
    polygons[geoid] = [coordinates] if geometry["type"] == "Polygon" else coordinates

assert len(names) == 159
points = [point for area in polygons.values() for polygon in area for ring in polygon for point in ring]
west, south = map(min, zip(*points))
east, north = map(max, zip(*points))
scale = 600 / (east - west)
height = round(24 + (north - south) * scale)

paths = {
    code: "".join(
        "M" + "L".join(f"{12 + (x - west) * scale:.1f},{12 + (north - y) * scale:.1f}"
                       for x, y in ring[:-1]) + "Z"
        for polygon in area for ring in polygon
    )
    for code, area in polygons.items()
}

out = Path(__file__).resolve().parents[1] / "assets/maps"
for file, variable, data in (
    ("georgia-county-names.js", "SSFGeorgiaCountyNames", names),
    ("georgia-county-boundaries.js", "SSFGeorgiaCountyGeometry",
     {"viewBox": f"0 0 624 {height}", "paths": paths}),
):
    (out / file).write_text(
        "// U.S. Census Bureau, 2024 Cartographic Boundary File. See GA-COUNTY-SOURCE.md.\n"
        + f"window.{variable} = " + json.dumps(data, sort_keys=True, separators=(",", ":")) + ";\n",
        encoding="utf8",
    )
