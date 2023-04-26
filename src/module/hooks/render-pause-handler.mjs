import {CONST} from "../const.mjs";
import {beautifyHeaders} from "../utils/beautify-headers.mjs";

export const renderPauseHandler = () => {
    const pauseImg = $("#pause img");
    const pauseFig = $("#pause figcaption");

    pauseImg.attr("src", `systems/${CONST.MODULE_ID}/assets/pause.webp`);

    beautifyHeaders(pauseFig);
};
