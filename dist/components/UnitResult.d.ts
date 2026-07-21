import { Material } from "@mat3ra/made";
import type { BaseUnit, Subworkflow } from "@mat3ra/wode";
/**
 * Helper type — BaseUnit's mixin chain exposes `flowchartId` and `name`
 * at runtime, but tsc cannot infer them through the mixin constructor
 * pattern.  This intersection makes them visible to the type checker.
 */
export type UnitWithFlowchart = BaseUnit & {
    flowchartId: string;
    name: string;
};
import React from "react";
/** Replaces FulfilledProfileState from /imports/client/store/storeTypes */
type JoveProfileState = Record<string, any>;
/** Replaces CorePropertyHolder from /imports/core/entity/CorePropertyHolder */
type JovePropertyHolder = {
    data: Record<string, any>;
    source?: any;
};
/** Replaces Job from /imports/jobs/job */
type JoveJob = Record<string, any>;
/** Replaces WebappMaterialSchema from /imports/schemas/ts/types */
type JoveWebappMaterialSchema = Record<string, any>;
interface UnitResultProps {
    name: string;
    subtitle: string;
    status: string;
    unit: UnitWithFlowchart;
    subworkflow: Subworkflow;
    results: JovePropertyHolder["data"][];
    job: JoveJob;
    profile: JoveProfileState;
    jobProperties: JovePropertyHolder[];
    material: InstanceType<typeof Material>;
    fetchMaterials: (ids: string[]) => Promise<JoveWebappMaterialSchema[]>;
    /** Optional component to render entity names. Falls back to a plain span. */
    EntityNameComponent?: React.ComponentType<{
        entity?: any;
    }>;
    /** Optional MUI DataGrid component. */
    DataGridComponent?: React.ComponentType<any>;
    /**
     * Optional host-injected material viewer (e.g. webapp's Material component). Falls back to a
     * plain name display. Must NOT default to the @mat3ra/made Material data class itself - it
     * isn't a React component and rendering it as one throws "Class constructor Material cannot
     * be invoked without 'new'".
     */
    MaterialComponent?: React.ComponentType<any>;
    /** Optional file utility helpers. */
    fileUtils?: {
        downloadAndProcessFile: (accountId: string, fileConfig: any, onSuccess: (contents: string, fileMetadata: any) => void, handler: (files: any[], onLoad: any) => void) => void;
        handleGetSignedURL: (files: any[], onLoad: any) => void;
        handleGetSignedUrlAsCSV: (files: any[], onLoad: any) => void;
    };
    /** Optional Fermi energy calculator. */
    calculateFermiEnergy?: (subworkflow: Subworkflow, firstResult: any, jobProperties: JovePropertyHolder[]) => number | undefined;
}
export default function UnitResult({ subworkflow, unit, name, status, subtitle, results, job, profile, jobProperties, material, fetchMaterials, EntityNameComponent, DataGridComponent, MaterialComponent, fileUtils, calculateFermiEnergy, }: UnitResultProps): React.JSX.Element;
export {};
