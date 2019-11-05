function Drawing(options) {
  // options: { parentEl, width, height, x0, y0, scale }
  this._initialize(options);
}

Drawing.prototype = {

  clear: function() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  },

  beginPath: function() {
    this.ctx.beginPath();
  },

  moveTo: function(p) {
    var cp = this._getCanvasPos(p);
    this.ctx.moveTo(cp[0], cp[1]);
  },

  lineTo: function(p) {
    var cp = this._getCanvasPos(p);
    this.ctx.lineTo(cp[0], cp[1]);
  },

  drawPath: function(options) {
    // options: { lineWidth, strokeStyle, fillStyle }
    if (options && options.lineWidth != undefined) {
      this.ctx.lineWidth = options.lineWidth;
    }
    if (options && options.fillStyle != undefined) {
      this.ctx.fillStyle = options.fillStyle;
      this.ctx.fill();
    }
    if (options && options.strokeStyle != undefined) {
      this.ctx.strokeStyle = options.strokeStyle;
    }
    this.ctx.stroke();
  },

  drawTriangle: function(options) {
    // options: { v0, v1, v2, lineWidth, strokeStyle, fillStyle }
    this.beginPath();
    this.moveTo(options.v0);
    this.lineTo(options.v1);
    this.lineTo(options.v2);
    this.lineTo(options.v0);
    this.drawPath(options);
  },

  drawPolygon: function(options) {
    // options: { v0, v1, v2, lineWidth, strokeStyle, fillStyle }
    this.beginPath();
    this.moveTo(options.vv[0]);
    for (var i = 1; i < options.vv.length; i++) {
      this.lineTo(options.vv[i]);
    }
    this.lineTo(options.vv[0]);
    this.drawPath(options);
  },

  drawCircle: function(options) {
    // p, radius, lineWidth, strokeStyle fillStyle
  },

  drawImage: function(options) {
    // imageEl
    this.ctx.drawImage(
      options.imageEl, 0, 0, this.canvasWidth, this.canvasHeight);

    this.imageData = this.ctx.getImageData(
      0, 0, this.canvasWidth, this.canvasHeight);
  },

  getColor: function(p) {
    var cp = this._getCanvasPos(p);
    var ix = parseInt(cp[0]);
    var iy = parseInt(cp[1]);
    var pIndex = iy * this.canvasWidth * 4 + ix * 4;
    return [
      this.imageData.data[pIndex],
      this.imageData.data[pIndex + 1],
      this.imageData.data[pIndex + 2]
    ];
  },

  _getCanvasPos(p) {
    return [
      this.canvasWidth2 + this.scale * (this.p0[0] + p[0]),
      this.canvasHeight2 - this.scale * (this.p0[1] + p[1]),
    ];
  },

  _initialize(options) {
    // Parent HTML element into which the canvas
    // is inserted
    this.parentEl = options.parentEl;
    // Visual width and height in the browser
    this.width = options.width;
    this.height = options.height;

    // Origin and scale
    this.p0 = options.p0;
    this.scale = options.scale;

    // Canvas width and height is double the
    // visual width and height
    this.canvasWidth = this.width * 2;
    this.canvasHeight = this.height * 2;
    this.canvasWidth2 = this.canvasWidth * 0.5;
    this.canvasHeight2 = this.canvasHeight * 0.5;

    this.canvasEl = $('<canvas/>')
      .attr('width', this.canvasWidth)
      .attr('height', this.canvasHeight);
      
      // .css('width', this.width + 'px')
      // .css('height', this.height + 'px');

    this.parentEl.append(this.canvasEl);
    this.ctx = this.canvasEl.get(0).getContext('2d');
    this.imageData = null;
  }

};
