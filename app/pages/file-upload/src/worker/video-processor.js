import { Logger } from "../utils/logger.js";

export default class VideoProcessor {
    #mp4Demuxer;
    #webMWriter;
    #service;
    #buffers = [];

    /**
     * @param {object} options
     * @param {import('./mp4-demuxer.js').default} options.mp4Demuxer
     * @param {import('./../deps/webm-writer2.js').default} options.webMWriter
     * @param {import('./service.js').default} options.service
     */
    constructor({ mp4Demuxer, webMWriter, service }) {
        this.#mp4Demuxer = mp4Demuxer;
        this.#webMWriter = webMWriter;
        this.#service = service;
    }

    async start({ file, encoderConfig, renderFrame, sendMessage }) {
        Logger.log("[videoprocessor] #start");

        const stream = file.stream();
        const filename = file.name.split("/").pop().replace(".mp4", "");
        await this.mp4Decoder(stream)
            .pipeThrough(this.encode144p(encoderConfig))
            .pipeThrough(
                this.renderDecodedFramesAndGetEncodedChunks(renderFrame)
            )
            .pipeThrough(this.transformIntoWebM())
            .pipeTo(this.upload(filename, "144p", "webm"));

        sendMessage({ status: "done" });
    }

    /**
     *
     * @param {*} stream
     * @returns {ReadableStream}
     */
    mp4Decoder(stream) {
        Logger.log("[videoprocessor] #mp4Decoder");

        return new ReadableStream({
            start: async (controller) => {
                const decoder = new VideoDecoder({
                    /** @param {VideoFrame} frame */
                    output(frame) {
                        Logger.log(
                            "[videoprocessor] #mp4Decoder #decoder.output:"
                            // frame
                        );
                        controller.enqueue(frame);
                    },
                    error(e) {
                        Logger.error(
                            "[videoprocessor] #mp4Decoder #decoder.error:",
                            e
                        );
                        controller.error(e);
                    }
                });

                return this.#mp4Demuxer.run(stream, {
                    onConfig: async (config) => {
                        Logger.log("[videoprocessor] #mp4Decoder #onConfig");
                        decoder.configure(config);
                    },
                    /** @param {EncodedVideoChunk} chunk */
                    onChunk: (chunk) => {
                        Logger.log("[videoprocessor] #mp4Decoder #onChunk");
                        decoder.decode(chunk);
                    }
                });
            }
        });
    }

    encode144p(encoderConfig) {
        /**
         * @type {VideoEncoder}
         */
        let _encoder;

        const readable = new ReadableStream({
            async start(controller) {
                const { supported } = await VideoDecoder.isConfigSupported(
                    encoderConfig
                );

                if (!supported) {
                    const message =
                        "[videoprocessor] #encode144p #start error: VideoDecoder config is not supported:";
                    Logger.error(message, config);
                    controller.error(message);
                    return;
                }

                _encoder = new VideoEncoder({
                    /**
                     *
                     * @param {EncodedVideoChunk} frame
                     * @param {EncodedVideoChunkMetadata} config
                     */
                    output: (frame, config) => {
                        if (config.decoderConfig) {
                            const decoderConfig = {
                                type: "config",
                                config: config.decoderConfig
                            };
                            controller.enqueue(decoderConfig);
                        }

                        controller.enqueue(frame);
                    },
                    error: (err) => {
                        Logger.error(
                            "[videoprocessor] #encode144p #VideoEncoder error: VideoDecoder config is not supported:",
                            err
                        );
                        controller.error(err);
                    }
                });

                _encoder.configure(encoderConfig);
            }
        });

        const writable = new WritableStream({
            write(frame) {
                _encoder.encode(frame);
                frame.close();
            }
        });

        return {
            readable,
            writable
        };
    }

    renderDecodedFramesAndGetEncodedChunks(renderFrame) {
        /**
         * @type {VideoEncoder}
         */
        let _decoder;

        return new TransformStream({
            start(controller) {
                _decoder = new VideoDecoder({
                    output: (frame) => {
                        renderFrame(frame);
                    },
                    error: (err) => {
                        Logger.error(`[videoprocessor] #renderDecoded`, err);
                        controller.error(err);
                    }
                });
            },
            async transform(encodedChunk, controller) {
                if (encodedChunk.type === "config") {
                    _decoder.configure(encodedChunk.config);
                    return;
                }

                _decoder.decode(encodedChunk);

                // need the encoded version to use webM
                controller.enqueue(encodedChunk);
            }
        });
    }

    transformIntoWebM() {
        const writable = new WritableStream({
            write: (chunk) => {
                this.#webMWriter.addFrame(chunk);
            }
        });

        return {
            readable: this.#webMWriter.getStream(),
            writable
        };
    }

    upload(filename, resolution, type) {
        const chunks = [];
        let byteCount = 0;
        let segments = 0;

        const triggerUpload = async () => {
            segments++;
            const blob = new Blob(chunks, { type: "video/webm" });
            const key = `${filename}-${resolution}-${segments}.${type}`;

            await this.#service.uploadFile({
                buffer: blob,
                filename: key
            });

            console.log(`uploading ${key} with size: ${blob.size}`);

            chunks.length = 0;
            byteCount = 0;
        };

        return new WritableStream({
            async write(chunk) {
                const { data } = chunk;

                chunks.push(data);
                byteCount += data.byteLength;

                if (byteCount <= 10e6) return;

                await triggerUpload();
            },
            async close() {
                if (!chunks.length) return;
                await triggerUpload();
            }
        });
    }
}
