/* eslint-disable react/prop-types */
/* eslint-disable react/no-array-index-key */
import type { BaseUnit, Subworkflow } from "@mat3ra/wode";
import Box from "@mui/material/Box";
import setClass from "classnames";
import React from "react";

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
    unit: BaseUnit;
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
    fileUtils,
    calculateFermiEnergy,
}: ResultsTabProps) {
    return (
        <Box className={setClass(className)} id={id} role={role} p={2}>
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
                            fileUtils={fileUtils}
                            calculateFermiEnergy={calculateFermiEnergy}
                        />
                    );
                })}
            </div>
        </Box>
    );
}
