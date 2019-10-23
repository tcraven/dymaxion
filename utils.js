function wrapAngle(angle) {
  if (angle > Math.PI) {
    return angle - 2 * Math.PI;
  }
  if (angle < -Math.PI) {
    return angle + 2 * Math.PI;
  }
  return angle;
}

function cart(p) {
  var r = p[0];
  var az = p[1];
  var el = p[2];
  var rCosEl = r * Math.cos(el);
  return [
    rCosEl * Math.cos(az),
    rCosEl * Math.sin(az),
    r * Math.sin(el)
  ];
}

function polar(p) {
  var x = p[0];
  var y = p[1];
  var z = p[2];
  var hxy = Math.hypot(x, y);
  return [
    Math.hypot(hxy, z),
    Math.atan2(y, x),
    Math.atan2(z, hxy)
  ];
}

function polarAzEl(p) {
  var pp = polar(p);
  return [
    pp[1],
    pp[2]
  ];
}

function rotate2d(point, angle) {
  var x = point[0];
  var y = point[1];
  var cos = Math.cos(angle);
  var sin = Math.sin(angle);
  return [
      x * cos - y * sin,
      x * sin + y * cos
  ];
}

function rotate3d(point, zAngle, yAngle, xAngle) {
  var p2 = rotate2d(
    [point[0], point[1]],
    zAngle);
  point = [p2[0], p2[1], point[2]];

  var p3 = rotate2d(
    [point[0], point[2]],
    yAngle);
  point = [p3[0], point[1], p3[1]];

  var p4 = rotate2d(
    [point[1], point[2]],
    xAngle);
  point = [point[0], p4[0], p4[1]];

  return point;
}

function loadImage(url, callback) {
  var image = new Image();
  image.onload = function() {
    callback(image);
  }
  image.src = url;
}
