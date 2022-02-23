const init = (master) => {
    const canvas = document.getElementById("canvas");
    master.canvas = canvas;
    master.gl = master.canvas.getContext("webgl");

    master.gl.viewport(0, 0, master.canvas.width, master.canvas.height);

    master.gl.clearColor(0, 0, 0, 0);
    master.gl.clear(master.gl.COLOR_BUFFER_BIT);
   
    var vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
    var fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;

    var vertexShader = createShader(master.gl, master.gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(master.gl, master.gl.FRAGMENT_SHADER, fragmentShaderSource);

    var program = createProgram(master.gl, vertexShader, fragmentShader);
    master.gl.useProgram(program);

    const verticesBuffer = master.gl.createBuffer();
    master.gl.bindBuffer(master.gl.ARRAY_BUFFER, verticesBuffer);

    const positionAttributeLocation = master.gl.getAttribLocation(program, "a_position");
    master.gl.enableVertexAttribArray(positionAttributeLocation);
    var size = 2;          // 2 components per iteration
    var type = master.gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    master.gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

    const resolutionUniformLocation = master.gl.getUniformLocation(program, "u_resolution");
    master.gl.uniform2f(resolutionUniformLocation, master.gl.canvas.width, master.gl.canvas.height);

    const colorUniformLocation = master.gl.getUniformLocation(program, "u_color");
    
    master.colorUniformLocation = colorUniformLocation
    master.positionAttributeLocation = positionAttributeLocation
    
    

    initEvent(master);
}

const initEvent = (master) => {

    const colorInput = document.getElementById("color_input")

    colorInput.addEventListener("change", (e) => {
        const value = colorInput.value;
        master.currentColor = new Color(hex2dec(value.slice(1, 3)), hex2dec(value.slice(3, 5)), hex2dec(value.slice(5, 7)));
    })

    master.canvas.addEventListener('mousedown', (e) => {
        master.mouseClicked = true
        const currentPixel = {
            x: e.offsetX - master.canvas.width / 2,
            y: (e.offsetY - master.canvas.height / 2) * -1
        }
        master.prevClick = currentPixel
        const radio = document.getElementsByName("draw");
        radio.forEach(r => {
            if (r.checked) {
                if (r.id === "rectangle") {
                    const newRect = new Square(master.prevClick.x, master.prevClick.y, master.prevClick.x, master.prevClick.y, master.currentColor);
                    master.rectangles.push(newRect);
                    master.activeRect = newRect;
                } else if (r.id === "square") {
                    const newSquare = new Square(master.prevClick.x, master.prevClick.y, master.prevClick.x, master.prevClick.y, master.currentColor);
                    master.squares.push(newSquare);
                    master.activeSquare = newSquare;
                } else if (r.id === "line") {
                    const newLine = new Line(master.prevClick.x, master.prevClick.y, master.prevClick.x, master.prevClick.y, master.currentColor);
                    master.lines.push(newLine);
                    master.activeLine = newLine;
                } else if (r.id === "change_square") {
                    let available = false;
                    let xChange;
                    let yChange;
                    let xAnchor;
                    let yAnchor;
                    for (let i = 0; i < master.squares.length; i++) {
                        const curSquare = master.squares[i];
                        if (Math.abs(curSquare.x1- currentPixel.x) < Math.abs(curSquare.x2 - currentPixel.x)) {
                            xChange = curSquare.x1;
                            xAnchor = curSquare.x2;
                        } else {
                            xChange = curSquare.x2;
                            xAnchor = curSquare.x1;
                        }
                        if (Math.abs(curSquare.y1 - currentPixel.y) < Math.abs(curSquare.y2 - currentPixel.y)) {
                            yChange = curSquare.y1
                            yAnchor = curSquare.y2
                        } else {
                            yChange = curSquare.y2
                            yAnchor = curSquare.y1
                        }

                        if (distance(xChange, yChange, currentPixel.x, currentPixel.y) < 5) {
                            master.activeSquare = master.squares[i]
                            available = true
                            break
                        }
                    }

                    if (available) {
                        master.activeSquare.x2 = xChange;
                        master.activeSquare.x1 = xAnchor;
                        master.activeSquare.y2 = xChange;
                        master.activeSquare.y1 = yAnchor;
                        master.changeSquare = true;
                    }
                }
            }
        })
    })

    master.canvas.addEventListener("mousemove", (e) => {
        if (master.mouseClicked) {
            const radio = document.getElementsByName("draw");
            const currentPixel = {
                x: e.offsetX - master.canvas.width / 2,
                y: (e.offsetY - master.canvas.height / 2) * -1
            }
            radio.forEach(r => {
                if (r.checked) {
                    if (r.id === "rectangle") {
                        master.activeRect.x2 = currentPixel.x;
                        master.activeRect.y2 = currentPixel.y;
                    } else if (r.id === "square") {
                        let newX = currentPixel.x;
                        let newY = currentPixel.y;
                        const deltaX = Math.abs(master.prevClick.x - currentPixel.x)
                        const deltaY = Math.abs(master.prevClick.y - currentPixel.y)
                        if (deltaX < deltaY) {
                            if (master.prevClick.y < currentPixel.y) {
                                newY = master.prevClick.y + deltaX;
                            } else {
                                newY = master.prevClick.y - deltaX;
                            }
                        } else {
                            if (master.prevClick.x < currentPixel.x) {
                                newX = master.prevClick.x + deltaY;
                            } else {
                                newX =  master.prevClick.x - deltaY;
                            }
                        }
                        
                        master.activeSquare.x2 = newX;
                        master.activeSquare.y2 = newY;
                    } else if (r.id === "change_square" && master.changeSquare) {
                        let newX = currentPixel.x;
                        let newY = currentPixel.y;
                        const deltaX = Math.abs(master.activeSquare.x1 - currentPixel.x)
                        const deltaY = Math.abs(master.activeSquare.y1 - currentPixel.y)
                        if (deltaX < deltaY) {
                            if (master.activeSquare.y1 < currentPixel.y) {
                                newY = master.activeSquare.y1 + deltaX;
                            } else {
                                newY = master.activeSquare.y1 - deltaX;
                            }
                        } else {
                            if (master.activeSquare.x1 < currentPixel.x) {
                                newX = master.activeSquare.x1 + deltaY;
                            } else {
                                newX =  master.activeSquare.x1 - deltaY;
                            }
                        }
                        
                        master.activeSquare.x2 = newX;
                        master.activeSquare.y2 = newY;
                    }
                }
            })
            master.reRender()
        }
        
    })

    master.canvas.addEventListener("mouseup", (e) => {
        master.mouseClicked = false
    })
}