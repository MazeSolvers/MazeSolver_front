package main

import "fmt"

type CheckMaze struct {
	size int
	grid [][]int
}

func NewCheckMaze(size int) *CheckMaze {
	maze := &CheckMaze{
		size: size,
		grid: make([][]int, size),
	}
	for i := range maze.grid {
		maze.grid[i] = make([]int, size)
	}

	for i := 0; i < size; i++ {
		maze.grid[0][i] = 1
		maze.grid[size-1][i] = 1
		maze.grid[i][0] = 1
		maze.grid[i][size-1] = 1
	}

	return maze
}

func (maze *CheckMaze) canPlaceWall(x, z int) bool {
	original := maze.grid[z][x]
	maze.grid[z][x] = 1
	connected := maze.dfs(25, 25, maze.size-2, maze.size-2)
	maze.grid[z][x] = original
	return connected
}

func (maze *CheckMaze) dfs(sx, sy, dx, dy int) bool {
	directions := [][2]int{
		{1, 0},
		{-1, 0},
		{0, 1},
		{0, -1},
	}
	stack := [][2]int{{sx, sy}}
	visited := make([][]bool, maze.size)
	for i := range visited {
		visited[i] = make([]bool, maze.size)
	}
	visited[sy][sx] = true

	for len(stack) > 0 {
		x, y := stack[len(stack)-1][0], stack[len(stack)-1][1]
		stack = stack[:len(stack)-1]
		if x == dx && y == dy {
			return true
		}
		for _, d := range directions {
			nx, ny := x+d[0], y+d[1]
			if nx >= 0 && ny >= 0 && nx < maze.size && ny < maze.size && maze.grid[ny][nx] == 0 && !visited[ny][nx] {
				stack = append(stack, [2]int{nx, ny})
				visited[ny][nx] = true
			}
		}
	}
	return false
}

func (maze *CheckMaze) addWall(x, z int) bool {
	if maze.canPlaceWall(x, z) {
		maze.grid[z][x] = 1
		fmt.Printf("Wall added at (%d, %d)\n", x, z)
		return true
	} else {
		fmt.Printf("Adding wall at (%d, %d) would block the path.\n", x, z)
		return false
	}
}

func (maze *CheckMaze) print() {
	for _, row := range maze.grid {
		fmt.Println(row)
	}
}
