import { getArcEndCoordinates, getPathValues } from '../../helpers/index';

describe('getPathValues', () => {
  const progress = 90;
  const max = 100;
  const baseParts = 3;

  it('should handle happy path', () => {
    expect(getPathValues(progress, max, baseParts)).toEqual([
      33.3333, 33.3333, 23.3333,
    ]);
  });

  it('should handle null', () => {
    expect(getPathValues(null, max, baseParts)).toEqual([0, 0, 0]);
  });

  it('should handle undefined', () => {
    expect(getPathValues(undefined, max, baseParts)).toEqual([0, 0, 0]);
  });

  it('should handle wrong progress', () => {
    expect(getPathValues(110, max, baseParts)).toEqual([
      33.3333, 33.3333, 33.3333,
    ]);
  });
});

describe('getArcEndCoordinates', () => {
  /**
   * The formula for arc length
   * s = r * θ
   * s = arc length, r = radius, θ = central angle corresponding to desired arc length
   * So
   * θ = s/r
   * To get x,y coordinates on circle circumference
   * x = 𝑟 * sin𝜃 + cx
   * y = 𝑟 * cos𝜃 + cy
   * cx and cy are circle center point coordinates
   */
  const cx = 10;
  const cy = -10;
  const circleCircumference = 600;
  const r = 100;
  const rotation = -180;
  const zeroPoint = { x: 0, y: 0 };

  it('should handle happy path', () => {
    const θ = circleCircumference / r + (rotation * Math.PI) / 180;
    const x = r * Math.cos(θ) + cx;
    const y = r * Math.sin(θ) + cy;

    expect(
      getArcEndCoordinates(r, circleCircumference, cx, cy, rotation)
    ).toEqual({ x, y });
  });

  it('should handle null values', () => {
    expect(
      getArcEndCoordinates(null, circleCircumference, cx, cy, rotation)
    ).toEqual(zeroPoint);

    expect(getArcEndCoordinates(r, null, cx, cy, rotation)).toEqual(zeroPoint);

    expect(
      getArcEndCoordinates(r, circleCircumference, null, cy, rotation)
    ).toEqual(zeroPoint);

    expect(
      getArcEndCoordinates(r, circleCircumference, cx, null, rotation)
    ).toEqual(zeroPoint);
  });

  it('should handle undefined values', () => {
    expect(
      getArcEndCoordinates(undefined, circleCircumference, cx, cy, rotation)
    ).toEqual(zeroPoint);

    expect(getArcEndCoordinates(r, undefined, cx, cy, rotation)).toEqual({
      x: 0,
      y: 0,
    });

    expect(
      getArcEndCoordinates(r, circleCircumference, undefined, cy, rotation)
    ).toEqual(zeroPoint);

    expect(
      getArcEndCoordinates(r, circleCircumference, cx, undefined, rotation)
    ).toEqual(zeroPoint);
  });
});
