import { Logger } from "../utils/logger.js";

import Service from "./service.js";
import MP4Demuxer from "./mp4-demuxer.js";
import CanvasRenderer from "./canvasRenderer.js";
import VideoProcessor from "./video-processor.js";
import WebMWriter from "./../lib/webm-writer2.js";

const qvgaConstraints = {
    width: 320,
    height: 240
};

const vgaConstraints = {
    width: 640,
    height: 480
};

const hdConstraints = {
    width: 1280,
    height: 720
};

const encoderConfig = {
    ...hdConstraints,
    bitrate: 10e6,

    // WebM
    codec: "vp09.00.10.08",
    pt: 4,
    hardwareAcceleration: "prefer-software"

    // MP4
    // codec: "avc1.42002A",
    // pt: 1,
    // hardwareAcceleration: "prefer-hardware"
};

const webmWriterConfig = {
    codec: "VP9",
    width: encoderConfig.width,
    height: encoderConfig.height,
    bitrate: encoderConfig.bitrate
};

const mp4Demuxer = new MP4Demuxer();
const webMWriter = new WebMWriter(webmWriterConfig);
const service = new Service({ url: "http://localhost:3000" });
const videoProcessor = new VideoProcessor({
    mp4Demuxer,
    webMWriter,
    service
});

onmessage = async ({ data }) => {
    Logger.log("[worker] onmessage");
    const renderFrame = CanvasRenderer.getRenderer(data.canvas);

    await videoProcessor.start({
        file: data.file,
        renderFrame,
        encoderConfig,
        sendMessage: (data) => {
            self.postMessage(data);
        }
    });
};
