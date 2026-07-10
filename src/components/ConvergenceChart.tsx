import { Chart } from "@mat3ra/prove";
import Box from "@mui/material/Box";
import React from "react";
import s from "underscore.string";

type convergenceData = {
    x: number;
    y: number;
};

interface Props {
    convergenceParamName: string;
    convergenceResultName: string;
    convergenceSeries: convergenceData[];
}

function ConvergenceChart({
    convergenceParamName,
    convergenceResultName,
    convergenceSeries,
}: Props) {
    function tooltipFormatter(this: { point: { param: string; y: number } }) {
        // note 'this' below refers to Highcharts tooltip scope
        // eslint-disable-next-line func-names
        return (
            `<b>${convergenceParamName}:</b> ` +
            // eslint-disable-next-line react/no-this-in-sfc
            this.point.param +
            `<br><b>${convergenceResultName}:</b> ` +
            // eslint-disable-next-line react/no-this-in-sfc
            this.point.y
        );
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

    return (
        <Box sx={{ m: 2 }}>
            {convergenceParamName && convergenceResultName && convergenceSeries ? (
                <Chart config={chartConfig} />
            ) : null}
        </Box>
    );
}

export default ConvergenceChart;
