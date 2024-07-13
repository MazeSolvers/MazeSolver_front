import * as THREE from "three";

import { Cell } from "./cell";

export class MazeGenerator{
    constructor{
        scene,
        world,
        {
            cols = 5, row = 5, debugPanel = null, playerEnabled = true 
        } = {}
    } {
        this.playerEnabled = playerEnabled;
        this.scene = scene;
        this.world = world;
        this.cols = cols;
        this.rows = rows;

        this.debugPanel = debugPanel;

        this.cells = [];
        this.maze = [];

        this.current = null;
        this.cellStack = [];

        this.initializeCells();

        this.curCullHelper = new THREE.cells(
            new THREE.
        )
    }

}