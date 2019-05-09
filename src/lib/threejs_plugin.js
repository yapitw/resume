import * as THREE from "three";
import * as opentype from "./opentype";
/**
 * Created by gbox3d on 15. 5. 13..
 */
opentype.Glyph.prototype._3_getPath = function(x, y, fontSize) {
  x = x !== undefined ? x : 0;
  y = y !== undefined ? y : 0;
  fontSize = fontSize !== undefined ? fontSize : 72;
  var scale = (1 / this.font.unitsPerEm) * fontSize;
  var p = new opentype.Path();
  var commands = this.path.commands;
  console.log(commands);

  for (var i = 0; i < commands.length; i += 1) {
    var cmd = commands[i];
    if (cmd.type === "M") {
      p.moveTo(x + cmd.x * scale, y + -cmd.y * scale);
    } else if (cmd.type === "L") {
      p.lineTo(x + cmd.x * scale, y + -cmd.y * scale);
    } else if (cmd.type === "Q") {
      p.quadraticCurveTo(
        x + cmd.x1 * scale,
        y + -cmd.y1 * scale,
        x + cmd.x * scale,
        y + -cmd.y * scale
      );

      //console.log(' quadraticCurveTo ');
      //console.log(cmd);
    } else if (cmd.type === "C") {
      //console.log('curveTo');
      //console.log(cmd);

      p.curveTo(
        x + cmd.x1 * scale,
        y + -cmd.y1 * scale,
        x + cmd.x2 * scale,
        y + -cmd.y2 * scale,
        x + cmd.x * scale,
        y + -cmd.y * scale
      );
    } else if (cmd.type === "Z") {
      p.closePath();
    }
  }

  return p;
};

opentype.Font.prototype._3_getPath = function(text, x, y, fontSize, options) {
  var fullPath = new opentype.Path();
  this.forEachGlyph(text, x, y, fontSize, options, function(
    glyph,
    gX,
    gY,
    gFontSize
  ) {
    var glyphPath = glyph._3_getPath(gX, gY, gFontSize);
    fullPath.extend(glyphPath);
  });

  return fullPath;
};

opentype.Font.prototype.getTextGeometry = function(option) {
  var font_path = this._3_getPath(
    option.text,
    option.x,
    option.y,
    option.fontSize
  );

  // console.log(font_path);

  var cmds = font_path.commands;

  //도형을 만든다. 그리는것은 2디같다.
  var path = new THREE.ShapePath();

  var paths = [];

  //cmds.length
  for (var i = 0; i < cmds.length; i++) {
    var cmd = cmds[i];

    // console.log( i + ':'+ cmd.type)

    switch (cmd.type) {
      case "M":
        path.moveTo(cmd.x, -cmd.y);
        break;
      case "L":
        path.lineTo(cmd.x, -cmd.y);
        break;
      case "Q":
        path.quadraticCurveTo(cmd.x1, -cmd.y1, cmd.x, -cmd.y);
        break;
      case "Z":
        // path.closePath();
        path.autoClose = true;
        paths.push(path);
        path = new THREE.ShapePath();
        break;
    }
  } //end for

  //var paths = data.paths;
  var shapes = [];

  for (var p = 0, pl = paths.length; p < pl; p++) {
    //배열을 하나씩 풀어서 다시넣기
    Array.prototype.push.apply(shapes, paths[p].toShapes());
  }

  var textGeoArr = [];

  for (var i = 0; i < shapes.length; i++) {
    var textGeo = new THREE.ExtrudeGeometry(shapes[i], option.geo_option);
    // console.log(textGeo);
    // for (var j = 0; j < textGeo.vertices.length; j++) {
    //     var x = textGeo.vertices[j].x;
    //     var y = textGeo.vertices[j].y;
    //     var z = textGeo.vertices[j].z;
    //     textGeo.vertices[j].x = -y
    //     textGeo.vertices[j].y = -z
    //     textGeo.vertices[j].z = -x
    // }
    textGeo.computeBoundingBox();
    textGeo.computeVertexNormals();
    textGeo.rotateX(Math.PI * -0.5);
    textGeo.rotateY(Math.PI * 0.5);

    textGeoArr.push(textGeo);
  }

  return textGeoArr;
};
export default opentype;
