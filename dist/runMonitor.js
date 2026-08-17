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
const IDLE_STATUSES = new Set(["idle", ""]);
const TERMINAL_STATUSES = new Set(["finished", "error", "terminated", "timeout"]);
/** Entries for the unit's current repetition, oldest first. */
function currentTrack(unit) {
    var _a, _b;
    const repetition = (_a = unit.repetition) !== null && _a !== void 0 ? _a : 0;
    return ((_b = unit.statusTrack) !== null && _b !== void 0 ? _b : [])
        .filter((entry) => { var _a; return ((_a = entry.repetition) !== null && _a !== void 0 ? _a : 0) === repetition; })
        .filter((entry) => Number.isFinite(entry.trackedAt))
        .slice()
        .sort((a, b) => a.trackedAt - b.trackedAt);
}
export function getUnitRunRow(unit, now) {
    var _a, _b, _c, _d, _e;
    const track = currentTrack(unit);
    const latest = track[track.length - 1];
    const status = (_b = (_a = latest === null || latest === void 0 ? void 0 : latest.status) !== null && _a !== void 0 ? _a : unit.status) !== null && _b !== void 0 ? _b : "idle";
    // "Started" is the first entry that is not idle — a unit sitting in the queue
    // has a track but has not begun, and calling that a start would report
    // durations for work that has not happened.
    const started = track.find((entry) => !IDLE_STATUSES.has(entry.status));
    const finished = track.find((entry) => TERMINAL_STATUSES.has(entry.status));
    const startedAt = started === null || started === void 0 ? void 0 : started.trackedAt;
    const finishedAt = finished === null || finished === void 0 ? void 0 : finished.trackedAt;
    // `!== undefined`, not truthiness: a timestamp of 0 is a real start, and
    // treating it as "not started" reported a running unit as pending.
    const isRunning = startedAt !== undefined && finishedAt === undefined;
    const durationSeconds = startedAt === undefined ? undefined : Math.max((finishedAt !== null && finishedAt !== void 0 ? finishedAt : now) - startedAt, 0);
    return {
        id: (_d = (_c = unit.flowchartId) !== null && _c !== void 0 ? _c : unit.name) !== null && _d !== void 0 ? _d : "unit",
        name: (_e = unit.name) !== null && _e !== void 0 ? _e : "Unit",
        status,
        startedAt,
        finishedAt,
        durationSeconds,
        isRunning,
    };
}
export function getUnitRunRows(units = [], now) {
    return units.map((unit) => getUnitRunRow(unit, now));
}
export function getRunSummary(rows, now) {
    const finished = rows.filter((row) => row.status === "finished").length;
    const failed = rows.filter((row) => TERMINAL_STATUSES.has(row.status) && row.status !== "finished").length;
    const running = rows.filter((row) => row.isRunning).length;
    const startTimes = rows
        .map((row) => row.startedAt)
        .filter((at) => at !== undefined);
    const isAllSettled = rows.every((row) => TERMINAL_STATUSES.has(row.status));
    const endTimes = rows
        .map((row) => row.finishedAt)
        .filter((at) => at !== undefined);
    return {
        total: rows.length,
        finished,
        running,
        failed,
        pending: rows.length - finished - failed - running,
        elapsedSeconds: startTimes.length
            ? Math.max((isAllSettled && endTimes.length ? Math.max(...endTimes) : now) -
                Math.min(...startTimes), 0)
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
export function formatDuration(seconds) {
    if (seconds === undefined || !Number.isFinite(seconds))
        return undefined;
    if (seconds < 60)
        return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)
        return `${minutes}m ${Math.round(seconds % 60)}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
}
/** True once every unit has reached a terminal status. */
export function isRunSettled(rows) {
    return rows.length > 0 && rows.every((row) => TERMINAL_STATUSES.has(row.status));
}
