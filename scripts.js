const canvas = document.getElementById("canvas")
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth - 20
canvas.height = window.innerHeight - 20

const allowPhysics = true

let objs = []

let debugColors = ["red", "green", "blue", "purple", "black", "grey", "orange", "yellow"]
const color = "black"

let cam = [0, 0, 100]
let camRot = [0, 0, 0]
const moveSpeed = 10
// const scaling = 2

function degRad(deg){
    return deg * (Math.PI / 180)
}

class Obj{
    constructor(points, edges, faces, wireframe, color, center, passive, faceColors) {
        this.points = points
        this.edges = edges
        this.faces = faces
        this.wireframe = wireframe

        this.faceColors = faceColors
        this.color = color

        this.center = center

        this.passive = passive
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

    const rotationMatrix = this.multiplyMatrices(yawMatrix, this.multiplyMatrices(pitchMatrix, rollMatrix))

    this.points.forEach((p) => {
        ctx.fillStyle = p[3]

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

            ctx.fillRect(px, py, 1, 1)
        }
    })

    if (this.wireframe) {
        this.edges.forEach(e => {
            const point1 = projectedPoints[e[0]]
            const point2 = projectedPoints[e[1]]

            if (point1 && point2 && point1[2] < 0 && point2[2] < 0) {
                ctx.beginPath()
                ctx.moveTo(point1[0], point1[1])
                ctx.lineTo(point2[0], point2[1])
                ctx.stroke()
            }
        })
    } else {
        this.faces.forEach((f, i) => {
            ctx.fillStyle = this.faceColors[i]
            ctx.beginPath()
            f.forEach(p => {
                if (projectedPoints[p] && projectedPoints[p][2] < 0) {
                    ctx.lineTo(projectedPoints[p][0], projectedPoints[p][1])
                }
            })
            ctx.fill()
        })
    }
}

    multiplyMatrices(a, b) {
        let result = []
        for (let i = 0; i < a.length; i++) {
            result[i] = []
            for (let j = 0 ;j < b[0].length; j++) {
                let sum = 0
                for (let k = 0; k < a[0].length; k++) {
                    sum += a[i][k] * b[k][j]
                }
                result[i][j] = sum
            }
        }
        return result
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
    

    updatePhysics(){
        objs.forEach((obj) => {
            if(obj === this)
                return
            let checked = obj.check(this.points)
            if(checked){
                //stuff
            }
        })
    }

    check(points) {
        let done = false
        points.forEach(p => {
            this.faces.forEach(face => {
                let averages = [0, 0, 0]
                face.forEach(i => {
                    averages[0] += this.points[i][0]
                    averages[1] += this.points[i][1]
                    averages[2] += this.points[i][2]
                })
                averages[0] /= face.length
                averages[1] /= face.length
                averages[2] /= face.length
    
                const [i1, i2, i3] = face
                const vec1 = [
                    this.points[i2][0] - this.points[i1][0],
                    this.points[i2][1] - this.points[i1][1],
                    this.points[i2][2] - this.points[i1][2]
                ]
                const vec2 = [
                    this.points[i3][0] - this.points[i1][0],
                    this.points[i3][1] - this.points[i1][1],
                    this.points[i3][2] - this.points[i1][2]
                ]
                const normal = [
                    vec1[1] * vec2[2] - vec1[2] * vec2[1],
                    vec1[2] * vec2[0] - vec1[0] * vec2[2],
                    vec1[0] * vec2[1] - vec1[1] * vec2[0]
                ]
    
                const vecToPoint = [
                    p[0] - averages[0],
                    p[1] - averages[1],
                    p[2] - averages[2]
                ]
    
                const dot = (vecToPoint[0] * normal[0]) +(vecToPoint[1] * normal[1]) + (vecToPoint[2] * normal[2])
    
                if (dot < 0) done = true
            })
        })
    
        return !done
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
        -sinPitch,             
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

objs.push(createCube([0, 0, 0], 50, true, "red", false))
objs.push(createRectangularPrism([0, 0, 0], 10, 20, 30, false, "blue", true, new Array(6).fill("black")))

function render(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    objs.forEach(o => {
        if(!o.passive)
            o.updatePhysics
        o.render()
    })

    requestAnimationFrame(render)
}
render()