


var renderer, scene, camera, pointLight, spotLight;

// field variables
var fieldWidth = 400, fieldHeight = 200;

// paddle variables
var paddleWidth, paddleHeight, paddleDepth, paddleQuality;
var paddle1DirY = 0, paddle2DirY = 0, paddleSpeed = 3;

// ball variables
var ball, paddle1, paddle2;
var ballDirX = 1, ballDirY = 1, ballSpeed = 2;
var backPanel, bacMaterial;
var healthBar;

var difficulty = 10;
var shots = [ball];

var context = new (window.AudioContext || window.webkitAudioContext)();
var source = null;
var audioBuffer = null;
var analyser = context.createAnalyser();
analyser.fftSize = 256;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);
var timer = [0, 0, 0, 0];
var visualiser1 = [];
var visualiser2 = [];
var beatDetect1 = [];
var beatDetect2 = [];
var beatDetect3 = [];
var beatDetect4 = [];
var beatAverages = [0, 0, 0, 0];
var beatPeaks = [0, 0, 0, 0];

function setup()
{
	createScene();
	draw();
}
function playSound() {
  // source is global so we can call .noteOff() later.
  source = context.createBufferSource();
  source.buffer = audioBuffer;
  source.loop = false;
  source.connect(analyser);
  analyser.connect(context.destination);
  source.start(1); // Play immediately.
  var buttons = document.querySelectorAll('button');
  buttons[0].disabled = true;
  if(healthBar)
  {
  	healthBar.scale.y = 1;
  	healthBar.material.color.r = 0;
  	healthBar.material.color.g = 1;
  }
  source.onended = function(event) {
	var buttons = document.querySelectorAll('button');
  	buttons[0].disabled = false;
}
}

function stopSound() {
  if (source) {
    source.stop(0);
  }
}

function initSound(arrayBuffer) {
  context.decodeAudioData(arrayBuffer, function(buffer) {
    // audioBuffer is global to reuse the decoded audio later.
    audioBuffer = buffer;
    var buttons = document.querySelectorAll('button');
    buttons[0].disabled = false;

  }, function(e) {
    console.log('Error decoding file', e);
  }); 
  analyser.fftSize = 2048;
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);

}

var fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', function(e) {  
	var reader = new FileReader();
	reader.onload = function(e) {
	  initSound(this.result);
	};
	reader.readAsArrayBuffer(this.files[0]);
}, false);


