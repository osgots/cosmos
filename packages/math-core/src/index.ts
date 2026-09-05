export type {
  Vector2,
  Vector3,
  Vector4
} from "./vector/types";

export {
  vector2,
  vector3,
  vector4
} from "./vector/create";

export {
  addVector2,
  subtractVector2,
  scaleVector2,
  dotVector2,
  squaredMagnitudeVector2,
  magnitudeVector2,
  normalizeVector2
} from "./vector/vector2";

export {
  addVector3,
  subtractVector3,
  scaleVector3,
  dotVector3,
  crossVector3,
  squaredMagnitudeVector3,
  magnitudeVector3,
  normalizeVector3
} from "./vector/vector3";

export {
  addVector4,
  subtractVector4,
  scaleVector4,
  dotVector4,
  squaredMagnitudeVector4,
  magnitudeVector4,
  normalizeVector4
} from "./vector/vector4";

export type {
  Matrix2,
  Matrix3,
  Matrix4
} from "./matrix/types";

export {
  matrix2,
  matrix3,
  matrix4
} from "./matrix/create";

export {
  IDENTITY_MATRIX2,
  multiplyMatrix2Vector2,
  multiplyMatrix2,
  transposeMatrix2
} from "./matrix/matrix2";

export {
  IDENTITY_MATRIX3,
  multiplyMatrix3Vector3,
  multiplyMatrix3,
  transposeMatrix3
} from "./matrix/matrix3";

export {
  IDENTITY_MATRIX4,
  multiplyMatrix4Vector4,
  multiplyMatrix4,
  transposeMatrix4
} from "./matrix/matrix4";

export {
  RotationPlane4,
  ROTATION_PLANES_4,
  rotationMatrix2,
  rotationMatrix3X,
  rotationMatrix3Y,
  rotationMatrix3Z,
  rotationMatrix4
} from "./matrix/rotation";

export type {
  RotationPlane4 as RotationPlane4Type
} from "./matrix/rotation";

export type {
  ProjectionBasis3ND,
  HypercubeCombinatorics
} from "./nd";

export {
  validateDimension,
  hypercubeCombinatorics,
  rotateVectorNDInPlane,
  createProjectionBasis3ND,
  projectVectorNDTo3D
} from "./nd";
