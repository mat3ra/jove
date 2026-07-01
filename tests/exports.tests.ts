/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

/**
 * Smoke tests for @mat3ra/jove exports.
 *
 * Rather than actually importing the React components (which require a DOM,
 * prode, prove, and a full React environment), we verify the dist/exports.js
 * and dist/exports.d.ts files declare the expected named exports.
 * This catches accidental deletion or renaming of public API symbols.
 */

const distDirectory = path.resolve(import.meta.dirname, "..", "dist");
const exportsJsPath = path.join(distDirectory, "exports.js");
const exportsDtsPath = path.join(distDirectory, "exports.d.ts");

test("dist/exports.js exists and is non-empty", () => {
    const stat = fs.statSync(exportsJsPath);
    assert.ok(stat.size > 0, "exports.js should not be empty");
});

test("dist/exports.d.ts exists and is non-empty", () => {
    const stat = fs.statSync(exportsDtsPath);
    assert.ok(stat.size > 0, "exports.d.ts should not be empty");
});

test("dist/exports.js declares UnitResult export", () => {
    const content = fs.readFileSync(exportsJsPath, "utf-8");
    assert.ok(content.includes("UnitResult"), "exports.js should reference UnitResult");
});

test("dist/exports.js declares ResultsTab export", () => {
    const content = fs.readFileSync(exportsJsPath, "utf-8");
    assert.ok(content.includes("ResultsTab"), "exports.js should reference ResultsTab");
});

test("dist/exports.js declares ConvergenceChart export", () => {
    const content = fs.readFileSync(exportsJsPath, "utf-8");
    assert.ok(content.includes("ConvergenceChart"), "exports.js should reference ConvergenceChart");
});

test("dist/exports.d.ts declares UnitResult type export", () => {
    const content = fs.readFileSync(exportsDtsPath, "utf-8");
    assert.ok(content.includes("UnitResult"), "exports.d.ts should reference UnitResult");
});

test("dist/exports.d.ts declares ResultsTab type export", () => {
    const content = fs.readFileSync(exportsDtsPath, "utf-8");
    assert.ok(content.includes("ResultsTab"), "exports.d.ts should reference ResultsTab");
});

test("dist/exports.d.ts declares ConvergenceChart type export", () => {
    const content = fs.readFileSync(exportsDtsPath, "utf-8");
    assert.ok(content.includes("ConvergenceChart"), "exports.d.ts should reference ConvergenceChart");
});