function createScene()
{
	// set the scene size
	var WIDTH = 800,
	  HEIGHT = 900;

	// set some camera attributes
	var VIEW_ANGLE = 50,
	  ASPECT = WIDTH / HEIGHT,
	  NEAR = 0.1,
	  FAR = 10000;

	var c = document.getElementById("gameCanvas");

	// create a WebGL renderer, camera
	// and a scene
	renderer = new THREE.WebGLRenderer();
	camera =
	  new THREE.PerspectiveCamera(
		VIEW_ANGLE,
		ASPECT,
		NEAR,
		FAR);

	scene = new THREE.Scene();

	// add the camera to the scene
	scene.add(camera);
	
	// set a default position for the camera
	// not doing this somehow messes up shadow rendering
	camera.position.z = 320;
	
	// start the renderer
	renderer.setSize(WIDTH, HEIGHT);

	// attach the render-supplied DOM element
	c.appendChild(renderer.domElement);

	// set up the playing surface plane 
	var planeWidth = fieldWidth,
		planeHeight = fieldHeight,
		planeQuality = 10;
		
	// create the paddle1's material
	var paddle1Material =
	  new THREE.MeshLambertMaterial(
		{
		  color: 0x32CD32
		});
	// create the paddle2's material
	var paddle2Material =
	  new THREE.MeshLambertMaterial(
		{
		  color: 0xFF4045
		});
	// create the plane's material	
	var planeMaterial =
	  new THREE.MeshLambertMaterial(
		{
		  color: 0x111111
		});
	// create the table's material
	var tableMaterial =
	  new THREE.MeshLambertMaterial(
		{
		  color: 0x800000
		});
	// create the pillar's material
	var pillarMaterial =
	  new THREE.MeshLambertMaterial(
		{
		  color: 0x8B0000
		});
	var visMaterial = 
	  new THREE.MeshLambertMaterial(
	  {
	  	color: 0xFF0000,
	  	transparent: true,
	  	opacity: .6
	  });
	var bacMaterial = 
	  new THREE.MeshLambertMaterial(
	  {
	  	color: 0x000000
	  });
	var healthMaterial = new THREE.MeshLambertMaterial(
	{
		color: 0x00FF00
	})
	// create the ground's material
	var groundMaterial =
	  new THREE.MeshLambertMaterial(
		{
		  color: 0x888888
		});
		
		
	// create the playing surface plane
	var plane = new THREE.Mesh(

	  new THREE.PlaneGeometry(
		planeWidth * 0.95,	// 95% of table width, since we want to show where the ball goes out-of-bounds
		planeHeight,
		planeQuality,
		planeQuality),

	  planeMaterial);
	  
	scene.add(plane);
	plane.receiveShadow = true;	
	
	var table = new THREE.Mesh(

	  new THREE.CubeGeometry(
		planeWidth * 1.05,	// this creates the feel of a billiards table, with a lining
		planeHeight * 1.03,
		100,				// an arbitrary depth, the camera can't see much of it anyway
		planeQuality,
		planeQuality,
		1),

	  tableMaterial);
	table.position.z = -51;	// we sink the table into the ground by 50 units. The extra 1 is so the plane can be seen
	scene.add(table);
	table.receiveShadow = true;	
	
	var roof = new THREE.Mesh(
		new THREE.CubeGeometry(
			planeWidth * 1.5,
			planeHeight * 1.4,
			100,
			planeQuality,
			planeQuality,
			1),
		planeMaterial);
	roof.position.z = 170;
	scene.add(roof);
	// // set up the sphere vars
	// lower 'segment' and 'ring' values will increase performance
	var radius = 5,
		segments = 6,
		rings = 6;
		
	// // create the sphere's material
	var sphereMaterial =
	  new THREE.MeshLambertMaterial(
		{
		  color: 0xD43001
		});
		
	// Create a ball with sphere geometry
	ball = new THREE.Mesh(

	  new THREE.SphereGeometry(
		radius,
		segments,
		rings),

	  sphereMaterial);

	// // add the sphere to the scene
	//scene.add(ball);
	
	ball.position.x = fieldWidth/2;
	ball.position.y = 0;
	// set ball above the table surface
	ball.position.z = radius;
	ball.receiveShadow = true;
    ball.castShadow = true;
	
	// // set up the paddle vars
	paddleWidth = 5;
	paddleHeight = 5;
	paddleDepth = 5;
	paddleQuality = 1;
		
	paddle1 = new THREE.Mesh(

	  new THREE.CubeGeometry(
		paddleWidth,
		paddleHeight,
		paddleDepth,
		paddleQuality,
		paddleQuality,
		paddleQuality),

	  paddle1Material);

	// // add the sphere to the scene
	scene.add(paddle1);

	
	paddle2 = new THREE.Mesh(

	  new THREE.CubeGeometry(
		paddleWidth,
		paddleHeight,
		paddleDepth,
		paddleQuality,
		paddleQuality,
		paddleQuality),

	  paddle2Material);
	
	paddle3 = new THREE.Mesh(

	  new THREE.CubeGeometry(
		paddleWidth,
		paddleHeight,
		paddleDepth,
		paddleQuality,
		paddleQuality,
		paddleQuality),

	  paddle2Material);

	paddle4 = new THREE.Mesh(

	  new THREE.CubeGeometry(
		paddleWidth,
		paddleHeight,
		paddleDepth,
		paddleQuality,
		paddleQuality,
		paddleQuality),

	  paddle2Material);

	paddle5 = new THREE.Mesh(

	  new THREE.CubeGeometry(
		paddleWidth,
		paddleHeight,
		paddleDepth,
		paddleQuality,
		paddleQuality,
		paddleQuality),

	  paddle2Material);
	paddle6 = new THREE.Mesh(
		new THREE.CubeGeometry(
			paddleWidth,
			paddleHeight,
			paddleDepth,
			paddleQuality,
			paddleQuality,
			paddleQuality),
		paddle2Material);

	// // add the sphere to the scene
	scene.add(paddle2);
	scene.add(paddle3);
	scene.add(paddle4);
	scene.add(paddle5);
	scene.add(paddle6);
	
	// set paddles on each side of the table
	paddle1.position.x = -fieldWidth/2 -paddleWidth;
	paddle1.position.z = 50;

	paddle2.position.x = fieldWidth/2 - paddleWidth;
	paddle2.position.y = fieldHeight/2 - paddleHeight;
	paddle2.position.z = 115;

	paddle3.position.x = fieldWidth/2 - paddleWidth;
	paddle3.position.y = fieldHeight/2 - paddleHeight;
	paddle3.position.z = paddleDepth;

	paddle4.position.x = fieldWidth/2 - paddleWidth;
	paddle4.position.y = -fieldHeight/2 + paddleHeight;
	paddle4.position.z = paddleDepth;

	paddle5.position.x = fieldWidth/2 - paddleWidth;
	paddle5.position.y = -fieldHeight/2 + paddleHeight;
	paddle5.position.z = 115;
	
	paddle6.position.x = fieldWidth/2 - paddleWidth;
	paddle6.position.y = fieldHeight/2 - paddleHeight;
	paddle6.position.z = 0;	
	
	
	
	paddle2.ydir = 'left';
	paddle2.zdir = 'up';
	paddle3.ydir = 'right';
	paddle3.zdir = 'down';
	paddle4.ydir = 'right';
	paddle4.zdir = 'down';
	paddle5.ydir = 'left';
	paddle5.zdir = 'up';
	paddle6.dir = 'right';

	paddle1.momentum = 0;
		
	// we iterate 10x (5x each side) to create pillars to show off shadows
	// this is for the pillars on the left
	// we iterate 10x (5x each side) to create pillars to show off shadows
	// this is for the pillars on the right
	var backdrop = new THREE.Mesh(

		  new THREE.CubeGeometry( 
		  400, 
		  30, 
		  300, 
		  1, 
		  1,
		  1 ),

		  pillarMaterial);
		  
	backdrop.position.x = -10;
	backdrop.position.y = -118;
	backdrop.position.z = -30;
	backdrop.castShadow = true;
	backdrop.receiveShadow = true;		
	scene.add(backdrop);	

	var backdrop2 = new THREE.Mesh(
		new THREE.CubeGeometry(
			400,
			30,
			300,
			1,
			1,
			1 ),
			pillarMaterial);

	backdrop2.position.x = -10;
	backdrop2.position.y = 118;
	backdrop2.position.z = -30;
	backdrop2.castShadow = true;
	backdrop2.receiveShadow = true;
	scene.add(backdrop2);
	

	for(var i = 0; i < 8; i++)
	{
		visualiser1.push(new THREE.Mesh(
			new THREE.CubeGeometry(
				50,
				5,
				300,
				1,
				1,
				1 ),
				visMaterial));
		visualiser1[visualiser1.length - 1].position.y = 105;
		visualiser1[visualiser1.length - 1].position.x = -185 + i * 50;
		visualiser1[visualiser1.length - 1].position.z = -150;
		scene.add(visualiser1[visualiser1.length - 1]);
	}

	for(var i = 0; i < 8; i++)
	{
		visualiser2.push(new THREE.Mesh(
			new THREE.CubeGeometry(
				50,
				5,
				300,
				1,
				1,
				1 ),
				visMaterial));
		visualiser2[visualiser2.length - 1].position.y = -105;
		visualiser2[visualiser2.length - 1].position.x = -185 + i * 50;
		visualiser2[visualiser2.length - 1].position.z = -150;
		scene.add(visualiser2[visualiser2.length - 1]);
	}
	backPanel = new THREE.Mesh(
		new THREE.CubeGeometry(
			40,
			400,
			500,
			1,
			1,
			1 ),
			bacMaterial);
	scene.add(backPanel);
	backPanel.position.x = fieldHeight + 40;

	// finally we finish by adding a ground plane
	// to show off pretty shadows
	healthBar = new THREE.Mesh(
		new THREE.CubeGeometry(
			22,
			205,
			1,
			1,
			1,
			1 ),
			healthMaterial);
	scene.add(healthBar);
	healthBar.position.x = -fieldHeight;
	var ground = new THREE.Mesh(

	  new THREE.CubeGeometry( 
	  1000, 
	  1000, 
	  3, 
	  1, 
	  1,
	  1 ),

	  groundMaterial);
    // set ground to arbitrary z position to best show off shadowing
	ground.position.z = -132;
	ground.receiveShadow = true;	
	scene.add(ground);		
		
	// // create a point light
	pointLight =
	  new THREE.PointLight(0xF8D898);

	// set its position
	pointLight.position.x = -50;
	pointLight.position.y = 0;
	pointLight.position.z = 50;
	pointLight.intensity = 2.9;
	pointLight.distance = 10000;
	// add to the scene
	scene.add(pointLight);
		
	// add a spot light
	// this is important for casting shadows
    spotLight = new THREE.SpotLight(0xF8D898);
    spotLight.position.set(-200, 0, 460);
    spotLight.intensity = 1.5;
    spotLight.castShadow = true;
    scene.add(spotLight);
	
	// MAGIC SHADOW CREATOR DELUXE EDITION with Lights PackTM DLC
	renderer.shadowMapEnabled = true;		
}

