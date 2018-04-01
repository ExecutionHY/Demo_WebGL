
var gl;

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}


function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}


var shaderProgram;

function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
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
}


function degToRad(degrees) {
    return degrees * Math.PI / 180;
}


var pyramidVertexPositionBuffer;
var pyramidVertexColorBuffer;
var cubeVertexPositionBuffer;
var cubeVertexColorBuffer;
var cubeVertexIndexBuffer;

function initBuffers() {

    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    vertices = [
        // Front face
        -1.0, -1.0,  1.0,
            1.0, -1.0,  1.0,
            1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
            1.0,  1.0, -1.0,
            1.0, -1.0, -1.0,

        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
            1.0,  1.0,  1.0,
            1.0,  1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Right face
            1.0, -1.0, -1.0,
            1.0,  1.0, -1.0,
            1.0,  1.0,  1.0,
            1.0, -1.0,  1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = 24;

    cubeVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    colors = [
        [1.0, 0.0, 0.0, 1.0], // Front face
        [1.0, 1.0, 0.0, 1.0], // Back face
        [0.0, 1.0, 0.0, 1.0], // Top face
        [1.0, 0.5, 0.5, 1.0], // Bottom face
        [1.0, 0.0, 1.0, 1.0], // Right face
        [0.0, 0.0, 1.0, 1.0]  // Left face
    ];
    var unpackedColors = [];
    for (var i in colors) {
        var color = colors[i];
        for (var j=0; j < 4; j++) {
            unpackedColors = unpackedColors.concat(color);
        }
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
    cubeVertexColorBuffer.itemSize = 4;
    cubeVertexColorBuffer.numItems = 24;

    cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    var cubeVertexIndices = [
        0, 1, 2,	  0, 2, 3,	// Front face
        4, 5, 6,	  4, 6, 7,	// Back face
        8, 9, 10,	 8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = 36;
}


var rPyramid = 0;
var rCube = 0;

position_box = [0.0, 10.0, 0.0];

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

    mat4.identity(mvMatrix);
    mat4.rotate(mvMatrix, degToRad(-60), [1, 0, 0]);
    mat4.translate(mvMatrix, [0.0, 40.0, -20.0]);

	// box
    mvPushMatrix();
    mat4.translate(mvMatrix, [boxBody.position.x, boxBody.position.y, boxBody.position.z]);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

	mvPopMatrix();
	
	// box
	mvPushMatrix();
    mat4.translate(mvMatrix, [boardBody.position.x, boardBody.position.y, boardBody.position.z]);
	mat4.scale(mvMatrix, [4, 3, 0.2]);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix();

}

var move_left = false;
var move_up = false;
var move_right = false;
var move_down = false;
var move_jump = false;
var constraint_y = true;
var constraint_z = false;

function onDocumentKeyDown(event) {
    if (event.keyCode == 37) {
        move_left = true;
    }
    else if (event.keyCode == 38) {
        move_up = true;
    }
    else if (event.keyCode == 39) {
        move_right = true;
    }
    else if (event.keyCode == 40) {
        move_down = true;
    }
    else if (event.keyCode == 32) {
        move_jump = true;
    }
}
function onDocumentKeyUp(event) {
    if (event.keyCode == 37) {
        move_left = false;
    }
    else if (event.keyCode == 38) {
        move_up = false;
    }
    else if (event.keyCode == 39) {
        move_right = false;
    }
    else if (event.keyCode == 40) {
        move_down = false;
    }
}


var lastTime = 0;

// initialize physics engine
var world = new CANNON.World();
world.gravity.set(0, 0, -9.82);

// create a box
var speedLimit = 10;
var boxMtl = new CANNON.Material({
	friction: 0.01,
});
var boxBody = new CANNON.Body({
    mass: 1,
    allowSleep: false,
    position: new CANNON.Vec3(0, 0, 10),
	shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
	material: boxMtl,
});
world.addBody(boxBody);

var boardBody = new CANNON.Body({
	mass: 0,
	allowSleep: false,
	position: new CANNON.Vec3(0, 0, 4),
	shape: new CANNON.Box(new CANNON.Vec3(4, 2, 0.2)),
});
world.addBody(boardBody);

var groundBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Plane(),
    collisionResponse: false,
});
world.addBody(groundBody);

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = (timeNow - lastTime) / 1000.0;

        if (move_left) {
            if (boxBody.velocity.x > -speedLimit) {
                boxBody.applyForce(new CANNON.Vec3(-100.0, 0.0, 0.0), boxBody.position);
            }
        }
        else if (move_right) {
            if (boxBody.velocity.x < speedLimit) {
                boxBody.applyForce(new CANNON.Vec3(100.0, 0.0, 0.0), boxBody.position);
            }
        }
        else {
            boxBody.velocity.x = 0;
        }
        if (move_jump) {
			if (boxBody.position.z < 1.1) {
				boxBody.velocity.z = 10;
			}
			move_jump = false;
		}
		/*
		if (boxBody.position.z <= 0.51 && 0 <= boxBody.velocity.z && boxBody.velocity.z < 0.2) {
			constraint_z = true;
		}
		else {
			constraint_z == false;
		}
		if (move_jump) {
			if (boxBody.position.z < 0.7) {
				boxBody.velocity.z = 10;
			}
			move_jump = false;
			constraint_z = false;
		}
		var posz = boxBody.position.z;
		*/
        var posy = boxBody.position.y;
        world.step(1.0/60, elapsed, 3);
        if (constraint_y) {
            boxBody.position.y = posy;
		}
		/*
        if (constraint_z) {
			boxBody.position.z = posz;
			boxBody.velocity.z = 0;
		}
		*/
    }
    lastTime = timeNow;
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

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    document.addEventListener('keydown',onDocumentKeyDown,false);
    document.addEventListener('keyup',onDocumentKeyUp,false);


    tick();
}
