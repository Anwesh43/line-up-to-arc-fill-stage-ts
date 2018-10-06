const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5

class LineUpToArcFillStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    luta : LineUpToArcFill = new LineUpToArcFill()
    animator : Animator = new Animator()
    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#BDBDBD'
        this.context.fillRect(0, 0, w, h)
        this.luta.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.luta.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.luta.update(() => {
                        this.animator.stop()
                        this.render()
                    })
                })
            })
        }
    }

    static init() {
        const stage : LineUpToArcFillStage = new LineUpToArcFillStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += 0.05 * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class UTAFNode {
    next : UTAFNode
    prev : UTAFNode
    state : State = new State()
    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new UTAFNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        context.fillStyle = '#283593'
        context.strokeStyle = '#283593'
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / 80
        const gap : number = w / (nodes + 1)
        const lsize : number = 2 * gap / 3
        const r : number = gap / 10
        const scale : number = this.state.scale
        context.save()
        context.translate(this.i * gap + gap, h/2)
        if (scale > 0) {
            context.beginPath()
            context.moveTo(-lsize/2, 0)
            context.lineTo(-lsize/2 + lsize * scale, 0)
            context.stroke()
        }
        for (var i = 0; i < 2; i++) {
            const sc = Math.min(0.5, Math.max(scale - 0.5 * i, 0)) * 2
            context.beginPath()
            context.moveTo(0, -2 * r + 4 * r * i)
            for(var k = 0; k <= 361 * sc; k++) {
                const x = r * Math.cos(k * Math.PI/180), y = -2*r + 4 * r * i + r * Math.sin(k * Math.PI/180)
                context.lineTo(x, y)
            }
            context.fill()
        }
        context.restore()
        if (this.prev) {
            this.prev.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) {
        var curr : UTAFNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LineUpToArcFill {

    curr : UTAFNode = new UTAFNode(0)
    dir : number = 1
    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}