function draw()
{	
	// draw THREE.JS scene
	var temp = document.getElementById('difficulty');
	difficulty = temp.value;
	renderer.render(scene, camera);
	// loop draw function call
	requestAnimationFrame(draw);
	analyser.getByteFrequencyData(dataArray);

	paddlePhysics();
	cameraPhysics();


	var ave1 = 0;
	var ave2 = 0;
	var ave3 = 0;
	var ave4 = 0;
	for(var i = 0; i < bufferLength; i++){
		if(i >= 0 && i < bufferLength/4)
			ave1 += dataArray[i];
		else if(i >= bufferLength/4 && i < bufferLength/2)
			ave2 += dataArray[i];
		else if(i >= bufferLength/2 && i < bufferLength - bufferLength/4)
			ave3 += dataArray[i];
		else
			ave4 += dataArray[i];
	}
	ave1 /= bufferLength/4;
	ave2 /= bufferLength/4;
	ave3 /= bufferLength/4;
	ave4 /= bufferLength/4;
	if(ave1 > beatPeaks[0])
		beatPeaks[0] = ave1;
	if(ave2 > beatPeaks[1])
		beatPeaks[1] = ave2;
	if(ave3 > beatPeaks[2])
		beatPeaks[2] = ave3;
	if(ave4 > beatPeaks[3])
		beatPeaks[3] = ave4;

	if(beatDetect1.length === 40)
	{
		beatDetect1.pop();
		beatDetect1.push(ave1);
		beatDetect2.pop();
		beatDetect2.push(ave2);
		beatDetect3.pop();
		beatDetect3.push(ave3);
		beatDetect4.pop();
		beatDetect4.push(ave4);
	}
	else
	{
		beatDetect1.push(ave1);
		beatDetect2.push(ave2);
		beatDetect3.push(ave3);
		beatDetect4.push(ave4);
	}
	for(var i = 0; i < beatDetect1.length; i++)
	{
		beatAverages[0] += beatDetect1[i];
		beatAverages[1] += beatDetect2[i];
		beatAverages[2] += beatDetect3[i];
		beatAverages[3] += beatDetect4[i];
	}
	beatAverages[0] /= beatDetect1.length;
	beatAverages[1] /= beatDetect2.length;
	beatAverages[2] /= beatDetect3.length;
	beatAverages[3] /= beatDetect4.length;
	var stc = 1;
	if(paddle2.ydir === 'right')
	{
		paddle2.position.y += (ave1 / 60);
	}
	else
	{
		paddle2.position.y -= (ave1 / 60);
	}
	if(paddle2.zdir === 'up')
	{
		paddle2.position.z += (ave3 / 60);
	}
	else
	{
		paddle2.position.z -= (ave3 / 60);
	}
	if(paddle2.position.y >= fieldHeight/2 && paddle2.ydir === 'right')
	{
		paddle2.position.y = fieldHeight/2;
		paddle2.ydir = 'left';
	}
	else if(paddle2.position.y <= -fieldHeight/2 && paddle2.ydir === 'left')
	{
		paddle2.position.y = -fieldHeight/2;
		paddle2.ydir = 'right';
	}
	if(paddle2.position.z >= 115 && paddle2.zdir === 'up')
	{
		paddle2.position.z = 115;
		paddle2.zdir = 'down';
	}
	else if(paddle2.position.z <= 5 && paddle2.zdir === 'down')
	{
		paddle2.position.z = 5;
		paddle2.zdir = 'up';
	}
	if(timer[0] > 0)
	{
		timer[0]--;
	}
	else if(ave1 > (((beatPeaks[0] - beatAverages[0])/2) + beatAverages[0]) * 1.8 && ave1 > 80)
	{
		spawnBallCenter(difficulty, paddle2.position.y, paddle2.position.z);
		timer[0] = stc * 2;
	}
	


	if(paddle3.ydir === 'right')
	{
		paddle3.position.y += (ave1 / 60);
	}
	else
	{
		paddle3.position.y -= (ave1 / 60);
	}
	if(paddle3.zdir === 'up')
	{
		paddle3.position.z += (ave3 / 60);
	}
	else
	{
		paddle3.position.z -= (ave3 / 60);
	}
	if(paddle3.position.y >= fieldHeight/2 && paddle3.ydir === 'right')
	{
		paddle3.position.y = fieldHeight/2;
		paddle3.ydir = 'left';
	}
	else if(paddle3.position.y <= -fieldHeight/2 && paddle3.ydir === 'left')
	{
		paddle3.position.y = -fieldHeight/2;
		paddle3.ydir = 'right';
	}
	if(paddle3.position.z >= 115 && paddle3.zdir === 'up')
	{
		paddle3.position.z = 115;
		paddle3.zdir = 'down';
	}
	else if(paddle3.position.z <= 5 && paddle3.zdir === 'down')
	{
		paddle3.position.z = 5;
		paddle3.zdir = 'up';
	}
	if(timer[0] > 0)
	{
		timer[0]--;
	}
	else if(ave1 > (((beatPeaks[0] - beatAverages[0])/2) + beatAverages[0]) * 1.8 && ave1 > 80)
	{
		spawnBallCenter(difficulty, paddle3.position.y, paddle3.position.z);
		timer[0] = stc * 2;
	}



	if(paddle4.ydir === 'right')
	{
		paddle4.position.y += (ave2 / 60);
	}
	else
	{
		paddle4.position.y -= (ave2 / 60);
	}
	if(paddle4.zdir === 'up')
	{
		paddle4.position.z += (ave4 / 60);
	}
	else
	{
		paddle4.position.z -= (ave4 / 60);
	}
	if(paddle4.position.y >= fieldHeight/2 && paddle4.ydir === 'right')
	{
		paddle4.position.y = fieldHeight/2;
		paddle4.ydir = 'left';

	}
	else if(paddle4.position.y <= -fieldHeight/2 && paddle4.ydir === 'left')
	{
		paddle4.position.y = -fieldHeight/2;
		paddle4.ydir = 'right';
	}
	if(paddle4.position.z >= 115 && paddle4.zdir === 'up')
	{
		paddle4.position.z = 115;
		paddle4.zdir = 'down';
	}
	else if(paddle4.position.z <= 5 && paddle4.zdir === 'down')
	{
		paddle4.position.z = 5;
		paddle4.zdir = 'up';
	}
	if(timer[1] > 0)
	{
		timer[1]--;
	}
	else if(ave2 > (((beatPeaks[1] - beatAverages[1])/2)+ beatAverages[1]) * 1.8 && ave2 > 80)
	{
		spawnBallCenter(difficulty, paddle4.position.y, paddle4.position.z);
		timer[1] = stc* 2;
	}




	if(paddle5.position.y >= fieldHeight/2 && paddle5.ydir === 'right')
	{
		paddle5.position.y = fieldHeight/2;
		paddle5.ydir = 'left';
	}
	else if(paddle5.position.y <= -fieldHeight/2 && paddle5.ydir === 'left')
	{
		paddle5.position.y = -fieldHeight/2;
		paddle5.ydir = 'right';
	}
	if(paddle5.position.z >= 115 && paddle5.zdir === 'up')
	{
		paddle5.position.z = 115;
		paddle5.zdir = 'down';
	}
	else if(paddle5.position.z <= 5 && paddle5.zdir === 'down')
	{
		paddle5.position.z = 5;
		paddle5.zdir = 'up';
	}
	if(paddle5.ydir === 'right')
	{
		paddle5.position.y += (ave2 / 60);
	}
	else
	{
		paddle5.position.y -= (ave2 / 60);
	}
	if(paddle5.zdir === 'up')
	{
		paddle5.position.z += (ave4 / 60);
	}
	else
	{
		paddle5.position.z -= (ave4 / 60);
	}
	if(timer[1] > 0)
	{
		timer[1]--;
	}
	else if(ave2 > (((beatPeaks[1] - beatAverages[1])/2)+ beatAverages[1]) * 1.8 && ave2 > 80)
	{
		spawnBallCenter(difficulty, paddle5.position.y, paddle5.position.z);
		timer[1] = stc * 2;
	}
	beatPeaks[0] -= .5;
	beatPeaks[1] -= .5;
	beatPeaks[2] -= .5;
	beatPeaks[3] -= .5;
	for(var i = 0; i < 8; i++)
	{
		visualiser1[i].position.z = -150 + dataArray[i * 16]/3;
	}
	for(var i = 0; i < 8; i++)
	{
		visualiser2[i].position.z = -150 + dataArray[i * 16]/3;
	}


	if(paddle6.dir === 'right')
	{
		paddle6.position.y += 50;
		if(paddle6.position.y >= fieldHeight/2)
		{
			paddle6.position.y = fieldHeight/2;
			paddle6.dir = 'up';
		}
	}
	else if(paddle6.dir === 'up')
	{
		paddle6.position.z += 50;
		if(paddle6.position.z >= 120)
		{
			paddle6.position.z = 120;
			paddle6.dir = 'left';
		}
	}
	else if(paddle6.dir === 'left')
	{
		paddle6.position.y -= 50;
		if(paddle6.position.y <= -fieldHeight/2)
		{
			paddle6.position.y = -fieldHeight/2;
			paddle6.dir = 'down';
		}
	}
	else if(paddle6.dir === 'down')
	{
		paddle6.position.z -= 50;
		if(paddle6.position.z <= 0)
		{
			paddle6.position.z = 0;
			paddle6.dir = 'right';
		}
	}
	spawnBallWall(difficulty, paddle6.position.y, paddle6.position.z);
	/*if(timer < 2)
	{
		timer++;
	}
	else
	{
		for(var i = 0; i < bufferLength; i++){
			if(i === 0)
			{
				if(dataArray[i]/2 > 75)
				{
					//spawnBallRight(dataArray[i]/2);
				}
			}
			else if(i === 49)
			{
				if(dataArray[i]/2 > 75)
				{
					spawnBallCenter(dataArray[i]/2);
				}
			}
			else if(i === 99)
			{
				if(dataArray[i]/2 > 75)
				{
					//spawnBallLeft(dataArray[i]/2);
				}
			}
			else
			{
				//idk, cry I guess
			}
		}
		timer = 0;
	}*/
	
	
	for(i = 0; i < shots.length; i++)
	{
		moveShot(shots[i]);
	}
	poppable(shots[0]);
	poppable(shots[0]);
	poppable(shots[0]);
	poppable(shots[0]);
	playerPaddleMovement();

}

