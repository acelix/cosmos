'use strict';

var _ = require('lodash');
var $ = require('jquery');
var THREE = require('three');
var Stats = require('./lib/Stats.js');

var stars = require('./stars.js');
var lspm = require('./lspm.js');
var constll = require('./constellations.js');
var labels = require('./labels.js');

var universeScale = 100;
var universe = require('./universe-sphere.js').init(universeScale);

var clock = new THREE.Clock();

var startPosition = new THREE.Vector3(0, 0, 0);

var steering = false;
var steerXY = {
	x: 0,
	y: 0
};


THREE.VRControls = require('./lib/vrControls.js');
THREE.VREffect = require('./lib/vrEffects.js');
var WEBVR = require('./lib/webvr.js');

window.scene = null;
window.stats = null;
window.renderer = null;
window.camera = null;
window.steeringCube = null;
window.container = document.getElementById('container');
window.controls = null;
window.effect = null;
window.coords = document.getElementById('coords');

var ww = window.innerWidth;
var wh = window.innerHeight;
var cw = ww / 2.0;
var ch = wh / 2.0;
var mouse = {
	x: cw,
	y: ch
};

container.onmousedown = function(e) {
	steering = true;
	mouse.x = e.clientX - cw;
	mouse.y = e.clientY - ch;
};
container.onmouseup   = function(e) {
	steering = false;
	mouse.x = e.clientX - cw;
	mouse.y = e.clientY - ch;
};
container.onmousemove = function(e) {
	if (steering) {
		mouse.x = e.clientX - cw;
		mouse.y = e.clientY - ch;
	}
};
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	effect.setSize( window.innerWidth, window.innerHeight );
}

var init = function() {
	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(ww, wh);
	//renderer.setClearColor(0x000000, 1.0);
	container.appendChild(renderer.domElement);

	// Lights!
	var light = new THREE.PointLight('#FFFFFF', 1.5);
	light.position.set(0, 0, 0.3);
	scene.add(light);
	var ambient = new THREE.AmbientLight('#292725');
	scene.add(ambient);
	scene.add(universe);

	if ( WEBVR.isAvailable() === false ){
		var cubeGeom = new THREE.BoxGeometry(0.001, 0.001, 0.001);
		var cubeMaterial = new THREE.MeshBasicMaterial({
			color: '#4488BB',
			transparent: false,
			opacity: 0.7});
		steeringCube = new THREE.Mesh(cubeGeom, cubeMaterial);
		steeringCube.position.set(startPosition.x, startPosition.y, startPosition.z);
		scene.add(steeringCube);
	}

	// this stops the jitter
	camera = new THREE.PerspectiveCamera(55, ww / wh, 0.1, 100000000);
	camera.position.set(-0.2, 0, 0);
	if (steeringCube != null ){
		camera.lookAt(steeringCube.position);
		steeringCube.add(camera);
	} else {
		scene.add(camera);
	}

	// STAR DATA
	stars.init(scene, universeScale);
	lspm.init(scene, universeScale);
	constll.init(scene, universeScale);

	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild(stats.domElement);

	controls = new THREE.VRControls(camera);
	effect = new THREE.VREffect(renderer);

	WEBVR.getVRDisplay( function ( display ) {
					document.body.appendChild( WEBVR.getButton( display, renderer.domElement ) );
	} );
	window.addEventListener( 'resize', onWindowResize, false );
};

function animate() {
	effect.requestAnimationFrame( animate );
	render();
}

var render = function(fl) {
	//requestAnimationFrame(render);

	// set camera - no longer needed because camera is attached to steering cube
	//	var relativeCameraOffset = new THREE.Vector3(-0.2, 0, 0);
	//	var cameraOffset = relativeCameraOffset.applyMatrix4(steeringCube.matrixWorld);
	//camera.position.x = cameraOffset.x;
	//camera.position.y = cameraOffset.y;
	//camera.position.z = cameraOffset.z;
	//camera.lookAt(steeringCube.position);
	//camera.rotation.x = steeringCube.rotation.x;
	//camera.rotation.y = steeringCube.rotation.y;
	//camera.rotation.z = steeringCube.rotation.z;

	// forward
	if(steeringCube != null){
		steeringCube.translateX(1);

		// steering inertia
		if (steering) {
			steerXY.x -= .05 * (steerXY.x - mouse.x);
			steerXY.y -= .05 * (steerXY.y - mouse.y);
		} else {
			steerXY.x = steerXY.x * .95;
			steerXY.y = steerXY.y * .95;
		}
		// steering
		steeringCube.rotateY(0.00005 * -steerXY.x);
		steeringCube.rotateZ(0.00005 * -steerXY.y);

		// speedometer
		var scp = steeringCube.position;
		var scr = steeringCube.rotation;
		var xyz_str = "x:" + scp.x.toFixed(3) + ", y:" + scp.y.toFixed(3) + ", z:" + scp.z.toFixed(3);
		var rot_str = "rx:" + scr.x.toFixed(3) + ", ry:" + scr.y.toFixed(3);
		coords.innerHTML = xyz_str + " &nbsp; | &nbsp; " + rot_str;
		camera.updateProjectionMatrix();
		labels.updateLabels(camera, []);
		renderer.render(scene, camera);
	} else {
		camera.updateProjectionMatrix();
		labels.updateLabels(camera, []);
		controls.update();
		effect.render( scene, camera );
	}
	stats.update();
};

if ( WEBVR.isAvailable() === false ) {
	document.body.appendChild( WEBVR.getMessage() );
}
init();
console.log("rendering");
animate();
