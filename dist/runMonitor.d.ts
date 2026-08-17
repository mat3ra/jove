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
export declare function getUnitRunRow(unit: MonitorableUnit, now: number): UnitRunRow;
export declare function getUnitRunRows(units: MonitorableUnit[] | undefined, now: number): UnitRunRow[];
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
export declare function getRunSummary(rows: UnitRunRow[], now: number): RunSummary;
/**
 * A duration a reader can hold in their head. Seconds below a minute, then
 * minutes, then hours — never "3847 s".
 */
export declare function formatDuration(seconds?: number): string | undefined;
/** True once every unit has reached a terminal status. */
export declare function isRunSettled(rows: UnitRunRow[]): boolean;
