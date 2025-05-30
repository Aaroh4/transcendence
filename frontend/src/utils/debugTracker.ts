type TrackerEntry = {
	count: number;
	events: string[];
};

class DebugTracker {
	private static instance: DebugTracker;
	private entries: Record<string, TrackerEntry> = {};

	private constructor() {}

	public static getInstance(): DebugTracker {
		if (!DebugTracker.instance) {
			DebugTracker.instance = new DebugTracker();
		}
		return DebugTracker.instance;
	}

	logCreate(label: string) {
		if (!this.entries[label]) {
			this.entries[label] = { count: 0, events: [] };
		}
		this.entries[label].count++;
		this.entries[label].events.push(`[+1] ${new Date().toISOString()}`);
		this.print(label);
	}

	logDispose(label: string) {
		if (!this.entries[label]) {
			this.entries[label] = { count: 0, events: [] };
		}
		this.entries[label].count--;
		this.entries[label].events.push(`[-1] ${new Date().toISOString()}`);
		this.print(label);
	}

	print(label: string) {
		console.log(`[Tracker] ${label}: ${this.entries[label].count}`);
	}

	snapshot(): Record<string, TrackerEntry> {
		return this.entries;
	}
}

export const debugTracker = DebugTracker.getInstance();
