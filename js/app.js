import * as THREE from "three";
import * as CANNON from "cannon";
import { obbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";

import CannonDebugger from "cannon-es-debugger";

import { Environment } from "./Environment";

export class App {
  constructor({ playerEnabled = true } = {}) {
    this.constants = {
      sizes: {
        width: Window.innerWidth,
        height: window.innerHeight,
      },
      controlsEnabled: !playerEnabled,
      playerEnabled: playerEnabled,
      physicsDebug: false,
      GRAVITY: new CANNON.Vec3(0, -9.82 * 5, 0),
    };

    this.renderer = null;
    this.canvas = null;

    this.initializeCanvas();
    this.initializeRenderer();
    this.initializeDebug();

    this.initialize3DSpace();
    this.initializeUISpace();

    this.previousRAF = null;
    this.raf();
    this.onWindowResize();
  }

  initializeCanvas() {
    document.body.innerHTML = `<canvas class = "webgl"></canvas>`;
    this.canvas = document.querySelector("canvas.webgl");
  }

  initializeRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
    });
    this.renderer.setSize(
      this.constants.sizes.width,
      this.constants.sizes.height
    );
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  initializeDebug() {
    if (this.constants.physicsDebug) {
      this.debug = new CannonDebugger(this.scene, this.world.bodies);
    }
  }

  initialize3DSpace() {
    this.initializePhysics();

    this.scene = new THREE.Scene();
    if (this.constants.playerEnabled) {
      const fog = new THREE.Fog("0x11383468", 1, 100);
      this.scene.fog = fog;
    } else {
      let light = new THREE.AmbientLight(0xffffff, 0.4);
      this.scene.add(light);
      light = new THREE.DirectionalLight(0xffffff, 0.5);
      light.position.set(10, 10, 10);
      light.castShadow = true;

      light = new THREE.DirectionalLight(0xffffff, 0.3);
      light.color.setHSL(0.6, 1, 0.6);
      light.groundColor.setHSL(0.095, 1, 0.75);
      light.position.set(0, 4, 0);
      this.scene.add(light);
    }
    this.environment;
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.constants.sizes.width / this.constants.sizes.height,
      0.1,
      1000
    );

    this.camera.position.set(0, 25, 2);
    if (!this.constants.playerEnabled) {
      this.camera.position.set(-38, 148, 145);

      this.camera.rotation.set(-0.92, -0.35, -0.43, "XYZ");
    }
    this.initalizeEnvironment();
    this.initalizeControls();

    if (this.constants.physicsDebug) {
      this.debug = new CannonDebugger(this.scene, this.world);
    }
  }

  initializePhysics() {
    this.CannonDebugger = null;
    this.timeStep = 1 / 60;
    this.world = new CANNON.World({
      gravity: this.constants.GRAVITY,
    });
  } //위 객체들 추가 구현 필요함
}
