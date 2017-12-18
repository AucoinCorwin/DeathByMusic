

//Load all the global stuff
var renderer, scene, camera, pointLight, spotLight;
var fieldWidth = 500, fieldHeight = 300, fieldDepth = 180;
var moverWidth, moverHeight, moverDepth;
var moverSpeed = 3;
var player, turret1;
var backPanel, bacMaterial;
var healthBar;
var difficulty = 10;
var shots = [];
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
var prevAve1 = 0;
var prevAve2 = 0;
var prevAve3 = 0;
var prevAve4 = 0;
var beatAverages = [0, 0, 0, 0];
var beatPeaks = [0, 0, 0, 0];
var fileInput = document.querySelector('input[type="file"]');


//So that stuff gets called
function setup(){	

	createScene();
	draw();
}

//To start playing the sound and start running the buffer through our analyser
function playSound(){

  source = context.createBufferSource();
  source.buffer = audioBuffer;
  source.loop = false;
  source.connect(analyser);
  analyser.connect(context.destination);
  source.start(1); 
  var buttons = document.querySelectorAll('button');
  buttons[0].disabled = true;
  if(healthBar) {

  	healthBar.scale.y = 1;
  	healthBar.material.color.r = 0;
  	healthBar.material.color.g = 1;
  	player.position.y = 0;
	player.position.z = fieldDepth / 2;
  }
  source.onended = function(event) {

	var buttons = document.querySelectorAll('button');
  	buttons[0].disabled = false;
	}
}

//Stop the sound when we lose
function stopSound() {

  if (source) {
    source.stop(0);
  }
}

