import * as THREE from "https://cdn.skypack.dev/three@0.128.0";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/GLTFLoader.js";

export class NPC {
  constructor(scene, collidableObjects, position = new THREE.Vector3(0, 0, 0)) {
    this.scene = scene;
    this.collidableObjects = collidableObjects;
    this.npc = null;
    this.npcLight = null; // NPC 조명 변수 추가
    this.loadModel(position);
  }

  loadModel(position) {
    const loader = new GLTFLoader();
    loader.load(
      'http://143.248.200.29:3000/models/scene.gltf',
      (gltf) => {
        this.npc = gltf.scene;
        this.npc.position.copy(position);
        this.npc.scale.set(0.15, 0.15, 0.15);
        this.npc.position.y = 0.1;

        // 모든 메시에 대해 약간의 빨간색 발광 재질 설정
        this.npc.traverse((node) => {
          if (node.isMesh) {
            node.material.emissive = new THREE.Color(0x330000);
            node.material.emissiveIntensity = 0.5;
          }
        });

        this.scene.add(this.npc);

        // 방향성 조명 추가
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(1, 1, 1); // 조명의 위치 설정
        this.scene.add(directionalLight);

        // NPC 주위에 약한 붉은색 조명 추가
        this.npcLight = new THREE.PointLight(0xff0000, 0.1, 5);
        this.npcLight.position.set(0, 3, 0);
        this.scene.add(this.npcLight);
      },
      undefined,
      (error) => {
        console.error(error);
      }
    );
  }


  checkCollisions() {
    if (!this.npc) return false;
    const npcBox = new THREE.Box3().setFromObject(this.npc);
    npcBox.expandByScalar(-0.1);
    for (let i = 0; i < this.collidableObjects.length; i++) {
      const wallBox = new THREE.Box3().setFromObject(this.collidableObjects[i]);
      if (npcBox.intersectsBox(wallBox)) {
        return true;
      }
    }
    return false;
  }

  update(targetPosition) {
    if (!this.npc) return;
    const direction = new THREE.Vector3()
      .subVectors(targetPosition, this.npc.position)
      .normalize();
    const speed = 0.02; // NPC 이동 속도

    const previousPosition = this.npc.position.clone();
    this.npc.position.add(direction.multiplyScalar(speed));

    if (this.checkCollisions()) {
      this.npc.position.copy(previousPosition); // 충돌 시 이전 위치로 되돌림
      this.findPath(targetPosition); // 장애물을 피하는 방법 추가
    }
  }

  findPath(targetPosition) {
    if (!this.npc) return;
    const directions = [
      new THREE.Vector3(1, 0, 0), // 오른쪽
      new THREE.Vector3(-1, 0, 0), // 왼쪽
      new THREE.Vector3(0, 0, 1), // 아래
      new THREE.Vector3(0, 0, -1), // 위
    ];

    const currentPosition = this.npc.position.clone();
    let foundPath = false;

    for (let i = 0; i < directions.length; i++) {
      const newDirection = directions[i];
      const newPosition = currentPosition
        .clone()
        .add(newDirection.multiplyScalar(0.1));
      this.npc.position.copy(newPosition);
      if (!this.checkCollisions()) {
        foundPath = true;
        break; // 충돌이 없는 방향을 찾으면 이동
      }
    }

    if (!foundPath) {
      this.npc.position.copy(currentPosition); // 충돌이 없는 방향을 찾지 못하면 제자리
    }
  }
}
