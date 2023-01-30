let ctx, canvas;
window.addEventListener("load", () => {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    //
    let boxes = [];
    for (let i = 0; i < 50; i++) {
        boxes.push(new AnimatedBox(i * 350, 250, [5, 0]));
    }
    // boxes.forEach((e) => { e.animate() })
});
class AnimatedBox {
    constructor(initialX, initialY, incriments) {
        this.initialX = initialX;
        this.initialY = initialY;
        this.currentX = initialX;
        this.currentY = initialY;
        this.new({
            x: initialX, y: initialY, width: 300, height: 400, radius: 50
        }, ["#9d29ee", "#9d29ee"]);
        this.increaments = incriments;
    }
    new(geometry, colors) {
        ctx.fillStyle = colors[0];
        ctx.strokeStyle = colors[0];
        ctx.beginPath();
        ctx.roundRect(geometry.x, geometry.y, geometry.width, geometry.height, [geometry.radius, geometry.radius, geometry.radius, geometry.radius]);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }
    animate(positionX = this.initialX, positionY = this.initialY) {
        console.log(this.currentX);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.new({
            x: positionX, y: positionY, width: 300, height: 400, radius: 50
        }, ["#9d29ee", "#9d29ee"]);
        (positionX -= this.increaments[0]);
        this.currentX = positionX;
        (positionY -= this.increaments[1]);
        this.currentY = positionY;
        if ((positionX <= canvas.width && positionX >= 0) && (positionY <= canvas.height && positionY >= 0)) {
            requestAnimationFrame(this.animate.bind(this));
        }
    }
}
//# sourceMappingURL=main.js.map