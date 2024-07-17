import * as THREE from "https://cdn.skypack.dev/three@0.128.0";

// 깊이 우선 탐색을 사용한 단순한 미로 생성
function generateSimpleMaze(size) {
    const maze = Array.from({ length: size }, () => Array(size).fill(1));

    function carve(x, y) {
        const directions = [
            [2, 0],
            [-2, 0],
            [0, 2],
            [0, -2],];

            let shuffledDirections = directions.sort(() => Math.random() - 0.5);

        directions.forEach(([dx, dy]) => {
            const nx = x + dx;
            const ny = y + dy;
            if (
                nx > 0 && nx < size - 1 &&
                ny > 0 && ny < size - 1 &&
                maze[ny][nx] === 1
            ) {
                maze[ny][nx] = 0;
                maze[y + dy / 2][x + dx / 2] = 0; // 중간 칸도 비우기
                carve(nx, ny);
            }
        });
    }

    // 시작점에서부터 미로 생성
    maze[1][1] = 0;
    carve(1, 1);

    // 무작위로 더 많은 벽을 제거하여 미로를 더 단순하게 만듦
    for (let y = 1; y < size - 1; y++) {
        for (let x = 1; x < size - 1; x++) {
            if (maze[y][x] === 1 && Math.random() > 0.7) { // 30% 확률로 벽 제거
                maze[y][x] = 0;
            }
        }
    }

    return maze;
}

export function createBasicMaze(scene, collidableObjects, wallMaterial, maze, excludedPositions) {
    const mazeData = generateSimpleMaze(maze.size); // 단순한 미로 생성 데이터
    const mazeSize = maze.size; // 미로의 크기
    const wallHeight = 5; // 벽의 높이
    const wallThickness = 0.5; // 벽의 두께

    // 바닥 생성
    const floorGeometry = new THREE.PlaneGeometry(mazeSize, mazeSize);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x000001 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // 미로 생성
    const halfSize = Math.floor(mazeSize / 2);

    for (let z = 0; z < mazeSize; z++) {
        for (let x = 0; x < mazeSize; x++) {
            if (mazeData[z][x] === 1 && !excludedPositions.some(([ex, ey]) => ex === x && ey === z)) {
                const wallGeometry = new THREE.BoxGeometry(1, wallHeight, 1); // 격자를 1 단위로 사용
                const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                wall.position.set(x - halfSize, wallHeight / 2, z - halfSize); // 좌표를 변환하여 격자가 이어지도록 설정
                scene.add(wall);
                collidableObjects.push(wall);

                // 벽 생성 행렬에 반영
                maze.addWall(x, z);
            }
        }
    }

    console.log("Basic maze initialized");
}
