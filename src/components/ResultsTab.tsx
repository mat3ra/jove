/* eslint-disable react/prop-types */
/* eslint-disable react/no-array-index-key */
import type { Subworkflow } from "@mat3ra/wode";
import type { UnitWithFlowchart } from "./UnitResult";
import Box from "@mui/material/Box";
import setClass from "classnames";
import React from "react";

import type { MonitorableUnit } from "../runMonitor";
import RunMonitor from "./RunMonitor";
import UnitResult from "./UnitResult";

// ---------------------------------------------------------------------------
// Local type definitions replacing webapp-specific imports
// ---------------------------------------------------------------------------

/** Replaces FulfilledProfileState from /imports/client/store/storeTypes */
type JoveProfileState = Record<string, any>;

/** Replaces CorePropertyHolder from /imports/core/entity/CorePropertyHolder */
type JovePropertyHolder = { data: Record<string, any>; source?: any };

/** Replaces Job from /imports/jobs/exports */
type JoveJob = Record<string, any>;

/** Replaces WebappMaterialSchema from /imports/schemas/ts/types */
type JoveWebappMaterialSchema = Record<string, any>;

// ---------------------------------------------------------------------------

export interface ResultsProps {
    name: string;
    subtitle: string;
    unit: UnitWithFlowchart;
    subworkflow: Subworkflow;
    results: JovePropertyHolder["data"][];
}

interface ResultsTabProps {
    className: string;
    id: string;
    role: string;
    job: JoveJob;
    profile: JoveProfileState;
    material: any;
    resultsProperties: ResultsProps[];
    jobProperties: JovePropertyHolder[];
    fetchMaterials: (ids: string[]) => Promise<JoveWebappMaterialSchema[]>;
    EntityNameComponent?: React.ComponentType<{ entity?: any }>;
    DataGridComponent?: React.ComponentType<any>;
    MaterialComponent?: React.ComponentType<any>;
    fileUtils?: {
        downloadAndProcessFile: (
            accountId: string,
            fileConfig: any,
            onSuccess: (contents: string, fileMetadata: any) => void,
            handler: (files: any[], onLoad: any) => void,
        ) => void;
        handleGetSignedURL: (files: any[], onLoad: any) => void;
        handleGetSignedUrlAsCSV: (files: any[], onLoad: any) => void;
    };
    calculateFermiEnergy?: (
        subworkflow: Subworkflow,
        firstResult: any,
        jobProperties: JovePropertyHolder[],
    ) => number | undefined;
    /**
     * Shows what the job is doing above the results, from the units' own status
     * tracks. Opt-in per host, like the rest of the guided designer.
     */
    showRunMonitor?: boolean;
    /** The job's units, in workflow order. Only read when `showRunMonitor`. */
    units?: MonitorableUnit[];
    /** Tail of the job's log, fetched by the host. */
    logText?: string;
    /** False when the deployment has no log feed, as opposed to an empty log. */
    hasLogSource?: boolean;
    /** Unix seconds; durations of running units are measured against it. */
    now?: number;
}

export default function ResultsTab({
    className,
    id,
    role,
    job,
    profile,
    material,
    resultsProperties,
    jobProperties,
    fetchMaterials,
    EntityNameComponent,
    DataGridComponent,
    MaterialComponent,
    fileUtils,
    calculateFermiEnergy,
    showRunMonitor = false,
    units,
    logText,
    hasLogSource,
    now,
}: ResultsTabProps) {
    return (
        <Box className={setClass(className)} id={id} role={role} p={2}>
            {showRunMonitor ? (
                <Box mb={3}>
                    <RunMonitor
                        units={units}
                        logText={logText}
                        hasLogSource={hasLogSource}
                        // The clock is the caller's to own: a component that read it
                        // itself would report a different elapsed time on every
                        // unrelated re-render.
                        now={now ?? Math.floor(Date.now() / 1000)}
                    />
                </Box>
            ) : null}
            <div className="mini-charts">
                {resultsProperties.map((item, index) => {
                    return (
                        <UnitResult
                            status={(item.unit as any).statusCls}
                            key={index}
                            name={item.name}
                            subtitle={item.subtitle}
                            unit={item.unit}
                            subworkflow={item.subworkflow}
                            material={material}
                            results={item.results}
                            profile={profile}
                            job={job}
                            jobProperties={jobProperties}
                            fetchMaterials={fetchMaterials}
                            EntityNameComponent={EntityNameComponent}
                            DataGridComponent={DataGridComponent}
                            MaterialComponent={MaterialComponent}
                            fileUtils={fileUtils}
                            calculateFermiEnergy={calculateFermiEnergy}
                        />
                    );
                })}
            </div>
        </Box>
    );
}
