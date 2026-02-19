export const getPathValues = (
  progress: number | null | undefined,
  max: number,
  segments: number
): number[] => {
  if (!progress) {
    return new Array(segments).fill(0);
  }

  const pathLengths: number[] = [];

  if (progress > max) {
    progress = max;
  }

  progress = (100 * progress) / max;

  let i = 0;
  while (i < segments) {
    const val: number = progress >= max / segments ? max / segments : progress;
    pathLengths.push(Math.round(val * 10000) / 10000);
    progress = progress - val;
    i++;
  }

  return pathLengths;
};

export const getArcEndCoordinates = (
  radius: number | null | undefined,
  circleCircumference: number | null | undefined,
  cx: number | null | undefined,
  cy: number | null | undefined,
  rotation: number = 0
): { x: number; y: number } => {
  if (
    circleCircumference == null ||
    circleCircumference === 0 ||
    radius == null ||
    radius === 0 ||
    cx == null ||
    cy == null
  ) {
    return { x: 0, y: 0 };
  }

  const θ = circleCircumference / radius + (rotation * Math.PI) / 180;
  const x = Math.cos(θ) * radius + cx;
  const y = Math.sin(θ) * radius + cy;

  return { x, y };
};
