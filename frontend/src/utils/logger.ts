// @ts-ignore
export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3
}

const Colors = {
	Reset: "\x1b[0m",
	Gray: "\x1b[90m",
	Blue: "\x1b[34m",
	Green: "\x1b[32m",
	Yellow: "\x1b[33m",
	Red: "\x1b[31m"
};

export class Logger {
	constructor(private level: LogLevel = LogLevel.INFO) {}

	private shouldLog(level: LogLevel): boolean {
		return level >= this.level;
	}

	private levelName(level: LogLevel): string {
		return LogLevel[level];
	}

	private levelColor(level: LogLevel): string {
		switch (level) {
			case LogLevel.DEBUG: return Colors.Gray;
			case LogLevel.INFO:  return Colors.Green;
			case LogLevel.WARN:  return Colors.Yellow;
			case LogLevel.ERROR: return Colors.Red;
			default: return Colors.Reset;
		}
	}

	log(level: LogLevel, ...args: any[]) {
		if (this.shouldLog(level)) {
			const tag = `[${this.levelName(level)}]`;
			console.log(tag, ...args);

			// Send log to backend
			// needs a way to be disabled so I can use one socket
			//return ;
			//socket.emit('frontend-log', {
			//	level: this.levelName(level),
			//	args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg)
			//});
		}
	}

	debug(...args: any[]) { this.log(LogLevel.DEBUG, ...args); }
	info(...args: any[])  { this.log(LogLevel.INFO,  ...args); }
	warn(...args: any[])  { this.log(LogLevel.WARN,  ...args); }
	error(...args: any[]) { this.log(LogLevel.ERROR, ...args); }
}
