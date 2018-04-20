
var shaderProgram;
// setup GLSL program
function initPrograms() {

	shaderProgram = MyUtils.initShaders(gl, "shader-fs", "shader-vs");

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
	gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
	shaderProgram.materialShininessUniform = gl.getUniformLocation(shaderProgram, "uMaterialShininess");
	shaderProgram.showSpecularHighlightsUniform = gl.getUniformLocation(shaderProgram, "uShowSpecularHighlights");
	shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
	shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
	shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
	shaderProgram.pointLightingSpecularColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingSpecularColor");
	shaderProgram.pointLightingDiffuseColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingDiffuseColor");
}
 

var ceramicsTexture;
var grayWallTexture;
var rustTexture;

function initTextures() {
	ceramicsTexture = gl.createTexture();
	ceramicsTexture.image = new Image();
	ceramicsTexture.image.onload = function () {
		MyUtils.handleLoadedTexture(gl, ceramicsTexture);
	}
	ceramicsTexture.image.src = "ceramics.jpg";

	grayWallTexture = gl.createTexture();
	grayWallTexture.image = new Image();
	grayWallTexture.image.onload = function () {
		MyUtils.handleLoadedTexture(gl, grayWallTexture);
	}
	grayWallTexture.image.src = "gray_wall.jpg";

	rustTexture = gl.createTexture();
	rustTexture.image = new Image();
	rustTexture.image.onload = function () {
		MyUtils.handleLoadedTexture(gl, rustTexture);
	}
	rustTexture.image.src = "rust.gif";
}

var teapotVertexPositionBuffer;
var teapotVertexNormalBuffer;
var teapotVertexTextureCoordBuffer;
var teapotVertexIndexBuffer;


function loadTeapot() {
	var request = new XMLHttpRequest();
	request.open("GET", "teapot.json");
	request.onreadystatechange = function () {
		if (request.readyState == 4) {
			MyUtils.handleLoadedTeapot(gl, JSON.parse(request.responseText));
		}
	}
	request.send();
}

function drawScene() {

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    // Clear the canvas AND the depth buffer.
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Turn on culling. By default backfacing triangles will be culled.
    gl.enable(gl.CULL_FACE);
    // Enable the depth buffer
    gl.enable(gl.DEPTH_TEST);
    // Tell it to use our program (pair of shaders)
    gl.useProgram(shaderProgram);

	// Compute the projection matrix
	var fieldOfViewRadians = MyUtils.degToRad(45);
    var aspect = gl.viewportWidth / gl.viewportHeight;
    var zNear = 1;
    var zFar = 2000;
	var projectionMatrix = mat4.create();
	mat4.perspective(projectionMatrix, fieldOfViewRadians, aspect, zNear, zFar);
    //mat4.perspective(fieldOfView, aspect, zNear, zFar, pMatrix);

	var boxPos = [boxBody.position.x, boxBody.position.y, boxBody.position.z];

    // Use matrix math to compute a position on a circle where the camera is
    var cameraPosition = [boxBody.position.x, boxBody.position.y-20, boxBody.position.z+10];
	var up = [0, 0, 1];
	// Compute the view matrix using look at.
	var viewMatrix = mat4.create();
	mat4.lookAt(viewMatrix, cameraPosition, boxPos, up);

	// teapot

	// Model View Matrix
	var modelMatrix = mat4.create();
	mat4.translate(modelMatrix, modelMatrix, boxPos);
	mat4.scale(modelMatrix, modelMatrix, [0.07, 0.07, 0.07]);
	mat4.rotate(modelMatrix, modelMatrix, MyUtils.degToRad(90), [1, 0, 0]);
	mat4.rotate(modelMatrix, modelMatrix, MyUtils.degToRad(30), [0, 0, 1]);
	mat4.rotate(modelMatrix, modelMatrix, MyUtils.degToRad(angle), [0, 1, 0]);
	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

	

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
    gl.bindTexture(gl.TEXTURE_2D, rustTexture);
	gl.uniform1i(shaderProgram.samplerUniform, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, teapotVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexTextureCoordBuffer);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, teapotVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexNormalBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, teapotVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotVertexIndexBuffer);

	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, projectionMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, modelViewMatrix);
	var normalMatrix = mat3.create();
	mat3.fromMat4(normalMatrix, modelViewMatrix);
	mat3.invert(normalMatrix, normalMatrix);
	mat3.transpose(normalMatrix, normalMatrix);
	gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);

	gl.drawElements(gl.TRIANGLES, teapotVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

	// board
    gl.useProgram(shaderProgram);
	gl.uniform1i(shaderProgram.showSpecularHighlightsUniform, specularHighlights);
	gl.uniform1i(shaderProgram.useLightingUniform, lighting);
	if (lighting) {
		gl.uniform3fv(shaderProgram.ambientColorUniform, [0.2, 0.2, 0.2]);
		gl.uniform3fv(shaderProgram.pointLightingLocationUniform, lightPos);
		gl.uniform3fv(shaderProgram.pointLightingSpecularColorUniform, [0.8, 0.8, 0.8]);
		gl.uniform3fv(shaderProgram.pointLightingDiffuseColorUniform, [0.8, 0.8, 0.8]);
	}
	gl.uniform1f(shaderProgram.materialShininessUniform, 32);

	var boardPos = [boardBody.position.x, boardBody.position.y, boardBody.position.z];
	mat4.identity(modelMatrix);
    mat4.translate(modelMatrix, modelMatrix, boardPos);
	mat4.scale(modelMatrix, modelMatrix, [4, 3, 0.2]);
	var modelViewMatrix = mat4.create();
	mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

	gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, ceramicsTexture);
	gl.uniform1i(shaderProgram.samplerUniform, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, projectionMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, modelViewMatrix);
	normalMatrix = mat3.create();
	mat3.fromMat4(normalMatrix, modelViewMatrix);
	mat3.invert(normalMatrix, normalMatrix);
	mat3.transpose(normalMatrix, normalMatrix);
	gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);

	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


}

function tick() {
    requestAnimFrame(tick);
    drawScene();
    animate();
}


function webGLStart() {
    var canvas = document.getElementById("display");
    MyUtils.initGL(canvas);
    initPrograms();
	initBuffers();
	initTextures();
	loadTeapot();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    document.addEventListener('keydown',onDocumentKeyDown,false);
    document.addEventListener('keyup',onDocumentKeyUp,false);


    tick();
}
