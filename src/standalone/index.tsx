import "./preloads";
import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import { ConvergenceChart, ResultsTab } from "../exports";
import { WorkflowStandata, MaterialStandata } from "@mat3ra/standata";
import { Material } from "@mat3ra/made";

// ---------------------------------------------------------------------------
// Dark theme
// ---------------------------------------------------------------------------

const demoTheme = createTheme({
    palette: {
        mode: "dark",
        primary: { main: "#7c4dff" },
        secondary: { main: "#00e5ff" },
        background: { default: "#0d1117", paper: "#161b22" },
    },
    typography: {
        fontFamily: "'Inter', 'Roboto', 'Helvetica Neue', sans-serif",
    },
    shape: { borderRadius: 10 },
});

// ---------------------------------------------------------------------------
// Mock convergence data
// ---------------------------------------------------------------------------

const mockConvergenceSeries = [
    { x: 1, y: -5.1 },
    { x: 2, y: -5.4 },
    { x: 3, y: -5.6 },
    { x: 4, y: -5.62 },
    { x: 5, y: -5.625 },
];

// ---------------------------------------------------------------------------
// Standata selector helpers
// Standata exposes items via runtimeData.filesMapByName (keyed by filename).
// ---------------------------------------------------------------------------

function getWorkflowNames(): string[] {
    try {
        const filesMap: Record<string, any> =
            (WorkflowStandata as any).runtimeData?.filesMapByName ?? {};
        const names = Object.values(filesMap)
            .map((wf: any) => wf?.name)
            .filter(Boolean) as string[];
        return names.length ? names : ["DFT Single Point", "Band Structure", "Geometry Optimization"];
    } catch {
        return ["DFT Single Point", "Band Structure", "Geometry Optimization"];
    }
}

function getMaterialNames(): string[] {
    try {
        const filesMap: Record<string, any> =
            (MaterialStandata as any).runtimeData?.filesMapByName ?? {};
        const names = Object.values(filesMap)
            .map((m: any) => m?.name)
            .filter(Boolean) as string[];
        return names.length ? names : ["Silicon", "Graphene", "Copper"];
    } catch {
        return ["Silicon", "Graphene", "Copper"];
    }
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

function SectionHeader({ title }: { title: string }) {
    return (
        <Box sx={{ mb: 2, mt: 1 }}>
            <Typography
                variant="overline"
                sx={{
                    color: "primary.main",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    fontSize: "0.7rem",
                }}>
                {title}
            </Typography>
            <Divider sx={{ mt: 0.5, borderColor: "primary.main", opacity: 0.4 }} />
        </Box>
    );
}

function App() {
    const workflowNames = useMemo(() => getWorkflowNames(), []);
    const materialNames = useMemo(() => getMaterialNames(), []);

    const [selectedWorkflow, setSelectedWorkflow] = useState(workflowNames[0] ?? "");
    const [selectedMaterial, setSelectedMaterial] = useState(materialNames[0] ?? "");

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "background.default",
                p: { xs: 2, md: 4 },
            }}>
            {/* ---- Header ---- */}
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h4"
                    fontWeight={800}
                    sx={{
                        background: "linear-gradient(135deg, #7c4dff 0%, #00e5ff 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        mb: 0.5,
                    }}>
                    Jove — Unit Results Viewer
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Standalone demo · convergence charts &amp; results inspection
                </Typography>
            </Box>

            {/* ---- Selectors ---- */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                }}>
                <SectionHeader title="Configuration" />
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <FormControl size="small" sx={{ minWidth: 220 }}>
                        <InputLabel>Workflow</InputLabel>
                        <Select
                            value={selectedWorkflow}
                            label="Workflow"
                            onChange={(e) => setSelectedWorkflow(e.target.value as string)}>
                            {workflowNames.map((wfName) => (
                                <MenuItem key={wfName} value={wfName}>
                                    {wfName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 220 }}>
                        <InputLabel>Material</InputLabel>
                        <Select
                            value={selectedMaterial}
                            label="Material"
                            onChange={(e) => setSelectedMaterial(e.target.value as string)}>
                            {materialNames.map((matName) => (
                                <MenuItem key={matName} value={matName}>
                                    {matName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* ---- Convergence Chart ---- */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                }}>
                <SectionHeader title="Convergence Chart" />
                <ConvergenceChart
                    convergenceParamName="Energy cutoff (Ry)"
                    convergenceResultName="Total Energy (eV)"
                    convergenceSeries={mockConvergenceSeries}
                />
            </Paper>

            {/* ---- Results Tab (empty results — no job data in standata) ---- */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                }}>
                <SectionHeader title="Results Tab" />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Showing an empty{" "}
                    <Box component="code" sx={{ fontFamily: "monospace", color: "secondary.main" }}>
                        ResultsTab
                    </Box>{" "}
                    — no job results are available in standata. Pass real{" "}
                    <Box component="code" sx={{ fontFamily: "monospace", color: "secondary.main" }}>
                        resultsProperties
                    </Box>{" "}
                    from your webapp to populate this section.
                </Typography>
                <ResultsTab
                    className=""
                    id="results-tab-demo"
                    role="tabpanel"
                    job={{}}
                    profile={{}}
                    material={new Material({})}
                    resultsProperties={[]}
                    jobProperties={[]}
                    fetchMaterials={async () => []}
                />
            </Paper>
        </Box>
    );
}

ReactDOM.render(
    <React.StrictMode>
        <ThemeProvider theme={demoTheme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>,
    document.getElementById("root"),
);
