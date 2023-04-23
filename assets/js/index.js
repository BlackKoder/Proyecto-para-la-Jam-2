//Esto hace el llamado a nuestro canvas
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

//Aquí establecemos nuestras dimensiones para nuestro canvas
canvas.width = 1024;
canvas.height = 576;

//Aquí escalamos los valores del lienzo dividiendo entre cuatro veces su tamaño, este debe de 
//concordar con el valor de scale que usamos más abajo
const scaledCanvas = {
	width: canvas.width / 4,
	height: canvas.height / 4
}

//Este bucle encierra un arreglo y toma 36 elementos del arreglo que nos da tiled de nuestro
//tilemap
const floorCollisions2D = [];
for(let i = 0; i < floorCollisions.length; i += 36){
	floorCollisions2D.push(floorCollisions.slice(i, i + 36));
}

//Esto lo que hace es crear los bloques que hemos hecho en tiled de nuestro tilemap
//202 es el símbolo que nos ididca que ahí hay un collider (16 hace referencia al ancho y alto)
const collisionBlocks = [];
floorCollisions2D.forEach((row, y) => {
	row.forEach((symbol, x) => {
		if (symbol === 202) {
			collisionBlocks.push(
				new CollisionBlock({
					position:{
						x: x * 16,
						y: y * 16,
					},
			}))
		}
	})
})

//Esto hace lo mismo de hacer el arreglo
const platformCollisions2D = [];
for(let i = 0; i < platformCollisions.length; i += 36){
	platformCollisions2D.push(platformCollisions.slice(i, i + 36));
}

//Esto crea los bloques de nuestras plataformas
const platformCollisionBlocks = [];
platformCollisions2D.forEach((row, y) => {
	row.forEach((symbol, x) => {
		if (symbol === 202) {
			platformCollisionBlocks.push(
				new CollisionBlock({
					position:{
						x: x * 16,
						y: y * 16,
					},
			}))
		}
	})
})

//Este va a ser el valor para la gravedad
const gravity = 0.5;

//Aquí puedo alterar la posición del jugador en el eje x y 
const player = new Sprite({
			position:{
				x: 150,
				y: 0
			},
			velocity:{
				x: 0,
				y: 1
			},
			offset:{
				x: 0,
				y: 0
			},
			collisionBlocks,
			imageSrc: './assets/img/warrior/Idle.png',
			frameRate: 8,
			
		});

//Este es el objeto del enemigo
const enemy = new Sprite({
			position:{
				x: 300,
				y: 0
			},
			velocity:{
				x: 0,
				y: 1
			},
			offset:{
				x: -12,
				y: 0
			},
			color: 'blue',
			collisionBlocks,
			imageSrc: './assets/img/warrior/Idle.png',
			frameRate: 8,
		});

//Este es el valor por defecto de nuestras teclas de dirección

const keys = {
	d:{
		pressed: false,
	},
	a:{
		pressed: false,
	},
	ArrowRight:{
		pressed: false,
	},
	ArrowLeft:{
		pressed: false,
	}
}

//Este es el objeto donde cambiamos los valores de nuestro background
const background = new Background({
	position:{
		x: 0,
		y: 0,
	},
	imageSrc: './assets/img/background.png'
})

//Con esto detectamos las colisiones al dar un golpe
function rectangularCollision({ rectangle1, rectangle2}){
	return(rectangle1.attackBox.position.x  + rectangle1.attackBox.width >=
				rectangle2.position.x && 
			rectangle1.attackBox.position.x <= 
				rectangle2.position.x + rectangle2.width && 
			rectangle1.attackBox.position.y + rectangle1.attackBox.height >=
				rectangle2.position.y && 
			rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
		)
}

//Aquí determinamos el Game Over o si sigue nuestra aventura
function determineDeath({player, enemy, timerId}){
	clearTimeout(timerId);
	document.querySelector('#display-text').style.display = 'flex';
	if (player.health <= 0) {
		document.querySelector('#display-text').innerHTML = 'Game Over';
	}else if(enemy.health <= 0 && player.health > 0){
		document.querySelector('#display-text').innerHTML = 'Adventure Continue';
	}

}

