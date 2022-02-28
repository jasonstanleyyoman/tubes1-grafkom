const distance = (x1, y1, x2, y2) => {
    return Math.sqrt((Math.pow(x1 - x2, 2)+ Math.pow(y1 - y2, 2)))
}

function hex2dec(n) {
    return parseInt(n,16)
}

// Intersection Line AB - CD
function getIntersectionPoint(A, B, C, D) {
    let a1 = B[1] - A[1];
    let b1 = A[0] - B[0];
    let c1 = a1 * (A[0]) + b1 * (A[1]);

    let a2 = D[1] - C[1];
    let b2 = C[0] - D[0];
    let c2 = a2 * (C[0]) + b2 * (C[1]);

    let det = a1 * b2 - a2 * b1;

    if (det === 0) {
        return { 'x': undefined, 'y': undefined };
    } else {
        let x = (b2 * c1 - b1 * c2) / det;
        let y = (a1 * c2 - a2 * c1) / det
        return { x, y };
    }
}

// Check if point X between point A and B
function checkBetween2Point(X, A, B) {
    let temp = distance(X[0], X[1], A[0], A[1]) + distance(X[0], X[1], B[0], B[1]);
    return Math.round(temp) === Math.round(distance(A[0], A[1], B[0], B[1]));
}

// Export & import models
function downloadModel(content, filename = "models.json", contentType = "json") {
    const a = document.createElement("a");
    const blob = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}
  
function exportModel() {
    const data = { current };
    downloadModel(JSON.stringify(data));
}

const loadFile = (e) => {
    const file = e.target.files[0]
    var reader = new FileReader()
    reader.addEventListener('load', function (e) {
      let data = e.target.result
      data = JSON.parse(data)
  
    })
    reader.readAsBinaryString(file)
  }

let exportButton = document.getElementById("export");
exportButton.addEventListener("click", exportModel);

let loadButton = document.getElementById('load')
loadButton.addEventListener('change', loadFile)