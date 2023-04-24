//Esta clase es para el jugador, aquí está la posición velocidad etc.
//NOTA: Si no puedo pasar las propiedades del constructor como un objetos, es porque
//No las he definido como un argumento
class Sprite extends Background{
	constructor({ position, velocity, color = 'red', offset, collisionBlocks, imageSrc,
		frameRate, scale = 0.5, animations }){
		super({imageSrc, frameRate, scale})
		this.position = position;
		//Aquí se modifica la velocidad
		this.velocity = velocity;
		//Aquí el ancho de las cajas rojas de los personajes
		//NOTA:Se divide el valor entre cuatro ya que como hemos metido player
		//dentro del save y restore este también toma los valores del background, por lo tanto
		//se escala, y entonces tenemos que permanecer con los cálculos exactos de nuestro 
		//scaledCanvas
		//this.width = 50 / 4;
		//Aquí se modifica la altura del cuadro rojo del personaje
		//Nota se esconden los valores de width y height en este caso porque 
		//Es necesario para poder arreglar que el sprite no traspase el collider
		//Para eso se utilizó el método onload en la clase background
		//this.height = 150 / 4;
		//Este es para los controles
		this.lastKey;
		//Este es para el cuadro de ataque
		this.attackBox = {
			position: {
				x: this.position.x,
				y: this.position.y
			},
			offset,
			width: 100 / 4,
			height: 50 / 4
		}
		this.color = color;
		this.isAttacking;
		this.health = 100;
		this.collisionBlocks = collisionBlocks;
		//Esto es para hacer la caja que va a encerrar a nuestro personaje
		//Y así podremos hacer la interacción con los colliders desde él
		this.hitbox = {
			position: {
				x: this.position.x,
				y: this.position.y,
			},
			width: 10,
			height: 10,
		}
		//Esto hace referencia a las animaciones
		this.animations = animations;
		//Esto hace referencia a la última dirección en la que se encuentra nuestro personaje
		this.lastDirection = 'right';

		//Este bucle es para que las animaciones puedan usar las imagenes
		//Haciendo el llamado desde la clase de Background
		for(let key in this.animations){
			const image = new Image();
			image.src = this.animations[key].imageSrc;

			this.animations[key].image = image;
		}

	}

	//Con este podemos cambiar los sprites para hacer las animaciones de cada mecánica que tengamos
	switchSprite(key){
		if (this.image === this.animations[key] || !this.loaded)return

		this.image = this.animations[key].image;
		this.frameBuffer = this.animations[key].frameBuffer;
		this.frameRate = this.animations[key].frameRate;
	}

	//Aquí se dibuja el cuadro rojo, se establece sus coordenadas y dimensiones
	//draw(){
		//c.fillStyle = this.color;
		//c.fillRect(this.position.x, this.position.y, this.width, this.height);

		//Nota, la attack box ha sido movida a la clase Background por el extends del sprite
	//}

	//Aquí se actualiza todos los valores de draw position y velocity
	update(){
		//Hacemos el llamado de updateFrames desde la clase Background
		this.updateFrames();
		//Hacemos el llamado de hitbox
		this.updateHitbox();
		//Esto es para hacer el cropbox que nos dice cuánto espacio abarca nuestro jugador
		/*c.fillStyle = 'rgba(0, 255, 0, 0.2)';
		c.fillRect(this.position.x, this.position.y, this.width, this.height);

		//Esto es para hacer el hitbox que posiciona nuestro jugador en el cropbox
		c.fillStyle = 'rgba(255, 0, 0, 0.2)';
		c.fillRect(
			this.hitbox.position.x, 
			this.hitbox.position.y, 
			this.hitbox.width, 
			this.hitbox.height);
		*/
		this.draw();
		this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
		this.attackBox.position.y = this.position.y;

		this.position.x += this.velocity.x;
		this.updateHitbox();
		this.checkForHorizontalCollisions();
		this.applyGravity();
		this.updateHitbox();
		this.checkForVerticalCollisions();

		/*if (this.position.y + this.height + this.velocity.y < canvas.height) {
		}else {
			this.velocity.y = 0;
		}*/
	}

	//Se establecen las mismas propiedades desde aquí ya que así estará siendo
	//Actualizados sus valores por cada frame
	//Nota: Tenemos que hacer referencia de hitbox desde el objeto 1 de collision
	//Si queremos que interactue este precisamente con los colliders que hemos creado
	updateHitbox(){
		this.hitbox = {
			position: {
				x: this.position.x + 35,
				y: this.position.y + 26,
			},
			width: 14,
			height: 27,
		}
	}

	//Aquí manejamos la gravedad de una forma un poco más cómoda y organizada
	applyGravity(){
		this.velocity.y += gravity;
		this.position.y += this.velocity.y;
	}

	//Aquí se detectan los coliders de forma vertical
	checkForVerticalCollisions(){
		for(let i = 0; i < this.collisionBlocks.length; i++){
			const collisionBlock = this.collisionBlocks[i];

			if (collision({
				object1: this.hitbox,
				object2: collisionBlock,
			})) {
				if (this.velocity.y > 0) {
					this.velocity.y = 0;

					const offset = 
						this.hitbox.position.y - this.position.y + this.hitbox.height;

					this.position.y = collisionBlock.position.y - offset - 0.01;
					break;
				}

				if (this.velocity.y < 0) {
					this.velocity.y = 0;

					const offset = 
						this.hitbox.position.y - this.position.y;

					this.position.y = 
						collisionBlock.position.y + collisionBlock.height - offset + 0.01;
					break;
				}
			}
		}
	}

	//Y aquí en horizontal
	checkForHorizontalCollisions(){
		for(let i = 0; i < this.collisionBlocks.length; i++){
			const collisionBlock = this.collisionBlocks[i];

			if (collision({
				object1: this.hitbox,
				object2: collisionBlock,
			})) {
				if (this.velocity.x > 0) {
					this.velocity.x = 0;
					const offset =
						this.hitbox.position.x - this.position.x + this.hitbox.width;
					this.position.x = collisionBlock.position.x - offset - 0.01;
					break;
				}

				if (this.velocity.x < 0) {
					this.velocity.x = 0;

					const offset =
						this.hitbox.position.x - this.position.x;
					this.position.x = 
						collisionBlock.position.x + collisionBlock.width - offset + 0.01;
					break;
				}
			}
		}
	}

	//Esto lo que hace es que los ataques se restablezcan a su valor original
	//Para que sea como un golpe que se está dando
	attack(){
		this.isAttacking = true;
		setTimeout(() => {
			this.isAttacking = false;
		}, 100)
	}
}
