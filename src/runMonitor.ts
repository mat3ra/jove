/**
 * What a running job is actually doing, unit by unit.
 *
 * A submitted job used to disappear: the designer stayed on the editing view,
 * and the only way to learn whether anything was happening was to reload and
 * read a status string. The units carry the answer already — each keeps a
 * `statusTrack` of `{ status, trackedAt }` — it was simply never read.
 *
 * Pure, and separate from the component, because the judgements are here: what
 * counts as started, how a duration is derived for a unit still running, and
 * what a run adds up to.
 */

export interface UnitStatusEntry {
    status: string;
    /** Unix seconds. */
    trackedAt: number;
    repetition?: number;
}

/** The shape a wode unit presents; only what the monitor reads. */
export interface MonitorableUnit {
    name?: string;
    flowchartId?: string;
    type?: string;
    status?: string;
    statusTrack?: UnitStatusEntry[];
    repetition?: number;
}

export interface UnitRunRow {
    id: string;
    name: string;
    /** The unit's latest status, e.g. "active", "finished", "error". */
    status: string;
    /** Unix seconds when the unit first left idle. Undefined until it starts. */
    startedAt?: number;
    /** Unix seconds when it reached a terminal status. Undefined while running. */
    finishedAt?: number;
    /**
     * Seconds the unit has run. For one still running this is measured against
     * `now`, so it is a duration so far rather than a final one.
     */
    durationSeconds?: number;
    /** True while the unit is between started and finished. */
    isRunning: boolean;
}

const IDLE_STATUSES = new Set(["idle", ""]);
const TERMINAL_STATUSES = new Set(["finished", "error", "terminated", "timeout"]);

/** Entries for the unit's current repetition, oldest first. */
function currentTrack(unit: MonitorableUnit): UnitStatusEntry[] {
    const repetition = unit.repetition ?? 0;

    return (unit.statusTrack ?? [])
        .filter((entry) => (entry.repetition ?? 0) === repetition)
        .filter((entry) => Number.isFinite(entry.trackedAt))
        .slice()
        .sort((a, b) => a.trackedAt - b.trackedAt);
}

export function getUnitRunRow(unit: MonitorableUnit, now: number): UnitRunRow {
    const track = currentTrack(unit);
    const latest = track[track.length - 1];
    const status = latest?.status ?? unit.status ?? "idle";

    // "Started" is the first entry that is not idle — a unit sitting in the queue
    // has a track but has not begun, and calling that a start would report
    // durations for work that has not happened.
    const started = track.find((entry) => !IDLE_STATUSES.has(entry.status));
    const finished = track.find((entry) => TERMINAL_STATUSES.has(entry.status));

    const startedAt = started?.trackedAt;
    const finishedAt = finished?.trackedAt;
    // `!== undefined`, not truthiness: a timestamp of 0 is a real start, and
    // treating it as "not started" reported a running unit as pending.
    const isRunning = startedAt !== undefined && finishedAt === undefined;

    const durationSeconds =
        startedAt === undefined ? undefined : Math.max((finishedAt ?? now) - startedAt, 0);

    return {
        id: unit.flowchartId ?? unit.name ?? "unit",
        name: unit.name ?? "Unit",
        status,
        startedAt,
        finishedAt,
        durationSeconds,
        isRunning,
    };
}

export function getUnitRunRows(units: MonitorableUnit[] = [], now: number): UnitRunRow[] {
    return units.map((unit) => getUnitRunRow(unit, now));
}

export interface RunSummary {
    total: number;
    finished: number;
    running: number;
    failed: number;
    /** Units not started yet. */
    pending: number;
    /** Seconds from the first unit's start to the last one's end (or now). */
    elapsedSeconds?: number;
    /** finished / total, as a percentage. */
    progressPercent: number;
}

export function getRunSummary(rows: UnitRunRow[], now: number): RunSummary {
    const finished = rows.filter((row) => row.status === "finished").length;
    const failed = rows.filter(
        (row) => TERMINAL_STATUSES.has(row.status) && row.status !== "finished",
    ).length;
    const running = rows.filter((row) => row.isRunning).length;
    const startTimes = rows
        .map((row) => row.startedAt)
        .filter((at): at is number => at !== undefined);
    const isAllSettled = rows.every((row) => TERMINAL_STATUSES.has(row.status));
    const endTimes = rows
        .map((row) => row.finishedAt)
        .filter((at): at is number => at !== undefined);

    return {
        total: rows.length,
        finished,
        running,
        failed,
        pending: rows.length - finished - failed - running,
        elapsedSeconds: startTimes.length
            ? Math.max(
                  (isAllSettled && endTimes.length ? Math.max(...endTimes) : now) -
                      Math.min(...startTimes),
                  0,
              )
            : undefined,
        // Counts finished units only. A run that ends in an error is not
        // "100% complete", and saying so would be the wrong kind of reassuring.
        progressPercent: rows.length ? Math.round((finished / rows.length) * 100) : 0,
    };
}

/**
 * A duration a reader can hold in their head. Seconds below a minute, then
 * minutes, then hours — never "3847 s".
 */
export function formatDuration(seconds?: number): string | undefined {
    if (seconds === undefined || !Number.isFinite(seconds)) return undefined;
    if (seconds < 60) return `${Math.round(seconds)}s`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${Math.round(seconds % 60)}s`;

    const hours = Math.floor(minutes / 60);

    return `${hours}h ${minutes % 60}m`;
}

/** True once every unit has reached a terminal status. */
export function isRunSettled(rows: UnitRunRow[]): boolean {
    return rows.length > 0 && rows.every((row) => TERMINAL_STATUSES.has(row.status));
}
