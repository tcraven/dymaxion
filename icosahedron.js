var Icosahedron = {

  vertices: null,
  edges: [
    [1, 3], [10, 11], [5, 6], [0, 7], [8, 9],
    [0, 3], [1, 2], [6, 7], [8, 10], [3, 4],
    [1, 10], [4, 5], [6, 11], [8, 11], [2, 10],
    [9, 10], [0, 5], [1, 9], [2, 3], [4, 11],
    [7, 9], [0, 1], [3, 5], [4, 6], [6, 8],
    [5, 7], [2, 11], [0, 9], [7, 8], [2, 4]
  ],
  faces: [
    [0, 3, 1], [0, 5, 3], [0, 7, 5], [0, 9, 7], [0, 1, 9],
    [1, 3, 2], [3, 4, 2], [3, 5, 4], [5, 6, 4], [5, 7, 6],
    [7, 8, 6], [7, 9, 8], [9, 10, 8], [9, 1, 10], [1, 2, 10],
    [2, 4, 11], [4, 6, 11], [6, 8, 11], [8, 10, 11], [10, 2, 11]
  ],

  getVertices: function() {
    if (!Icosahedron.vertices) {
      var vertices = [];
      var angle = Math.atan(0.5);
      var dAz = 2 * Math.PI / 10;
      vertices.push(cart([1, 0, Math.PI / 2]));
      for (var k = 0; k < 5; k++) {
        vertices.push(cart([1, 2 * dAz * k, angle]));
        vertices.push(cart([1, dAz + 2 * dAz * k, -angle]));
      }
      vertices.push(cart([1, 0, -Math.PI / 2]));
      Icosahedron.vertices = vertices;
    }
    return Icosahedron.vertices;
  },

  getEdges: function() {
    return Icosahedron.edges;
  },

  // Get points along edges, in nested arrays by edge
  getEdgePoints: function(vertices, edges, divideCount) {
    var result = [];
    var N = divideCount;
    for (var i = 0; i < edges.length; i++) {
      var edgePoints = [];
      var edge = edges[i];
      var p0 = vertices[edge[0]];
      var p1 = vertices[edge[1]];
      var dd = [
        p1[0] - p0[0],
        p1[1] - p0[1],
        p1[2] - p0[2]
      ];
      for (var k = 0; k <= N; k++) {
        var p = [
          p0[0] + k * dd[0] / N,
          p0[1] + k * dd[1] / N,
          p0[2] + k * dd[2] / N
        ];
        edgePoints.push(p);
      }
      result.push(edgePoints);
    }
    return result;
  },

  // Faces are lists of three vertices and are listed in
  // the clockwise direction.
  getFaces: function() {
    return Icosahedron.faces;
  },

  // Translates local face position (s, t) into
  // cartesian position (x, y, z)
  getFacePos: function(faceIndex, localPos) {
    var vertices = Icosahedron.getVertices();
    var face = Icosahedron.faces[faceIndex];
    var v0 = vertices[face[0]];
    var v1 = vertices[face[1]];
    var v2 = vertices[face[2]];
    var e1 = [
      v1[0] - v0[0],
      v1[1] - v0[1],
      v1[2] - v0[2]
    ];
    var e2 = [
      v2[0] - v0[0],
      v2[1] - v0[1],
      v2[2] - v0[2]
    ];
    var result = [
      v0[0] + e1[0] * localPos[0] + e2[0] * localPos[1],
      v0[1] + e1[1] * localPos[0] + e2[1] * localPos[1],
      v0[2] + e1[2] * localPos[0] + e2[2] * localPos[1]
    ];
    return result;
  }

};
