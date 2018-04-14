
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



var bgTexture;
var grayWallTexture;

function initTextures() {
	bgTexture = gl.createTexture();
	bgTexture.image = new Image();
	bgTexture.image.onload = function () {
		MyUtils.handleLoadedTexture(gl, bgTexture);
	}
	bgTexture.image.src = "bg.gif";

	grayWallTexture = gl.createTexture();
	grayWallTexture.image = new Image();
	grayWallTexture.image.onload = function () {
		MyUtils.handleLoadedTexture(gl, grayWallTexture);
	}
	grayWallTexture.image.src = "gray_wall.jpg";
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
  
var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

function mvPushMatrix() {
	var copy = mat4.create();
	mat4.set(mvMatrix, copy);
	mvMatrixStack.push(copy);
}

function mvPopMatrix() {
	if (mvMatrixStack.length == 0) {
		throw "Invalid popMatrix!";
	}
	mvMatrix = mvMatrixStack.pop();
}


function setMatrixUniforms() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);


	var normalMatrix = mat3.create();
	mat4.toInverseMat3(mvMatrix, normalMatrix);
	mat3.transpose(normalMatrix);
	gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(shaderProgram);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0, pMatrix);

    mat4.identity(mvMatrix);
    mat4.rotate(mvMatrix, MyUtils.degToRad(-60), [1, 0, 0]);
    //mat4.rotate(mvMatrix, MyUtils.degToRad(-10), [0, 1, 0]);
    
    mat4.translate(mvMatrix, [-(-0+boxBody.position.x), 40.0, -(20.0+boxBody.position.z)]);

	// teapot
	mvPushMatrix();
	mat4.translate(mvMatrix, [boxBody.position.x, boxBody.position.y, boxBody.position.z]);
	mat4.scale(mvMatrix, [0.1, 0.1, 0.1]);
	mat4.rotate(mvMatrix, MyUtils.degToRad(90), [1, 0, 0]);
	

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



function drawScene_() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    // Turn on culling. By default backfacing triangles
    // will be culled.
    gl.enable(gl.CULL_FACE);

    // Enable the depth buffer
    gl.enable(gl.DEPTH_TEST);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(shaderProgram);

	// Compute the projection matrix
	var fieldOfViewRadians = MyUtils.degToRad(45);
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var zNear = 1;
    var zFar = 2000;
	var projectionMatrix = mat4.create();
	mat4.perspective(projectionMatrix, fieldOfViewRadians, aspect, zNear, zFar);
	
	// TODO: toRadian
    // Use matrix math to compute a position on a circle where the camera is
	var cameraMatrix = mat4.create();
    var cameraPosition = [40, 40, 40];
	var up = [0, 1, 0];
	// Compute the camera's matrix using look at.
	mat4.lookAt(cameraMatrix, cameraPosition, [0, 0, 0], up);

    // Make a view matrix from the camera matrix
	var viewMatrix = mat4.create();
	mat4.invert(viewMatrix, cameraMatrix);

	// teapot

	// Model View Matrix
	var modelMatrix = mat4.create();
	//mat4.translate(modelMatrix, modelMatrix, [boxBody.position.x, boxBody.position.y, boxBody.position.z]);
	mat4.scale(modelMatrix, modelMatrix, [0.1, 0.1, 0.1]);
	mat4.rotate(modelMatrix, modelMatrix, MyUtils.degToRad(90), [1, 0, 0]);
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
    gl.bindTexture(gl.TEXTURE_2D, grayWallTexture);
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
	mat3.transpose(normalMatrix, modelViewMatrix);
	gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
	gl.drawElements(gl.TRIANGLES, teapotVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

	/*
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
*/
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
