//Esta clase es para el background
class Background{
	constructor({position, imageSrc, frameRate = 1, frameBuffer = 3, scale = 1}){
		this.position = position;
		this.image = new Image();
		//Con scale podemos modificar el tamaño de nuestro personaje o nuestro background
		//dependiendo de la clase donde se coloque la propiedad
		this.scale = scale;
		this.image.onload = () =>{
			this.width = (this.image.width / this.frameRate) * this.scale;
			this.height = this.image.height * this.scale;
		}
		//Con esto ponemos las imagenes
		this.image.src = imageSrc;
		//Con frameRate lo que hacemos es cortar el resto de sprites de la spritesheet para que 
		//Se pueda acoplar uno a uno en secuencia en el cropbox
		//En frameRate tenemos que especificar en el objeto del jugador el número de frames que tiene
		//El spritesheet de nuestro jugador
		this.frameRate = frameRate;
		//Current frame es el último frame por el que empezó la posición de nuestro cropbox
		//Se le pone el valor de 0 para que empieze desde su primera posición y así siga la 
		//secuencia de forma ordenada
		this.currentFrame = 0;
		//frameBuffer altera la velocidad con la que nuestro cropbox se desplaza dentro de nuestro
		//spritesheet, el valor puede rondar entre 2 a 10... Pero es un valor un poco subjetivo
		this.frameBuffer = frameBuffer;
		//Con elapsed frames lo que hacemos es contar cuántos frames han pasado en nuestra animación
		//El valor de elapsedFrames se va a autoincrementar en update por cada animación que suceda
		this.elapsedFrames = 0; 
	}

	draw(){
		if (!this.image) return;

		//Cropbox lo que hace es encerrar a nuestro sprite en una caja y dividir el resto
		//de elementos de la spritesheet para que se muestre uno solo,
		//Para luego ser usada una imagen tras otra en secuencia en la caja para que 
		//Se pueda apreciar una animación
		//Cropbox por lo general cambia su posición para poder ver una imagen tras otra
		const cropbox = {
			position: {
				x: this.currentFrame * (this.image.width / this.frameRate),
				y: 0, 
			},
			width: this.image.width / this.frameRate,
			height: this.image.height,
		}

		c.drawImage(
			this.image,
		    cropbox.position.x,
		    cropbox.position.y,
		    cropbox.width,
		    cropbox.height, 
		    this.position.x, 
		    this.position.y,
		    this.width,
		    this.height); 

		//Caja de ataque
		if (this.isAttacking) {
			c.fillStyle = "green";
			c.fillRect(
				this.attackBox.position.x, 
				this.attackBox.position.y, 
				this.attackBox.width, 
				this.attackBox.height
				);	
		}
	}

	update(){
		this.draw();
		this.updateFrames();
	}

	//Aquí esto se encarga de actualizar nuestros frames constantemente
	updateFrames(){
		this.elapsedFrames++;
		//Aquí restamos el valor de frameBuffer y de elapsedFrames
		if (this.elapsedFrames % this.frameBuffer === 0) {

			//Esto lo ponemos para que los frames del escenario no se actualicen como tal
			//Ya que si lo hacemos no podrá hacer referencia a nada de nuestro código
			//Ya que la animación de los frames está pensada para el jugador
			if (this.currentFrame < this.frameRate - 1) {
				this.currentFrame++;

			}else{
				this.currentFrame = 0;
			}
		}
	}
}