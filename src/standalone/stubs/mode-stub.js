/**
 * Stub for @mat3ra/mode in standalone mode.
 * Exports Model, ModelFactory, and related items needed by @mat3ra/wode.
 * All instances are minimal no-ops.
 */

export class Model {
    static defaultConfig = {
        type: "dft",
        subtype: "gga",
        functional: "pbe",
    };

    constructor(config = {}) {
        this._config = { ...Model.defaultConfig, ...config };
    }

    toJSON() {
        return { ...this._config };
    }
}

export const ModelFactory = {
    create(config = {}) {
        return new Model(config);
    },
    createFromApplication(config = {}) {
        return new Model(config);
    },
};

export class PseudopotentialMethod {}
export class Method {}

export default { Model, ModelFactory, PseudopotentialMethod, Method };
