import { debugLog } from '../services/debugApi';

type TrackerEntry = {
	count: number;
	events: string[];
};

class DebugTracker {
	private static instance: DebugTracker;
	private entries: Record<string, TrackerEntry> = {};
	private uid: string;

	private constructor() {
		// Generate or reuse a persistent UID per session
		this.uid = sessionStorage.getItem("debugUID") || crypto.randomUUID();
		sessionStorage.setItem("debugUID", this.uid);
	}

	public static getInstance(): DebugTracker {
		if (!DebugTracker.instance) {
			DebugTracker.instance = new DebugTracker();
		}
		return DebugTracker.instance;
	}

	/** Log creation of a component instance */
	public async logCreate(label: string) {
		this._ensureLabel(label);
		this.entries[label].count++;
		this._recordEvent(label, '+1');
		await this._send(label, 1);
	}

	/** Log disposal of a component instance */
	public async logDispose(label: string) {
		this._ensureLabel(label);
		this.entries[label].count--;
		this._recordEvent(label, '-1');
		await this._send(label, -1);
	}

	/** Print current count to console */
	public print(label: string) {
		const count = this.entries[label]?.count ?? 0;
		console.log(`[Tracker] ${label}: ${count}`);
	}

	/** Get internal state (optional usage) */
	public snapshot(): Record<string, TrackerEntry> {
		return this.entries;
	}

	// Internal helpers

	private _ensureLabel(label: string) {
		if (!this.entries[label]) {
			this.entries[label] = { count: 0, events: [] };
		}
	}

	private _recordEvent(label: string, deltaSign: '+1' | '-1') {
		const timestamp = new Date().toISOString();
		this.entries[label].events.push(`[${deltaSign}] ${timestamp}`);
	}

	private async _send(label: string, delta: 1 | -1) {
		try {
			await debugLog({
				label,
				delta,
				uid: this.uid
			});
		} catch (err) {
			console.warn(`❌ Failed to send debug log for ${label}:`, err);
		}
	}
}

export const debugTracker = DebugTracker.getInstance();
