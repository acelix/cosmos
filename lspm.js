var THREE = require('three');

var LSPM = {
	init: function(scene, scaleFactor) {
		var particles, geometry, materials = [], parameters, i, color, size;

		geometry = new THREE.BufferGeometry();

		// Opera 8.0+, Firefox, Chrome, Safari
		var http_request = new XMLHttpRequest();
		http_request.onreadystatechange = function() {
			if (http_request.readyState === 4) {
				// Javascript function JSON.parse to parse JSON data
				var stars = JSON.parse(http_request.responseText);

				var positions = new Float32Array( stars.length * 3 );
				var colors = new Float32Array( stars.length * 3 );
				var lums = new Float32Array( stars.length );

				stars.forEach(function(star) {
					positions[ i*3 + 0 ] = star.pos[0] * scaleFactor;
					positions[ i*3 + 1 ] = star.pos[1] * scaleFactor;
					positions[ i*3 + 2 ] = star.pos[2] * scaleFactor;

					colors[ i*3 + 0 ] = star.color[0]/255;
					colors[ i*3 + 1 ] = star.color[1]/255;
					colors[ i*3 + 2 ] = star.color[2]/255;

					lums[i] = Math.pow(star.luminosity, 0.25);
				});

				geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
				geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
				geometry.addAttribute( 'luminosity', new THREE.BufferAttribute( lums, 1 ) );

				var sMaterial = new THREE.ShaderMaterial( {
					uniforms: {
						cutoff: { type: 'f', value: 0.25}
					},
					vertexShader:   document.getElementById('vertexshader').textContent,
					fragmentShader: document.getElementById('fragmentshader').textContent,
					side: THREE.DoubleSide,
					blending: THREE.AdditiveBlending,
					transparent: true,
					depthTest: true
				});

				particles = new THREE.Points(geometry, sMaterial);
				scene.add(particles);

				console.log("LSPM Born");
			}
		};
		http_request.open("GET", "data/lspm.json", true);
		http_request.send();
	}

};

module.exports = LSPM;
