/**
 * Stub for @mat3ra/code in standalone mode.
 * Exports the base classes and all mixin functions needed by @mat3ra/wode.
 *
 * All mixin functions are called as `mixin(SomeClass.prototype)` to decorate
 * prototypes in-place — they must be safe no-ops in standalone mode.
 */

export class InMemoryEntity {
    constructor(config = {}) {
        this._json = config;
    }
    prop(key) {
        return this._json[key];
    }
    requiredProp(key) {
        return this._json[key];
    }
    setProp(key, value) {
        this._json[key] = value;
    }
    toJSON() {
        return { ...this._json };
    }
    clone() {
        return new this.constructor(this.toJSON());
    }
}

export class HashedEntity extends InMemoryEntity {}
export class NamedEntity extends InMemoryEntity {}
export class NamedInMemoryEntity extends NamedEntity {}

// All mixin functions are no-ops: called as mixin(SomeClass.prototype)
const noOpMixin = () => {};
export const taggableMixin = noOpMixin;
export const hashedEntityMixin = noOpMixin;
export const runtimeItemsMixin = noOpMixin;
export const runtimeItemsUILogicMixin = noOpMixin;
export const namedEntityMixin = noOpMixin;
export const defaultableEntityMixin = noOpMixin;
export const computedEntityMixin = noOpMixin;
export const hasDescriptionMixin = noOpMixin;

// Unit schema mixins from @mat3ra/wode
export const baseUnitSchemaMixin = noOpMixin;
export const statusSchemaMixin = noOpMixin;
export const assertionUnitSchemaMixin = noOpMixin;
export const assignmentUnitSchemaMixin = noOpMixin;
export const conditionUnitSchemaMixin = noOpMixin;
export const errorUnitSchemaMixin = noOpMixin;
export const executionUnitInputSchemaMixin = noOpMixin;
export const executionUnitSchemaMixin = noOpMixin;
export const iOUnitSchemaMixin = noOpMixin;
export const mapUnitSchemaMixin = noOpMixin;
export const reduceUnitSchemaMixin = noOpMixin;
export const subworkflowUnitSchemaMixin = noOpMixin;
export const subworkflowSchemaMixin = noOpMixin;
export const workflowSchemaMixin = noOpMixin;
export const jobSchemaMixin = noOpMixin;

export default {
    InMemoryEntity,
    HashedEntity,
    NamedEntity,
    NamedInMemoryEntity,
    taggableMixin,
    hashedEntityMixin,
    runtimeItemsMixin,
    runtimeItemsUILogicMixin,
    namedEntityMixin,
    defaultableEntityMixin,
    computedEntityMixin,
    hasDescriptionMixin,
    baseUnitSchemaMixin,
    statusSchemaMixin,
    assertionUnitSchemaMixin,
    assignmentUnitSchemaMixin,
    conditionUnitSchemaMixin,
    errorUnitSchemaMixin,
    executionUnitInputSchemaMixin,
    executionUnitSchemaMixin,
    iOUnitSchemaMixin,
    mapUnitSchemaMixin,
    reduceUnitSchemaMixin,
    subworkflowUnitSchemaMixin,
    subworkflowSchemaMixin,
    workflowSchemaMixin,
    jobSchemaMixin,
};
