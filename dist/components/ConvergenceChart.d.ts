import React from "react";
type convergenceData = {
    x: number;
    y: number;
};
interface Props {
    convergenceParamName: string;
    convergenceResultName: string;
    convergenceSeries: convergenceData[];
}
declare function ConvergenceChart({ convergenceParamName, convergenceResultName, convergenceSeries, }: Props): React.JSX.Element;
export default ConvergenceChart;
