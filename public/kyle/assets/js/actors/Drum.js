import Actor from './Actor';
export default class Drum extends Actor {

	constructor(scene, opts) {
		super(scene, opts);

		this.raycaster = new THREE.Raycaster();
		this.sound();
		this.addEvents();


	}

	shape() {
		if (!this.visualizers) this.visualizers = [];
		this.container();
		this.visualizer();
	}

	watchAudio() {
		if (this.audio) {
			this.audio.update();
			this.visualize();
			requestAnimationFrame(this.watchAudio.bind(this));
		}
	}

	visualize() {
        for (var i = 0; i < this.visualizers.length; i++) {
            var s = 5 * this.audio.frequencies[i] / 16;
            s = s > 0 ? s : 0.0001;
            this.visualizers[i].scale.set(s, s, s);
        }
	}

	visualizer() {
		for (let i = 0; i < 256; i++) {
			var geometry = new THREE.BoxGeometry(0.005, 0.005, 0.005);
			var material = new THREE.MeshBasicMaterial({ color: this.opts.color });
			var box = new THREE.Mesh( geometry, material );

			box.position.set(
				this.opts.position.x,
				this.opts.position.y + (0.1 * i),
				this.opts.position.z - 1
			);
			
			this.visualizers.push(box);
			this.shapes.push(box);
		}
	}

	container() {
		var geometry = new THREE.CylinderGeometry( 0.4, 0.3, 1, 128);
		var material = new THREE.MeshPhongMaterial({ shading: 0xFFFFFF });
		var cylinder = new THREE.Mesh( geometry, material );

		cylinder.position.set(
			this.opts.position.x,
			this.opts.position.y,
			this.opts.position.z
		);

	    this.shapes.push(cylinder);
	}

	addEvents() {
		this.event = {};
		if (WEBVR.isAvailable() === true) {
			this.opts.controller1.addEventListener('triggerdown', this.onTriggerDown.bind(this));
			this.opts.controller2.addEventListener('triggerdown', this.onTriggerDown.bind(this));

			this.opts.controller1.addEventListener('triggerup', this.onTriggerUp.bind(this));
			this.opts.controller2.addEventListener('triggerup', this.onTriggerUp.bind(this));
		}
		document.addEventListener('keydown', this.onKeyDown.bind(this));
		document.addEventListener('mousedown', this.onMouseDown.bind(this));
		document.addEventListener('touchstart', this.onTouchStart.bind(this));
	}

	sound() {
		this.audio = new AudioReactive({});
		this.watchAudio();
	}

	onKeyDown(evt) {
		if (evt.keyCode === this.opts.keyCode) {
			try {
				this.audio.playMedia(this.opts.sound || '');
			}
			catch(e) {
				console.error(e);
			}
			this.setMaterial(this.shapes[0], this.opts.color);
		}
		if (evt.keyCode === 13) this.debug({x: 1, y: 1, z: 1});

		this.release = this.onKeyUp.bind(this);
		document.addEventListener('keyup', this.release);
	}

	onTriggerDown(evt) {
		console.log('trigger', evt.target.position);
		console.log('dist', this.shapes[0].position.distanceTo(evt.target.position));
                
        var vec = new THREE.Vector3();
        vec.setFromMatrixPosition( evt.target.matrix );
                
		this.interact3d(vec);
	}
	onTriggerUp() {
		this.stopInteract();
	}

	onKeyUp() {
		document.removeEventListener('keyup', this.release);
		this.stopInteract();
	}

	onMouseDown(evt) {
		evt.preventDefault();
		this.event.x = ( event.clientX / this.renderer.domElement.clientWidth ) * 2 - 1;
		this.event.y = -( event.clientY / this.renderer.domElement.clientHeight ) * 2 + 1;

		this.release = this.onMouseUp.bind(this);
		document.addEventListener('mouseup', this.release);

		this.interact();
	}
	onTouchStart(evt) {
		evt.preventDefault();
		this.event.x = ( event.touches[0].clientX / this.renderer.domElement.clientWidth ) * 2 - 1;
		this.event.y = -( event.touches[0].clientY / this.renderer.domElement.clientHeight ) * 2 + 1;

		this.release = this.onMouseUp.bind(this);
		document.addEventListener('touchend', this.release);

		this.interact();
	}

	onMouseUp() {
		document.removeEventListener('mouseup', this.release);
		this.stopInteract();
	}
	onTouchEnd() {
		document.removeEventListener('touchend', this.release);
		this.onMouseUp();
	}

	interact() {
		this.raycaster.setFromCamera(this.event, this.camera);

		let intersects = this.raycaster.intersectObjects([this.shapes[0]]);
		if (intersects.length > 0) {
			try {
				this.audio.playMedia(this.opts.sound || '');
			}
			catch(e) {
				console.error(e);
			}
			intersects.forEach(intersect => this.setMaterial(intersect.object, this.opts.color));
		}
	}

	interact3d(pos) {
		let dist = pos.distanceTo(this.shapes[0].position);
		console.log('dist', dist);
		if (dist < 1) {
			this.audio.playMedia(this.opts.sound || '');
			this.setMaterial(this.shapes[0], this.opts.color);
		}
	}

	debug(pos) {
		return;
		var geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1);
		var material = new THREE.MeshPhongMaterial({ shading: 0xFFFFFF });
		var debug = new THREE.Mesh( geometry, material );

		debug.position.set(
			pos.x,
			pos.y,
			pos.z
		);

	    this.scene.add(debug);
	}

	stopInteract() {
		this.setMaterial(this.shapes[0], 0xffffff);
	}

	setMaterial(shape, hex) {
		shape.material.color.setHex( hex );
	}

}