import plotly.graph_objects as go
import numpy as np

"""
TO DO:
- Edge and plane intersections to determine which face a (r, az, el)
  point lies on
"""


def cart2sph(vertex):
    x = vertex[0]
    y = vertex[1]
    z = vertex[2]
    hxy = np.hypot(x, y)
    r = np.hypot(hxy, z)
    el = np.arctan2(z, hxy)
    az = np.arctan2(y, x)
    return [r, az, el]


def sph2cart(vertex):
    r = vertex[0]
    az = vertex[1]
    el = vertex[2]
    rcos_theta = r * np.cos(el)
    x = rcos_theta * np.cos(az)
    y = rcos_theta * np.sin(az)
    z = r * np.sin(el)
    return [x, y, z]


r = 1
a = np.arctan(0.5)
daz = 2 * np.pi / 10

vertices = []
annotations = []

vertices.append([r, 0, np.pi / 2])
for k in [0, 1, 2, 3, 4]:
    vertices.append([r, 0 + 2 * daz * k, a])
    vertices.append([r, daz + 2 * daz * k, -a])
vertices.append([r, 0, -np.pi / 2])

edges = [
    # Top
    [0, 1], [0, 3], [0, 5], [0, 7], [0, 9],
    # Upper perimeter
    [1, 3], [3, 5], [5, 7], [7, 9], [9, 1],
    # Middle
    [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
    [6, 7], [7, 8], [8, 9], [9, 10], [10, 1],
    # Lower perimeter
    [2, 4], [4, 6], [6, 8], [8, 10], [10, 2],
    # Bottom
    [11, 2], [11, 4], [11, 6], [11, 8], [11, 10]
]

faces = [
    # Top
    [0, 1, 5], [1, 2, 6], [2, 3, 7], [3, 4, 8], [4, 0, 9],
    # Upper middle
    [5, 10, 11], [6, 12, 13], [7, 14, 15], [8, 16, 17], [9, 18, 19],
    # Lower middle
    [11, 12, 20], [13, 14, 21], [15, 16, 22], [17, 18, 23], [19, 10, 24],
    # Bottom
    [20, 25, 26], [21, 26, 27], [22, 27, 28], [23, 28, 29], [24, 29, 25]
]

face_vertices = []
for face in faces:
    vertex_set = set()
    for k in [0, 1, 2]:
        vertex_set.update(edges[face[k]])
    face_vertices.append(sorted(list(vertex_set)))

# face_vertices:
# [[0, 1, 3], [0, 3, 5], [0, 5, 7], [0, 7, 9], [0, 1, 9], [1, 2, 3],
# [3, 4, 5], [5, 6, 7], [7, 8, 9], [1, 9, 10], [2, 3, 4], [4, 5, 6],
# [6, 7, 8], [8, 9, 10], [1, 2, 10], [2, 4, 11], [4, 6, 11],
# [6, 8, 11], [8, 10, 11], [2, 10, 11]]

cart_vertices = [sph2cart(v) for v in vertices]

for v_index, v in enumerate(cart_vertices):
    annotations.append(dict(
        x=v[0], y=v[1], z=v[2],
        text=f"v-{v_index}",
        showarrow=False))

for e_index, e in enumerate(edges):
    v0 = cart_vertices[e[0]]
    v1 = cart_vertices[e[1]]
    annotations.append(dict(
        x=0.5 * (v0[0] + v1[0]),
        y=0.5 * (v0[1] + v1[1]),
        z=0.5 * (v0[2] + v1[2]),
        text=f"e-{e_index}",
        showarrow=False))

face_centers = []
for f_index, fv in enumerate(face_vertices):
    v0 = cart_vertices[fv[0]]
    v1 = cart_vertices[fv[1]]
    v2 = cart_vertices[fv[2]]
    fcx = 0.333 * (v0[0] + v1[0] + v2[0])
    fcy = 0.333 * (v0[1] + v1[1] + v2[1])
    fcz = 0.333 * (v0[2] + v1[2] + v2[2])
    face_centers.append([fcx, fcy, fcz])
    annotations.append(dict(
        x=fcx,
        y=fcy,
        z=fcz,
        text=f"f-{f_index}",
        showarrow=False))


def find_intersect(az, el):
    d = sph2cart([1, az, el])
    face_index = find_intersect_face_index(d=d)
    fv = face_vertices[face_index]
    v0 = cart_vertices[fv[0]]
    v1 = cart_vertices[fv[1]]
    v2 = cart_vertices[fv[2]]
    st = find_intersect_position(d=d, v0=v0, v1=v1, v2=v2)
    return {
        "face_index": face_index,
        "s": st[0],
        "t": st[1]
    }


def find_intersect_face_index(d):
    min_sum = None
    face_index = None
    for f_index, fc in enumerate(face_centers):
        fsum = 0
        for i in [0, 1, 2]:
            dd = d[i] - fc[i]
            fsum += dd * dd

        # print("YYY", d, fc, f_index, fsum)
        if min_sum is None or fsum < min_sum:
            min_sum = fsum
            face_index = f_index

    return face_index


def find_intersect_position(d, v0, v1, v2):
    A = np.array([
        [d[0], v0[0] - v1[0], v0[0] - v2[0]],
        [d[1], v0[1] - v1[1], v0[1] - v2[1]],
        [d[2], v0[2] - v1[2], v0[2] - v2[2]]
    ])
    b = np.array([
        [v0[0]],
        [v0[1]],
        [v0[2]]
    ])
    ust = np.linalg.solve(A, b)
    return [ust[1][0], ust[2][0]]


x = [v[0] for v in cart_vertices]
y = [v[1] for v in cart_vertices]
z = [v[2] for v in cart_vertices]

i = [fv[0] for fv in face_vertices]
j = [fv[1] for fv in face_vertices]
k = [fv[2] for fv in face_vertices]

fig = go.Figure(
    data=[
        go.Scatter3d(x=x, y=y, z=z, mode='markers'),
        go.Mesh3d(
            x=x, y=y, z=z,
            opacity=0.8,
            flatshading=True,
            i=i, j=j, k=k)
    ])

fig.update_layout(
    scene=go.layout.Scene(
        annotations=annotations))

fig.show()


def wrap(angle):
    if angle > np.pi:
        return angle - 2 * np.pi
    return angle


# Get points along edges
edge_points = []
for e_index, e in enumerate(edges):
    v0 = cart_vertices[e[0]]
    v1 = cart_vertices[e[1]]
    ed = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]]
    for t in np.arange(0, 1, 0.05):
        ep = [v0[0] + t * ed[0], v0[1] + t * ed[1], v0[2] + t * ed[2]]
        edge_points.append(ep)