function poppable(shot)
{
	if(shot)
	{
		if (shot.mesh.position.x <= -fieldHeight/2 - 140)
		{
			shots.shift();
			scene.remove(shot.mesh);
			shot.mesh.geometry.dispose();
			shot.mesh.material.dispose();
			shot.mesh = undefined;
			shot.xspd = undefined;
			shot.yspd = undefined;
			shot.path = undefined;
			shot = undefined;
		}
	}
	else
	{
		shots.shift();
	}
}

function moveShot(shot)
{
	if(shot){
		shot.mesh.position.x += shot.xspd;
		shot.mesh.position.y += shot.yspd;
		if(shot.path === 'center')
		{
			if (shot.mesh.position.y <= -fieldHeight/2)
			{
				shot.yspd *= -1;
			}	
			// if ball goes off the bottom side (side of table)
			if (shot.mesh.position.y >= fieldHeight/2)
			{
				shot.yspd *= -1;
			}
		}
		if(shot.path === 'left')
		{
			if(shot.mesh.zdir === 'up')
			{
				shot.mesh.position.z += (40 - shot.mesh.position.z) * .1;
				if(shot.mesh.position.z >= 38)
				{
					shot.mesh.zdir = 'down';
				}
			}
			else
			{
				shot.mesh.position.z -= (shot.mesh.position.z - 5) * .1;
				if(shot.mesh.position.z <= 6)
				{
					shot.mesh.zdir = 'up';
				}
			}
			if (shot.mesh.position.y <= -fieldHeight/2)
			{
				shot.yspd *= -1;
			}	
			// if ball goes off the bottom side (side of table)
			if (shot.mesh.position.y >= fieldHeight/2)
			{
				shot.yspd *= -1;
			}
		}
		if(shot.path === 'center'){
			if (paddle1.position.x <= shot.mesh.position.x + 5
			&& paddle1.position.x >= shot.mesh.position.x - 5)
			{
				if (paddle1.position.y <= shot.mesh.position.y + 5
				&& paddle1.position.y >= shot.mesh.position.y - 5)
				{
					if(paddle1.position.z <= shot.mesh.position.z + 5
					&& paddle1.position.z >= shot.mesh.position.z - 5)
					{
						if(healthBar.scale.y > 0)
						{
							healthBar.scale.y -= .1;
							healthBar.material.color.g = healthBar.material.color.g - .1;
							healthBar.material.color.r = healthBar.material.color.r + .1;
						}
						if(healthBar.scale.y < .1)
						{
							stopSound();
						}
					}

				}
			}
		}
		else
		{
			if (paddle1.position.x <= shot.mesh.position.x + 15
			&& paddle1.position.x >= shot.mesh.position.x - 15)
			{
				if (paddle1.position.y <= shot.mesh.position.y + 5
				&& paddle1.position.y >= shot.mesh.position.y - 5)
				{
					if(paddle1.position.z <= shot.mesh.position.z + 25
					&& paddle1.position.z >= shot.mesh.position.z - 25)
					{
						if(healthBar.scale.y > 0)
						{
							healthBar.scale.y -= .1;
							healthBar.material.color.g = healthBar.material.color.g - .1;
							healthBar.material.color.r = healthBar.material.color.r + .1;
						}
						if(healthBar.scale.y < .1)
						{
							stopSound();
						}
					}

				}
			}
		}
	}

}

