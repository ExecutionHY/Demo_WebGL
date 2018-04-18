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
//world.addBody(groundBody);

var angle = 0.0;
function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = (timeNow - lastTime) / 1000.0;
        angle += elapsed*30;

        if (move_left) {
            boxBody.position.x += -speedLimit * elapsed;
        }
        else if (move_right) {
            boxBody.position.x += speedLimit * elapsed;
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
        
        if (boxBody.position.z < -40) {
            boxBody.position = new CANNON.Vec3(0, 0, 40);
        }

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


