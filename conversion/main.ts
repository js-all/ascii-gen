import { createCanvas, loadImage } from 'canvas'
import { ADDRCONFIG } from 'dns';
import _fs from 'fs';
import path from 'path'

const { promises: fs } = _fs;
const rel = (p: string) => path.join(__dirname, p);

const image = process.argv[2];
const width = parseInt(process.argv[3]);
const height = parseInt(process.argv[4]);

(async () => {
    let resString = "";
    if (image === undefined) {
        throw new Error("no path to image given");
    }
    const loadedJson = <[string, number][]>JSON.parse(await (await fs.readFile(rel('../gen/results.json'))).toString());
    // a list of every UTF-16 characters
    // and their "light" value, ( how white
    // the drawn character is )
    const lettersIndex = <Map<string, number>>new Map(loadedJson);
    const loadedImg = await loadImage(image);
    const w = isNaN(width) ? loadedImg.width : width;
    const h = isNaN(height) ? loadedImg.height : height;
    const letterMax = Math.max(...Array.from(lettersIndex.values()));
    const letterMin = Math.min(...Array.from(lettersIndex.values()));

    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(loadedImg, 0, 0, w, h);

    const data = ctx.getImageData(0, 0, w, h).data;

    for (let i = 0; i < data.length; i += 4) {
        const color = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const mappedColor = color / 255 * (letterMax - letterMin) + letterMin;
        const chr = Array.from(lettersIndex.entries()).reduce((a, b) => {
            const aDiff = Math.abs(a[1] - mappedColor);
            const bDiff = Math.abs(b[1] - mappedColor);

            if (aDiff == bDiff) {
                return a > b ? a : b;
            } else {
                return bDiff < aDiff ? b : a;
            }
        })[0];
        resString += chr;
        if (i > 0 && (i + 4) % (w * 4) === 0) resString += "\n";
    }

    await fs.writeFile(rel("/results.txt"), resString);
    console.log("done !");
})();

