/**
 * Stub for @mat3ra/ide in standalone mode.
 * Exports the mixin functions needed by @mat3ra/wode workflows.
 * The compute mixins are applied as mixin(SomeClass.prototype) — they must be no-ops.
 */

const noOpMixin = () => {};

// From @mat3ra/ide/dist/js/compute
export const computedEntityMixin = noOpMixin;
export class ComputedEntityMixin {}

export default { computedEntityMixin, ComputedEntityMixin };
