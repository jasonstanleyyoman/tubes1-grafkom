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
                    master.renderOrders.push("rect");
                } else if (r.id === "square") {
                    const newSquare = new Square(master.prevClick.x, master.prevClick.y, master.prevClick.x, master.prevClick.y, master.currentColor);
                    master.squares.push(newSquare);
                    master.activeSquare = newSquare;
                    master.renderOrders.push("square");
                } else if (r.id === "line") {
                    const newLine = new Line(master.prevClick.x, master.prevClick.y, master.prevClick.x, master.prevClick.y, master.currentColor);
                    master.lines.push(newLine);
                    master.activeLine = newLine;
                    master.renderOrders.push("line");
                } else if (r.id === "change_line") {
                    let available = false;
                    let xChange;
                    let yChange;
                    let xAnchor;
                    let yAnchor;
                    for (let i = 0; i < master.lines.length; i++) {
                        const curLine = master.lines[i];
                        if (Math.abs(curLine.x1- currentPixel.x) < Math.abs(curLine.x2 - currentPixel.x)) {
                            xChange = curLine.x1;
                            xAnchor = curLine.x2;
                        } else {
                            xChange = curLine.x2;
                            xAnchor = curLine.x1;
                        }
                        if (Math.abs(curLine.y1 - currentPixel.y) < Math.abs(curLine.y2 - currentPixel.y)) {
                            yChange = curLine.y1
                            yAnchor = curLine.y2
                        } else {
                            yChange = curLine.y2
                            yAnchor = curLine.y1
                        }

                        if (distance(xChange, yChange, currentPixel.x, currentPixel.y) < 5) {
                            master.activeLine = master.lines[i]
                            available = true
                            break
                        }
                    }

                    if (available) {
                        master.activeLine.x2 = xChange;
                        master.activeLine.x1 = xAnchor;
                        master.activeLine.y2 = xChange;
                        master.activeLine.y1 = yAnchor;
                        master.changeLine = true;
                    }
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
                } else if (r.id === "polygon" && master.makePoly) {
                    master.activePolygon.addVertices(master.prevClick.x, master.prevClick.y);
                    master.reRender();
                } else if (r.id === "change_polygon") {
                    let getPolygon = false;
                    let i = master.polygons.length - 1;
                    while (!getPolygon && i >= 0) {
                        const poly = master.polygons[i];
                        let j = 0;
                        while (!getPolygon && j < poly.n_poly) {
                            if (distance(currentPixel.x, currentPixel.y, poly.vertices[j * 2], poly.vertices[j * 2 + 1]) < 5) {
                                getPolygon = true;
                                master.changePolygon = true;
                                master.activePolygon = poly;
                                master.changePolyN = j;
                            } 
                            j ++;
                        }
                        i--;
                    }
                } else if (r.id === "change_color_polygon") {
                    let clickPoint = [master.prevClick.x, master.prevClick.y];
                    let clickPointExt = [master.prevClick.x + 600, master.prevClick.y];
                    let i = master.polygons.length - 1;
                    let isInsidePoly = false;
                    while (!isInsidePoly && i >= 0) {
                        const poly = master.polygons[i];
                        const initialPoint = [poly.vertices[0], poly.vertices[1]];
                        let currPoint = [poly.vertices[2], poly.vertices[3]];

                        let intersection = getIntersectionPoint(initialPoint, currPoint, clickPoint, clickPointExt);
                        let poinCheckX = intersection.x === undefined ? clickPoint[0] : intersection.x;
                        let poinCheckY = intersection.y === undefined ? clickPoint[1] : intersection.y;
                        let temp = checkBetween2Point([poinCheckX, poinCheckY], initialPoint, currPoint);
                        if (temp && intersection.x === undefined && intersection.y === undefined) {
                            isInsidePoly = true
                        } else {
                            let isIntersect1, isIntersect2, isIntersect3;
                            isIntersect1 = temp && checkBetween2Point([poinCheckX, poinCheckY], clickPoint, clickPointExt);
                            let j = 4;
                            while (!isInsidePoly && j < poly.vertices.length) {
                                let nextPoint = [poly.vertices[j], poly.vertices[j + 1]];

                                let centralIntersection = getIntersectionPoint(initialPoint, nextPoint, clickPoint, clickPointExt);
                                poinCheckX = centralIntersection.x === undefined ? clickPoint[0] : centralIntersection.x;
                                poinCheckY = centralIntersection.y === undefined ? clickPoint[1] : centralIntersection.y;
                                temp = checkBetween2Point([poinCheckX, poinCheckY], initialPoint, nextPoint);
                                if (temp && centralIntersection.x === undefined && centralIntersection.y === undefined) {
                                    isInsidePoly = true;
                                }
                                isIntersect2 = temp && checkBetween2Point([poinCheckX, poinCheckY], clickPoint, clickPointExt);

                                let shareIntersection = getIntersectionPoint(nextPoint, currPoint, clickPoint, clickPointExt);
                                poinCheckX = shareIntersection.x === undefined ? clickPoint[0] : shareIntersection.x;
                                poinCheckY = shareIntersection.y === undefined ? clickPoint[1] : shareIntersection.y;
                                temp = checkBetween2Point([poinCheckX, poinCheckY], nextPoint, currPoint);
                                if (temp && shareIntersection.x === undefined && shareIntersection.y === undefined) {
                                    isInsidePoly = true;
                                }
                                isIntersect3 = temp && checkBetween2Point([poinCheckX, poinCheckY], clickPoint, clickPointExt);

                                if (!isInsidePoly) {
                                    isInsidePoly = ((isIntersect1 !== isIntersect2) !== isIntersect3) && !(isIntersect1 && isIntersect2 && isIntersect3);
                                }
                                isIntersect1 = isIntersect2;
                                currPoint = nextPoint;
                                j += 2;
                            }
                        }
                        i--;
                    }
                    if (isInsidePoly) {
                        master.activePolygon = master.polygons[i + 1];
                        master.activePolygon.color = master.currentColor;
                        master.reRender();
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
                    } else if (r.id === "line") {
                        master.activeLine.x2 = currentPixel.x;
                        master.activeLine.y2 = currentPixel.y;
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
                    } else if (r.id === "change_line" && master.changeLine) {
                        let newX = currentPixel.x;
                        let newY = currentPixel.y;
                        const deltaX = Math.abs(master.activeLine.x1 - currentPixel.x)
                        const deltaY = Math.abs(master.activeLine.y1 - currentPixel.y)

                        master.activeLine.x2 = newX;
                        master.activeLine.y2 = newY;
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
                                newX = master.activeSquare.x1 - deltaY;
                            }
                        }
                        
                        master.activeSquare.x2 = newX;
                        master.activeSquare.y2 = newY;
                    } else if (r.id === "polygon" && master.makePoly && master.activePolygon.n_poly > 2) {
                        master.activePolygon.changeVertices(master.activePolygon.n_poly - 1, currentPixel.x, currentPixel.y);
                    } else if (r.id === "change_polygon" && master.changePolygon) {
                        if (master.changePolyN !== null) {
                            master.activePolygon.changeVertices(master.changePolyN, currentPixel.x, currentPixel.y);
                        }
                    }
                }
            })
            master.reRender()
        }
        
    })

    master.canvas.addEventListener("mouseup", (e) => {
        master.mouseClicked = false;
        master.changeSquare = false;
        master.changePolygon = false;
        master.changePolyN = null;
    })

    const makePoly = document.getElementById('make_poly');
    makePoly.addEventListener('change', (e) => {
        master.makePoly = makePoly.checked;
        if (master.makePoly) {
            if (master.polygons.length > 0) {
                if (master.polygons[master.polygons.length - 1].n_poly < 3) {
                    let idx = master.renderOrders.lastIndexOf("polygon");
                    master.polygons.pop();
                    master.renderOrders.splice(idx, 1);
                } 
            }
            const newPolygon = new Polygon(master.currentColor);
            master.polygons.push(newPolygon);
            master.activePolygon = newPolygon;
            master.renderOrders.push("polygon");
        }
    })
}
