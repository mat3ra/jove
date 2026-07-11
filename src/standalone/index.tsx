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
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

import { WorkflowStandata, MaterialStandata } from "@mat3ra/standata";
// Deep-path import — bypasses @mat3ra/wode's barrel (index.js), which eagerly
// requires the PointsPath context-providers tree and, through it, @mat3ra/made's
// CJS bundle. Workflow.js/Subworkflow.js themselves never touch @mat3ra/made.
import Workflow from "@mat3ra/wode/dist/js/Workflow";
import { Material } from "@mat3ra/made";
import * as Jode from "@mat3ra/jode";
const { Job } = Jode;
import { ResultsTab, type ResultsProps } from "@mat3ra/jove";

// NOTE (injection pattern): the standalone demo does NOT embed @mat3ra/job-designer.
// job-designer is the heavy, Meteor-coupled editor shell; embedding it drags in the
// whole workflow-designer → wove → reactflow → simpl-schema stub chain. Instead the
// demo renders jove's OWN components (ResultsTab) plus lightweight package-native tab
// viewers below, and lets the host webapp inject the full job-designer when it wants
// the editable designer. Same principle as the material 3D viewer / files explorer:
// package-native defaults here, real components injected from the webapp.

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
// Standata helpers — real workflow/material catalog, no mocking needed here.
// ---------------------------------------------------------------------------

function getAllWorkflowJsons(): any[] {
    try {
        return new WorkflowStandata().getAll() ?? [];
    } catch {
        return [];
    }
}

function getAllMaterialJsons(): any[] {
    try {
        return new MaterialStandata().getAll() ?? [];
    } catch {
        return [];
    }
}

const allWorkflowJsons = getAllWorkflowJsons();
const allMaterialJsons = getAllMaterialJsons();

function tryCreateWorkflow(json: any): InstanceType<typeof Workflow> | null {
    try {
        return new Workflow(json);
    } catch (error) {
        console.error("[jove standalone] Workflow construction failed:", error);
        return null;
    }
}

// ---------------------------------------------------------------------------
// Mock ResultsProps — prove-compatible PropertyData objects.
// Each entry corresponds to one subworkflow; rendered by jove's own ResultsTab.
// This is the only "fake" data in the demo — real computation results come
// from a real job in the actual webapp. Everything else (Workflow, Subworkflow,
// Material) is constructed from real standata-sourced JSON via jove's real
// peer packages.
// ---------------------------------------------------------------------------

function createMockResultsProperties(
    wodeWorkflow: InstanceType<typeof Workflow> | null,
): ResultsProps[] {
    if (!wodeWorkflow) return [];
    const subworkflowInstances: any[] = (wodeWorkflow as any).subworkflowInstances ?? [];
    if (subworkflowInstances.length === 0) return [];

    return subworkflowInstances.slice(0, 2).map((subworkflow: any, index: number) => {
        const unitName = subworkflow?.name ?? `Subworkflow ${index + 1}`;
        const unitInstance = (subworkflow?.units)?.[0] ?? {};
        const mockUnit = { ...unitInstance, statusCls: "success" };

        const results = [
            { name: "total_energy", value: -123.456 - index * 0.5, units: "eV" },
            { name: "fermi_energy", value: 6.23 + index * 0.1, units: "eV" },
            { name: "pressure", value: 0.042 + index * 0.01, units: "kbar" },
        ];

        return {
            name: unitName,
            subtitle: `Iteration ${index + 1}`,
            unit: mockUnit,
            subworkflow,
            results,
        } as ResultsProps;
    });
}

// ---------------------------------------------------------------------------
// Standalone Tab Viewers
// ---------------------------------------------------------------------------

function StandaloneMaterialViewer({ material }: { material: any }) {
    const raw = material?.toJSON?.() ?? material;
    return (
        <Box sx={{ p: 3, height: "calc(100vh - 120px)", overflow: "auto" }}>
            <Typography variant="h6" sx={{ color: "secondary.main", mb: 2 }}>
                {material?.name || material?.formula || "Material Details"}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.6, mb: 2 }}>
                Standalone viewer showing raw material JSON. (In production webapp, this renders a full 3D interactive viewer).
            </Typography>
            <pre style={{
                background: "rgba(255,255,255,0.03)",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.08)",
                overflowX: "auto",
                fontFamily: "monospace",
                fontSize: "0.85rem",
            }}>
                {JSON.stringify(raw, null, 2)}
            </pre>
        </Box>
    );
}

