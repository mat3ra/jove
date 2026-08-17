import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import LogViewer from "@mat3ra/cove/dist/mui/components/log-viewer/LogViewer";
import MetricTile from "@mat3ra/cove/dist/mui/components/metric/MetricTile";
import SegmentedMeter from "@mat3ra/cove/dist/mui/components/metric/SegmentedMeter";
import { JobStatusChip } from "@mat3ra/cove/dist/mui/components/status/StatusChip";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatDuration, getRunSummary, getUnitRunRows, isRunSettled } from "../runMonitor";
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
export default function RunMonitor({ units = [], logText, hasLogSource = true, now, id = "run-monitor", }) {
    const rows = getUnitRunRows(units, now);
    const summary = getRunSummary(rows, now);
    const settled = isRunSettled(rows);
    return (_jsxs(Stack, { spacing: 2, id: id, children: [_jsxs(Paper, { sx: { p: 2 }, children: [_jsxs(Stack, { direction: "row", spacing: 3, flexWrap: "wrap", useFlexGap: true, children: [_jsx(MetricTile, { id: "run-monitor-progress", label: "Units", value: `${summary.finished}/${summary.total}`, caption: settled ? "run complete" : "finished", tone: summary.failed ? "error" : "default" }), _jsx(MetricTile, { id: "run-monitor-elapsed", label: settled ? "Took" : "Elapsed", value: formatDuration(summary.elapsedSeconds), caption: summary.elapsedSeconds === undefined ? "not started" : undefined }), _jsx(MetricTile, { id: "run-monitor-running", label: "Running now", value: summary.running, caption: summary.pending ? `${summary.pending} to come` : undefined }), summary.failed ? (_jsx(MetricTile, { id: "run-monitor-failed", label: "Failed", value: summary.failed, tone: "error", caption: "see the units below" })) : null] }), summary.total ? (_jsx(Box, { sx: { mt: 2 }, children: _jsx(SegmentedMeter, { id: "run-monitor-meter", total: summary.total, caption: `${summary.progressPercent}%`, segments: [
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
                            ] }) })) : null] }), _jsxs(Paper, { sx: { p: 2 }, children: [_jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "Units" }), _jsx(Stack, { divider: _jsx(Box, { sx: { borderTop: "1px solid", borderColor: "divider" } }), children: rows.length ? (rows.map((row) => _jsx(UnitRunRowView, { row: row }, row.id))) : (_jsx(Typography, { variant: "body2", color: "text.secondary", children: "This job has no units to report on." })) })] }), _jsx(Paper, { sx: { p: 2 }, children: _jsx(LogViewer, { id: "run-monitor-log", label: "Job log", text: logText, isLive: !settled, emptyMessage: hasLogSource
                        ? "No output yet."
                        : "This deployment does not provide a log feed." }) })] }));
}
/** One unit's line: what it is, where it got to, and how long that took. */
function UnitRunRowView({ row }) {
    const duration = formatDuration(row.durationSeconds);
    return (_jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", id: `run-monitor-unit-${row.id}`, "data-status": row.status, sx: { py: 1 }, children: [_jsx(Box, { sx: { flexGrow: 1, minWidth: 0 }, children: _jsx(Typography, { variant: "body2", noWrap: true, children: row.name }) }), _jsx(Typography, { variant: "caption", color: "text.secondary", sx: { flexShrink: 0 }, children: duration ? (row.isRunning ? `${duration} so far` : duration) : "—" }), _jsx(Box, { sx: { flexShrink: 0 }, children: _jsx(JobStatusChip, { status: row.status, label: row.status === "idle" ? "Not started" : undefined }) })] }));
}
