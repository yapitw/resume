import "./style/index.scss";
import CanvasBG from "./canvas";
let template = require("./main.pug");
document.querySelector("main").innerHTML = template();

new CanvasBG();