var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let ctx, canvas, container, colorControl;
let GlobalTextColor = "#ffffff", GlobalBoxColor = "#ff0000", GlobalBackgroundColor = "#dddddd", GlobalIncreaments = [2, 0], GlobalScale = 0.6, GlobalDirection = -1; //negative for rigjht to left video
class AnimatedBox {
    constructor(index, Schema, RenderedData) {
        this.sizeData = { width: 300 * GlobalScale, height: 400 * GlobalScale, radius: 50 * GlobalScale };
        this.images = { list: [] };
        this.RenderedData = RenderedData;
        this.dataSchema = Schema;
        this.CalculateSize();
        this.currentX = index * 350 * GlobalScale;
        this.currentY = (canvas.height / 2) - (this.sizeData.height / 2);
        this.drawCursorPosition = this.currentY + 10;
        this.Start(Schema);
    }
    Start(Schema) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let index = 0; index < Schema.length; index++) {
                const element = Schema[index];
                if (element.type !== 'image')
                    continue;
                yield this.LoadImage(this.RenderedData[index]);
            }
            this.CallAll();
        });
    }
    // function for one draw call
    CallAll() {
        if (this.currentX >= canvas.width || this.currentX <= -1 * (this.sizeData.width + 20))
            return this.move();
        this.drawBox();
        let iCount = 0;
        this.dataSchema.forEach((data, index) => {
            // switch statement to see if data is image , text, number
            switch (data.type) {
                case "image":
                    this.DrawImage(this.images.list[iCount]);
                    iCount += 1;
                    break;
                default:
                    this.drawText(this.RenderedData[index]);
                    break;
            }
        });
        this.drawCursorPosition = this.currentY + 10;
        this.move();
    }
    // calculate sizes
    CalculateSize() {
        let height = 10;
        this.dataSchema.forEach((e) => {
            switch (e.type) {
                case 'image':
                    height += 210 * GlobalScale;
                    break;
                default:
                    height += 50 * GlobalScale;
                    break;
            }
        });
        this.sizeData.height = height;
    }
    // draw box method
    drawBox(geometry = {
        x: this.currentX, y: this.currentY, width: this.sizeData.width, height: this.sizeData.height, radius: this.sizeData.radius
    }, colors = [GlobalBoxColor, GlobalBoxColor]) {
        ctx.fillStyle = colors[0];
        ctx.strokeStyle = colors[0];
        ctx.beginPath();
        ctx.roundRect(geometry.x, geometry.y, geometry.width, geometry.height, [geometry.radius, geometry.radius, geometry.radius, geometry.radius]);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }
    // draw text method
    drawText(Text) {
        ctx.fillStyle = GlobalTextColor;
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.fillText(Text, this.currentX + (150) * GlobalScale, this.drawCursorPosition + 20, 170);
        this.drawCursorPosition += 30;
    }
    // draw image method
    LoadImage(ImgSrc) {
        return new Promise((resolve) => {
            let Img = new Image();
            Img.onload = () => {
                this.images.list.push(Img);
                resolve(0);
            };
            Img.src = ImgSrc;
        });
    }
    DrawImage(Img) {
        ctx.drawImage(Img, this.currentX + 75 * GlobalScale, this.drawCursorPosition, 150 * GlobalScale, 200 * GlobalScale);
        this.drawCursorPosition += 205 * GlobalScale;
    }
    // move method
    move(positionX = this.currentX, positionY = this.currentY) {
        // 
        (positionX += GlobalIncreaments[0] * GlobalDirection);
        this.currentX = positionX;
        (positionY += GlobalIncreaments[1]);
        this.currentY = positionY;
    }
}
function fullProcess(NewData) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    canvas = document.getElementById("myCanvas");
    container = document.getElementById("canvas-container");
    colorControl = document.querySelector('.property-control');
    colorControl.style.display = 'block';
    container.style.display = "flex";
    // 
    ctx = canvas.getContext("2d");
    canvas.width = container.clientWidth * GlobalScale;
    canvas.height = container.clientHeight * GlobalScale;
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
    let fieldData = NewData.Extractor();
    // iterating over columns
    recordCanvas(canvas, fieldData.data.length);
    fieldData.data.forEach((element, index) => {
        boxArray.push(new AnimatedBox(index, fieldData.schema, element));
    });
    setInterval(() => {
        ctx.fillStyle = GlobalBackgroundColor;
        ctx.fillRect(0, 0, 1, 1);
    }, 50);
    // 
    setTimeout(() => { animate(boxArray); }, 5000);
}
function animate(boxes) {
    if (boxes[boxes.length - 1].currentX >= canvas.width) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = GlobalBackgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        boxes.forEach((element) => { element.CallAll(); });
        requestAnimationFrame(() => { animate(boxes); });
    }
}
function recordCanvas(canvas, Boxes) {
    //
    let chunks = [];
    return new Promise((resolve, reject) => {
        let canvasStream = canvas.captureStream(24);
        let mediaRecorder = new MediaRecorder(canvasStream, {
            mimeType: 'video/webm; codecs=vp9'
        });
        mediaRecorder.onstart = () => {
            let input = document.querySelector('#progress-message > p');
            input.innerText = 'Recording canvas';
        };
        mediaRecorder.start();
        mediaRecorder.ondataavailable = (evt) => {
            chunks.push(evt.data);
            // console.log(mediaRecorder.state)
        };
        mediaRecorder.requestData();
        mediaRecorder.onstop = (evt) => {
            let blob = new Blob(chunks, { type: "video/mp4" });
            let url = URL.createObjectURL(blob);
            let input = document.querySelector('#progress-message > p');
            input.innerHTML = `Done Recording <br> <a class="view-video" href="${url}" target="_blank">Watch Video</a>`;
            // display the video
            resolve();
        };
        setTimeout(() => { mediaRecorder.stop(); }, (2 * Boxes * 1000) + 1000);
    });
}
//# sourceMappingURL=Boxes.js.map