class Polygon {
    vertices = [];
    n_poly = 0;
    color;
    constructor(color) {
        this.color = color;
    }

    addVertices(x, y) {
        this.vertices.push(x, y);
        this.n_poly += 1;
    }

    changeLastVertices(x, y) {
        this.vertices[this.n_poly * 2 - 2] = x;
        this.vertices[this.n_poly * 2 - 1] = y;
    }

    changeColor(color) {
        this.color = color;
    }

    prepare(master) {
        if (this.n_poly > 2) {
            master.gl.bufferData(master.gl.ARRAY_BUFFER, new Float32Array(this.vertices), master.gl.STATIC_DRAW);

            this.color.prepare(master);
        }
    }

    draw(master) {
        if (this.n_poly > 2) {
            var primitiveType = master.gl.TRIANGLE_FAN;
            var offset = 0;
            var count = this.n_poly;
            master.gl.drawArrays(primitiveType, offset, count);
        }
    }
}
