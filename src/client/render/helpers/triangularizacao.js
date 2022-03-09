function getCoordByIndex(coords, index) {
    return [coords[index*3], coords[index*3+1], coords[index*3+2]];
}

function getDistance(a, b) {
    return Math.abs(a-b);
}

let coords = [
    -1815.6425986252725,
    -1860.1317850751802,
    0,
    -1815.6425986252725,
    2346.795968945138,
    0,
    1710.0683137793094,
    2346.795968945138,
    0,
    1710.0683137793094,
    -1860.1317850751802,
    0
];

let indices = [
    0,
    3,
    1,
    3,
    2,
    1
];
let floorLeft = getCoordByIndex(coords, 0);
let floorRight = getCoordByIndex(coords, 3);
let topLeft = getCoordByIndex(coords, 1);
let topRight = getCoordByIndex(coords, 2);

let horizontalDistance = getDistance(floorLeft[0], floorRight[0]);
let verticalDistance = getDistance(topLeft[1], floorLeft[1]);

let N = 50;
let horizontalOffset = horizontalDistance/N;
let verticalOffset = verticalDistance/N;


let newCoords = [];

let newIndices = [];

let startWidth = floorLeft[0];
let startHeight = floorLeft[1];
let goalWidth = topRight[0];
let goalHeight = topRight[1];

let currentBot = startHeight;
let currentTop = currentBot + verticalOffset;
let currentLeft = startWidth;
let currentRight = currentLeft + horizontalOffset;

let numberSquares = 0;

while(currentTop <= goalHeight) {
    currentLeft = startWidth;
    currentRight = currentLeft + horizontalOffset;
    while(currentRight <= goalWidth) {
        newCoords.push(currentLeft, currentBot, 0);
        newCoords.push(currentLeft, currentTop, 0);
        currentLeft = currentRight;
        newCoords.push(currentLeft, currentBot, 0);
        newCoords.push(currentLeft, currentTop, 0);

        const factor = 4*numberSquares;
        
        newIndices.push(factor+0, factor+2, factor+1);
        newIndices.push(factor+3, factor+2, factor+1);

        currentRight = currentLeft + horizontalOffset;
        numberSquares++;
    }
    currentBot = currentTop;
    currentTop = currentBot + verticalOffset;
}
console.log({newCoords});
console.log({newIndices});