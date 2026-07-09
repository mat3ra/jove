/**
 * Stub for @mat3ra/job-designer — used by the standalone demo only.
 *
 * The real @mat3ra/job-designer package is not yet published on npm.
 * This stub provides pass-through React wrappers so the standalone
 * demo can build and render without the full job-designer dependency.
 *
 * Remove this stub and the vite alias once @mat3ra/job-designer is
 * published to npm and added to devDependencies.
 */

import React from "react";

export function JobDesignerProvider({ children }) {
    return React.createElement(React.Fragment, null, children);
}

export function JobLocalReduxContainer(props) {
    return React.createElement(React.Fragment, null, props.children);
}
