(function() {
  const canvasEl = document.getElementById('canvas');
  const ctx = canvasEl.getContext('2d');
  const CELL_SIZE = 8;
  const WIDTH = 120;
  const HEIGHT = 100;

  class Cell {
    constructor(grid, r, c, alive = false) {
      this.grid = grid;
      this.r = r;
      this.c = c;
      this.alive = alive;
      this.aliveNext = null;
    }

    get neighbors() {
      return this.grid.neighbors(this.r, this.c);
    }

    get livingNeighbors() {
      return this.neighbors
        .filter(n => n.alive)
        .length;
    }

    setNext() {
      const livingNeighbors = this.livingNeighbors;
      if (this.alive) {
        if (livingNeighbors < 2 || livingNeighbors > 3) {
          this.aliveNext = false;
        } else {
          this.aliveNext = true;
        }
      } else {
        if (livingNeighbors === 3) {
          this.aliveNext = true;
        } else {
          this.aliveNext = false;
        }
      }
    }

    toNext() {
      this.alive = this.aliveNext;
    }
  }

  class Grid {
    constructor() {
      this.cols = WIDTH;
      this.rows = HEIGHT;

      canvasEl.width = WIDTH * CELL_SIZE + 1;
      canvasEl.height = HEIGHT * CELL_SIZE + 1;

      // this.globeMode = false;
      this.clearGrid();
    }

    clearGrid() {
      this._cells = new Array(HEIGHT)
        .fill(true) // can't map over undefined
        .map((_, r) => {
          return new Array(WIDTH)
            .fill(true)
            .map((_, c) => new Cell(this, r, c));
        });
    }

    cell(r, c) {
      if (r < 0 || c < 0 || r >= this.rows || c >= this.cols ) {
        return null;
      }

      return this._cells[r][c];
    }

    neighbors(r, c) {
      return [
        this.cell(r - 1, c    ),
        this.cell(r - 1, c + 1),
        this.cell(r    , c + 1),
        this.cell(r + 1, c + 1),
        this.cell(r + 1, c    ),
        this.cell(r + 1, c - 1),
        this.cell(r    , c - 1),
        this.cell(r - 1, c - 1)
      ].filter(cell => cell);
    }

    forEach(fn) {
      this._cells.forEach(row => {
        row.forEach(cell => {
          fn(cell);
        });
      });
    }

    tick() {
      this.forEach(cell => cell.setNext());
      this.forEach(cell => cell.toNext());
    }


  }

  window.Life = window.Life || {};
  window.Life.Grid = Grid;
})();