//Con esto hacemos el contador del tiempo de la partida
let timer = 30;
let  timerId;
function decreaseTimer(){
	if (timer > 0 ) {
		timerId = setTimeout(decreaseTimer, 1000);
		timer--;
		document.querySelector('#timer').innerHTML = timer;
	}
	if (timer === 0) {
		determineDeath({player, enemy, timerId});
	}

}


decreaseTimer();

//Esta función lo que hace es dibujar en nuestro liezo varios cuadros por segundo
//Se mantiene activo todo el tiempo
function animate(){
	window.requestAnimationFrame(animate);
	c.fillStyle = "white";
	c.fillRect(0, 0, canvas.width, canvas.height);

	//Con este guardamos los valores que están dentro de él
	c.save();
	//Con este manejamos el escalado del background
	c.scale(4, 4);
	//Con este hacemos la transición de la vista del background
	c.translate(0, -background.image.height + scaledCanvas.height);
	background.update();
	//Con esto pintamos los colliders para visualizar
	collisionBlocks.forEach((collisionBlock) => {
		collisionBlock.update();
	})
	//Con esto pintamos los colliders para visualizar las plataformas
	platformCollisionBlocks.forEach((platformCollisionBlock) => {
		platformCollisionBlock.update();
	})
	//Encerramos los parametros de player y enemy dentro de save y restore para que 
	//se acople a las proporciones de los colliders y nuestro tilemap
	player.update();
	enemy.update();


	//Aquí altero la velocidad del personaje y el desplazamiento del jugador
	player.velocity.x = 0;
	enemy.velocity.x = 0;

	if (keys.d.pressed && player.lastKey === 'd') {
		player.velocity.x = 5;
	}else if(keys.a.pressed && player.lastKey === 'a'){
		player.velocity.x = -5;
	}

	//Aquí altero la velocidad del personaje y el desplazamiento del enemigo

	if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
		enemy.velocity.x = 5;
	}else if(keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft'){
		enemy.velocity.x = -5;
	}
	//Detección de colisiones
	if (
		rectangularCollision({
			rectangle1: player,
			rectangle2: enemy
		}) && 
		player.isAttacking
		) {
		player.isAttacking = false;
		enemy.health -= 20;
		document.querySelector('#enemyHealth').style.width = enemy.health + "%";
	}

	if (
		rectangularCollision({
			rectangle1: enemy,
			rectangle2: player
		}) && 
		enemy.isAttacking
		) {
		enemy.isAttacking = false;
		player.health -= 20;
		document.querySelector('#playerHealth').style.width = player.health + "%";
	}
	//Con este restaura los valores para mostrarnoslo constantemente en pantalla
	c.restore();




	//Terminar el juego basado en la vida
	if (player.health <= 0 || enemy.health <= 0) {
		determineDeath({player, enemy, timerId});
	}

}

animate();


//Aquí están los controles, se mantiene en escucha en un evento por si presiono una
//tecla en el teclado
window.addEventListener('keydown', (event) =>{
	switch(event.key){
		case 'd':
			keys.d.pressed = true;
			player.lastKey = 'd';
		break;	

		case 'a':
			keys.a.pressed = true;
			player.lastKey = 'a';
		break; 

		case 'w':
			player.velocity.y = -8;
		break; 

		case 'k':
			player.attack();
		break;

		case 'ArrowRight':
			keys.ArrowRight.pressed = true;
			enemy.lastKey = 'ArrowRight';
		break;	

		case 'ArrowLeft':
			keys.ArrowLeft.pressed = true;
			enemy.lastKey = 'ArrowLeft';
		break; 

		case 'ArrowUp':
			enemy.velocity.y = -8;
		break; 

		case 'p':
			enemy.isAttacking = true;
		break;
	}
	//console.log(event.key);
});

//Este es el contrario de la dirección a donde establecimos que vaya el personje
//Para que se mantenga en un solo sitio y no se mueva a lo loco

window.addEventListener('keyup', (event) =>{
	switch(event.key){
		case 'd':
			keys.d.pressed = false;
		break;	

		case 'a':
			keys.a.pressed = false;
		break; 
	}

	switch(event.key){
		case 'ArrowRight':
			keys.ArrowRight.pressed = false;
		break;
		
		case 'ArrowLeft':
			keys.ArrowLeft.pressed = false;
		break;		
	}
});