function StandaloneFilesExplorer() {
    const PREBAKED_JOB_FILES = [
        { name: "input.in", size: "2.4 KB" },
        { name: "job.pbs", size: "1.1 KB" },
        { name: "stdout.txt", size: "48.2 KB" },
        { name: "OUTCAR", size: "1.2 MB" },
        { name: "vasprun.xml", size: "4.8 MB" },
        { name: "POSCAR", size: "0.8 KB" },
        { name: "POTCAR", size: "12.3 KB" },
        { name: "INCAR", size: "1.0 KB" },
    ];
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, opacity: 0.6 }}>
                Standalone Files Preview
            </Typography>
            <List dense disablePadding>
                {PREBAKED_JOB_FILES.map((file) => (
                    <ListItem key={file.name} sx={{ py: 1, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            <InsertDriveFileIcon fontSize="small" sx={{ opacity: 0.6 }} />
                        </ListItemIcon>
                        <ListItemText
                            primary={file.name}
                            secondary={file.size}
                            primaryTypographyProps={{ variant: "body2", sx: { fontWeight: 500 } }}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}

const fetchMaterials = async () => [];

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

function App() {
    const [workflowIndex, setWorkflowIndex] = useState(0);
    const [materialIndex, setMaterialIndex] = useState(0);

    const selectedWorkflowJson = allWorkflowJsons[workflowIndex] ?? allWorkflowJsons[0];
    const selectedMaterialJson = allMaterialJsons[materialIndex] ?? allMaterialJsons[0];

    const wodeWorkflow = useMemo(
        () => tryCreateWorkflow(selectedWorkflowJson),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [workflowIndex],
    );

    const resultsProperties = useMemo(
        () => createMockResultsProperties(wodeWorkflow),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [workflowIndex],
    );

    const materialInstance = useMemo(() => {
        const materialWithId = {
            ...selectedMaterialJson,
            _id: selectedMaterialJson._id ?? `standalone-mat-${selectedMaterialJson.formula ?? "Si"}`,
        };
        try {
            return new Material(materialWithId);
        } catch {
            const formula = materialWithId?.formula ?? "";
            const symbols = formula.match(/[A-Z][a-z]*/g) ?? [];
            return {
                ...materialWithId,
                uniqueElements: [...new Set(symbols)],
                toJSON: () => materialWithId,
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [materialIndex]);

    const job = useMemo(() => {
        if (!wodeWorkflow || !materialInstance) return null;
        const name = `${wodeWorkflow.name} — ${
            materialInstance.formula || materialInstance.name || "Material"
        }`;
        // Restore real jode Job in the demo
        return new Job({
            _id: "standalone-job-1",
            id: "standalone-job-1",
            name,
            status: "finished",
            workflow: selectedWorkflowJson,
        });
    }, [wodeWorkflow, materialInstance, selectedWorkflowJson]);

    const [tab, setTab] = useState<"materials" | "results" | "files">("results");

    if (!wodeWorkflow || !job) {
        return (
            <ThemeProvider theme={demoTheme}>
                <CssBaseline />
                <Box sx={{ p: 4, color: "error.main" }}>
                    <Typography variant="h6">Failed to construct workflow/job from selected data.</Typography>
                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                        Check the console for details.
                    </Typography>
                </Box>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={demoTheme}>
            <CssBaseline />
            <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        px: 2,
                        py: 1,
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        bgcolor: "background.paper",
                        flexShrink: 0,
                    }}>
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "primary.main", mr: 2, flexShrink: 0 }}>
                        jove — Job Viewer
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <FormControl size="small" sx={{ minWidth: 280 }}>
                            <InputLabel id="workflow-select-label">Workflow</InputLabel>
                            <Select
                                labelId="workflow-select-label"
                                value={workflowIndex}
                                label="Workflow"
                                onChange={(event) =>
                                    setWorkflowIndex(Number(event.target.value))
                                }>
                                {allWorkflowJsons.map((wf: any, i: number) => (
                                    <MenuItem key={i} value={i}>
                                        {wf?.name ?? `Workflow ${i + 1}`}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Divider orientation="vertical" flexItem />
                        <FormControl size="small" sx={{ minWidth: 260 }}>
                            <InputLabel id="material-select-label">Material</InputLabel>
                            <Select
                                labelId="material-select-label"
                                value={materialIndex}
                                label="Material"
                                onChange={(event) =>
                                    setMaterialIndex(Number(event.target.value))
                                }>
                                {allMaterialJsons.map((mat: any, i: number) => (
                                    <MenuItem key={i} value={i}>
                                        {mat?.name ?? mat?.formula ?? `Material ${i + 1}`}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Chip
                            label={`${allWorkflowJsons.length} workflows · ${allMaterialJsons.length} materials`}
                            variant="outlined"
                            color="secondary"
                            size="small"
                        />
                    </Stack>
                </Box>

                {/* Tabs — jove's own components + package-native default viewers. */}
                <Tabs
                    value={tab}
                    onChange={(_e, value) => setTab(value)}
                    sx={{ px: 2, borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
                    <Tab label="Materials" value="materials" />
                    <Tab label="Results" value="results" />
                    <Tab label="Files" value="files" />
                </Tabs>

                <Box sx={{ flex: 1, overflow: "auto" }}>
                    {tab === "materials" && <StandaloneMaterialViewer material={materialInstance} />}
                    {tab === "results" && (
                        <ResultsTab
                            className=""
                            id="jove-results-tab"
                            role="tabpanel"
                            job={job as any}
                            profile={{} as any}
                            material={materialInstance as any}
                            resultsProperties={resultsProperties}
                            jobProperties={[]}
                            fetchMaterials={fetchMaterials}
                        />
                    )}
                    {tab === "files" && <StandaloneFilesExplorer />}
                </Box>
            </Box>
        </ThemeProvider>
    );
}

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root"),
);
