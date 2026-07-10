import "./preloads";
import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

import { WorkflowStandata, MaterialStandata } from "@mat3ra/standata";
import { Workflow as WodeWorkflow } from "@mat3ra/wode";
import { Material } from "@mat3ra/made";
import { Job, JobStatus } from "@mat3ra/jode";
import { JobDesignerProvider, JobLocalReduxContainer } from "@mat3ra/job-designer";
import type { ResultsProps } from "@mat3ra/jove";
import { ThreeDEditor } from "@exabyte-io/wave.js";

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
// Standata helpers — same pattern as job-designer standalone
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

// ---------------------------------------------------------------------------
// Workflow construction helper
// ---------------------------------------------------------------------------

function tryCreateWorkflow(json: any): WodeWorkflow | null {
    try {
        return new WodeWorkflow(json);
    } catch (error) {
        console.error("[jove standalone] WodeWorkflow construction failed:", error);
        return null;
    }
}

// ---------------------------------------------------------------------------
// Mock ResultsProps — prove-compatible PropertyData objects.
// Each entry corresponds to one subworkflow; rendered by jove's ResultsTab.
// ---------------------------------------------------------------------------

function createMockResultsProperties(
    wodeWorkflow: WodeWorkflow | null,
): ResultsProps[] {
    if (!wodeWorkflow) return [];
    // Use properly-constructed Subworkflow instances from the wode Workflow
    // so that class methods like convergenceSeries() work correctly.
    const subworkflowInstances: any[] = (wodeWorkflow as any).subworkflowInstances ?? [];
    if (subworkflowInstances.length === 0) return [];

    return subworkflowInstances.slice(0, 2).map((subworkflow: any, index: number) => {
        const unitName = subworkflow?.name ?? `Subworkflow ${index + 1}`;
        // Use a properly-constructed unit instance if available
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
// Build a finished Job.
// status="finished" reveals Results + Files tabs and defaults to Results tab.
// ---------------------------------------------------------------------------

function buildFinishedJob(wodeWorkflow: WodeWorkflow, materialJson: any): Job | null {
    try {
        const materialWithId = {
            ...materialJson,
            _id: materialJson._id ?? `standalone-mat-${materialJson.formula ?? "Si"}`,
        };

        const job = new Job({
            name: `${wodeWorkflow.name} — ${materialJson.formula ?? materialJson.name ?? "Material"}`,
            status: JobStatus.finished,
            _id: "standalone-job-1",
            // clusterFqdn must be truthy for FilesTab to show FilesExplorerContainer
            clusterFqdn: "standalone.cluster",
        });

        job.setWorkflow(wodeWorkflow);

        try {
            const material = new Material(materialWithId);
            job.setMaterial(material);
        } catch {
            // Material construction failure is non-fatal
        }

        return job;
    } catch (error) {
        console.error("[jove standalone] Job construction failed:", error);
        return null;
    }
}

// ---------------------------------------------------------------------------
// Pre-baked file list for the Files tab (standalone has no cluster connection)
// ---------------------------------------------------------------------------

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

function StandaloneFilesExplorer() {
    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.6 }}>
                Standalone preview — showing pre-baked file list
            </Typography>
            <List dense disablePadding>
                {PREBAKED_JOB_FILES.map((file) => (
                    <ListItem key={file.name} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            <InsertDriveFileIcon fontSize="small" sx={{ opacity: 0.6 }} />
                        </ListItemIcon>
                        <ListItemText
                            primary={file.name}
                            secondary={file.size}
                            primaryTypographyProps={{ variant: "body2" }}
                            secondaryTypographyProps={{ variant: "caption" }}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}

// ---------------------------------------------------------------------------
// Material viewer wrapper — passes the Made.Material instance to ThreeDEditor.
// Falls back gracefully if ThreeDEditor fails to load in the standalone context.
// ---------------------------------------------------------------------------

function StandaloneMaterialViewer({ material }: { material: any }) {
    try {
        return (
            <Box sx={{ height: "100%", minHeight: 400 }}>
                <ThreeDEditor
                    material={material}
                    isEditable={false}
                    isStandalone={false}
                />
            </Box>
        );
    } catch {
        const name = material?.name ?? material?.formula ?? "Material";
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h6">{name}</Typography>
            </Box>
        );
    }
}


// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

function App() {
    const [workflowIndex, setWorkflowIndex] = useState(0);
    const [materialIndex, setMaterialIndex] = useState(0);

    const selectedWorkflowJson = allWorkflowJsons[workflowIndex] ?? allWorkflowJsons[0];
    const selectedMaterialJson = allMaterialJsons[materialIndex] ?? allMaterialJsons[0];

    const designerKey = `${workflowIndex}-${materialIndex}`;

    const [wodeWorkflow, job] = useMemo(
        () => {
            const workflow = tryCreateWorkflow(selectedWorkflowJson);
            return [workflow, workflow ? buildFinishedJob(workflow, selectedMaterialJson) : null];
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [workflowIndex, materialIndex],
    );

    const resultsProperties = useMemo(
        () => createMockResultsProperties(wodeWorkflow ?? null),
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
            return materialWithId;
        }
    }, [materialIndex]); // eslint-disable-line react-hooks/exhaustive-deps

    // materialJson is the plain JSON form — used for serialization props.
    const materialJson = (materialInstance as any)?.toJSON?.() ?? (materialInstance as any);

    if (!job) {
        return (
            <ThemeProvider theme={demoTheme}>
                <CssBaseline />
                <Box sx={{ p: 4, color: "error.main" }}>
                    <Typography variant="h6">Failed to construct job from selected data.</Typography>
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
                        Job Viewer
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

                {/* Job viewer — status=finished → read-only, opens on Results tab */}
                <Box sx={{ flex: 1, overflow: "auto" }}>
                    <JobDesignerProvider
                        deps={{
                            getRouteQueryTab: () => null,
                            FilesExplorerContainer: StandaloneFilesExplorer,
                        }}
                    >
                        <JobLocalReduxContainer
                            key={designerKey}
                            job={job}
                            jobMaterials={[materialInstance] as any}
                            materials={[materialInstance] as any}
                            project={{ name: "Demo Project", _id: "standalone-project" } as any}
                            metaProperties={[]}
                            accountUsers={[]}
                            accountUsersIsLoading={false}
                            profile={
                                {
                                    user: { entity: { id: "1" } },
                                    account: { entity: { id: "1", slug: "demo" } },
                                    personalAccount: { entity: { id: "1" } },
                                } as any
                            }
                            publicAccount={{ entity: { id: "public" } } as any}
                            clusters={[]}
                            refreshMetaProperties={() => {}}
                            jobDialogs={{
                                selectMaterialsReduxDialog: { isOpen: false, open: () => {}, close: () => {} },
                                selectWorkflowReduxDialog: { isOpen: false, open: () => {}, close: () => {} },
                                selectParentReduxDialog: { isOpen: false, open: () => {}, close: () => {} },
                                selectDatasetReduxDialog: { isOpen: false, open: () => {}, close: () => {} },
                            } as any}
                            workflowDialogs={{
                                pseudoUploadReduxDialog: [() => {}, () => {}] as any,
                                unitTypeReduxDialog: [() => {}, () => {}] as any,
                            } as any}
                            templates={[]}
                            resultsProperties={resultsProperties}
                            jobProperties={[]}
                            createMetaProperty={async () => undefined}
                            fetchMaterials={async () => []}
                            loadWorkflowEntityById={async () => undefined}
                            workflowId={undefined}
                            onMaterialAdd={() => {}}
                            onMaterialRemove={() => {}}
                            onDestroy={() => {}}
                            getJobMaterialClient={async () => null}
                            MaterialViewerComponent={StandaloneMaterialViewer as any}
                        />
                    </JobDesignerProvider>
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