function spawnBallCenter(speed, ypos, zpos)
{
		var rand = Math.random();
		rand = rand - .5;
		shot = { mesh:new THREE.Mesh(

	  	new THREE.CubeGeometry(
		10,
		10,
		10,
		1,
		1,
		1),
	  	
	  	new THREE.MeshLambertMaterial(
		{
		  color: 0xD43001
		})), xspd: -difficulty, yspd: 0, path: 'center'}

		// // add the sphere to the scene
		shots.push(shot);
		scene.add(shot.mesh);
		
		shot.mesh.position.x = fieldWidth/2;
		shot.mesh.position.y = ypos;
		// set ball above the table surface
		shot.mesh.position.z = zpos;
		//shot.mesh.receiveShadow = true;
	    //shot.mesh.castShadow = true;
}
function spawnBallWall(speed, ypos, zpos)
{
	var rand = Math.random();
	shot = { mesh:new THREE.Mesh(

	  	new THREE.CubeGeometry(
		30,
		10,
		50,
		1,
		1,
		1),
	  	
	  	new THREE.MeshLambertMaterial(
		{
		  color: 0xD43001
		})), xspd: -difficulty, yspd: 0, path: 'wall'}
		shots.push(shot);
		scene.add(shot.mesh);
		
		shot.mesh.position.x = fieldWidth/2;
		shot.mesh.position.y = ypos;
		// set ball above the table surface
		shot.mesh.position.z = zpos;
}



