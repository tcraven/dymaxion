var Subfaces = {

  addSubvertex: function(v, subvertices, vDict) {
    var vk = v.toString();
    var i = vDict[vk];
    if (i == undefined) {
      i = subvertices.length;
      vDict[vk] = i;
      subvertices.push(v);
    }
    return i;
  },

  subdivideFace: function(face, subvertices, subfaces, vDict) {
    var i0 = face[0];
    var i1 = face[1];
    var i2 = face[2];
    var v0 = subvertices[i0];
    var v1 = subvertices[i1];
    var v2 = subvertices[i2];

    var e1 = [0.5 * (v1[0] - v0[0]), 0.5 * (v1[1] - v0[1])];
    var e2 = [0.5 * (v2[0] - v0[0]), 0.5 * (v2[1] - v0[1])];
    
    var v3 = [v0[0] + e1[0], v0[1] + e1[1]];
    var v4 = [v0[0] + e1[0] + e2[0], v0[1] + e1[1] + e2[1]];
    var v5 = [v0[0] + e2[0], v0[1] + e2[1]];
    
    var i3 = Subfaces.addSubvertex(v3, subvertices, vDict);
    var i4 = Subfaces.addSubvertex(v4, subvertices, vDict);
    var i5 = Subfaces.addSubvertex(v5, subvertices, vDict);

    subfaces.push(
      [i0, i3, i5], [i3, i4, i5], [i1, i4, i3], [i2, i5, i4]
    );
  },

  createSubfaceData: function(options) {
    // vertices are (s, t) coordinates
    var divisionCount = options.divisionCount;
    var subfaceData = {
      subvertices: [[0, 0], [0, 1], [1, 0]],
      subfacesByDivision: [
        [ [0, 1, 2] ]         // 0th division is first face
      ],
      vertexCountsByDivision: [
        3
      ]
    };
    
    var vDict = {};
    for (var i = 0; i < subfaceData.subvertices.length; i++) {
      vDict[subfaceData.subvertices[i].toString()] = i;
    }

    for (var divIndex = 1; divIndex < divisionCount; divIndex++) {
      var subvertices = subfaceData.subvertices;
      var subfaces = subfaceData.subfacesByDivision[divIndex - 1];
      var newSubfaces = [];
      for (var i = 0; i < subfaces.length; i++) {
        Subfaces.subdivideFace(subfaces[i], subvertices, newSubfaces, vDict);
      }
      subfaceData.subfacesByDivision[divIndex] = newSubfaces;
      subfaceData.vertexCountsByDivision[divIndex] = subvertices.length;
    }
    return subfaceData;
  }

};
