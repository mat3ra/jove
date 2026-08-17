import React from "react";
import type { MonitorableUnit } from "../runMonitor";
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
export default function RunMonitor({ units, logText, hasLogSource, now, id, }: RunMonitorProps): React.JSX.Element;
