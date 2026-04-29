import { nativeImage } from "electron";

export function createTrayImage(): Electron.NativeImage {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path fill="black" d="M5.8 6.5c-.6 0-1.1-.7-1.1-1.6s.5-1.6 1.1-1.6 1.1.7 1.1 1.6-.5 1.6-1.1 1.6Zm6.4 0c-.6 0-1.1-.7-1.1-1.6s.5-1.6 1.1-1.6 1.1.7 1.1 1.6-.5 1.6-1.1 1.6ZM9 14.7c-3 0-5.1-1.7-5.1-4 0-1.8 1.2-3.2 2.8-3.2.9 0 1.5.4 2.3.4s1.4-.4 2.3-.4c1.6 0 2.8 1.4 2.8 3.2 0 2.3-2.1 4-5.1 4Zm0-2.3c.8 0 1.7-.4 1.7-1.1 0-.5-.4-.8-.9-.8-.3 0-.5.1-.8.1s-.5-.1-.8-.1c-.5 0-.9.3-.9.8 0 .7.9 1.1 1.7 1.1Z"/></svg>`;
  const image = nativeImage.createFromDataURL(
    `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
  );
  image.setTemplateImage(true);
  return image;
}
