import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
import { ENTITY_ICONS } from "@mat3ra/cove/dist/mui/components/icon/entityIcons";
import { Material } from "@mat3ra/made";
import { PropertyName } from "@mat3ra/prode";
import { ResultsView } from "@mat3ra/prove";
import type { BaseUnit, Subworkflow } from "@mat3ra/wode";

/**
 * Helper type — BaseUnit's mixin chain exposes `flowchartId` and `name`
 * at runtime, but tsc cannot infer them through the mixin constructor
 * pattern.  This intersection makes them visible to the type checker.
 */
export type UnitWithFlowchart = BaseUnit & { flowchartId: string; name: string };
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import groupBy from "lodash/groupBy";
import React, { useEffect, useMemo, useState } from "react";
import s from "underscore.string";

import ConvergenceChart from "./ConvergenceChart";

// ---------------------------------------------------------------------------
// Local type definitions replacing webapp-specific imports
// ---------------------------------------------------------------------------

/** Replaces FulfilledProfileState from /imports/client/store/storeTypes */
type JoveProfileState = Record<string, any>;

/** Replaces CorePropertyHolder from /imports/core/entity/CorePropertyHolder */
type JovePropertyHolder = { data: Record<string, any>; source?: any };

/** Replaces Job from /imports/jobs/job */
type JoveJob = Record<string, any>;

/** Replaces WebappMaterialSchema from /imports/schemas/ts/types */
type JoveWebappMaterialSchema = Record<string, any>;

// ---------------------------------------------------------------------------

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
    EntityNameComponent?: React.ComponentType<{ entity?: any }>;
    /** Optional MUI DataGrid component. */
    DataGridComponent?: React.ComponentType<any>;
    /** Optional file utility helpers. */
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
    /** Optional Fermi energy calculator. */
    calculateFermiEnergy?: (
        subworkflow: Subworkflow,
        firstResult: any,
        jobProperties: JovePropertyHolder[],
    ) => number | undefined;
}

