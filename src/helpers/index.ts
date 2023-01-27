export const getPathValues = (
  progress: number | undefined,
  max: number,
  segments: number
): number[] => {
  if (!progress) {
    return [...Array(segments)].map(() => 0);
  }

  const pathLengths = [];

  if (progress > max) {
    progress = max;
  }

  progress = (100 * progress) / max;

  let i = 0;
  while (i < segments) {
    const val: number = progress >= max / segments ? max / segments : progress;
    pathLengths.push(Number.parseFloat(val.toFixed(4)));
    progress = progress - val;
    i++;
  }

  return pathLengths;
};

export const getArcEndCoordinates = (
  radius: number,
  circleCircumference: number,
  cx: number,
  cy: number,
  rotation: number = 0
): { x: number; y: number } => {
  if (!circleCircumference || !radius || !cx || !cy) {
    return { x: 0, y: 0 };
  }

  const θ = circleCircumference / radius + (rotation * Math.PI) / 180;
  const x = Math.cos(θ) * radius + cx;
  const y = Math.sin(θ) * radius + cy;

  return { x, y };
};
