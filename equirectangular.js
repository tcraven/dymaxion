var Equirectangular = {

  drawMapImage: function(options) {
    // options: { drawing, imageEl }
    var drawing = options.drawing;
    var imageEl = options.imageEl;

    drawing.drawImage({
      imageEl: imageEl
    });
  },

  drawOverlayMap: function(options) {
    // options: { drawing, vertices }
    var drawing = options.drawing;
    var vertices = options.vertices;
    var edgeDivideCount = 20;
    var edgePoints = Icosahedron.getEdgePoints(vertices, edgeDivideCount);
    var longLineThreshold = 0.2;
    
    drawing.beginPath();
    for (var i = 0; i < edgePoints.length; i++) {
      var points = edgePoints[i];
      var pPrev = null;
      for (var j = 0; j < points.length; j++) {
        var point = points[j];
        var p = polarAzEl(point);
        if (j == 0) {
          drawing.moveTo(p);
        }
        else {
          // Don't draw line if the distance is large
          var dx = p[0] - pPrev[0];
          var dy = p[1] - pPrev[1];
          var d = dx * dx + dy * dy;
          if (d > longLineThreshold) {
            drawing.moveTo(p);
          }
          else {
            drawing.lineTo(p);
          }
        }
        pPrev = p;
      }
    }
    drawing.drawPath({
      lineWidth: 2
    });
  }

};