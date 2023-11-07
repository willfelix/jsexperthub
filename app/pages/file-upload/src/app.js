import View from "./view.js";
import { Logger, Clock } from "./utils/index.js";

let took = "";
const view = new View();
const clock = new Clock();
const worker = new Worker("./src/worker/worker.js", {
    type: "module"
});

worker.onerror = (error) => {
    Logger.error("[app] #worker #onerror:", error);
};

worker.onmessage = ({ data }) => {
    Logger.info("[app] #worker #onmessage:", data);
    if (data.status !== "done") return;

    clock.stop();
    view.updateElapsedTime(`Process took ${took.replace("ago", "")}`);

    if (!data.buffers) return;
    view.downloadBlobAsFile(data.buffers, data.filename);
};

view.configureOnFileChange((file) => {
    Logger.info("[app] configureOnFilechange");
    const canvas = view.getCanvas();
    worker.postMessage({ file, canvas }, [canvas]);

    clock.start((time) => {
        took = time;
        view.updateElapsedTime(`Process started ${time}`);
    });
});

async function fakeFetch() {
    const filePath = "/videos/frag_bunny.mp4";
    const response = await fetch(filePath);
    // // traz o tamanho do arquivo!
    // const response = await fetch(filePath, { method: "HEAD" });
    // const fileSize = response.headers.get('content-length');
    // debugger
    const file = new File([await response.blob()], filePath, {
        type: "video/mp4",
        lastModified: Date.now()
    });

    const event = new Event("change");
    Reflect.defineProperty(event, "target", { value: { files: [file] } });

    document.getElementById("fileUpload").dispatchEvent(event);
}

// fakeFetch()
