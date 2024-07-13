class Game {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);

    this.boardSize = 19;
    this.cellSize = 1;
    this.board = this.createBoard(this.boardSize);
    this.stones = [];
    this.currentColor = 0x000000; // Black

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.container.addEventListener(
      "click",
      (event) => this.onMouseClick(event),
      false
    );

    window.addEventListener("resize", () => this.onWindowResize(), false);
  }

  init() {
    this.camera.position.set(9, 30, 25);
    this.camera.lookAt(9, 0, 9);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 50, 50);
    this.scene.add(directionalLight);

    this.scene.add(this.board);
    this.animate();
  }

  createBoard(size) {
    const group = new THREE.Group();

    const boardThickness = 1;
    const boardGeometry = new THREE.BoxGeometry(size, boardThickness, size);
    const boardMaterial = new THREE.MeshLambertMaterial({ color: 0xdeb887 });
    const boardMesh = new THREE.Mesh(boardGeometry, boardMaterial);
    boardMesh.position.set((size - 1) / 2, -boardThickness / 2, (size - 1) / 2);
    group.add(boardMesh);

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    for (let i = 0; i < size; i++) {
      const horizontalLineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-size / 2, boardThickness / 2 + 0.01, i - size / 2),
        new THREE.Vector3(
          size / 2 - 1,
          boardThickness / 2 + 0.01,
          i - size / 2
        ),
      ]);
      const horizontalLine = new THREE.Line(
        horizontalLineGeometry,
        lineMaterial
      );
      group.add(horizontalLine);

      const verticalLineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i - size / 2, boardThickness / 2 + 0.01, -size / 2),
        new THREE.Vector3(
          i - size / 2,
          boardThickness / 2 + 0.01,
          size / 2 - 1
        ),
      ]);
      const verticalLine = new THREE.Line(verticalLineGeometry, lineMaterial);
      group.add(verticalLine);
    }

    return group;
  }

  createStone(x, z, color) {
    const stoneGeometry = new THREE.SphereGeometry(0.45, 64, 64);
    const stoneMaterial = new THREE.MeshLambertMaterial({ color: color });
    const stoneMesh = new THREE.Mesh(stoneGeometry, stoneMaterial);
    stoneMesh.position.set(x, 0.5, z);
    return stoneMesh;
  }

  onMouseClick(event) {
    event.preventDefault();

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects([
      this.board.children[0],
    ]);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      const x = Math.round(intersect.point.x);
      const z = Math.round(intersect.point.z);

      if (this.isValidMove(x, z)) {
        const stone = this.createStone(x, z, this.currentColor);
        this.scene.add(stone);
        this.stones.push({ x: x, z: z, color: this.currentColor });

        this.currentColor =
          this.currentColor === 0x000000 ? 0xffffff : 0x000000; // Toggle color
      }
    }
  }

  isValidMove(x, z) {
    for (let stone of this.stones) {
      if (stone.x === x && stone.z === z) {
        return false;
      }
    }
    return true;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
}

export default Game;
