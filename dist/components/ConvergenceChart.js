import { jsx as _jsx } from "react/jsx-runtime";
import { Chart } from "@mat3ra/prove";
import Box from "@mui/material/Box";
import s from "underscore.string";
function ConvergenceChart({ convergenceParamName, convergenceResultName, convergenceSeries, }) {
    function tooltipFormatter() {
        // note 'this' below refers to Highcharts tooltip scope
        // eslint-disable-next-line func-names
        return (`<b>${convergenceParamName}:</b> ` +
            // eslint-disable-next-line react/no-this-in-sfc
            this.point.param +
            `<br><b>${convergenceResultName}:</b> ` +
            // eslint-disable-next-line react/no-this-in-sfc
            this.point.y);
    }
    const chartConfig = {
        title: {
            text: `${s.humanize(convergenceResultName)} Convergence`,
        },
        xAxis: {
            title: {
                text: "Iteration",
            },
            tickInterval: 1,
        },
        yAxis: {
            title: {
                text: convergenceResultName,
            },
        },
        series: [
            {
                name: convergenceResultName,
                data: convergenceSeries,
            },
        ],
        legend: false,
        tooltip: {
            formatter: tooltipFormatter,
        },
        credits: {
            enabled: false,
        },
    };
    return (_jsx(Box, { sx: { m: 2 }, children: convergenceParamName && convergenceResultName && convergenceSeries ? (_jsx(Chart, { config: chartConfig })) : null }));
}
export default ConvergenceChart;
