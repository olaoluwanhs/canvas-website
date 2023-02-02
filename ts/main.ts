type RoundRectGeo = {
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
};


let ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, container: HTMLDivElement;

window.addEventListener("load", () => {
    canvas = <HTMLCanvasElement>document.getElementById("myCanvas");
    container = <HTMLDivElement>document.getElementById("container");
    ctx = canvas.getContext("2d");
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    // 
    window.addEventListener("resize", () => {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    });
    //
    let boxes: Array<AnimatedBox> = [];
    for (let i = 0; i < 25; i++) {
        boxes.push(new AnimatedBox(i * 350, 60, [-5, 0], "ola.png", 25 - i))
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // let a = 0
    // setInterval(() => { a++; console.log(a) }, 1000)
    recordCanvas(canvas);
    // 
    setTimeout(() => { animate(boxes) }, 4000);
    // while (a < 55) {
    //     if (a < 50) clearInterval(aInt);
    // }


})

class AnimatedBox {
    initialX: number;
    initialY: number;
    currentX: number;
    currentY: number;
    increaments: [number, number];
    img: HTMLImageElement;
    rankings: number;

    constructor(initialX: number, initialY: number, incriments: [number, number], ImgSrc: string | undefined, rankings: number) {
        this.initialX = initialX;
        this.initialY = initialY;
        this.currentX = initialX;
        this.currentY = initialY;
        this.increaments = incriments
        this.Image(ImgSrc).then(() => this.draw());
        this.rankings = rankings;
    }

    drawName() {
        ctx.fillStyle = "white";
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Olaoluwa \n Babatunde", this.currentX + (150), this.currentY + (300), 150)
    }
    drawRanking() {
        ctx.fillStyle = "white";
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${this.rankings}`, this.currentX + (150), this.currentY + (350), 150)
    }

    async Image(ImgSrc: string): Promise<number> {
        return new Promise((resolve) => {
            let Img: HTMLImageElement = new Image();
            Img.onload = () => {
                resolve(0);
            }
            Img.src = ImgSrc
            this.img = Img;
        })
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
            //
            ctx.drawImage(this.img, this.currentX + 75, this.currentY + 70, 150, 200);
            // 
            this.drawName();
            this.drawRanking()
        }

        this.move()
    }

    move(positionX: number = this.currentX, positionY: number = this.currentY) {
        // 
        (positionX += this.increaments[0]);
        this.currentX = positionX;
        (positionY += this.increaments[1]);
        this.currentY = positionY;
    }
}


function animate(boxes: Array<AnimatedBox>) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    boxes.map((element) => { element.draw() })

    // console.log(boxes[boxes.length - 1].currentX);

    if (boxes[boxes.length - 1].currentX >= canvas.width - 400) requestAnimationFrame(() => { animate(boxes) });
}

function recordCanvas(canvas: HTMLCanvasElement): Promise<Function> {
    //
    let chunks = []
    return new Promise((resolve, reject) => {
        let canvasStream = canvas.captureStream(30)

        let mediaRecorder = new MediaRecorder(canvasStream, {
            mimeType: 'video/webm; codecs=vp9'
        });

        mediaRecorder.start(300);

        mediaRecorder.ondataavailable = (evt) => {
            chunks.push(evt.data)
            // if (mediaRecorder.state === 'recording') {
            //     mediaRecorder.stop();
            // }
        };

        mediaRecorder.onstop = (evt) => {
            let blob = new Blob(chunks, { type: "video/mp4" })
            let url = URL.createObjectURL(blob);
            // display the video
            window.open(url, "_blank");
            resolve(mediaRecorder.stop)
        }

        setTimeout(() => { mediaRecorder.stop(); }, 45000)

    })
}
