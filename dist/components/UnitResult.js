import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
import { ENTITY_ICONS } from "@mat3ra/cove/dist/mui/components/icon/entityIcons";
import { Material } from "@mat3ra/made";
import { PropertyName } from "@mat3ra/prode";
import { ResultsView } from "@mat3ra/prove";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import groupBy from "lodash/groupBy";
import { useEffect, useMemo, useState } from "react";
import s from "underscore.string";
import ConvergenceChart from "./ConvergenceChart";
/** Package-native fallback when no host-injected material viewer is provided. */
function DefaultMaterialComponent({ material: materialProp }) {
    var _a, _b;
    return _jsx(Box, { component: "span", children: (_b = (_a = materialProp === null || materialProp === void 0 ? void 0 : materialProp.name) !== null && _a !== void 0 ? _a : materialProp === null || materialProp === void 0 ? void 0 : materialProp.formula) !== null && _b !== void 0 ? _b : "Material" });
}
export default function UnitResult({ subworkflow, unit, name, status, subtitle, results, job, profile, jobProperties, material, fetchMaterials, EntityNameComponent, DataGridComponent, MaterialComponent = DefaultMaterialComponent, fileUtils, calculateFermiEnergy, }) {
    var _a, _b;
    const [expanded, setExpanded] = useState(true);
    const [activePanel, setActivePanel] = useState(0);
    const resultsByRepetition = Object.values(groupBy(results, "repetition"));
    const materialIds = useMemo(() => {
        return jobProperties
            .filter((holder) => { var _a, _b; return ((_b = (_a = holder.source) === null || _a === void 0 ? void 0 : _a.info) === null || _b === void 0 ? void 0 : _b.unitId) === unit.flowchartId; })
            .map(({ data }) => data)
            .filter((data) => data.name === PropertyName.final_structure)
            .map((data) => data.materialId);
    }, [jobProperties, unit.flowchartId]);
    const [materials, setMaterials] = useState([]);
    useEffect(() => {
        fetchMaterials(materialIds)
            .then((fetchedMaterials) => {
            setMaterials(fetchedMaterials.map((m) => new Material(m)));
        })
            .catch(console.error);
    }, [fetchMaterials, materialIds]);
    const getFileContent = (data, onSuccess) => {
        var _a, _b, _c;
        if (!fileUtils)
            return;
        const fileConfig = {
            key: (_a = data.objectData) === null || _a === void 0 ? void 0 : _a.NAME,
            jobId: job === null || job === void 0 ? void 0 : job.id,
        };
        const isImageFile = data.filetype === "image";
        const isCSVFile = data.filetype === "csv";
        fileUtils.downloadAndProcessFile((_c = (_b = profile === null || profile === void 0 ? void 0 : profile.account) === null || _b === void 0 ? void 0 : _b.entity) === null || _c === void 0 ? void 0 : _c._id, fileConfig, onSuccess, (files, onFileContentsLoad) => {
            if (isImageFile) {
                const firstFileMetadata = files[0];
                if (!firstFileMetadata)
                    return;
                onFileContentsLoad("", firstFileMetadata);
                return;
            }
            if (isCSVFile) {
                fileUtils.handleGetSignedUrlAsCSV(files, onFileContentsLoad);
                return;
            }
            fileUtils.handleGetSignedURL(files, onFileContentsLoad);
        });
    };
    const addFermiEnergy = (repetitionResult, jobProps) => {
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
        return subworkflow.convergenceSeries(job === null || job === void 0 ? void 0 : job.scopeTrack);
    }, [subworkflow._id, job === null || job === void 0 ? void 0 : job.scopeTrack]);
    return (_jsxs(Accordion, { className: "unit-results", "data-tid": s.slugify(`${subworkflow === null || subworkflow === void 0 ? void 0 : subworkflow.name}-${unit === null || unit === void 0 ? void 0 : unit.name}`), expanded: expanded, onChange: () => setExpanded(!expanded), children: [_jsx(AccordionSummary, { expandIcon: _jsx(IconByName, { name: "shapes.arrow.down" }), children: _jsx(Box, { sx: { backgroundColor: "background.paper", p: 2 }, children: EntityNameComponent ? (_jsx(EntityNameComponent, { entity: material })) : (_jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [(ENTITY_ICONS === null || ENTITY_ICONS === void 0 ? void 0 : ENTITY_ICONS.unit) && (_jsx(Box, { component: "span", children: ENTITY_ICONS.unit })), _jsx(Box, { component: "span", children: name }), subtitle && (_jsx(Box, { component: "span", sx: { color: "text.secondary", fontSize: "0.85em" }, children: subtitle })), status && (_jsxs(Box, { component: "span", sx: { color: "text.secondary", fontSize: "0.75em" }, onClick: () => setExpanded(!expanded), children: ["(", status, ")"] }))] })) }) }), _jsx(Divider, {}), _jsx(AccordionDetails, { children: (subworkflow === null || subworkflow === void 0 ? void 0 : subworkflow.hasConvergence) ? (_jsxs(_Fragment, { children: [_jsx(ConvergenceChart, { convergenceParamName: (_a = subworkflow.convergenceParam) !== null && _a !== void 0 ? _a : "", convergenceResultName: (_b = subworkflow.convergenceResult) !== null && _b !== void 0 ? _b : "", convergenceSeries: convergenceSeries }), resultsByRepetition.reverse().map((repetitionResult, index) => {
                            const firstResult = repetitionResult[0];
                            const isActivePanel = activePanel === index;
                            const extendedRepetitionResult = addFermiEnergy(repetitionResult, jobProperties);
                            const entityName = `Iteration: ${((firstResult === null || firstResult === void 0 ? void 0 : firstResult.repetition) || 0) + 1}`;
                            return (_jsx(Box, { m: 2, children: _jsxs(Accordion, { defaultExpanded: true, expanded: isActivePanel, onChange: () => {
                                        setActivePanel(isActivePanel ? -1 : index);
                                    }, children: [_jsx(AccordionSummary, { expandIcon: _jsx(IconByName, { name: "shapes.arrow.down" }), children: _jsx(Box, { sx: {
                                                    backgroundColor: "background.paper",
                                                    p: 2,
                                                }, children: _jsx(Box, { component: "span", children: entityName }) }) }), _jsx(Divider, {}), _jsx(AccordionDetails, { children: _jsx(ResultsView, { results: extendedRepetitionResult, extraConfig: {
                                                    material,
                                                    materials: materials,
                                                    MaterialComponent,
                                                    MaterialComponentProps: {
                                                        profile,
                                                    },
                                                    DataGridComponent,
                                                    getFileContent,
                                                } }) })] }) }, firstResult === null || firstResult === void 0 ? void 0 : firstResult.repetition));
                        })] })) : (_jsx(ResultsView, { results: addFermiEnergy(results, jobProperties), extraConfig: {
                        material,
                        materials: materials,
                        MaterialComponent,
                        MaterialComponentProps: {
                            profile,
                        },
                        DataGridComponent,
                        getFileContent,
                    } })) })] }));
}
