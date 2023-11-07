const isActive = false;

export class Logger {
    static log(...message) {
        if (isActive) console.log(...message);
    }

    static error(...message) {
        console.error(...message);
    }

    static info(...message) {
        console.info(...message);
    }
}
