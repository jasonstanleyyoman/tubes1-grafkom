class Master {
    constructor() {
        this.gl;
        this.canvas;

        this.mouseClicked = false
        this.prevClick = {
            x: 0,
            y: 0
        }
        this.lines = []
        this.squares = []
        this.rectangles = []
        this.activeLine;
        this.activeSquare;
        this.activeRect;

        this.changeLine = false;
        this.changeSquare = false;
        this.currentColor = new Color(255, 0, 0);
    }

    reset() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    reRender() {
        this.reset();

        this.lines.forEach((line) => {
            line.prepare(this);
            line.draw(this);
        })

        this.squares.forEach((square) => {
            square.prepare(this);
            square.draw(this);
        })

        this.rectangles.forEach((rect) => {
            rect.prepare(this);
            rect.draw(this);
        })
    }
}