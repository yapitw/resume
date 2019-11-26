import "./style/index.scss";
import CanvasBG from "./canvas";
let template = require("./main.pug");
document.querySelector("body").innerHTML = template();

new CanvasBG();