sp_edge_points = [cart2sph(ep) for ep in edge_points]


az = [wrap(v[1]) for v in sp_edge_points]
el = [wrap(v[2]) for v in sp_edge_points]

fig2 = go.Figure(
    data=[
        go.Scatter(x=az, y=el, mode='markers')
    ],
    layout=go.Layout(
        xaxis=dict(range=[-np.pi, np.pi]),
        yaxis=dict(range=[-0.5 * np.pi, 0.5 * np.pi])
    ))

fig2.show()


def get_face_positions():
    for az in np.arange(-np.pi, np.pi, np.pi / 16):
        for el in np.arange(-np.pi / 2, np.pi / 2, np.pi / 16):
            xxx = find_intersect(az=az, el=el)
            print(az, el, xxx)


def draw_map():
    print("draw_map")
    edge_len = 1
    # map_vertices = [None] * len(vertices)
    # # for edge_index in edge_list:
    # #     edge = edges[edge_index]
    # #     v0 = map_vertices[edge[0]]
    # #     v1 = map_vertices[edge[1]]

    # # Start with face zero
    # face = faces[0]

    # # Add new faces to the map, using the edges in this
    # # order, starting from face zero
    # edge_list = [1]

    # for edge_index in edge_list:
    #     # Calculate the vertex positions for the current
    #     # face
    #     for e_index in face:

    #     next_face = None
    #     # Determine the next face

    a = np.pi / 3

    v0 = [0, 0]
    v1 = [np.cos(a), np.sin(a)]
    v2 = [1, 0]

    x = [v0[0], v1[0], v2[0]]
    y = [v0[1], v1[1], v2[1]]

    fig3 = go.Figure(
        data=[
            go.Scatter(x=x, y=y, mode='markers')
        ])

    fig3.update_layout(
        yaxis=dict(
            scaleanchor="x",
            scaleratio=1),
        shapes=[
            go.layout.Shape(
                type="line",
                x0=v0[0], y0=v0[1], x1=v1[0], y1=v1[1])
        ])


    # fig3.show()


draw_map()


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
