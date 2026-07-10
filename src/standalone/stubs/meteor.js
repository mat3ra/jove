/**
 * Stub for @mat3ra/ade, @mat3ra/mode, swig, mathjs and other
 * packages that are not available in standalone browser mode.
 * Exports no-op classes to satisfy named imports.
 */

export class Application {
    constructor(config = {}) {
        this._config = config;
    }
    toJSON() {
        return { ...this._config };
    }
}

export class Template {
    constructor(config = {}) {
        this._config = typeof config === "string" ? { content: config } : (config || {});
    }
    toJSON() {
        return { ...this._config };
    }
}

export class Model {
    constructor(config = {}) {
        this._config = config;
    }
    toJSON() {
        return { ...this._config };
    }
}

export class Method {
    constructor(config = {}) {
        this._config = config;
    }
    toJSON() {
        return { ...this._config };
    }
}

export default { Application, Template, Model, Method };
