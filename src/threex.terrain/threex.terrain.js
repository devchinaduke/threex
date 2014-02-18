var THREEx	= THREEx	|| {}


THREEx.Terrain	= {}

THREEx.Terrain.allocateHeightMap	= function(width, depth){
	// TODO use typedarray
	var heightMap	= new Array(width)
	for(var x = 0; x < width; x++){
		heightMap[x]	= new Array(depth)		
	}
	return heightMap
}

THREEx.Terrain.simplexHeightMap	= function(heightMap){
	// get heightMap dimensions
	var width	= heightMap.length
	var depth	= heightMap[0].length

	var simplex	= new SimplexNoise()
	for(var x = 0; x < width; x++){
		for(var z = 0; z < depth; z++){
			var height	= 0
			var level	= 8
			height	+= (simplex.noise(x/level, z/level)/2 + 0.5) * 0.125
			level	*= 3
			height	+= (simplex.noise(x/level, z/level)/2 + 0.5) * 0.25
			level	*= 2
			height	+= (simplex.noise(x/level, z/level)/2 + 0.5) * 0.5
			level	*= 2
			height	+= (simplex.noise(x/level, z/level)/2 + 0.5) * 1
			height	/= 1+0.5+0.25+0.125
			heightMap[x][z]	= height
		}
	}
	return heightMap	
}

THREEx.Terrain.heightMapToCanvas	= function(heightMap, canvas){
	// get heightMap dimensions
	var width	= heightMap.length
	var depth	= heightMap[0].length
	// create canvas
	canvas		= canvas	|| document.createElement('canvas')
	canvas.width	= width
	canvas.height	= depth
	var context	= canvas.getContext("2d");
	// loop on each pixel of the canvas
	for(var x = 0; x < canvas.width; x++){
		for(var y = 0; y < canvas.height; y++){
			var height	= heightMap[x][y]
			// compute color based on height
			if( height < 0.5 ){
				height		= (height*2)*0.5 + 0.2
				height		= Math.floor(height * 256)
				context.fillStyle = 'rgb(0, 0,'+height+')'
				context.fillRect(x, y, 1, 1)
			}else if( height < 0.7 ){
				height		= (height-0.5)/0.2
				height		= height*0.5 + 0.2
				height		= Math.floor(height * 256)
				context.fillStyle = 'rgb(0, '+height+', 0)'
				context.fillRect(x, y, 1, 1)
			}else{
				height		= (height-0.7)/0.3
				height		= height*0.5 + 0.5
				height		= Math.floor(height * 256)
				context.fillStyle = 'rgb('+height+','+height+','+height+')'
				context.fillRect(x, y, 1, 1)
			}
		}
	}
	// return the just built canvas
	return canvas
}

THREEx.Terrain.heightMapToPlaneGeometry	= function(heightMap){
	// get heightMap dimensions
	var width	= heightMap.length
	var depth	= heightMap[0].length
	// build geometry
	var geometry	= new THREE.PlaneGeometry( 1, 1, width-1, depth-1)
	// loop on each vertex of the geometry
	for(var x = 0; x < width; x++){
		for(var z = 0; z < depth; z++){
			var height	= heightMap[x][z]
			var vertex	= geometry.vertices[x+z*width]
			vertex.z	= (height-0.5)*2
			// vertex.z	= x/width*2
		}
	}
	geometry.verticesNeedUpdate	= true

geometry.computeCentroids()
// geometry.computeTangents()
// geometry.tangentsNeedUpdate	= true
// geometry.elementsNeedUpdate	= true

	geometry.computeFaceNormals()
	geometry.computeVertexNormals()
	geometry.normalsNeedUpdate	= true

	return geometry
}

THREEx.Terrain.heightMapToVertexColor	= function(heightMap, geometry){
	// get heightMap dimensions
	var width	= heightMap.length
	var depth	= heightMap[0].length
	// loop on each vertex of the geometry
	var color	= new THREE.Color()
	for(var i = 0; i < geometry.faces.length; i++){
		var face	= geometry.faces[i]
		console.assert(face instanceof THREE.Face4)
		face.vertexColors.push( vertexIdxToColor(face.a).clone() )
		face.vertexColors.push( vertexIdxToColor(face.b).clone() )
		face.vertexColors.push( vertexIdxToColor(face.c).clone() )
		face.vertexColors.push( vertexIdxToColor(face.d).clone() )
	}
	geometry.colorsNeedUpdate	= true
	return
	
	function vertexIdxToColor(vertexIdx){
		var x	= Math.floor(vertexIdx % width)
		var z	= Math.floor(vertexIdx / width)
		return coordToColor(x, z)
	}

	function coordToColor(x, z){	
		var height	= heightMap[x][z]

		// compute color based on height
		if( height < 0.5 ){
			height		= (height*2)*0.5 + 0.2
			color.setRGB(0,0, height)
		}else if( height < 0.7 ){
			height		= (height-0.5)/0.2
			height		= height*0.5 + 0.2
			color.setRGB(0,height, 0)
		}else{
			height		= (height-0.7)/0.3
			height		= height*0.5 + 0.5
			color.setRGB(height,height, height)
		}
		// color.setRGB(1,1,1)
		return color;
	}
}