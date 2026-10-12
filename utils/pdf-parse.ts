// Dummy polyfills for pdf-parse to prevent ReferenceError in server environment
if (typeof global.DOMMatrix === "undefined") {
  (global as any).DOMMatrix = class DOMMatrix {};
}
if (typeof global.ImageData === "undefined") {
  (global as any).ImageData = class ImageData {};
}
if (typeof global.Path2D === "undefined") {
  (global as any).Path2D = class Path2D {};
}

import * as pdfParseModule from "pdf-parse";
const pdfParse = (pdfParseModule as any).default || pdfParseModule;
export default pdfParse;
