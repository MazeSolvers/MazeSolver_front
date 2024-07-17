// checkmaze.js
export class checkmaze {
  constructor(size) {
    this.size = size;
    this.grid = Array.from({ length: size }, () => Array(size).fill(0));
    for (let i = 0; i < size; i++) {
      this.grid[0][i] = 1;
      this.grid[size - 1][i] = 1;
      this.grid[i][0] = 1;
      this.grid[i][size - 1] = 1;
    }
  }

  canPlaceWall(x, z) {
    const original = this.grid[z][x];
    this.grid[z][x] = 1;
    const connected = this.dfs(25, 25, this.size - 2, this.size - 2); // 시작과 끝 좌표를 확인
    this.grid[z][x] = original;
    return connected;
  }

  dfs(sx, sy, dx, dy) {
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    let stack = [[sx, sy]];
    let visited = Array.from({ length: this.size }, () =>
      Array(this.size).fill(false)
    );
    visited[sy][sx] = true;

    while (stack.length > 0) {
      let [x, y] = stack.pop();
      if (x === dx && y === dy) return true;
      for (let [dx, dy] of directions) {
        let nx = x + dx,
          ny = y + dy;
        if (
          nx >= 0 &&
          ny >= 0 &&
          nx < this.size &&
          ny < this.size &&
          this.grid[ny][nx] === 0 &&
          !visited[ny][nx]
        ) {
          stack.push([nx, ny]);
          visited[ny][nx] = true;
        }
      }
    }
    return false;
  }

  addWall(x, z) {
    if (this.canPlaceWall(x, z)) {
      this.grid[z][x] = 1;
      console.log(`Wall added at (${x}, ${z})`);
    } else {
      console.log(`Adding wall at (${x}, ${z}) would block the path.`);
    }
  }

  print() {
    console.log(this.grid.map((row) => row.join(" ")).join("\n"));
  }
}
