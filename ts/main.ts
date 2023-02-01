type RoundRectGeo = {
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
};


let ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement;

window.addEventListener("load", () => {
    canvas = <HTMLCanvasElement>document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    //
    let boxes: Array<AnimatedBox> = [];
    for (let i = 0; i < 25; i++) {
        boxes.push(new AnimatedBox(i * 350, 150, [-5, 0]))
    }

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    setTimeout(() => { animate(boxes) }, 4000)

})

class AnimatedBox {
    initialX: number;
    initialY: number;
    currentX: number;
    currentY: number;
    increaments: [number, number];

    constructor(initialX: number, initialY: number, incriments: [number, number]) {
        this.initialX = initialX;
        this.initialY = initialY;
        this.currentX = initialX;
        this.currentY = initialY;
        this.increaments = incriments
        this.draw();

    }

    draw(geometry: RoundRectGeo = {
        x: this.currentX, y: this.currentY, width: 300, height: 400, radius: 50
    }, colors: [string, string] = ["#9d29ee", "#9d29ee"]) {

        if (!(this.currentX < 0 || this.currentX > canvas.width) || !(this.currentY < 0 || this.currentY > canvas.height)) {
            ctx.fillStyle = colors[0]
            ctx.strokeStyle = colors[0]
            ctx.beginPath();
            ctx.roundRect(geometry.x, geometry.y, geometry.width, geometry.height, [geometry.radius, geometry.radius, geometry.radius, geometry.radius])
            ctx.stroke();
            ctx.fill();
            ctx.closePath();
        }

        this.move()
    }

    move(positionX: number = this.currentX, positionY: number = this.currentY) {

        (positionX += this.increaments[0]);
        this.currentX = positionX;
        (positionY += this.increaments[1]);
        this.currentY = positionY;

    }
}


function animate(boxes: Array<AnimatedBox>) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    boxes.map((element) => { element.draw() })

    console.log(boxes[boxes.length - 1].currentX);

    if (boxes[boxes.length - 1].currentX >= canvas.width - 400) requestAnimationFrame(() => { animate(boxes) });
}
