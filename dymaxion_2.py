import dymaxion
import icosahedron
import equirectangular


def main():
    # dymaxion.plot_dymaxion()
    # icosahedron.plot_icosahedron()

    equirectangular.test()

    print("OK")


if __name__ == "__main__":
    main()

"""
Next step:
- Output flat map of triangles (faces)
- Triangles are 60 degrees  (1/3 * pi)
- Use the edges of the faces, and use s, t for posistions inside triangles
- Position triangles in sequence by choosing the next edge to draw
  a new triangle from
- This list of edge indexes determines the layout of the map
- Start with vertex zero, edge zero, face zero
- In future can apply rotation and translation when starting
- Can apply az, el offset to change position of points on map

- Edges are only important when drawing the map (flattening the faces)
- Faces are described by three vertex indexes, always clockwise ordering
- First vertex of a face is not important? Can be any of the three
- Edges can be derived from faces automatically - they have no direction
"""

"""
Make modules:
    - dymaxion
    - icosahedron
    - equirectangular
"""
