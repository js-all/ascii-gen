import { Canvas, createCanvas, loadImage } from 'canvas'
import fs from 'fs'
import path from 'path'

const size = 20;
const res: Map<string, number> = new Map();

for (let i = 32; i < 127; i++) {
    const chr = String.fromCharCode(i);
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    ctx.font = "monospace " + size + "px";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "white";
    ctx.fillText(chr, size / 2, size / 2);
    res.set(chr, computeCanvasColorAverage(ctx));
};
const array = Array.from(res.entries()).sort((a: [string, number], b: [string, number]) => a[1] - b[1]);

fs.writeFileSync(path.join(__dirname, "/results.json"), JSON.stringify(array), {});
console.log("done");

function computeCanvasColorAverage(ctx: CanvasRenderingContext2D) {
    const data = ctx.getImageData(0, 0, size, size).data;
    const colors: number[] = [];
    for (let i = 0; i < data.length; i += 4) {
        colors.push((data[i], data[i + 1], data[i + 2]) / 3);
    }
    let avg = 0;
    for (let i of colors) {
        avg += i;
    }
    avg /= colors.length;
    return avg;
}
