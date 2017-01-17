(function() {
  const canvasEl = document.getElementById('canvas');
  const ctx = canvasEl.getContext('2d');
  const CELL_SIZE = 8;
  const WIDTH = 140;
  const HEIGHT = 80;
  const BLACK = '#111';
  const WHITE = '#EEE';
  const GRAY = '#888';

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

    render() {
      ctx.fillStyle = this.alive ? BLACK : WHITE;
      ctx.fillRect(
        CELL_SIZE * this.c,
        CELL_SIZE * this.r,
        CELL_SIZE,
        CELL_SIZE
      );

      ctx.strokeStyle = GRAY;
      ctx.strokeRect(
        CELL_SIZE * this.c,
        CELL_SIZE * this.r,
        CELL_SIZE,
        CELL_SIZE
      );
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
      this.forEach(cell => cell.render());
    }

    render() {
      this.forEach(cell => cell.render());
    }

    getCellByPixel(x, y) {
      const rowIndex = parseInt(y / CELL_SIZE);
      const colIndex = parseInt(x / CELL_SIZE);
      return this.cell(rowIndex, colIndex);
    }
  }

  class Game {
    constructor() {
      this.grid = new Grid();
      canvas.addEventListener('mousedown', handleClickCanvas);
      document
        .getElementById('play')
        .addEventListener('click', handleClickPlay);
      document
        .getElementById('pause')
        .addEventListener('click', handleClickPause);
      document
        .getElementById('clear')
        .addEventListener('click', handleClickClear);


      this.grid.render();
    }

    play() {
      this.interval = setInterval(() => {
        this.grid.tick();
      }, 150);
    }

    pause() {
      clearInterval(this.interval);
    }

    clear() {
      this.pause();
      this.grid.clearGrid();
    }

  }

  window.game = new Game();

  function handleClickPlay() {
    window.game.play();
  }

  function handleClickPause() {
    window.game.pause();
  }

  function handleClickClear() {
    window.game.pause();
    window.game.grid.clearGrid();
    window.game.grid.render();
  }

  function handleClickCanvas(e) {
    const cell = window.game.grid.getCellByPixel(e.offsetX, e.offsetY);
    const paintWithLife = !cell.alive;
    cell.alive = !cell.alive;
    cell.render();

    canvas.addEventListener('mousemove', handleClickedDragCanvas);
    document.addEventListener('mouseup', function () {
      canvas.removeEventListener('mousemove', handleClickedDragCanvas);
    })

    function handleClickedDragCanvas(e) {
      const draggedCell = window.game.grid.getCellByPixel(e.offsetX, e.offsetY);
      if (draggedCell.alive !== paintWithLife) {
        draggedCell.alive = paintWithLife;
        draggedCell.render();
      }
    }

  }

})();
