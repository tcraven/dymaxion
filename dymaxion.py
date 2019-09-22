import numpy as np
import plotly.graph_objects as go


X_UNIT = [1, 0]
Y_UNIT = [np.cos(np.pi / 3), np.sin(np.pi / 3)]


def get_map_pos(ij):
    i, j = ij
    return [
        X_UNIT[0] * i + Y_UNIT[0] * j,
        X_UNIT[1] * i + Y_UNIT[1] * j
    ]


def get_map_ij(pos):
    pass


def get_opposite_pos(v0, v1):
    SIN_PI_3 = np.sin(np.pi / 3)
    return [
        v0[0] + 0.5 * (v1[0] - v0[0]) + SIN_PI_3 * (v0[1] - v1[1]),
        v0[1] + 0.5 * (v1[1] - v0[1]) + SIN_PI_3 * (v1[0] - v0[0])
    ]


def plot_dymaxion(face_points):
    map_points = []
    for i in np.arange(-2, 3, 1):
        for j in np.arange(-2, 3, 1):
            p = get_map_pos(ij=(i, j))
            map_points.append(p)

    print(map_points)

    map_points_2 = []
    map_points_3 = []

    face_ij = [(0, 0), (0, 1), (1, 0)]
    face = [get_map_pos(ij=ij) for ij in face_ij]

    for p in face:
        map_points_2.append(p)

    o_pos = get_opposite_pos(
        v0=face[2],
        v1=face[0])
    map_points_3.append(o_pos)

    map_points_4 = []
    v0 = face[0]
    v1 = face[1]
    v2 = face[2]
    for face_point in face_points:
        # p = v0 + (v1 - v0) * s + (v2 - v0) * t
        px = v0[0] + (v1[0] - v0[0]) * face_point["s"] + (v2[0] - v0[0]) * face_point["t"]
        py = v0[1] + (v1[1] - v0[1]) * face_point["s"] + (v2[1] - v0[1]) * face_point["t"]
        map_points_4.append([px, py])

    fig = go.Figure(
        data=[
            go.Scatter(
                x=[p[0] for p in map_points],
                y=[p[1] for p in map_points],
                mode='markers'),
            go.Scatter(
                x=[p[0] for p in map_points_2],
                y=[p[1] for p in map_points_2],
                mode='markers'),
            go.Scatter(
                x=[p[0] for p in map_points_3],
                y=[p[1] for p in map_points_3],
                mode='markers'),
            go.Scatter(
                x=[p[0] for p in map_points_4],
                y=[p[1] for p in map_points_4],
                mode='markers')
        ])
    fig.update_layout(
        yaxis=dict(
            scaleanchor="x",
            scaleratio=1))
    fig.show()
