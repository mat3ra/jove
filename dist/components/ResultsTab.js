import { jsx as _jsx } from "react/jsx-runtime";
import Box from "@mui/material/Box";
import setClass from "classnames";
import UnitResult from "./UnitResult";
export default function ResultsTab({ className, id, role, job, profile, material, resultsProperties, jobProperties, fetchMaterials, EntityNameComponent, DataGridComponent, fileUtils, calculateFermiEnergy, }) {
    return (_jsx(Box, { className: setClass(className), id: id, role: role, p: 2, children: _jsx("div", { className: "mini-charts", children: resultsProperties.map((item, index) => {
                return (_jsx(UnitResult, { status: item.unit.statusCls, name: item.name, subtitle: item.subtitle, unit: item.unit, subworkflow: item.subworkflow, material: material, results: item.results, profile: profile, job: job, jobProperties: jobProperties, fetchMaterials: fetchMaterials, EntityNameComponent: EntityNameComponent, DataGridComponent: DataGridComponent, fileUtils: fileUtils, calculateFermiEnergy: calculateFermiEnergy }, index));
            }) }) }));
}
