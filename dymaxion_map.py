from PIL import Image, ImageDraw
import numpy as np
import plotly.graph_objects as go
import dymaxion
import icosahedron

"""
Perhaps best way is to go from icosahedron faces projected onto
the equirectangular map.

Subdivide faces into lots of small triangles (subdivide by finding
the center of a triangle and creating three triangles)

Then each triangle will overlap one or more pixel in the
equirectangular map. Calculating intersections should be easy
owing to the rectangular grid.

In cases where multiple pixels (and portions of pixels) are
overlapped by a triangle, that triangle's color can be
determined by averaging the pixel colors according to
the proportion of the pixel that is overlapped.
"""


def eqr_tile_to_dym_tiles(az0, el0, az1, el1):
    """
    Projects a rectangular tile on the equirectangular map to
    one or more face tiles on the dymaxion map.

    It is assumed that the eqr tile is small enough that it
    doesn't span an entire face. The tile can fall completely
    inside a face, or it could span several faces if it falls
    on a vertex or face boundary.

    - Determine which 

    az0, el0        Bottom left azimuth/longitude,
                    elevation/latitude
    az1, el1        Bottom right az, elx
    az2, el2        Top right
    az3, el3        Top left

    Returns:
        [
            [face_index, s0, t0, s1, t1, s2, t2, s3, s3],
            ...
        ]

    face_index      Index of icosahedron face
    s0, t0          Bottom left point (relative to face vertex 0)
    s1, t1          Bottom right point (relative to face vertex 0)
    s2, t2          Top right point (relative to face vertex 0)
    s3, t3          Top left point (relative to face vertex 0)
    """
    pass


def test():
    faces = icosahedron.faces
    fig_data = []
    az_offset = 0
    el_offset = 0
    for face in faces:
        subfaces, subvertices = icosahedron.get_subfaces(
            face=face,
            division_count=4)

        sp_subvertices = [icosahedron.cart2sph(v) for v in subvertices]
        az = [icosahedron.wrap_az(v[1] + az_offset) for v in sp_subvertices]
        el = [icosahedron.wrap_el(v[2] + el_offset) for v in sp_subvertices]
        fig_data.append(go.Scatter(x=az, y=el, mode="markers"))

    fig2 = go.Figure(
        data=fig_data,
        layout=go.Layout(
            xaxis=dict(range=[-np.pi, np.pi]),
            yaxis=dict(range=[-0.5 * np.pi, 0.5 * np.pi])
        ))
    fig2.show()
    print(icosahedron.get_edges(faces))
    return

    INPUT_PIXEL_INCREMENT = 16
    RESAMPLE_FACTOR = 2
    input_image = Image.open("eqr_world_1.png")
    width, height = input_image.size
    print(width, height)

    output_image = Image.new(
        mode=input_image.mode,
        size=(width * RESAMPLE_FACTOR, height * RESAMPLE_FACTOR))

    xs = np.arange(0, width, INPUT_PIXEL_INCREMENT)
    ys = np.arange(0, height, INPUT_PIXEL_INCREMENT)

    draw = ImageDraw.Draw(output_image)

    dx = RESAMPLE_FACTOR * INPUT_PIXEL_INCREMENT - 1
    
    face_points = []

    for x in xs:
        for y in ys:
            x = int(x)
            y = int(y)
            pixel_color = input_image.getpixel((x, y))

            # Find face and position
            az = ((x / width) - 0.5) * 2 * np.pi
            el = ((y / height) - 0.5) * np.pi
            p = icosahedron.find_intersect(az=az, el=el)
            if p["face_index"] == 0:
                # print(x, y, az, el, p)
                face_points.append(p)

            # Antialiasing is only possible by drawing larger
            # and resizing down.
            ox = x * RESAMPLE_FACTOR
            oy = y * RESAMPLE_FACTOR
            draw.polygon(
                xy=[
                    (ox, oy),
                    (ox + dx, oy),
                    (ox + dx, oy + dx),
                    (ox, oy + dx)
                ],
                fill=pixel_color)

    # output_image = output_image.resize(
    #     size=(width // 2, height // 2),
    #     resample=Image.LANCZOS)

    output_image.show()

    print(len(face_points))

    dymaxion.plot_dymaxion(face_points=face_points)

    print("OK")


if __name__ == "__main__":
    test()
