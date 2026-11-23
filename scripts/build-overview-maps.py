"""Build local SVG path data from Natural Earth map-unit GeoJSON exports."""
import json
from pathlib import Path
import sys

destination = Path(__file__).resolve().parents[1] / "assets/maps"
aliases = {"US": "United States", "GB": "United Kingdom", "DO": "Dominican Republic",
           "AG": "Antigua and Barbuda", "VI": "U.S. Virgin Islands",
           "VG": "British Virgin Islands", "KY": "Cayman Islands",
           "TC": "Turks and Caicos Islands", "VC": "Saint Vincent and the Grenadines"}

def build(path, context, project):
    places = {}
    background = []
    for feature in json.loads(Path(path).read_text())["features"]:
        props = feature["properties"]
        geometry = feature["geometry"]
        polygons = [geometry["coordinates"]] if geometry["type"] == "Polygon" else geometry["coordinates"]
        code = props["ISO_A2"]
        if props["ADM0_A3"] == "GBR":
            code = "GB"
        elif props["GU_A3"] in {"ACA", "ACB"}:
            code = "AG"
        elif code == "-99":
            code = props["GU_A3"]
        visible, selectable = context(props)
        if not visible:
            continue
        paths = []
        for polygon in polygons:
            for ring in polygon:
                points = [project(lon, lat) for lon, lat in ring[:-1]]
                paths.append("M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in points) + "Z")
        if selectable:
            place = places.setdefault(code, {"name": aliases.get(code, props["NAME_LONG"]), "path": ""})
            place["path"] += "".join(paths)
        else:
            background.extend(paths)
    return {"places": places, "background": "".join(background)}

def write(filename, variable, data):
    (destination / filename).write_text(
        "// Generated from Natural Earth, version 5.1.1.\nwindow." + variable + " = " +
        json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8"
    )

world = build(sys.argv[1], lambda p: (p["GU_A3"] != "ATA", True),
              lambda lon, lat: ((lon + 180) * 2.5, (85 - lat) * 2.5))
caribbean = build(sys.argv[2],
                  lambda p: (p["REGION_UN"] == "Americas", p["SUBREGION"] == "Caribbean"),
                  lambda lon, lat: ((lon + 88) * 24, (28 - lat) * 25))
world["islandNames"] = {code: place["name"] for code, place in caribbean["places"].items()}
write("world-overview.js", "SSFWorldOverview", world)
write("caribbean-overview.js", "SSFCaribbeanOverview", caribbean)
