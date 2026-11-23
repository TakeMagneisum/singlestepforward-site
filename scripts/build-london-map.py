"""Convert the GLA borough layer (British National Grid GeoJSON) to SVG paths."""
import ctypes as C
import ctypes.util
import json
from pathlib import Path
import sys

source = json.loads(Path(sys.argv[1]).read_text())
features = sorted(source["features"], key=lambda f: f["properties"]["GSS_CODE"])
codes = [f["properties"]["GSS_CODE"] for f in features]
assert codes == [f"E090000{i:02d}" for i in range(1, 34)]
geos = C.CDLL(ctypes.util.find_library("geos_c"))
pointer = C.c_void_p

def bind(name, result, *arguments):
    function = getattr(geos, name)
    function.restype = result
    function.argtypes = arguments
    return function

bind("initGEOS", None, pointer, pointer)(None, None)
read = bind("GEOSGeoJSONReader_readGeometry", pointer, pointer, C.c_char_p)
reader = bind("GEOSGeoJSONReader_create", pointer)()
collection = {"type": "GeometryCollection", "geometries": [f["geometry"] for f in features]}
original = read(reader, json.dumps(collection).encode())
simplified = bind("GEOSCoverageSimplifyVW", pointer, pointer, C.c_double, C.c_int)(original, 100, 0)
assert simplified
writer = bind("GEOSGeoJSONWriter_create", pointer)()
result = bind("GEOSGeoJSONWriter_writeGeometry", C.c_char_p, pointer, pointer, C.c_int)(writer, simplified, 0)
geometries = json.loads(result)["geometries"]
assert len(geometries) == 33
paths = {}
for code, geometry in zip(codes, geometries):
    polygons = [geometry["coordinates"]] if geometry["type"] == "Polygon" else geometry["coordinates"]
    paths[code] = "".join(
        "M" + "L".join(f"{(x-500000)/75:.2f},{(201500-y)/75:.2f}" for x, y in ring[:-1]) + "Z"
        for polygon in polygons for ring in polygon
    )
output = Path(__file__).resolve().parents[1] / "assets/maps/london-boundaries.js"
output.write_text("// Generated from the Greater London Authority borough layer.\nwindow.SSFLondonPaths = " + json.dumps(paths, indent=2) + ";\n")