// Handles player's paddle movement
function playerPaddleMovement()
{
	// move left
	if (Key.isDown(Key.A))		
	{
		// if paddle is not touching the side of table
		// we move
		if (paddle1.position.y >= fieldHeight /2 - 5)
		{
		}
		// else we don't move and stretch the paddle
		// to indicate we can't move
		else
		{
			paddle1.position.y += paddleSpeed;
			if(paddle1.rotation.z < .5)
				paddle1.rotation.z += .1;
		}
	}
	// move right
	if (Key.isDown(Key.D))
	{
		if (paddle1.position.y <= -fieldHeight/2 + 5)
		{
			
		}
		else
		{
			paddle1.position.y -= paddleSpeed;
			if(paddle1.rotation.z > -.5)
				paddle1.rotation.z += -.1;
		}
	}
	if (Key.isDown(Key.S))
	{
		if(paddle1.position.z <= 5)
		{
		}
		else
		{
			paddle1.position.z -= paddleSpeed;
			if(paddle1.rotation.y < .5)
				paddle1.rotation.y += .1;
		}
	}
	if (Key.isDown(Key.W))
	{	
		if(paddle1.position.z >= 100)
		{

		}
		else
		{
			paddle1.position.z += paddleSpeed;
			if(paddle1.rotation.y > -.5)
				paddle1.rotation.y -= .1;
		}
	}
	if(!Key.isDown(Key.A)){
		if(!Key.isDown(Key.D)){
			if(!Key.isDown(Key.S)){
				if(!Key.isDown(Key.W))
				{
					paddle1.rotation.z = 0;
					paddle1.rotation.y = 0;
					
				}
			}
		}
	}

}

// Handles camera and lighting logic
function cameraPhysics()
{
	// we can easily notice shadows if we dynamically move lights during the game
	//spotLight.position.x = ball.position.x * 2;
	//spotLight.position.y = ball.position.y * 2;
	
	// move to behind the player's paddle
	camera.position.x = paddle1.position.x - 100;
	camera.position.y = paddle1.position.y;// * 0.05;
	camera.position.z = paddle1.position.z + 15;// + 0.04 * (paddle1.position.x);
	//camera.position.z = 5 + 100 + .04 * (paddle1.position.x);
	
	// rotate to face towards the opponent
	//camera.rotation.x = -0.01 * (ball.position.y) * Math.PI/180;
	camera.rotation.y = -90 * Math.PI/180;
	camera.rotation.z = -90 * Math.PI/180;
}

// Handles paddle collision logic
function paddlePhysics()
{

	
	
}



