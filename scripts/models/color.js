class Color {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    prepare(master) {
        master.gl.uniform4f(master.colorUniformLocation, this.r / 255, this.g / 255, this.b / 255, 1);
    }
}