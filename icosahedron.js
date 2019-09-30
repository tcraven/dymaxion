var Icosahedron = {

  getVertices: function() {
    var vertices = [];
    var angle = Math.atan(0.5);
    var dAz = 2 * Math.PI / 10;
    vertices.push(cart([1, 0, Math.PI / 2]));
    for (var k = 0; k < 5; k++) {
      vertices.push(cart([1, 2 * dAz * k, angle]));
      vertices.push(cart([1, dAz + 2 * dAz * k, -angle]));
    }
    vertices.push(cart([1, 0, -Math.PI / 2]));
    return vertices;
  },

  getEdges: function() {
    return [
      [1, 3], [10, 11], [5, 6], [0, 7], [8, 9],
      [0, 3], [1, 2], [6, 7], [8, 10], [3, 4],
      [1, 10], [4, 5], [6, 11], [8, 11], [2, 10],
      [9, 10], [0, 5], [1, 9], [2, 3], [4, 11],
      [7, 9], [0, 1], [3, 5], [4, 6], [6, 8],
      [5, 7], [2, 11], [0, 9], [7, 8], [2, 4]
    ];
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
  }

};
