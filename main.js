
function handleLoadedTexture(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);
}

var bgTexture;
var grayWallTexture;

function initTextures() {
	bgTexture = gl.createTexture();
	bgTexture.image = new Image();
	bgTexture.image.onload = function () {
		handleLoadedTexture(bgTexture)
	}
	bgTexture.image.src = "bg.gif";

	grayWallTexture = gl.createTexture();
	grayWallTexture.image = new Image();
	grayWallTexture.image.onload = function () {
		handleLoadedTexture(grayWallTexture)
	}
	grayWallTexture.image.src = "gray_wall.gif";
}

var teapotVertexPositionBuffer;
var teapotVertexNormalBuffer;
var teapotVertexTextureCoordBuffer;
var teapotVertexIndexBuffer;

function handleLoadedTeapot(teapotData) {
	teapotVertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapotData.vertexNormals), gl.STATIC_DRAW);
	teapotVertexNormalBuffer.itemSize = 3;
	teapotVertexNormalBuffer.numItems = teapotData.vertexNormals.length / 3;

	teapotVertexTextureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexTextureCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapotData.vertexTextureCoords), gl.STATIC_DRAW);
	teapotVertexTextureCoordBuffer.itemSize = 2;
	teapotVertexTextureCoordBuffer.numItems = teapotData.vertexTextureCoords.length / 2;

	teapotVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapotData.vertexPositions), gl.STATIC_DRAW);
	teapotVertexPositionBuffer.itemSize = 3;
	teapotVertexPositionBuffer.numItems = teapotData.vertexPositions.length / 3;

	teapotVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotVertexIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(teapotData.indices), gl.STATIC_DRAW);
	teapotVertexIndexBuffer.itemSize = 1;
	teapotVertexIndexBuffer.numItems = teapotData.indices.length;

	document.getElementById("loadingtext").textContent = "";
}


function loadTeapot() {
	var request = new XMLHttpRequest();
	request.open("GET", "teapot.json");
	request.onreadystatechange = function () {
		if (request.readyState == 4) {
			handleLoadedTeapot(JSON.parse(request.responseText));
		}
	}
	request.send();
}
  

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0, pMatrix);

    mat4.identity(mvMatrix);
    mat4.rotate(mvMatrix, degToRad(-60), [1, 0, 0]);
    //mat4.rotate(mvMatrix, degToRad(-10), [0, 1, 0]);
    
    mat4.translate(mvMatrix, [-(-0+boxBody.position.x), 40.0, -(20.0+boxBody.position.z)]);

	// teapot
	mvPushMatrix();
	mat4.translate(mvMatrix, [boxBody.position.x, boxBody.position.y, boxBody.position.z]);
	mat4.scale(mvMatrix, [0.1, 0.1, 0.1]);
	mat4.rotate(mvMatrix, degToRad(90), [1, 0, 0]);
	

	var lighting = 1;
	var lightPos = [-10, 20, 20];

	var specularHighlights = 1;
	gl.uniform1i(shaderProgram.showSpecularHighlightsUniform, specularHighlights);

	gl.uniform1i(shaderProgram.useLightingUniform, lighting);
	if (lighting) {
		gl.uniform3fv(shaderProgram.ambientColorUniform, [0.2, 0.2, 0.2]);
		gl.uniform3fv(shaderProgram.pointLightingLocationUniform, lightPos);
		gl.uniform3fv(shaderProgram.pointLightingSpecularColorUniform, [0.8, 0.8, 0.8]);
		gl.uniform3fv(shaderProgram.pointLightingDiffuseColorUniform, [0.8, 0.8, 0.8]);
	}
	gl.uniform1f(shaderProgram.materialShininessUniform, 32);
	
	gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, grayWallTexture);
	gl.uniform1i(shaderProgram.samplerUniform, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, teapotVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexTextureCoordBuffer);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, teapotVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexNormalBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, teapotVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotVertexIndexBuffer);
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, teapotVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

	mvPopMatrix();
	
	// board
	mvPushMatrix();
    mat4.translate(mvMatrix, [boardBody.position.x, boardBody.position.y, boardBody.position.z]);
	mat4.scale(mvMatrix, [4, 3, 0.2]);

	gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, grayWallTexture);
	gl.uniform1i(shaderProgram.samplerUniform, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mvPopMatrix();

}

function tick() {
    requestAnimFrame(tick);
    drawScene();
    animate();
}


function webGLStart() {
    var canvas = document.getElementById("display");
    initGL(canvas);
    initShaders()
	initBuffers();
	initTextures();
	loadTeapot();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    document.addEventListener('keydown',onDocumentKeyDown,false);
    document.addEventListener('keyup',onDocumentKeyUp,false);


    tick();
}
