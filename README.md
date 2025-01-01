# Game of War
Based on Conway's Game of Life

## Rule
Two players started with a grid. Each cell in that grid will have a random "difficulty" and to survive in that cell, a player must have that amount of neighbouring cells. The starting position is also randomized.

Each cell that a player own will give 1 production point in the next tick, even if that cell will be dead in the next tick.

An empty cell will automatically claim without production point if:
- there are enough neibouring cells; and
- the player has more neibouring cell than the enemy.

A player can manually claim an empty cell next to their existing cell by spending production point. A player cannot manually claim a cell with difficulty 0.

A player wins if they have production point larger than twice the area of the grid.