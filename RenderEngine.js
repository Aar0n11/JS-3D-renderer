const canvas = document.getElementById("canvas")
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth - 20
canvas.height = window.innerHeight - 20

let objs = []

let cam = [0, 0, 100]
let camRot = [0, 0, 0]
const moveSpeed = 10

function degRad(deg){
    return deg * (Math.PI / 180)
}

function multiplyMatrices(a, b) {
    let result = []
    for (let i = 0; i < 3; i++) {
        result[i] = [];
        for (let j = 0; j < 3; j++) {
            result[i][j] = a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j]
        }
    }
    return result
}

class RenderObject{
    constructor(points, edges, faces, wireframe, color, center, faceColors) {
        this.points = points
        this.edges = edges
        this.faces = faces
        this.wireframe = wireframe

        this.faceColors = faceColors
        this.color = color

        this.center = center
    }

    render() {
        let projectedPoints = []

        const [yaw, pitch, roll] = camRot

        const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw)
        const cosPitch = Math.cos(pitch), sinPitch = Math.sin(pitch)
        const cosRoll = Math.cos(roll), sinRoll = Math.sin(roll)

        const yawMatrix = [
            [cosYaw, 0, sinYaw],
            [0, 1, 0],
            [-sinYaw, 0, cosYaw]
        ]

        const pitchMatrix = [
            [1, 0, 0],
            [0, cosPitch, -sinPitch],
            [0, sinPitch, cosPitch]
        ]

        const rollMatrix = [
            [cosRoll, -sinRoll, 0],
            [sinRoll, cosRoll, 0],
            [0, 0, 1]
        ]

        const rotationMatrix = multiplyMatrices(yawMatrix, multiplyMatrices(pitchMatrix, rollMatrix))

        this.points.forEach((p) => {
            ctx.fillStyle = this.color

            let x = p[0] + this.center[0] - cam[0]
            let y = p[1] + this.center[1] - cam[1]
            let z = p[2] + this.center[2] - cam[2]

            const rotatedPoint = this.multiplyMatrixAndPoint(rotationMatrix, [x, y, z])

            let distZ = rotatedPoint[2]

            if (distZ < 0) {
                const scale = 500 / distZ
                let px = rotatedPoint[0] * scale + canvas.width / 2
                let py = rotatedPoint[1] * scale + canvas.height / 2
                projectedPoints.push([px, py, distZ])
                // ctx.fillRect(px, py, 1, 1)
            }
        })

        return projectedPoints
    }
    
    multiplyMatrixAndPoint(matrix, point) {
        let result = []
        for (let i = 0; i < matrix.length; i++) {
            result[i] = 0
            for (let j = 0; j < point.length; j++) {
                result[i] += matrix[i][j] * point[j]
            }
        }
        return result
    }
}

document.addEventListener("keydown", e => {
    const forwardSpeed = moveSpeed
    const strafeSpeed = moveSpeed

    const [yaw, pitch, roll] = camRot

    const cosYaw = Math.cos(yaw)
    const sinYaw = Math.sin(yaw)
    const cosPitch = Math.cos(pitch)
    const sinPitch = Math.sin(pitch)

    const forward = [
        sinYaw * cosPitch,  
        -sinPitch * sinYaw,             
        cosYaw * -cosPitch    
    ]

    const right = [
        -cosYaw,            
        0,                 
        -sinYaw              
    ]

    switch(e.code) {
        case "KeyW":
            cam[0] += forward[0] * forwardSpeed
            cam[1] += forward[1] * forwardSpeed
            cam[2] += forward[2] * forwardSpeed
            break
        case "KeyS": 
            cam[0] -= forward[0] * forwardSpeed
            cam[1] -= forward[1] * forwardSpeed
            cam[2] -= forward[2] * forwardSpeed
            break
        case "KeyA":
            cam[0] -= right[0] * strafeSpeed
            cam[1] -= right[1] * strafeSpeed
            cam[2] -= right[2] * strafeSpeed
            break
        case "KeyD":
            cam[0] += right[0] * strafeSpeed
            cam[1] += right[1] * strafeSpeed
            cam[2] += right[2] * strafeSpeed
            break
        case "Space":
            cam[1] += moveSpeed
            break
        case "ShiftLeft": 
            cam[1] -= moveSpeed
            break

        case "ArrowLeft": 
            camRot[0] += degRad(10)
            break
        case "ArrowRight": 
            camRot[0] -= degRad(10)
            break
        case "ArrowUp": 
            camRot[1] += degRad(10) 
            break
        case "ArrowDown": 
            camRot[1] -= degRad(10) 
            break
        case "KeyI":
            camRot[2] += degRad(10)
            break
        case "KeyK":
            camRot[2] -= degRad(10)
            break
    }
})

function render() {
    // ctx.lineCap = "round"
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let renderStack = []

    objs.forEach(o => {
        const projectedPoints = o.render()

        projectedPoints.forEach(p => {
            if (p) {
                renderStack.push({ type: 'point', dist: Math.abs(p[2]), point: p })
            }
        })

        if (o.wireframe) {
            o.edges.forEach(e => {
                const point1 = projectedPoints[e[0]];
                const point2 = projectedPoints[e[1]];
                
                if (point1 && point2) {
                    const dist = (point1[2] + point2[2]) / 2
                    renderStack.push({
                        type: 'edge',
                        distance: dist,
                        points: [point1, point2],
                        color: o.color
                    });
                }
            });
        }        

        if (!o.wireframe && o.faces) {
            o.faces.forEach(face => {
                const facePoints = face.map(index => projectedPoints[index]).filter(p => p !== undefined)
                if (facePoints.length === face.length) {
                    const dist = facePoints.reduce((sum, p) => sum + p[2], 0) / facePoints.length
                    renderStack.push({ 
                        type: 'quad', 
                        dist, 
                        points: facePoints,
                        color: o.color
                    })
                }
            })
        }
    })

    renderStack.sort((a, b) => a.dist - b.dist)

    renderStack.forEach(item => {
        if (item.type === 'point') {
            ctx.fillRect(item.point[0], item.point[1], 1, 1)
        } else if (item.type === 'edge') {
            const [point1, point2] = item.points
            ctx.strokeStyle = item.color
            ctx.beginPath()
            ctx.moveTo(point1[0], point1[1])
            ctx.lineTo(point2[0], point2[1])
            ctx.stroke()
        } else if (item.type === 'quad') {
            ctx.fillStyle = item.color
            ctx.beginPath()
            
            item.points.forEach((p, index) => {
                if (index === 0) {
                    ctx.moveTo(p[0], p[1])
                } else {
                    ctx.lineTo(p[0], p[1])
                }
            })
            ctx.closePath()
            ctx.fill()
        }
    })

    requestAnimationFrame(render)
}
render()