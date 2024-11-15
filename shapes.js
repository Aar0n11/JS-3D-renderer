function createCube(center, size, wireframe, color, faceColors){
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

    return(new RenderObject(points, edges, faces, wireframe, color, center, faceColors))
}

function createRectangularPrism(center, width, height, depth, wireframe, color, faceColors){
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
    
    return(new RenderObject(points, edges, faces, wireframe, color, center, faceColors))
}

function createSphere(subdivisionsX, subdivisionsY, wireframe, color, center, radius) {
    let points = new Array(subdivisionsX * subdivisionsY + 1)
    let edges = []
    let faces = []

    let iteration = 0

    points[subdivisionsX * subdivisionsY + 1] = [0, 0, -radius]

    for (let i = 0; i < subdivisionsX; i++) {
        for (let j = 0; j < subdivisionsY; j++) {
            let angleX = (2 * Math.PI / subdivisionsX) * i
            let angleY = (-Math.PI / 2) + (Math.PI / subdivisionsY) * j

            let psi = angleX  
            let theta = angleY 
            let phi = 0       

            let Rz = [
                [Math.cos(psi), -Math.sin(psi), 0],
                [Math.sin(psi), Math.cos(psi), 0],
                [0, 0, 1]
            ]

            let Ry = [
                [Math.cos(theta), 0, Math.sin(theta)],
                [0, 1, 0],
                [-Math.sin(theta), 0, Math.cos(theta)]
            ]

            let Rx = [
                [1, 0, 0],
                [0, Math.cos(phi), -Math.sin(phi)],
                [0, Math.sin(phi), Math.cos(phi)]
            ]

            let R = multiplyMatrices(multiplyMatrices(Rz, Ry), Rx)

            let pointLocal = [radius, 0, 0]
            let pointWorld = [
                R[0][0] * pointLocal[0] + R[0][1] * pointLocal[1] + R[0][2] * pointLocal[2],
                R[1][0] * pointLocal[0] + R[1][1] * pointLocal[1] + R[1][2] * pointLocal[2],
                R[2][0] * pointLocal[0] + R[2][1] * pointLocal[1] + R[2][2] * pointLocal[2]
            ]

            points[iteration] = pointWorld

            if (i < subdivisionsX - 1 && j < subdivisionsY - 1) {
                let current = iteration
                let nextI = (i + 1) % subdivisionsX
                let nextJ = (j + 1) % subdivisionsY

                faces.push([current, nextI * subdivisionsY + j, nextI * subdivisionsY + nextJ, current + 1])
                faces.push([current + 1, nextI * subdivisionsY + nextJ, current + nextJ, current + nextJ + 1])
            }

            let nextI = (i + 1) % subdivisionsX
            edges.push([iteration, nextI * subdivisionsY + j]);

            if (j < subdivisionsY-1) {
                edges.push([iteration, iteration + 1]);
            }

            iteration++
        }
    }

    for (let j = 0; j < subdivisionsY - 1; j++) {
        let lastRowStart = (subdivisionsX - 1) * subdivisionsY + j
        let lastRowEnd = (subdivisionsX - 1) * subdivisionsY + (j + 1) % subdivisionsY
        let firstRowStart = j
        let firstRowEnd = (j + 1) % subdivisionsY

        faces.push([lastRowStart, firstRowStart, firstRowEnd, lastRowEnd])
    }
    return new RenderObject(points, edges, faces, wireframe, color, center, [], [])
}