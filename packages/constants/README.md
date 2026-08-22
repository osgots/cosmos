# @cosmos/constants

Authoritative mathematical and physical constants for COSMOS Infinity.

## Purpose

This package is the lowest-level source of constants used by the future:

- units engine
- mathematics engine
- numerical engine
- quantum models
- relativity
- gravity
- stellar physics
- cosmology
- procedural universe engine

It must remain independent of React, Three.js, rendering, application code,
physics-domain packages, and higher-level COSMOS Infinity systems.

## Scientific policy

### SI defining constants

Constants classified as SI defining constants must:

1. use the exact numerical value defined by the International System of Units;
2. preserve the authoritative decimal representation in `decimal`;
3. expose a JavaScript `number` through `value` only for ordinary calculations;
4. set `exactByDefinition` to `true`;
5. never include a measurement uncertainty because their defining numerical
   values are exact.

Primary authority:

Bureau International des Poids et Mesures (BIPM), International System of
Units (SI).

### Measured constants

Measured constants such as the Newtonian gravitational constant must NOT be
added using the same assumptions as SI defining constants.

Before a measured constant is accepted, COSMOS Infinity must record:

- authoritative source;
- recommended-value revision;
- numerical value;
- standard uncertainty;
- unit;
- publication/reference;
- whether the value is exact or measured.

Measured constants must set:

`exactByDefinition: false`

### Precision policy

The `decimal` field is the authoritative textual representation.

The `value` field is an IEEE-754 JavaScript number and may not preserve every
decimal quantity exactly.

Future high-precision systems must construct their precision-aware values from
`decimal`, not by converting back from `value`.

### Dependency rule

`@cosmos/constants` must not depend on any other COSMOS Infinity package.

Higher-level packages may depend on this package.

## Currently accepted SI defining constants

- speed of light in vacuum, c
- Planck constant, h
- elementary charge, e
- Boltzmann constant, k_B
- Avogadro constant, N_A

Additional SI defining constants should be introduced only when a COSMOS
Infinity subsystem actually requires them.

## Change-control rule

Any modification to an accepted physical constant requires:

1. authoritative-source verification;
2. numerical comparison;
3. TypeScript validation;
4. affected physics tests;
5. scientific review.

A visual or application feature must never redefine a physical constant.
