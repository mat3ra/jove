import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
    formatDuration,
    getRunSummary,
    getUnitRunRow,
    getUnitRunRows,
    isRunSettled,
} from "../src/runMonitor";

const NOW = 1_000;

const unit = (name: string, track: Array<[string, number]>, extra = {}) => ({
    name,
    flowchartId: `fc-${name}`,
    statusTrack: track.map(([status, trackedAt]) => ({ status, trackedAt })),
    ...extra,
});

describe("getUnitRunRow", () => {
    it("reports a unit that has not started", () => {
        const row = getUnitRunRow(unit("cp", [["idle", 100]]), NOW);
        assert.equal(row.status, "idle");
        assert.equal(row.startedAt, undefined);
        assert.equal(row.durationSeconds, undefined);
        assert.equal(row.isRunning, false);
    });

    it("does not treat sitting in the queue as having started", () => {
        // Otherwise a queued unit reports a duration for work it has not done.
        const row = getUnitRunRow(unit("cp", [["idle", 100]]), NOW);
        assert.equal(row.durationSeconds, undefined);
    });

    it("measures a running unit against now", () => {
        const row = getUnitRunRow(
            unit("cp", [
                ["idle", 100],
                ["active", 400],
            ]),
            NOW,
        );
        assert.equal(row.isRunning, true);
        assert.equal(row.durationSeconds, 600);
        assert.equal(row.finishedAt, undefined);
    });

    it("freezes a finished unit's duration at its end", () => {
        const row = getUnitRunRow(
            unit("cp", [
                ["active", 400],
                ["finished", 700],
            ]),
            NOW,
        );
        assert.equal(row.isRunning, false);
        assert.equal(row.durationSeconds, 300);
        assert.equal(row.finishedAt, 700);
    });

    it("treats an error as an ending, not as still running", () => {
        const row = getUnitRunRow(
            unit("cp", [
                ["active", 400],
                ["error", 500],
            ]),
            NOW,
        );
        assert.equal(row.status, "error");
        assert.equal(row.isRunning, false);
        assert.equal(row.durationSeconds, 100);
    });

    it("reads only the current repetition of a restarted unit", () => {
        // A retried unit carries its first attempt's track too; timing the run
        // from the original start would report a duration spanning the failure.
        const row = getUnitRunRow(
            {
                name: "cp",
                repetition: 1,
                statusTrack: [
                    { status: "active", trackedAt: 100, repetition: 0 },
                    { status: "error", trackedAt: 200, repetition: 0 },
                    { status: "active", trackedAt: 800, repetition: 1 },
                ],
            },
            NOW,
        );
        assert.equal(row.startedAt, 800);
        assert.equal(row.durationSeconds, 200);
    });

    it("counts a unit that started at timestamp zero as running", () => {
        // Truthiness on the start time made 0 read as "never started", so the
        // first unit of a run measured from zero reported itself as pending
        // while it was visibly running.
        const row = getUnitRunRow(
            unit("cp", [
                ["idle", 0],
                ["active", 0],
            ]),
            NOW,
        );
        assert.equal(row.startedAt, 0);
        assert.equal(row.isRunning, true);
        assert.equal(row.durationSeconds, NOW);
    });

    it("survives a unit with no track at all", () => {
        const row = getUnitRunRow({ name: "cp", status: "active" }, NOW);
        assert.equal(row.status, "active");
        assert.equal(row.durationSeconds, undefined);
    });

    it("ignores unreadable timestamps", () => {
        const row = getUnitRunRow(unit("cp", [["active", Number.NaN]]), NOW);
        assert.equal(row.startedAt, undefined);
    });
});

describe("getRunSummary", () => {
    const rows = getUnitRunRows(
        [
            unit("a", [
                ["active", 100],
                ["finished", 300],
            ]),
            unit("b", [
                ["active", 300],
                ["finished", 600],
            ]),
            unit("c", [["active", 600]]),
            unit("d", [["idle", 50]]),
        ],
        NOW,
    );

    it("counts what is done, running and still to come", () => {
        const summary = getRunSummary(rows, NOW);
        assert.deepEqual(
            {
                total: summary.total,
                finished: summary.finished,
                running: summary.running,
                pending: summary.pending,
                failed: summary.failed,
            },
            { total: 4, finished: 2, running: 1, pending: 1, failed: 0 },
        );
    });

    it("measures elapsed from the first start while the run is live", () => {
        assert.equal(getRunSummary(rows, NOW).elapsedSeconds, 900);
    });

    it("stops the clock once every unit has settled", () => {
        const settled = getUnitRunRows(
            [
                unit("a", [
                    ["active", 100],
                    ["finished", 300],
                ]),
                unit("b", [
                    ["active", 300],
                    ["finished", 600],
                ]),
            ],
            NOW,
        );
        assert.equal(getRunSummary(settled, NOW).elapsedSeconds, 500);
        assert.equal(isRunSettled(settled), true);
    });

    it("does not call a failed run complete", () => {
        // 100% next to a red unit would be the wrong kind of reassuring.
        const failed = getUnitRunRows(
            [
                unit("a", [
                    ["active", 100],
                    ["finished", 300],
                ]),
                unit("b", [
                    ["active", 300],
                    ["error", 400],
                ]),
            ],
            NOW,
        );
        const summary = getRunSummary(failed, NOW);
        assert.equal(summary.progressPercent, 50);
        assert.equal(summary.failed, 1);
        assert.equal(isRunSettled(failed), true);
    });

    it("reports nothing elapsed before anything starts", () => {
        const summary = getRunSummary(getUnitRunRows([unit("a", [["idle", 10]])], NOW), NOW);
        assert.equal(summary.elapsedSeconds, undefined);
        assert.equal(summary.progressPercent, 0);
    });

    it("survives a run with no units", () => {
        assert.equal(getRunSummary([], NOW).progressPercent, 0);
        assert.equal(isRunSettled([]), false);
    });
});

describe("formatDuration", () => {
    it("uses units a reader can hold in their head", () => {
        assert.equal(formatDuration(45), "45s");
        assert.equal(formatDuration(90), "1m 30s");
        assert.equal(formatDuration(3847), "1h 4m");
    });

    it("says nothing when there is nothing to say", () => {
        assert.equal(formatDuration(undefined), undefined);
        assert.equal(formatDuration(Number.NaN), undefined);
    });
});
