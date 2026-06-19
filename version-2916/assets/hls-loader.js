import { H as Hls } from "./hls-vendor-dru42stk.mjs";

window.Hls = Hls;
window.dispatchEvent(new Event("hls-ready"));
