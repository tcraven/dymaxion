var Dymaxion = {

  getTiles: function() {
    /*
    Dymaxion map consists of a list of tiles.
    {
      sourceTileIndex       Tile that this tile connects from
      sourceEdgeIndex       Source face edge that this tile connects from
      sourceFaceIndex       Source face that this tile connects from
      faceIndex             Face that this tile represents
      vv                    List of vertex positions [v0, v1, v2]
    }

    Each tile is connected to a previous tile via the sourceTileIndex
    and sourceEdgeIndex values. The other values are populated by the
    algorithm as the Dymaxion map is layed out.
    */
    var SIN_60 = Math.sqrt(3) / 2;
    var v0 = [0, 0];
    var tiles = [
      {
        faceIndex: 0,
        vv: [
          v0,
          [v0[0] + 0.5, v0[1] + SIN_60],
          [v0[0] + 1, v0[1] + 0]
        ]
      },  // 0
      // Left section
      { sourceTileIndex: 0, sourceEdgeIndex: 0 },     //  1
      { sourceTileIndex: 1, sourceEdgeIndex: 0 },     //  2
      { sourceTileIndex: 2, sourceEdgeIndex: 0 },     //  3
      { sourceTileIndex: 2, sourceEdgeIndex: 1 },     //  4
      { sourceTileIndex: 4, sourceEdgeIndex: 1 },     //  5
      { sourceTileIndex: 5, sourceEdgeIndex: 0 },     //  6
      { sourceTileIndex: 6, sourceEdgeIndex: 1 },     //  7
      { sourceTileIndex: 5, sourceEdgeIndex: 1 },     //  8
      { sourceTileIndex: 4, sourceEdgeIndex: 2 },     //  9
      { sourceTileIndex: 9, sourceEdgeIndex: 1 },     // 10
      { sourceTileIndex: 9, sourceEdgeIndex: 2 },     // 11
      // Right section
      { sourceTileIndex: 0, sourceEdgeIndex: 1 },     // 12
      { sourceTileIndex: 12, sourceEdgeIndex: 1 },    // 13
      { sourceTileIndex: 12, sourceEdgeIndex: 2 },    // 14
      { sourceTileIndex: 14, sourceEdgeIndex: 1 },    // 15
      { sourceTileIndex: 15, sourceEdgeIndex: 1 },    // 16
      { sourceTileIndex: 15, sourceEdgeIndex: 2 },    // 17
      // Bottom section
      { sourceTileIndex: 0, sourceEdgeIndex: 2 },     // 18
      { sourceTileIndex: 18, sourceEdgeIndex: 1 },    // 19
    ];

    // Calculate tile positions
    for (var i = 1; i < tiles.length; i++) {
      var tile = tiles[i];
      var sourceTile = tiles[tile.sourceTileIndex];
      var sourceFace = Icosahedron.faces[sourceTile.faceIndex];
      tile.sourceFaceIndex = sourceTile.faceIndex;
      tile.faceIndex = Icosahedron.neighborFaces[
        tile.sourceFaceIndex][tile.sourceEdgeIndex];
      var face = Icosahedron.faces[tile.faceIndex];

      tile._sourceFace = sourceFace;
      tile._face = face;

      tile.vv = [];
      for (var k = 0; k < 3; k++) {
        var vertexIndex = face[k];
        var sourceK = sourceFace.indexOf(vertexIndex);
        if (sourceK != -1) {
          // Copy position from source tile
          tile.vv[k] = sourceTile.vv[sourceK];
        }
        else {
          // Calculate position from source tile
          var v = sourceTile.vv[tile.sourceEdgeIndex];
          var vi0 = [1, 2, 0][tile.sourceEdgeIndex];
          var vi1 = [0, 1, 2][tile.sourceEdgeIndex];
          var e = [
            sourceTile.vv[vi0][0] - sourceTile.vv[vi1][0],
            sourceTile.vv[vi0][1] - sourceTile.vv[vi1][1],
          ];
          // Rotate e 90 degrees anticlockwise to get
          // to the next vertex position
          var e90 = [-e[1], e[0]];
          tile.vv[k] = [
            v[0] + 0.5 * e[0] + SIN_60 * e90[0],
            v[1] + 0.5 * e[1] + SIN_60 * e90[1]
          ];
        }
      }
    }

    return tiles;
  },

  drawMapDebug: function(options) {
    var drawing = options.drawing;
    var tiles = Dymaxion.getTiles();
    
    for (var i = 0; i < tiles.length; i++) {
      var tile = tiles[i];
      drawing.drawTriangle({
        v0: tile.vv[0],
        v1: tile.vv[1],
        v2: tile.vv[2],
        lineWidth: 1,
        fillStyle: '#fff',
        strokeStyle: '#000'
      });
    }
  },

  drawMap: function(options) {
    // options: drawing, subfaceData, divisionCount,
    // vertices, eqrImageDrawing
    var drawing = options.drawing;
    var subfaceData = options.subfaceData;
    var divisionCount = options.divisionCount;
    var vertices = options.vertices;
    var eqrImageDrawing = options.eqrImageDrawing;

    var tiles = Dymaxion.getTiles();
    var subvertices = subfaceData.subvertices;
    var subvertexCount = subfaceData.vertexCountsByDivision[
      divisionCount - 1];
    
    for (var i = 0; i < tiles.length; i++) {
      var tile = tiles[i];

      // Get subvertex colors from the equirectangular map image
      var subvertexColors = [];
      for (var j = 0; j < subvertexCount; j++) {
        var localPos = subvertices[j];
        var pos = Icosahedron.getFacePos(
          vertices, tile.faceIndex, localPos);
        var p = polarAzEl(pos);
        var color = eqrImageDrawing.getColor(p);
        subvertexColors.push(color);
      }

      // Draw the colored subfaces
      var tileE1 = [
        tile.vv[1][0] - tile.vv[0][0],
        tile.vv[1][1] - tile.vv[0][1]
      ];
      var tileE2 = [
        tile.vv[2][0] - tile.vv[0][0],
        tile.vv[2][1] - tile.vv[0][1]
      ];
      var subfaces = subfaceData.subfacesByDivision[divisionCount - 1];
      for (var j = 0; j < subfaces.length; j++) {
        var i0 = subfaces[j][0];
        var i1 = subfaces[j][1];
        var i2 = subfaces[j][2];
        var localV0 = subvertices[i0];
        var localV1 = subvertices[i1];
        var localV2 = subvertices[i2];
        var rgb = [
          parseInt((subvertexColors[i0][0] + subvertexColors[i1][0] + subvertexColors[i2][0]) / 3),
          parseInt((subvertexColors[i0][1] + subvertexColors[i1][1] + subvertexColors[i2][1]) / 3),
          parseInt((subvertexColors[i0][2] + subvertexColors[i1][2] + subvertexColors[i2][2]) / 3)
        ];
        var style = 'rgb(' + rgb.join(',') + ')';

        var v0 = [
          tile.vv[0][0] + tileE1[0] * localV0[0] + tileE2[0] * localV0[1],
          tile.vv[0][1] + tileE1[1] * localV0[0] + tileE2[1] * localV0[1]
        ];
        var v1 = [
          tile.vv[0][0] + tileE1[0] * localV1[0] + tileE2[0] * localV1[1],
          tile.vv[0][1] + tileE1[1] * localV1[0] + tileE2[1] * localV1[1]
        ];
        var v2 = [
          tile.vv[0][0] + tileE1[0] * localV2[0] + tileE2[0] * localV2[1],
          tile.vv[0][1] + tileE1[1] * localV2[0] + tileE2[1] * localV2[1]
        ];

        drawing.drawTriangle({
          v0: v0,
          v1: v1,
          v2: v2,
          lineWidth: 1,
          fillStyle: style,
          strokeStyle: style
        });
      }

      drawing.drawTriangle({
        v0: tile.vv[0],
        v1: tile.vv[1],
        v2: tile.vv[2],
        lineWidth: 1,
        strokeStyle: '#000'
      });

    }
  }

};
