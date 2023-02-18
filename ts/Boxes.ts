let ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, container: HTMLDivElement, colorControl: HTMLDivElement;
let GlobalTextColor: string = "#ffffff",
    GlobalBoxColor: string = "#ff0000",
    GlobalBackgroundColor: string = "#dddddd",
    GlobalIncreaments: [number, number] = [2, 0],
    GlobalScale: number = 0.6,
    GlobalDirection: number = -1; //negative for rigjht to left video

type sizeDataType = {
    width: number;
    height: number;
    radius: number;
};

type RoundRectGeo = {
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
};


class AnimatedBox {
    private RenderedData: BoxDataType
    private dataSchema: Array<SchemaType>
    private sizeData: sizeDataType = { width: 300 * GlobalScale, height: 400 * GlobalScale, radius: 50 * GlobalScale }
    currentX: number;
    currentY: number;
    private images: { list: Array<HTMLImageElement> } = { list: [] }
    private drawCursorPosition: number;



    constructor(index: number, Schema: Array<SchemaType>, RenderedData: BoxDataType) {
        this.RenderedData = RenderedData;
        this.dataSchema = Schema;
        this.CalculateSize();
        this.currentX = index * 350 * GlobalScale;
        this.currentY = (canvas.height / 2) - (this.sizeData.height / 2);
        this.drawCursorPosition = this.currentY + 10;
        this.Start(Schema);
    }

    async Start(Schema: SchemaType[]) {
        for (let index = 0; index < Schema.length; index++) {
            const element = Schema[index];
            if (element.type !== 'image') continue;
            await this.LoadImage(this.RenderedData[index])
        }

        this.CallAll();
    }

    // function for one draw call
    CallAll() {
        if (this.currentX >= canvas.width || this.currentX <= -1 * (this.sizeData.width + 20)) return this.move();
        this.drawBox();
        let iCount = 0
        this.dataSchema.forEach((data, index) => {
            // switch statement to see if data is image , text, number
            switch (data.type) {
                case "image":
                    this.DrawImage(this.images.list[iCount]);
                    iCount += 1
                    break;

                default:
                    this.drawText(this.RenderedData[index])
                    break;
            }
        })
        this.drawCursorPosition = this.currentY + 10
        this.move();
    }

    // calculate sizes
    private CalculateSize() {
        let height = 10;
        this.dataSchema.forEach((e) => {
            switch (e.type) {
                case 'image':
                    height += 210 * GlobalScale
                    break;

                default:
                    height += 50 * GlobalScale
                    break;
            }
        })
        this.sizeData.height = height
    }
    // draw box method
    private drawBox(geometry: RoundRectGeo = {
        x: this.currentX, y: this.currentY, width: this.sizeData.width, height: this.sizeData.height, radius: this.sizeData.radius
    }, colors: [string, string] = [GlobalBoxColor, GlobalBoxColor]) {

        ctx.fillStyle = colors[0]
        ctx.strokeStyle = colors[0]
        ctx.beginPath();
        ctx.roundRect(geometry.x, geometry.y, geometry.width, geometry.height, [geometry.radius, geometry.radius, geometry.radius, geometry.radius])
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }

    // draw text method
    private drawText(Text: string) {
        ctx.fillStyle = GlobalTextColor;
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.fillText(Text, this.currentX + (150) * GlobalScale, this.drawCursorPosition + 20, 170)
        this.drawCursorPosition += 30
    }
    // draw image method
    private LoadImage(ImgSrc: string): Promise<number> {
        return new Promise((resolve) => {
            let Img: HTMLImageElement = new Image();
            Img.onload = () => {
                this.images.list.push(Img)
                resolve(0)
            }
            Img.src = ImgSrc
        })
    }
    private DrawImage(Img: HTMLImageElement) {
        ctx.drawImage(Img, this.currentX + 75 * GlobalScale, this.drawCursorPosition, 150 * GlobalScale, 200 * GlobalScale)
        this.drawCursorPosition += 205 * GlobalScale
    }

    // move method
    private move(positionX: number = this.currentX, positionY: number = this.currentY) {
        // 
        (positionX += GlobalIncreaments[0] * GlobalDirection);
        this.currentX = positionX;
        (positionY += GlobalIncreaments[1]);
        this.currentY = positionY;
    }
}

function fullProcess(NewData: NewData) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    canvas = <HTMLCanvasElement>document.getElementById("myCanvas");
    container = <HTMLDivElement>document.getElementById("canvas-container");
    colorControl = document.querySelector('.property-control');
    colorControl.style.display = 'block';

    container.style.display = "flex";

    // 
    ctx = canvas.getContext("2d");
    canvas.width = container.clientWidth * GlobalScale;
    canvas.height = container.clientHeight * GlobalScale
    // 
    window.addEventListener("resize", () => {
        canvas.width = container.clientWidth * GlobalScale;
        canvas.height = container.clientHeight * GlobalScale;
    });

    ctx.fillStyle = GlobalBackgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // List of box array initalized
    const boxArray = [];
    // get data
    let fieldData: RenderedDataType = NewData.Extractor();
    // iterating over columns
    recordCanvas(canvas, fieldData.data.length);
    fieldData.data.forEach((element, index) => {
        boxArray.push(new AnimatedBox(index, fieldData.schema, element))
    })
    setInterval(() => {
        ctx.fillStyle = GlobalBackgroundColor;
        ctx.fillRect(0, 0, 1, 1);
    }, 50)
    // 
    setTimeout(() => { animate(boxArray) }, 5000);
}
function animate(boxes: Array<AnimatedBox>) {
    if (boxes[boxes.length - 1].currentX >= canvas.width) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = GlobalBackgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        boxes.forEach((element) => { element.CallAll() })
        requestAnimationFrame(() => { animate(boxes) });
    }
}

function recordCanvas(canvas: HTMLCanvasElement, Boxes: number): Promise<void> {
    //
    let chunks = []
    return new Promise((resolve, reject) => {
        let canvasStream = canvas.captureStream(24)

        let mediaRecorder = new MediaRecorder(canvasStream, {
            mimeType: 'video/webm; codecs=vp9'
        });

        mediaRecorder.onstart = () => {
            let input: HTMLParagraphElement = document.querySelector('#progress-message > p')
            input.innerText = 'Recording canvas'
        }
        mediaRecorder.start();

        mediaRecorder.ondataavailable = (evt) => {
            chunks.push(evt.data)
            // console.log(mediaRecorder.state)
        };
        mediaRecorder.requestData()

        mediaRecorder.onstop = (evt) => {
            let blob = new Blob(chunks, { type: "video/mp4" })
            let url = URL.createObjectURL(blob);
            let input: HTMLParagraphElement = document.querySelector('#progress-message > p')
            input.innerHTML = `Done Recording <br> <a class="view-video" href="${url}" target="_blank">Watch Video</a>`;
            // display the video
            resolve();
        }
        setTimeout(() => { mediaRecorder.stop(); }, (2 * Boxes * 1000) + 1000)
    })
}