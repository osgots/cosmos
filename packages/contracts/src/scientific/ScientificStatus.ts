/**
 * Describes how strongly a COSMOS Infinity entity, model,
 * statement, or visualization is grounded in science.
 *
 * This uses a JavaScript object + TypeScript literal-union type
 * instead of an enum so it remains compatible with
 * erasableSyntaxOnly.
 */
export const ScientificStatus = {
  Observed: "OBSERVED",
  EstablishedTheory: "ESTABLISHED_THEORY",
  EstablishedModel: "ESTABLISHED_MODEL",
  Approximation: "APPROXIMATION",
  PhysicsConstrainedExtrapolation: "PHYSICS_CONSTRAINED_EXTRAPOLATION",
  Theoretical: "THEORETICAL",
  Speculative: "SPECULATIVE",
  ArtisticVisualization: "ARTISTIC_VISUALIZATION"
} as const;

export type ScientificStatus =
  (typeof ScientificStatus)[keyof typeof ScientificStatus];