//We take the sounds and pull the raw bytes out of it for us to run the Web Audio Api thing
function initSound(arrayBuffer) {

  context.decodeAudioData(arrayBuffer, function(buffer) {
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



//Whenever the player selects the file to use we pull the source and initSound
//I tried to set up some default files for people to use, but it's nearly impossible to get the data I need without using the <input> tag
//And for security reasons I can't run any files through it unless the user manually selects them
//So for now it's  user-submitted audio files 
fileInput.addEventListener('change', function(e) {

	var test = document.getElementById("defaultSong");
	var reader = new FileReader();
	reader.onload = function(e) {

	  initSound(this.result);
	};
	reader.readAsArrayBuffer(this.files[0]);
}, false);


function createScene() {
	//Create variables for all the materials and meshes I need
	var WIDTH = 800,
	  HEIGHT = 800;

	var c = document.getElementById("gameCanvas");

	renderer = new THREE.WebGLRenderer();
	camera = new THREE.PerspectiveCamera(
		50,
		WIDTH / HEIGHT,
		.1,
		10000);

	scene = new THREE.Scene();

	scene.add(camera);

	camera.position.z = 320;
	
	renderer.setSize(WIDTH, HEIGHT);

	c.appendChild(renderer.domElement);


	var planeWidth = fieldWidth,
		planeHeight = fieldHeight;
		

	var playerMaterial = new THREE.MeshLambertMaterial({

		  color: 0x32CD32
		});

	var turret1Material = new THREE.MeshLambertMaterial({

		  color: 0xFF4045
		});

	var floorMaterial = new THREE.MeshLambertMaterial({

		  color: 0x111111
		});

	var pillarMaterial = new THREE.MeshLambertMaterial({

		  color: 0x8B0000
		});

	var visMaterial = new THREE.MeshLambertMaterial( {

	  	color: 0xFF0000,
	  	transparent: true,
	  	opacity: .6
	  });

	var bacMaterial = new THREE.MeshLambertMaterial({

	  	color: 0x000000
	  });

	var healthMaterial = new THREE.MeshLambertMaterial({

		color: 0x00FF00
	})

	var groundMaterial = new THREE.MeshLambertMaterial({

		  color: 0x888888
		});
		
		


	
	var floor = new THREE.Mesh(

	  new THREE.CubeGeometry(
		planeWidth + 100,	
		planeHeight + 1000,
		100,				
		10,
		10,
		1),

	  floorMaterial);
	floor.position.z = -50;	
	scene.add(floor);
	floor.receiveShadow = true;	
	
	var roof = new THREE.Mesh(
		new THREE.CubeGeometry(
			planeWidth + 100,
			planeHeight + 1000,
			100,
			10,
			10,
			1),
		floorMaterial);
	roof.position.z = fieldDepth + 50;
	scene.add(roof);
		
	
	moverWidth = 5;
	moverHeight = 5;
	moverDepth = 5;

		
	player = new THREE.Mesh(

	  new THREE.CubeGeometry(
		moverWidth,
		moverHeight,
		moverDepth,
		1,
		1,
		1),

	  playerMaterial);

	scene.add(player);

	
	turret1 = new THREE.Mesh(

	  new THREE.CubeGeometry(
		moverWidth,
		moverHeight,
		moverDepth,
		1,
		1,
		1),

	  turret1Material);
	
	turret2 = new THREE.Mesh(

	  new THREE.CubeGeometry(
		moverWidth,
		moverHeight,
		moverDepth,
		1,
		1,
		1),

	  turret1Material);

	turret3 = new THREE.Mesh(

	  new THREE.CubeGeometry(
		moverWidth,
		moverHeight,
		moverDepth,
		1,
		1,
		1),

	  turret1Material);

	turret4 = new THREE.Mesh(

	  new THREE.CubeGeometry(
		moverWidth,
		moverHeight,
		moverDepth,
		1,
		1,
		1),

	  turret1Material);
	turret5 = new THREE.Mesh(
		new THREE.CubeGeometry(
			moverWidth,
			moverHeight,
			moverDepth,
			1,
			1,
			1),
		turret1Material);

	scene.add(turret1);
	scene.add(turret2);
	scene.add(turret3);
	scene.add(turret4);
	scene.add(turret5);
	

	player.position.x = -fieldWidth/2 -moverWidth;
	player.position.y = 0;
	player.position.z = fieldDepth / 2;

	turret1.position.x = fieldWidth/2 - moverWidth;
	turret1.position.y = fieldHeight/2 - moverHeight;
	turret1.position.z = fieldDepth - 5;

	turret2.position.x = fieldWidth/2 - moverWidth;
	turret2.position.y = fieldHeight/2 - moverHeight;
	turret2.position.z = moverDepth;

	turret3.position.x = fieldWidth/2 - moverWidth;
	turret3.position.y = -fieldHeight/2 + moverHeight;
	turret3.position.z = moverDepth;

	turret4.position.x = fieldWidth/2 - moverWidth;
	turret4.position.y = -fieldHeight/2 + moverHeight;
	turret4.position.z = fieldDepth - 5;
	
	turret5.position.x = fieldWidth/2 - moverWidth;
	turret5.position.y = fieldHeight/2 - moverHeight;
	turret5.position.z = 0;	
	
	
	
	turret1.ydir = 'left';
	turret1.zdir = 'up';
	turret2.ydir = 'right';
	turret2.zdir = 'down';
	turret3.ydir = 'right';
	turret3.zdir = 'down';
	turret4.ydir = 'left';
	turret4.zdir = 'up';
	turret5.dir = 'right';

	player.momentum = 0;
		
	var backdrop = new THREE.Mesh(

		  new THREE.CubeGeometry( 
		  fieldWidth + 100, 
		  30, 
		  fieldDepth, 
		  1, 
		  1,
		  1 ),

		  pillarMaterial);
		  
	backdrop.position.x = -10;
	backdrop.position.y = -fieldHeight / 2 - 15;
	backdrop.position.z = fieldDepth / 2;
	backdrop.castShadow = true;
	backdrop.receiveShadow = true;		
	scene.add(backdrop);	

	var backdrop2 = new THREE.Mesh(
		new THREE.CubeGeometry(
			fieldWidth + 100,
			30,
			fieldDepth,
			1,
			1,
			1 ),
			pillarMaterial);

	backdrop2.position.x = -10;
	backdrop2.position.y = fieldHeight / 2 + 15;
	backdrop2.position.z = fieldDepth / 2;
	backdrop2.castShadow = true;
	backdrop2.receiveShadow = true;
	scene.add(backdrop2);
	

	for(var i = 0; i < 8; i++){

		visualiser1.push(new THREE.Mesh(
			new THREE.CubeGeometry(
				50,
				5,
				300,
				1,
				1,
				1 ),
				visMaterial));
		visualiser1[visualiser1.length - 1].position.y = fieldHeight /2;
		visualiser1[visualiser1.length - 1].position.x = -185 + i * 50;
		visualiser1[visualiser1.length - 1].position.z = -150;
		scene.add(visualiser1[visualiser1.length - 1]);
	}

	for(var i = 0; i < 8; i++){

		visualiser2.push(new THREE.Mesh(
			new THREE.CubeGeometry(
				50,
				5,
				300,
				1,
				1,
				1 ),
				visMaterial));
		visualiser2[visualiser2.length - 1].position.y = -fieldHeight /2;
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

	healthBar = new THREE.Mesh(
		new THREE.CubeGeometry(
			5,
			fieldHeight,
			20,
			1,
			1,
			1 ),
			healthMaterial);
	scene.add(healthBar);
	healthBar.position.x = fieldWidth / 2;
	healthBar.position.y = 0;
	healthBar.position.z = fieldDepth / 2;
	var ground = new THREE.Mesh(

	  new THREE.CubeGeometry( 
	  1000, 
	  1000, 
	  3, 
	  1, 
	  1,
	  1 ),

	  groundMaterial);
	ground.position.z = -132;
	ground.receiveShadow = true;	
	scene.add(ground);		
		
	pointLight =
	  new THREE.PointLight(0xFFFFFF);

	pointLight.position.x = 0;
	pointLight.position.y = 0;
	pointLight.position.z = 50;
	pointLight.intensity = 3;
	pointLight.distance = 10000;
	scene.add(pointLight);
		

    spotLight = new THREE.SpotLight(0xFF0000);
    spotLight.position.set(-200, 0, 460);
    spotLight.intensity = 1.5;
    spotLight.castShadow = true;
    scene.add(spotLight);
	
	renderer.shadowMapEnabled = true;		
}

//Main draw function
function draw(){	

	//Set the speed of projectiles to the value from the form
	var temp = document.getElementById('difficulty');
	difficulty = temp.value;
	if(difficulty < 5)
	{
		difficulty = 5;
	}
	else if(difficulty > 10)
	{
		difficulty = 10;
	}
	//Stuff you need to do as general upkeep
	renderer.render(scene, camera);
	requestAnimationFrame(draw);
	analyser.getByteFrequencyData(dataArray);
	cameraTracking();

	//For storing the values I pull from the frequency data
	var ave1 = 0;
	var ave2 = 0;
	var ave3 = 0;
	var ave4 = 0;



	//To reset the spotlight after a collision
	if(spotLight.intensity > 1.5 && healthBar.scale.y > .1){

		spotLight.intensity -= .4;
	}
	if(spotLight.intensity < 1.5){

		spotLight.intensity = 1.5;
	}

	//Add up and average the frequency data for the four quadrants
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


	//Check for peaks for proper beat-detection
	if(ave1 > beatPeaks[0])
		beatPeaks[0] = ave1;
	if(ave2 > beatPeaks[1])
		beatPeaks[1] = ave2;
	if(ave3 > beatPeaks[2])
		beatPeaks[2] = ave3;
	if(ave4 > beatPeaks[3])
		beatPeaks[3] = ave4;

	//We only store the most recent data for purposes of beat detection, so if we're at the length, cycle the oldest one out
	if(beatDetect1.length === 40){

		beatDetect1.pop();
		beatDetect1.push(ave1);
		beatDetect2.pop();
		beatDetect2.push(ave2);
		beatDetect3.pop();
		beatDetect3.push(ave3);
		beatDetect4.pop();
		beatDetect4.push(ave4);
	}
	else{

		beatDetect1.push(ave1);
		beatDetect2.push(ave2);
		beatDetect3.push(ave3);
		beatDetect4.push(ave4);
	}


	//We now collect the averages of the past 40 averages to set a baseline for beat detection
	for(var i = 0; i < beatDetect1.length; i++){

		beatAverages[0] += beatDetect1[i];
		beatAverages[1] += beatDetect2[i];
		beatAverages[2] += beatDetect3[i];
		beatAverages[3] += beatDetect4[i];
	}
	beatAverages[0] /= beatDetect1.length;
	beatAverages[1] /= beatDetect2.length;
	beatAverages[2] /= beatDetect3.length;
	beatAverages[3] /= beatDetect4.length;




	//Used to control forced time between shots, every frame is just a little too much, so I use this to alternate
	var stc = 1;
	var musicMod = 40 + ((10 - difficulty) * 6);
	//Moving, checking position, and checking if it needs to fire for all four turrets
	if(turret1.ydir === 'right'){

		turret1.position.y += (ave1 / musicMod);
	}
	else{

		turret1.position.y -= (ave1 / musicMod);
	}
	if(turret1.zdir === 'up'){

		turret1.position.z += (ave3 / musicMod);
	}
	else{

		turret1.position.z -= (ave3 / musicMod);
	}
	if(turret1.position.y >= fieldHeight/2 && turret1.ydir === 'right'){

		turret1.position.y = fieldHeight/2;
		turret1.ydir = 'left';
	}
	else if(turret1.position.y <= -fieldHeight/2 && turret1.ydir === 'left'){

		turret1.position.y = -fieldHeight/2;
		turret1.ydir = 'right';
	}
	if(turret1.position.z >= fieldDepth - 5 && turret1.zdir === 'up'){

		turret1.position.z = fieldDepth - 5;
		turret1.zdir = 'down';
	}
	else if(turret1.position.z <= 5 && turret1.zdir === 'down'){

		turret1.position.z = 5;
		turret1.zdir = 'up';
	}
	if(timer[3] > 0){

		timer[3]--;
	}
	//So we take the peak, and the average, and then get .8 of the difference, and add it onto the average. If the current frequency value surpasses that, and is above a minimum threshold, we spawn a shot
	else if(ave1 > (((beatPeaks[0] - beatAverages[0])/2) + beatAverages[0]) * 1.8 && ave1 > 80){

		
		spawnBallCenter(difficulty, turret1.position.y, turret1.position.z);
		if(ave1 > prevAve1 + 3)
		{
			spawnBallHor(difficulty, turret1.position.y, turret1.position.z);

		}

		timer[3] = stc;
	}
	


	if(turret2.ydir === 'right'){

		turret2.position.y += (ave1 / musicMod);
	}
	else{

		turret2.position.y -= (ave1 / musicMod);
	}
	if(turret2.zdir === 'up'){

		turret2.position.z += (ave3 / musicMod);
	}
	else{

		turret2.position.z -= (ave3 / musicMod);
	}
	if(turret2.position.y >= fieldHeight/2 && turret2.ydir === 'right'){

		turret2.position.y = fieldHeight/2;
		turret2.ydir = 'left';
	}
	else if(turret2.position.y <= -fieldHeight/2 && turret2.ydir === 'left'){

		turret2.position.y = -fieldHeight/2;
		turret2.ydir = 'right';
	}
	if(turret2.position.z >= fieldDepth - 5 && turret2.zdir === 'up'){

		turret2.position.z = fieldDepth - 5;
		turret2.zdir = 'down';
	}
	else if(turret2.position.z <= 5 && turret2.zdir === 'down'){

		turret2.position.z = 5;
		turret2.zdir = 'up';
	}
	if(timer[2] > 0){

		timer[2]--;
	}
	else if(ave1 > (((beatPeaks[0] - beatAverages[0])/2) + beatAverages[0]) * 1.8 && ave1 > 80){

		spawnBallCenter(difficulty, turret2.position.y, turret2.position.z);
		if(ave3 > prevAve3 * 1.05)
		{
			//spawnBallVert(difficulty, turret2.position.y, turret2.position.z);

		}
		timer[2] = stc;
	}



	if(turret3.ydir === 'right'){

		turret3.position.y += (ave2 / musicMod);
	}
	else{

		turret3.position.y -= (ave2 / musicMod);
	}
	if(turret3.zdir === 'up'){

		turret3.position.z += (ave4 / musicMod);
	}
	else{

		turret3.position.z -= (ave4 / musicMod);
	}
	if(turret3.position.y >= fieldHeight/2 && turret3.ydir === 'right'){

		turret3.position.y = fieldHeight/2;
		turret3.ydir = 'left';

	}
	else if(turret3.position.y <= -fieldHeight/2 && turret3.ydir === 'left'){

		turret3.position.y = -fieldHeight/2;
		turret3.ydir = 'right';
	}
	if(turret3.position.z >= fieldDepth - 5 && turret3.zdir === 'up'){

		turret3.position.z = fieldDepth - 5;
		turret3.zdir = 'down';
	}
	else if(turret3.position.z <= 5 && turret3.zdir === 'down'){

		turret3.position.z = 5;
		turret3.zdir = 'up';
	}
	if(timer[0] > 0){

		timer[0]--;
	}
	else if(ave2 > (((beatPeaks[1] - beatAverages[1])/2)+ beatAverages[1]) * 1.8 && ave2 > 80){

		spawnBallCenter(difficulty, turret3.position.y, turret3.position.z);
		if(ave2 > prevAve2 + 3)
		{
			spawnBallVert(difficulty, turret3.position.y, turret3.position.z);

		}
		timer[0] = stc;
	}




	if(turret4.position.y >= fieldHeight/2 && turret4.ydir === 'right'){

		turret4.position.y = fieldHeight/2;
		turret4.ydir = 'left';
	}
	else if(turret4.position.y <= -fieldHeight/2 && turret4.ydir === 'left'){

		turret4.position.y = -fieldHeight/2;
		turret4.ydir = 'right';
	}
	if(turret4.position.z >= fieldDepth - 5 && turret4.zdir === 'up'){

		turret4.position.z = fieldDepth - 5;
		turret4.zdir = 'down';
	}
	else if(turret4.position.z <= 5 && turret4.zdir === 'down'){

		turret4.position.z = 5;
		turret4.zdir = 'up';
	}
	if(turret4.ydir === 'right'){

		turret4.position.y += (ave2 / musicMod);
	}
	else{

		turret4.position.y -= (ave2 / musicMod);
	}
	if(turret4.zdir === 'up'){

		turret4.position.z += (ave4 / musicMod);
	}
	else{

		turret4.position.z -= (ave4 / musicMod);
	}
	if(timer[1] > 0){

		timer[1]--;
	}
	else if(ave2 > (((beatPeaks[1] - beatAverages[1])/2)+ beatAverages[1]) * 1.8 && ave2 > 80){

		spawnBallCenter(difficulty, turret4.position.y, turret4.position.z);
		if(ave4 > prevAve4 * 1.05)
		{
			//spawnBallVert(difficulty, turret4.position.y, turret4.position.z);

		}
		timer[1] = stc;
	}


	//We want beatPeaks to slowly degrade over time so if the overall noise of the song drops early highs don't obfuscate beats later on at lower levels
	beatPeaks[0] -= .5;
	beatPeaks[1] -= .5;
	beatPeaks[2] -= .5;
	beatPeaks[3] -= .5;

	//For the visualisers (which are now kinda hidden by the wall shots, I should move them somewhere)
	for(var i = 0; i < 8; i++){

		visualiser1[i].position.z = -150 + dataArray[i * 16]/3;
	}
	for(var i = 0; i < 8; i++){

		visualiser2[i].position.z = -150 + dataArray[i * 16]/3;
	}

	//Controls for the turret that spawns the obstacles lining the wall, isn't modified by the music, and just exists to make it seem like the player is flying forward (and encourage them to avoid hugging walls)
	if(turret5.dir === 'right'){

		turret5.position.y += 50;
		if(turret5.position.y >= fieldHeight/2){

			turret5.position.y = fieldHeight/2;
			turret5.dir = 'up';
		}
	}
	else if(turret5.dir === 'up'){

		turret5.position.z += 50;
		if(turret5.position.z >= fieldDepth){

			turret5.position.z = fieldDepth;
			turret5.dir = 'left';
		}
	}
	else if(turret5.dir === 'left'){

		turret5.position.y -= 50;
		if(turret5.position.y <= -fieldHeight/2){

			turret5.position.y = -fieldHeight/2;
			turret5.dir = 'down';
		}
	}
	else if(turret5.dir === 'down'){

		turret5.position.z -= 50;
		if(turret5.position.z <= 0){

			turret5.position.z = 0;
			turret5.dir = 'right';
		}
	}
	//Spawn the wall obstacles
	spawnBallWall(difficulty, turret5.position.y, turret5.position.z);
	
	//Move all the shots
	for(i = 0; i < shots.length; i++){

		moveShot(shots[i]);
	}
	prevAve1 = ave1;
	prevAve2 = ave2;
	prevAve3 = ave3;
	prevAve4 = ave4;
	//Potentially seven shots can spawn every other frame, so we call this four times each frame to ensure we don't slowly overload on meshes and objects
	poppable(shots[0]);
	poppable(shots[0]);
	poppable(shots[0]);
	poppable(shots[0]);
	if(healthBar.scale.y >= .1)
		playerMovement();

}

function poppable(shot){

	//Checks the oldest-living shots to see if they've exited the area of relevance, if they have, remove anything that might need memory and remove them from the list
	if(shot){

		if (shot.mesh.position.x <= -fieldHeight/2 - 140){

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
	else{

		//Incase a mysterious invalid shot ends up the list, or we accidentally check a slot that's already gone
		shots.shift();
	}
}

function moveShot(shot){

	//If it exists, move it, and check if it's collided with the player.
	//Wallshots have different dimensions and thus need to be checked differently
	if(shot){
		shot.mesh.position.x += shot.xspd;
		shot.mesh.position.y += shot.yspd;

		if(shot.path === 'center'){
			if (player.position.x <= shot.mesh.position.x + 5
			&& player.position.x >= shot.mesh.position.x - 5){

				if (player.position.y <= shot.mesh.position.y + 5
				&& player.position.y >= shot.mesh.position.y - 5){

					if(player.position.z <= shot.mesh.position.z + 5
					&& player.position.z >= shot.mesh.position.z - 5){

						if(spotLight.intensity === 1.5){
							spotLight.intensity = 15.5;
							if(healthBar.scale.y > 0){

								healthBar.scale.y -= .1;
								healthBar.material.color.g = healthBar.material.color.g - .1;
								healthBar.material.color.r = healthBar.material.color.r + .1;
							}
							if(healthBar.scale.y < .1){

								//If we're dead end the game
								stopSound();
							}
						}
					}

				}
			}
		}
		else if(shot.path === 'horizontal')
		{
			if (player.position.x <= shot.mesh.position.x + 5
			&& player.position.x >= shot.mesh.position.x - 5){

				if(player.position.z <= shot.mesh.position.z + 5
				&& player.position.z >= shot.mesh.position.z - 5){

					if(spotLight.intensity === 1.5){
						spotLight.intensity = 15.5;
						if(healthBar.scale.y > 0){

							healthBar.scale.y -= .1;
							healthBar.material.color.g = healthBar.material.color.g - .1;
							healthBar.material.color.r = healthBar.material.color.r + .1;
						}
						if(healthBar.scale.y < .1){

								//If we're dead end the game
							stopSound();
						}
					}
				}
			}
		}
		else if(shot.path === 'vertical')
		{
			if (player.position.x <= shot.mesh.position.x + 5
			&& player.position.x >= shot.mesh.position.x - 5){

				if(player.position.y <= shot.mesh.position.y + 5
				&& player.position.y >= shot.mesh.position.y - 5){

					if(spotLight.intensity === 1.5){
						spotLight.intensity = 15.5;
						if(healthBar.scale.y > 0){

							healthBar.scale.y -= .1;
							healthBar.material.color.g = healthBar.material.color.g - .1;
							healthBar.material.color.r = healthBar.material.color.r + .1;
						}
						if(healthBar.scale.y < .1){

								//If we're dead end the game
							stopSound();
						}
					}
				}
			}
		}
		else{

			if (player.position.x <= shot.mesh.position.x + 15
			&& player.position.x >= shot.mesh.position.x - 15){

				if (player.position.y <= shot.mesh.position.y + 5
				&& player.position.y >= shot.mesh.position.y - 5){

					if(player.position.z <= shot.mesh.position.z + 25
					&& player.position.z >= shot.mesh.position.z - 25){

						if(spotLight.intensity === 1.5){
							spotLight.intensity = 15.5;
							if(healthBar.scale.y > 0){

								healthBar.scale.y -= .1;
								healthBar.material.color.g = healthBar.material.color.g - .1;
								healthBar.material.color.r = healthBar.material.color.r + .1;
							}
							if(healthBar.scale.y < .1){

								stopSound();
							}
						}
					}

				}
			}
		}
	}

}

//Spawn the square shots that line up with the turrets
function spawnBallCenter(speed, ypos, zpos){

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
	  	
	  	new THREE.MeshLambertMaterial({

		  color: 0xD43001
		})), xspd: -difficulty, yspd: 0, path: 'center'}

		shots.push(shot);
		scene.add(shot.mesh);
		
		shot.mesh.position.x = fieldWidth/2;
		shot.mesh.position.y = ypos;
		shot.mesh.position.z = zpos;
}
function spawnBallHor(speed, ypos, zpos){

		var rand = Math.random();
		rand = rand - .5;
		shot = { mesh:new THREE.Mesh(

	  	new THREE.CubeGeometry(
		10,
		500,
		10,
		1,
		1,
		1),
	  	
	  	new THREE.MeshLambertMaterial({

		  color: 0xD43001
		})), xspd: -difficulty, yspd: 0, path: 'horizontal'}

		shots.push(shot);
		scene.add(shot.mesh);
		
		shot.mesh.position.x = fieldWidth/2;
		shot.mesh.position.y = ypos;
		shot.mesh.position.z = zpos;
}
function spawnBallVert(speed, ypos, zpos){

		var rand = Math.random();
		rand = rand - .5;
		shot = { mesh:new THREE.Mesh(

	  	new THREE.CubeGeometry(
		10,
		10,
		500,
		1,
		1,
		1),
	  	
	  	new THREE.MeshLambertMaterial({

		  color: 0xD43001
		})), xspd: -difficulty, yspd: 0, path: 'vertical'}

		shots.push(shot);
		scene.add(shot.mesh);
		
		shot.mesh.position.x = fieldWidth/2;
		shot.mesh.position.y = ypos;
		shot.mesh.position.z = zpos;
}

//spawn the wall obstacles
function spawnBallWall(speed, ypos, zpos){

	var rand = Math.random();
	shot = { mesh:new THREE.Mesh(
		//We want them to be longer on the side to look like pillars, so they eat into the wall better and look like full protrusions in the floor and ceiling
	  	new THREE.CubeGeometry(
		30,
		10,
		50,
		1,
		1,
		1),
	  	
	  	new THREE.MeshLambertMaterial({

		  color: 0xD43001
		})), xspd: -difficulty, yspd: 0, path: 'wall'}
		shots.push(shot);
		scene.add(shot.mesh);
		
		shot.mesh.position.x = fieldWidth/2;
		shot.mesh.position.y = ypos;
		shot.mesh.position.z = zpos;
}


//Player movement and bounds checking
function playerMovement(){

	if (Key.isDown(Key.A)){

		if (player.position.y >= fieldHeight /2 - 5){

		}
		else{

			player.position.y += moverSpeed;
			if(player.rotation.z < .5)
				player.rotation.z += .1;
		}
	}
	if (Key.isDown(Key.D)){

		if (player.position.y <= -fieldHeight/2 + 5){

			
		}
		else{

			player.position.y -= moverSpeed;
			if(player.rotation.z > -.5)
				player.rotation.z += -.1;
		}
	}
	if (Key.isDown(Key.S)){

		if(player.position.z <= 5){

		}
		else{

			player.position.z -= moverSpeed;
			if(player.rotation.y < .5)
				player.rotation.y += .1;
		}
	}
	if (Key.isDown(Key.W)){	

		if(player.position.z >= fieldDepth - 20){


		}
		else{

			player.position.z += moverSpeed;
			if(player.rotation.y > -.5)
				player.rotation.y -= .1;
		}
	}
	if(!Key.isDown(Key.A)){
		if(!Key.isDown(Key.D)){
			if(!Key.isDown(Key.S)){
				if(!Key.isDown(Key.W)){

					player.rotation.z = 0;
					player.rotation.y = 0;
					
				}
			}
		}
	}

}

//Just sets the camera's position so that it follows the player slightly above their Z-axis (to help give the illusion of speed and help give the sense of depth)
function cameraTracking(){

	camera.position.x = player.position.x - 100;
	camera.position.y = player.position.y;
	camera.position.z = player.position.z + 15;

	camera.rotation.y = -90 * Math.PI/180;
	camera.rotation.z = -90 * Math.PI/180;
}





