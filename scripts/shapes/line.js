class Line {
    x1;
    x2;
    y1;
    y2;
    
    constructor(x1, y1, x2, y2, color) {
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
        this.color = color;
    }

    prepare(master) {
        const positions = [
            this.x1, this.y1,
            this.x2, this.y2
        ]

        master.gl.bufferData(master.gl.ARRAY_BUFFER, new Float32Array(positions), master.gl.STATIC_DRAW);

        this.color.prepare(master);
    }

    draw(master) {
        var primitiveType = master.gl.LINES;
        var offset = 0;
        var count = 2;
        master.gl.drawArrays(primitiveType, offset, count);
    }
}