export default function UnitResult({
    subworkflow,
    unit,
    name,
    status,
    subtitle,
    results,
    job,
    profile,
    jobProperties,
    material,
    fetchMaterials,
    EntityNameComponent,
    DataGridComponent,
    fileUtils,
    calculateFermiEnergy,
}: UnitResultProps) {
    const [expanded, setExpanded] = useState(true);
    const [activePanel, setActivePanel] = useState(0);

    const resultsByRepetition = Object.values(groupBy(results, "repetition"));

    const materialIds = useMemo(() => {
        return jobProperties
            .filter((holder) => holder.source?.info?.unitId === unit.flowchartId)
            .map(({ data }) => data)
            .filter((data) => data.name === PropertyName.final_structure)
            .map((data) => data.materialId);
    }, [jobProperties, unit.flowchartId]);

    const [materials, setMaterials] = useState<InstanceType<typeof Material>[]>([]);

    useEffect(() => {
        fetchMaterials(materialIds)
            .then((fetchedMaterials) => {
                setMaterials(fetchedMaterials.map((m) => new Material(m)));
            })
            .catch(console.error);
    }, [fetchMaterials, materialIds]);

    type FileMetadata = { key: string; signedUrl: string };
    type OnFileContentsLoad = (contents: string | object[], fileMetadata: FileMetadata) => void;

    const getFileContent = (data: JovePropertyHolder["data"], onSuccess: OnFileContentsLoad) => {
        if (!fileUtils) return;

        const fileConfig = {
            key: (data as any).objectData?.NAME,
            jobId: job?.id,
        };

        const isImageFile = (data as any).filetype === "image";
        const isCSVFile = (data as any).filetype === "csv";

        fileUtils.downloadAndProcessFile(
            profile?.account?.entity?._id,
            fileConfig,
            onSuccess as (contents: string, fileMetadata: FileMetadata) => void,
            (files: FileMetadata[], onFileContentsLoad: any) => {
                if (isImageFile) {
                    const firstFileMetadata = files[0];
                    if (!firstFileMetadata) return;
                    onFileContentsLoad("", firstFileMetadata);
                    return;
                }
                if (isCSVFile) {
                    fileUtils.handleGetSignedUrlAsCSV(files, onFileContentsLoad);
                    return;
                }
                fileUtils.handleGetSignedURL(files, onFileContentsLoad);
            },
        );
    };

    const addFermiEnergy = (repetitionResult: any[], jobProps: JovePropertyHolder[]) => {
        if (repetitionResult.length === 0) {
            return [];
        }
        const firstResult = repetitionResult[0];
        const fermiEnergy = calculateFermiEnergy
            ? calculateFermiEnergy(subworkflow, firstResult, jobProps)
            : undefined;
        return repetitionResult.map((result) => ({
            ...result,
            fermiEnergy,
        }));
    };

    const convergenceSeries = useMemo(() => {
        return subworkflow.convergenceSeries(job?.scopeTrack);
    }, [subworkflow._id, job?.scopeTrack]);

    return (
        <Accordion
            className="unit-results"
            data-tid={s.slugify(`${subworkflow?.name}-${unit?.name}`)}
            expanded={expanded}
            onChange={() => setExpanded(!expanded)}>
            <AccordionSummary expandIcon={<IconByName name="shapes.arrow.down" />}>
                <Box sx={{ backgroundColor: "background.paper", p: 2 }}>
                    {EntityNameComponent ? (
                        <EntityNameComponent entity={material as any} />
                    ) : (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {ENTITY_ICONS?.unit && (
                                <Box component="span">{ENTITY_ICONS.unit}</Box>
                            )}
                            <Box component="span">{name}</Box>
                            {subtitle && (
                                <Box component="span" sx={{ color: "text.secondary", fontSize: "0.85em" }}>
                                    {subtitle}
                                </Box>
                            )}
                            {status && (
                                <Box
                                    component="span"
                                    sx={{ color: "text.secondary", fontSize: "0.75em" }}
                                    onClick={() => setExpanded(!expanded)}>
                                    ({status})
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            </AccordionSummary>
            <Divider />
            <AccordionDetails>
                {subworkflow?.hasConvergence ? (
                    <>
                        <ConvergenceChart
                            convergenceParamName={subworkflow.convergenceParam ?? ""}
                            convergenceResultName={subworkflow.convergenceResult ?? ""}
                            convergenceSeries={convergenceSeries as any}
                        />
                        {resultsByRepetition.reverse().map((repetitionResult, index) => {
                            const firstResult = repetitionResult[0] as any;

                            const isActivePanel = activePanel === index;
                            const extendedRepetitionResult = addFermiEnergy(
                                repetitionResult,
                                jobProperties,
                            );
                            const entityName = `Iteration: ${(firstResult?.repetition || 0) + 1}`;
                            return (
                                <Box m={2} key={firstResult?.repetition}>
                                    <Accordion
                                        defaultExpanded
                                        expanded={isActivePanel}
                                        onChange={() => {
                                            setActivePanel(isActivePanel ? -1 : index);
                                        }}>
                                        <AccordionSummary
                                            expandIcon={<IconByName name="shapes.arrow.down" />}>
                                            <Box
                                                sx={{
                                                    backgroundColor: "background.paper",
                                                    p: 2,
                                                }}>
                                                <Box component="span">{entityName}</Box>
                                            </Box>
                                        </AccordionSummary>
                                        <Divider />
                                        <AccordionDetails>
                                            <ResultsView
                                                results={extendedRepetitionResult}
                                                extraConfig={{
                                                    material,
                                                    materials: materials as any,
                                                    MaterialComponent: Material as any,
                                                    MaterialComponentProps: {
                                                        profile,
                                                    },
                                                    DataGridComponent,
                                                    getFileContent,
                                                } as any}
                                            />
                                        </AccordionDetails>
                                    </Accordion>
                                </Box>
                            );
                        })}
                    </>
                ) : (
                    <ResultsView
                        results={addFermiEnergy(results, jobProperties)}
                        extraConfig={{
                            material,
                            materials: materials as any,
                            MaterialComponent: Material as any,
                            MaterialComponentProps: {
                                profile,
                            },
                            DataGridComponent,
                            getFileContent,
                        } as any}
                    />
                )}
            </AccordionDetails>
        </Accordion>
    );
}
