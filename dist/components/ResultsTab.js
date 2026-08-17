import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from "@mui/material/Box";
import setClass from "classnames";
import RunMonitor from "./RunMonitor";
import UnitResult from "./UnitResult";
export default function ResultsTab({ className, id, role, job, profile, material, resultsProperties, jobProperties, fetchMaterials, EntityNameComponent, DataGridComponent, MaterialComponent, fileUtils, calculateFermiEnergy, showRunMonitor = false, units, logText, hasLogSource, now, }) {
    return (_jsxs(Box, { className: setClass(className), id: id, role: role, p: 2, children: [showRunMonitor ? (_jsx(Box, { mb: 3, children: _jsx(RunMonitor, { units: units, logText: logText, hasLogSource: hasLogSource, 
                    // The clock is the caller's to own: a component that read it
                    // itself would report a different elapsed time on every
                    // unrelated re-render.
                    now: now !== null && now !== void 0 ? now : Math.floor(Date.now() / 1000) }) })) : null, _jsx("div", { className: "mini-charts", children: resultsProperties.map((item, index) => {
                    return (_jsx(UnitResult, { status: item.unit.statusCls, name: item.name, subtitle: item.subtitle, unit: item.unit, subworkflow: item.subworkflow, material: material, results: item.results, profile: profile, job: job, jobProperties: jobProperties, fetchMaterials: fetchMaterials, EntityNameComponent: EntityNameComponent, DataGridComponent: DataGridComponent, MaterialComponent: MaterialComponent, fileUtils: fileUtils, calculateFermiEnergy: calculateFermiEnergy }, index));
                }) })] }));
}
