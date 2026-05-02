import { nativeImage } from "electron";

export function createTrayImage(): Electron.NativeImage {
  const size = 22;
  const buf = Buffer.alloc(size * size * 4, 0);

  function fillCircle(cx: number, cy: number, r: number): void {
    const r2 = r * r;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r2) {
          const i = (y * size + x) * 4;
          buf[i] = 0;
          buf[i + 1] = 0;
          buf[i + 2] = 0;
          buf[i + 3] = 255;
        }
      }
    }
  }

  fillCircle(5, 4, 2.4);
  fillCircle(11, 2.5, 2.4);
  fillCircle(17, 4, 2.4);
  fillCircle(3, 9, 2.4);
  fillCircle(11, 15, 7);

  const image = nativeImage.createFromBuffer(buf, { width: size, height: size });
  if (process.platform === "darwin") image.setTemplateImage(true);
  return image;
}
