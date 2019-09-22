import numpy as np
import plotly.graph_objects as go


def sph2cart(r, az, el):
    rcos_theta = r * np.cos(el)
    x = rcos_theta * np.cos(az)
    y = rcos_theta * np.sin(az)
    z = r * np.sin(el)
    return [x, y, z]


def cart2sph(vertex):
    x = vertex[0]
    y = vertex[1]
    z = vertex[2]
    hxy = np.hypot(x, y)
    r = np.hypot(hxy, z)
    el = np.arctan2(z, hxy)
    az = np.arctan2(y, x)
    return [r, az, el]


def wrap_az(angle):
    if angle > np.pi:
        return angle - 2 * np.pi
    return angle


def wrap_el(angle):
    if angle > np.pi / 2:
        return angle - np.pi
    return angle
    # if angle > np.pi:
    #     return angle - 2 * np.pi
    # return angle


def rotate2d(point, angle):
    x = point[0]
    y = point[1]
    cos = np.cos(angle)
    sin = np.sin(angle)
    return [
        x * cos - y * sin,
        x * sin + y * cos
    ]


def rotate3d(point, z_angle, y_angle):
    p2 = rotate2d(
        point=[point[0], point[1]],
        angle=z_angle)
    point = [p2[0], p2[1], point[2]]

    p3 = rotate2d(
        point=[point[0], point[2]],
        angle=y_angle)
    point = [p3[0], point[1], p3[1]]

    return point


def get_vertices():
    """
    Calculates list of vertices for the icosahedron.
    """
    az0 = 0.0
    el0 = 0.0  # np.pi / 2
    vertices = []
    r = 1
    a = np.arctan(0.5)
    daz = 2 * np.pi / 10
    vertices.append(sph2cart(r=r, az=az0, el=el0 + np.pi / 2))
    for k in [0, 1, 2, 3, 4]:
        vertices.append(sph2cart(r=r, az=az0 + 2 * daz * k, el=el0 + a))
        vertices.append(sph2cart(r=r, az=az0 + daz + 2 * daz * k, el=el0 - a))
    vertices.append(sph2cart(r=r, az=az0, el=el0 - np.pi / 2))

    """
    TO DO:
    - Vertices, faces and edges are constant and computed once
    - Each time rotation is applied, we have a new set of vertices,
      but the same original set of vertices is used to compute them
    - This could also apply to edge points (for drawing smooth edges)
      and face points (when subdividing faces)
    - HTML5 canvas with equirectangular map drawn on it
        - Second overlay canvas with face edges drawn on it
        - Vary z and y angles with mouse drag
    """

    vertices = [
        rotate3d(
            v,
            z_angle=0.0,
            y_angle=1 * np.pi / 2)
        for v in vertices]

    return vertices


def get_faces():
    """
    Faces are lists of three vertices and are listed in
    the clockwise direction.
    """
    return [
        [0, 3, 1], [0, 5, 3], [0, 7, 5], [0, 9, 7], [0, 1, 9],
        [1, 3, 2], [3, 4, 2], [3, 5, 4], [5, 6, 4], [5, 7, 6],
        [7, 8, 6], [7, 9, 8], [9, 10, 8], [9, 1, 10], [1, 2, 10],
        [2, 4, 11], [4, 6, 11], [6, 8, 11], [8, 10, 11], [10, 2, 11]
    ]


def get_edges(faces):
    """
    Edges are pairs of vertices derived from faces. Edges do not
    have directions - only faces do (and they are clockwise).
    """
    edges_set = set()
    for face in faces:
        e1 = tuple(sorted([face[0], face[1]]))
        e2 = tuple(sorted([face[1], face[2]]))
        e3 = tuple(sorted([face[0], face[2]]))
        edges_set.update([e1, e2, e3])

    return list(edges_set)


def get_face_center(face, vertices):
    v0 = vertices[face[0]]
    v1 = vertices[face[1]]
    v2 = vertices[face[2]]
    cx = (v0[0] + v1[0] + v2[0]) / 3
    cy = (v0[1] + v1[1] + v2[1]) / 3
    cz = (v0[2] + v1[2] + v2[2]) / 3
    return [cx, cy, cz]


def get_midpoint(v0, v1):
    return [
        (v0[0] + v1[0]) / 2,
        (v0[1] + v1[1]) / 2,
        (v0[2] + v1[2]) / 2
    ]


def get_face_centers(faces, vertices):
    face_centers = []
    for face in faces:
        face_centers.append(get_face_center(
            face=face,
            vertices=vertices))
    return face_centers


vertices = get_vertices()
faces = get_faces()
edges = get_edges(faces=faces)
face_centers = get_face_centers(faces=faces, vertices=vertices)


def subdivide(subfaces, subvertices):
    new_faces = []
    new_vertices = subvertices.copy()

    # For each face, get its vertices and calculate
    # the midpoints of each edge
    # Add the new vertices to the vertices list
    # Remove the original face from subfaces
    # Create three faces and add to subfaces
    for face in subfaces:
        mid_vertex_01 = get_midpoint(
            v0=new_vertices[face[0]],
            v1=new_vertices[face[1]])
        mid_vertex_12 = get_midpoint(
            v0=new_vertices[face[1]],
            v1=new_vertices[face[2]])
        mid_vertex_20 = get_midpoint(
            v0=new_vertices[face[2]],
            v1=new_vertices[face[0]])

        mid_vertex_01_index = len(new_vertices)
        mid_vertex_12_index = mid_vertex_01_index + 1
        mid_vertex_20_index = mid_vertex_01_index + 2

        new_vertices.extend([
            mid_vertex_01,
            mid_vertex_12,
            mid_vertex_20
        ])

        new_faces.extend([
            [face[0], mid_vertex_01_index, mid_vertex_20_index],
            [mid_vertex_01_index, face[1], mid_vertex_12_index],
            [mid_vertex_12_index, face[2], mid_vertex_20_index],
            [mid_vertex_01_index, mid_vertex_12_index, mid_vertex_20_index]
        ])

    return new_faces, new_vertices


def get_subfaces(face, division_count=2):
    """
    Subdivide face division_count times and return lists of
    subfaces and subvertices.
    """
    # Take the face and its vertices as the starting subface and
    # subvertices
    subvertices = [
        vertices[face[0]],
        vertices[face[1]],
        vertices[face[2]]
    ]
    subfaces = [[0, 1, 2]]

    for i in range(division_count):
        subfaces, subvertices = subdivide(
            subfaces=subfaces,
            subvertices=subvertices)

    return subfaces, subvertices


def plot_icosahedron():
    x = [v[0] for v in vertices]
    y = [v[1] for v in vertices]
    z = [v[2] for v in vertices]

    i = [f[0] for f in faces]
    j = [f[1] for f in faces]
    k = [f[2] for f in faces]

    fig = go.Figure(
        data=[
            go.Scatter3d(x=x, y=y, z=z, mode='markers'),
            go.Mesh3d(
                x=x, y=y, z=z,
                opacity=0.8,
                flatshading=True,
                i=i, j=j, k=k)
        ])

    fig.show()


def find_intersect(az, el):
    d = sph2cart(r=1, az=az, el=el)
    face_index = find_intersect_face_index(d=d)
    face = faces[face_index]
    v0 = vertices[face[0]]
    v1 = vertices[face[1]]
    v2 = vertices[face[2]]
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
