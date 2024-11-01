function createCube(center, size, wireframe, color, passive, faceColors){
    let points = []
    points.push(
        [size,   size, size, color],
        [-size,   size, size, color],
        [-size,   -size, size, color],
        [-size,   -size, -size, color],
        [size,   -size, size, color],
        [size,   -size, -size, color],
        [size,   size, -size, color],
        [-size,   size, -size, color]
    )

    let edges = [
        [0, 4],
        [0, 1],
        [0, 6],
        [1, 7],
        [1, 2],
        [2, 4],
        [2, 3],
        [3, 7],
        [3, 5],
        [4, 5],
        [5, 6],
        [6, 7]
    ]

    let faces = [
        [3, 5, 6, 7],
        [1, 0, 6, 7],
        [1, 2, 3, 7],
        [3, 2, 4, 5],
        [4, 5, 6, 0],
        [2, 4, 0, 1]
    ]

    return(new Obj(points, edges, faces, wireframe, color, center, passive, faceColors))
}

function createRectangularPrism(center, width, height, depth, wireframe, color, passive, faceColors){
    let points = [
        [ width/2,  height/2,  depth/2, color],
        [-width/2,  height/2,  depth/2, color],
        [-width/2, -height/2,  depth/2, color],
        [ width/2, -height/2,  depth/2, color],
        [ width/2,  height/2, -depth/2, color],
        [-width/2,  height/2, -depth/2, color],
        [-width/2, -height/2, -depth/2, color],
        [ width/2, -height/2, -depth/2, color]
    ]
    

    const edges = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 4],
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7]
    ];
    

    const faces = [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [1, 5, 6, 2],
        [0, 3, 7, 4],
        [0, 1, 5, 4],
        [3, 2, 6, 7]
    ];
    
    return(new Obj(points, edges, faces, wireframe, color, center, passive, faceColors))
}