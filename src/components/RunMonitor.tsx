import LogViewer from "@mat3ra/cove/dist/mui/components/log-viewer/LogViewer";
import MetricTile from "@mat3ra/cove/dist/mui/components/metric/MetricTile";
import SegmentedMeter from "@mat3ra/cove/dist/mui/components/metric/SegmentedMeter";
import { JobStatusChip } from "@mat3ra/cove/dist/mui/components/status/StatusChip";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React from "react";

import type { MonitorableUnit, UnitRunRow } from "../runMonitor";
import { formatDuration, getRunSummary, getUnitRunRows, isRunSettled } from "../runMonitor";

export interface RunMonitorProps {
    /** The job's units, in workflow order. */
    units?: MonitorableUnit[];
    /**
     * Tail of the job's log. The host fetches it — job-designer injects a reader
     * through `setDependencies()`; without one the panel says so rather than
     * pretending the job is silent.
     */
    logText?: string;
    /** False when the host has no log source at all, as opposed to an empty log. */
    hasLogSource?: boolean;
    /**
     * Unix seconds, for measuring durations of units still running. Passed in
     * rather than read from the clock so the component stays testable and a
     * re-render does not silently change what it reports.
     */
    now: number;
    id?: string;
}

/**
 * What a submitted job is doing, while it does it.
 *
 * A job used to disappear at submit: the designer stayed on the editing view,
 * and the only way to find out whether anything was happening was to reload and
 * read a status string. Every unit already carries a `statusTrack`; this reads
 * it — which unit is running, how long each took, what is left — and tails the
 * log beside it.
 *
 * It settles rather than switching: when the last unit reaches a terminal
 * status the same rows become the record of the run, so the reader is not
 * moved somewhere else at the moment they most want to look.
 */
export default function RunMonitor({
    units = [],
    logText,
    hasLogSource = true,
    now,
    id = "run-monitor",
}: RunMonitorProps) {
    const rows = getUnitRunRows(units, now);
    const summary = getRunSummary(rows, now);
    const settled = isRunSettled(rows);

    return (
        <Stack spacing={2} id={id}>
            <Paper sx={{ p: 2 }}>
                <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                    <MetricTile
                        id="run-monitor-progress"
                        label="Units"
                        value={`${summary.finished}/${summary.total}`}
                        caption={settled ? "run complete" : "finished"}
                        tone={summary.failed ? "error" : "default"}
                    />
                    <MetricTile
                        id="run-monitor-elapsed"
                        label={settled ? "Took" : "Elapsed"}
                        value={formatDuration(summary.elapsedSeconds)}
                        caption={summary.elapsedSeconds === undefined ? "not started" : undefined}
                    />
                    <MetricTile
                        id="run-monitor-running"
                        label="Running now"
                        value={summary.running}
                        caption={summary.pending ? `${summary.pending} to come` : undefined}
                    />
                    {summary.failed ? (
                        <MetricTile
                            id="run-monitor-failed"
                            label="Failed"
                            value={summary.failed}
                            tone="error"
                            caption="see the units below"
                        />
                    ) : null}
                </Stack>

                {summary.total ? (
                    <Box sx={{ mt: 2 }}>
                        <SegmentedMeter
                            id="run-monitor-meter"
                            total={summary.total}
                            caption={`${summary.progressPercent}%`}
                            segments={[
                                {
                                    label: "Finished",
                                    value: summary.finished,
                                    color: "success.main",
                                },
                                ...(summary.failed
                                    ? [
                                          {
                                              label: "Failed",
                                              value: summary.failed,
                                              color: "error.main",
                                          },
                                      ]
                                    : []),
                                {
                                    label: "Running",
                                    value: summary.running,
                                    color: "warning.main",
                                    isProjected: true,
                                },
                            ]}
                        />
                    </Box>
                ) : null}
            </Paper>

            <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Units
                </Typography>
                <Stack divider={<Box sx={{ borderTop: "1px solid", borderColor: "divider" }} />}>
                    {rows.length ? (
                        rows.map((row) => <UnitRunRowView key={row.id} row={row} />)
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            This job has no units to report on.
                        </Typography>
                    )}
                </Stack>
            </Paper>

            <Paper sx={{ p: 2 }}>
                <LogViewer
                    id="run-monitor-log"
                    label="Job log"
                    text={logText}
                    isLive={!settled}
                    emptyMessage={
                        hasLogSource
                            ? "No output yet."
                            : "This deployment does not provide a log feed."
                    }
                />
            </Paper>
        </Stack>
    );
}

/** One unit's line: what it is, where it got to, and how long that took. */
function UnitRunRowView({ row }: { row: UnitRunRow }) {
    const duration = formatDuration(row.durationSeconds);

    return (
        <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            id={`run-monitor-unit-${row.id}`}
            data-status={row.status}
            sx={{ py: 1 }}
        >
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap>
                    {row.name}
                </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                {/* A running unit's duration is "so far", and saying so stops the
                    number reading as a final measurement. */}
                {duration ? (row.isRunning ? `${duration} so far` : duration) : "—"}
            </Typography>
            <Box sx={{ flexShrink: 0 }}>
                {/* "idle" is a unit status, not a job one, so cove's mapping resolves
                    it to the neutral Unknown presentation — correct tone, wrong
                    word. The label is overridden; the rest of the vocabulary
                    (active, finished, error, terminated) is shared. */}
                <JobStatusChip
                    status={row.status}
                    label={row.status === "idle" ? "Not started" : undefined}
                />
            </Box>
        </Stack>
    );
}
