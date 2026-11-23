"""Generate SVG path data from the Census 2024 1:20m state shapefile."""
import json
from pathlib import Path
import subprocess
import sys

source = Path(sys.argv[1]).resolve()

def features(where, projection, clip=()):
    command = ["ogr2ogr", "-f", "GeoJSON", "-t_srs", projection,
               "-where", where, *clip, "/vsistdout/", str(source)]
    return json.loads(subprocess.check_output(command))["features"]

def paths(features, box):
    polygons = {}
    for feature in features:
        geometry = feature["geometry"]
        coordinates = geometry["coordinates"]
        polygons[feature["properties"]["STUSPS"]] = (
            [coordinates] if geometry["type"] == "Polygon" else coordinates
        )
    points = [p for area in polygons.values() for polygon in area for ring in polygon for p in ring]
    west, south = map(min, zip(*points))
    east, north = map(max, zip(*points))
    left, top, width, height = box
    scale = min(width / (east - west), height / (north - south))
    left += (width - (east - west) * scale) / 2
    top += (height - (north - south) * scale) / 2

    return {
        code: "".join("M" + "L".join(
            f"{left + (x - west) * scale:.1f},{top + (north - y) * scale:.1f}"
            for x, y in ring[:-1]) + "Z" for polygon in area for ring in polygon)
        for code, area in polygons.items()
    }

mainland = features("STATEFP <= '56' AND STUSPS NOT IN ('AK','HI')", "EPSG:5070")
alaska = features("STUSPS = 'AK'", "EPSG:3338")
hawaii = features("STUSPS = 'HI'", "EPSG:26904", ("-clipsrc", "-161", "18", "-154", "23"))
geometry = {
    **paths(mainland, (12, 12, 876, 490)),
    **paths(alaska, (20, 520, 225, 102)),
    **paths(hawaii, (274, 520, 150, 102)),
}
assert len(geometry) == 51
output = Path(__file__).resolve().parents[1] / "assets/maps/us-state-boundaries.js"
output.write_text("// Generated from the U.S. Census Bureau 2024 state boundaries.\n"
                  "window.SSFUsStatePaths = " + json.dumps(geometry, separators=(",", ":")) + ";\n")
