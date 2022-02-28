class Master {
    constructor() {
        this.gl;
        this.canvas;

        this.mouseClicked = false
        this.prevClick = {
            x: 0,
            y: 0
        }
        this.renderOrders = []; // "line", "square", "rect", "polygon"
        this.lines = [];
        this.squares = [];
        this.rectangles = [];
        this.polygons = [];
        this.activeLine;
        this.activeSquare;
        this.activeRect;
        this.activePolygon;
        this.makePolygon = false;

        this.changeLine = false;
        this.changeSquare = false;
        this.changePolygon = false;
        this.changePolyN = null;
        this.currentColor = new Color(255, 0, 0);
    }

    reset() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    reRender() {
        this.reset();
        let l = 0, s = 0, r = 0, p = 0;

        this.renderOrders.forEach((obj) => {
            if (obj === "line") {
                this.lines[l].prepare(this);
                this.lines[l].draw(this);
                l++;
            } else if (obj === "square") {
                this.squares[s].prepare(this);
                this.squares[s].draw(this);
                s++;
            } else if (obj === "rect") {
                this.rectangles[r].prepare(this);
                this.rectangles[r].draw(this);
                r++;
            } else if (obj === "polygon") {
                this.polygons[p].prepare(this);
                this.polygons[p].draw(this);
                p++;
            }
        })
    }
}
