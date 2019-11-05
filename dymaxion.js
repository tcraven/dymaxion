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
      { sourceTileIndex: 2, sourceEdgeIndex: 0 },  //  3
      { sourceTileIndex: 2, sourceEdgeIndex: 1 },     //  4
      { sourceTileIndex: 4, sourceEdgeIndex: 1 },     //  5
      { sourceTileIndex: 5, sourceEdgeIndex: 0,
        cut: { type: 'third', side: 'left', vertexIndex: 0 } },  //  6 (third)
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
      { sourceTileIndex: 15, sourceEdgeIndex: 2,
        cut: { type: 'half', side: 'right', vertexIndex: 1 } },  // 17 (half)
      // Bottom section
      { sourceTileIndex: 0, sourceEdgeIndex: 2 },     // 18
      { sourceTileIndex: 18, sourceEdgeIndex: 1 },    // 19
      // Extra repeat tiles
      { sourceTileIndex: 7, sourceEdgeIndex: 1,
        cut: { type: 'half', side: 'left', vertexIndex: 1 } },   // 20 (half)
      { sourceTileIndex: 3, sourceEdgeIndex: 1,
        cut: { type: 'third', side: 'right', vertexIndex: 0 } },  // 20 (third)
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

      function getIndexList(k) {
        return [(0 + k) % 3, (1 + k) % 3, (2 + k) % 3];
      }

      // For cut tiles, calculate vv2
      if (tile.cut) {
        var ii = getIndexList(tile.cut.vertexIndex);
        var vvLeft = null;
        var vvRight = null;

        if (tile.cut.type == 'half') {
          var v3 = [
            tile.vv[ii[0]][0] + 0.5 * (tile.vv[ii[2]][0] - tile.vv[ii[0]][0]),
            tile.vv[ii[0]][1] + 0.5 * (tile.vv[ii[2]][1] - tile.vv[ii[0]][1])
          ];
          vvLeft = [ tile.vv[ii[0]], tile.vv[ii[1]], v3 ];
          vvRight = [ tile.vv[ii[1]], tile.vv[ii[2]], v3 ];
        }
        if (tile.cut.type == 'third') {
          var SQRT36 = Math.sqrt(3) / 6;
          var e = [
            tile.vv[ii[1]][0] - tile.vv[ii[0]][0],
            tile.vv[ii[1]][1] - tile.vv[ii[0]][1]
          ];
          var e90 = [ -e[1], e[0] ];
          var v3 = [
            tile.vv[ii[0]][0] + 0.5 * e[0] - SQRT36 * e90[0],
            tile.vv[ii[0]][1] + 0.5 * e[1] - SQRT36 * e90[1]
          ];
          vvLeft = [ tile.vv[ii[0]], tile.vv[ii[1]], v3 ];
          vvRight = [ tile.vv[ii[0]], v3, tile.vv[ii[1]], tile.vv[ii[2]] ];
        }

        if (tile.cut.side == 'left') {
          tile.vvCut = vvLeft;
          tile.vv2 = vvRight;
        }
        if (tile.cut.side == 'right') {
          tile.vvCut = vvRight;
          tile.vv2 = vvLeft;
        }

        console.log('Tile with cut:', tile);
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
    var drawIterationLimit = 10000;
    var t0 = new Date().getTime();
    var tP = t0;
    var progressIntervalMs = 2000;

    var tiles = Dymaxion.getTiles();
    var subvertices = subfaceData.subvertices;
    var subvertexCount = subfaceData.vertexCountsByDivision[
      divisionCount - 1];
    var subfaces = subfaceData.subfacesByDivision[
      divisionCount - 1];
    
    function drawTiles(i0, j0, iterationLimit) {
      var t = new Date().getTime();
      if (t - tP > progressIntervalMs) {
        var subfaceProgress = (j0 + 1) / subfaces.length;
        var progress = (i0 + subfaceProgress) / tiles.length;
        var elapsedMs = t - t0;
        var remainingMs = (1 - progress) / progress * elapsedMs;

        console.log(
          'Dymaxion.drawTiles: Progress: ' + parseInt(progress * 100) + '% ' +
          'Elapsed: ' + parseInt(elapsedMs / 1000) + ' ' +
          'Remaining: ' + parseInt(remainingMs / 1000)
        );

        tP = t;
      }

      iterationCount = 0;
      for (var i = i0; i < tiles.length; i++) {
        // console.log('Dymaxion.drawMap:', i, tiles.length);

        var tile = tiles[i];

        // Draw the colored subfaces
        var tileE1 = [
          tile.vv[1][0] - tile.vv[0][0],
          tile.vv[1][1] - tile.vv[0][1]
        ];
        var tileE2 = [
          tile.vv[2][0] - tile.vv[0][0],
          tile.vv[2][1] - tile.vv[0][1]
        ];
        
        for (var j = j0; j < subfaces.length; j++) {
          if (iterationCount >= iterationLimit) {
            // Iteration limit has been reached. Schedule
            // to next batch of iterations starting from
            // the current i, j position and return.
            // console.log(
            //   'Dymaxion.drawMap: Iteration limit reached',
            //   iterationLimit, i, j);
            requestAnimationFrame(function() {
              drawTiles(i, j, iterationLimit);
            });
            return;
          }
          var vv = [];
          for (var k = 0; k < 3; k++) {
            vv.push(subvertices[subfaces[j][k]]);
          }

          var colors = [];
          for (var k = 0; k < 3; k++) {
            var pos = Icosahedron.getFacePos(
              vertices, tile.faceIndex, vv[k]);
            var p = polarAzEl(pos);
            var color = eqrImageDrawing.getColor(p);
            colors.push(color);
          }

          var rgb = [
            parseInt((colors[0][0] + colors[1][0] + colors[2][0]) / 3),
            parseInt((colors[0][1] + colors[1][1] + colors[2][1]) / 3),
            parseInt((colors[0][2] + colors[1][2] + colors[2][2]) / 3)
          ];
          var style = 'rgb(' + rgb.join(',') + ')';

          var v0 = [
            tile.vv[0][0] + tileE1[0] * vv[0][0] + tileE2[0] * vv[0][1],
            tile.vv[0][1] + tileE1[1] * vv[0][0] + tileE2[1] * vv[0][1]
          ];
          var v1 = [
            tile.vv[0][0] + tileE1[0] * vv[1][0] + tileE2[0] * vv[1][1],
            tile.vv[0][1] + tileE1[1] * vv[1][0] + tileE2[1] * vv[1][1]
          ];
          var v2 = [
            tile.vv[0][0] + tileE1[0] * vv[2][0] + tileE2[0] * vv[2][1],
            tile.vv[0][1] + tileE1[1] * vv[2][0] + tileE2[1] * vv[2][1]
          ];

          drawing.drawTriangle({
            v0: v0,
            v1: v1,
            v2: v2,
            lineWidth: 1,
            fillStyle: style,
            strokeStyle: style
          });

          iterationCount += 1;
        }
        // At the end of the inner loop, reset j0 to zero
        // so that the next inner loop starts at zero
        j0 = 0;

        // Cut out part of the tile if necessary
        if (tile.vvCut) {
          drawing.drawPolygon({
            vv: tile.vvCut,
            lineWidth: 2,
            fillStyle: '#fff',
            strokeStyle: '#fff'
          });
        }
      }

      // Draw outlines after all tiles have been drawn
      for (var i = 0; i < tiles.length; i++) {
        var tile = tiles[i];
        drawing.drawPolygon({
          vv: tile.vv2 || tile.vv,
          lineWidth: 2,
          strokeStyle: '#000'
        });
      }

      console.log('Dymaxion.drawTiles: Finished');
    }

    drawTiles(0, 0, drawIterationLimit);

  }

};
