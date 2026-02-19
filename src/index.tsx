import {
  forwardRef,
  type ForwardRefRenderFunction,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, TSpan } from 'react-native-svg';
import { getArcEndCoordinates, getPathValues } from './helpers';

interface Indicator {
  show?: boolean;
  radius?: number;
  strokeWidth?: number;
  color?: string;
}

interface RNSegmentedProgressBarProps {
  radius: number;
  strokeWidth?: number;
  baseColor?: string;
  progressColor?: string;
  segments?: number;
  segmentsGap?: number;
  centerComponent?: JSX.Element;
  indicator?: Indicator;
}

export type RunAnimationHandler = {
  run: ({ progress }: { progress: number }) => void;
};

const IndicatorCircle = Animated.createAnimatedComponent(Circle);
const ProgressCircle = Animated.createAnimatedComponent(Circle);

const max = 100;
const duration = 1200;
const progressDelay = 500;

const INDICATOR_FONT = {
  textAnchor: 'middle' as const,
  fontSize: 18,
};

/**
 * Computes the declarative strokeDashoffset for a segment.
 * Returns an Animated.AnimatedInterpolation when the segment has progress,
 * or a static number when it doesn't.
 */
const computeStrokeDashoffset = (
  animatedVal: Animated.Value,
  target: number,
  circumference: number,
  numSegments: number,
  gap: number
): Animated.AnimatedInterpolation<number> | number => {
  if (target <= 0) return circumference;

  const gapAdjust = (numSegments * target * gap) / 100;
  const targetOffset = circumference * (1 - target / 100) + gapAdjust;
  const thresholdV = gapAdjust > 0 ? (gapAdjust * 100) / circumference : 0;

  // Gap consumes all progress — segment stays hidden
  if (thresholdV >= target) return circumference;

  // With gap: dead zone at start where offset stays at circumference
  if (thresholdV > 0) {
    return animatedVal.interpolate({
      inputRange: [0, thresholdV, target],
      outputRange: [circumference, circumference, targetOffset],
      extrapolate: 'clamp',
    });
  }

  // No gap: simple linear interpolation
  return animatedVal.interpolate({
    inputRange: [0, target],
    outputRange: [circumference, targetOffset],
    extrapolate: 'clamp',
  });
};

const RNSegmentedProgressBar: ForwardRefRenderFunction<
  RunAnimationHandler,
  RNSegmentedProgressBarProps
> = (props, ref) => {
  const {
    radius,
    strokeWidth = 10,
    baseColor = '#ffede1',
    progressColor = '#F39E93',
    segments = 3,
    segmentsGap = 0,
    indicator,
    centerComponent,
  } = props;

  const animatedValue = useRef(new Animated.Value(0)).current;
  const progressAnimatedValues = useRef(
    new Array(segments).fill(null).map(() => new Animated.Value(0))
  ).current;

  const indicatorCircleRef = useRef<any>(null);

  const tSpanRef = useRef<any>(null);

  // Per-segment target values — drives both render-time interpolation and animation
  const [segmentTargets, setSegmentTargets] = useState<number[]>(() =>
    new Array(segments).fill(0)
  );
  // Overall progress stored in ref (only needed inside animation, not for render)
  const activeProgressRef = useRef(0);
  // Pending animation config — bridges run() and the post-render effect
  const pendingAnimationRef = useRef<{
    progress: number;
    targets: number[];
  } | null>(null);

  const indicatorSegmentsGap = indicator?.radius ?? 0;
  const halfCircle = radius + strokeWidth + indicatorSegmentsGap;
  const circleCircumference = 2 * Math.PI * radius;
  const rotation = -90 + (180 * (segmentsGap / 2 / radius)) / Math.PI;

  const getProgressValues = useCallback(
    (progress: number) => getPathValues(progress, max, segments),
    [segments]
  );

  const getMeanSegmentsGap = useCallback(
    (progress: number) => {
      const pathValues = getProgressValues(progress);
      const activeSegments = pathValues.filter((val) => val > 0).length;
      return (
        ((progress / (activeSegments || 1)) * segments * segmentsGap) / 100
      );
    },
    [getProgressValues, segments, segmentsGap]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      animatedValue.stopAnimation();
      animatedValue.removeAllListeners();
      progressAnimatedValues.forEach((v) => {
        v.stopAnimation();
        v.removeAllListeners();
      });
    };
  }, [animatedValue, progressAnimatedValues]);

  // Start animations AFTER React has re-rendered with updated segmentTargets.
  // This guarantees progressTrack useMemo has correct interpolations before
  // any animated values start ticking.
  useEffect(() => {
    const pending = pendingAnimationRef.current;
    if (!pending) return;
    pendingAnimationRef.current = null;

    const { progress, targets } = pending;

    const progressAnimations = Animated.sequence(
      progressAnimatedValues.map((animVal, index) =>
        Animated.timing(animVal, {
          toValue: targets[index] ?? 0,
          duration: (duration * (targets[index] ?? 0)) / max,
          delay: index === 0 ? progressDelay : 0,
          useNativeDriver: false,
          easing: Easing.linear,
        })
      )
    );

    if (indicator?.show) {
      const percentageAnim = Animated.timing(animatedValue, {
        toValue: progress,
        duration: (duration * progress) / max,
        delay: progressDelay,
        useNativeDriver: false,
        easing: Easing.linear,
      });
      Animated.parallel([progressAnimations, percentageAnim]).start();
    } else {
      progressAnimations.start();
    }
  }, [segmentTargets, animatedValue, indicator?.show, progressAnimatedValues]);

  const run = useCallback(
    ({ progress }: { progress: number }): void => {
      // Stop ongoing animations and clear all listeners
      animatedValue.stopAnimation();
      animatedValue.removeAllListeners();
      animatedValue.setValue(0);
      progressAnimatedValues.forEach((v) => {
        v.stopAnimation();
        v.removeAllListeners();
        v.setValue(0);
      });

      const targets = getProgressValues(progress);
      activeProgressRef.current = progress;

      // Set up indicator static properties once (not per-frame)
      if (indicator?.show && indicatorCircleRef.current && tSpanRef.current) {
        const calculatedProgress = `${Math.round(progress)}%`;
        // @ts-ignore – setNativeProps exists on native ref
        indicatorCircleRef.current.setNativeProps({
          r: indicator.radius || 0,
          strokeWidth: indicator.strokeWidth || 0,
        });
        // @ts-ignore – setNativeProps exists on native ref
        tSpanRef.current.setNativeProps({
          children: calculatedProgress,
          font: INDICATOR_FONT,
        });
      }

      // Set up indicator position listener (trig-based, can't use interpolate)
      if (indicator?.show) {
        const meanGap = getMeanSegmentsGap(progress);
        animatedValue.addListener((v) => {
          const val = Math.min(v.value, progress);
          const paintedLength = (circleCircumference * val) / 100;
          const adjustedLength = paintedLength - meanGap;

          if (adjustedLength <= 0) return;

          const { x: cx, y: cy } = getArcEndCoordinates(
            radius,
            adjustedLength,
            halfCircle,
            halfCircle,
            rotation
          );

          if (indicatorCircleRef.current) {
            // @ts-ignore – setNativeProps exists on native ref
            indicatorCircleRef.current.setNativeProps({ cx, cy });
          }
          if (tSpanRef.current) {
            // @ts-ignore – setNativeProps exists on native ref
            tSpanRef.current.setNativeProps({ dx: cx, dy: cy + 5 });
          }
        });
      }

      // Store pending config and trigger re-render with new targets.
      // Animations start in a useEffect AFTER React has re-rendered,
      // ensuring interpolations in progressTrack are set up correctly.
      pendingAnimationRef.current = { progress, targets };
      setSegmentTargets(targets);
    },
    [
      animatedValue,
      circleCircumference,
      getMeanSegmentsGap,
      getProgressValues,
      halfCircle,
      indicator?.show,
      indicator?.radius,
      indicator?.strokeWidth,
      progressAnimatedValues,
      radius,
      rotation,
    ]
  );

  // Memoize base track circles (static, never animate)
  const baseTrack = useMemo(() => {
    const baseStrokeDashoffset =
      circleCircumference - circleCircumference / segments + segmentsGap;

    return new Array(segments)
      .fill(null)
      .map((_, key) => (
        <Circle
          key={key}
          cx={halfCircle}
          cy={halfCircle}
          r={radius}
          stroke={baseColor}
          rotation={rotation + (key * 360) / segments}
          origin={`${halfCircle}, ${halfCircle}`}
          strokeWidth={strokeWidth}
          strokeDasharray={circleCircumference}
          strokeDashoffset={baseStrokeDashoffset}
          strokeLinecap="round"
        />
      ));
  }, [
    baseColor,
    circleCircumference,
    halfCircle,
    radius,
    rotation,
    segments,
    segmentsGap,
    strokeWidth,
  ]);

  // Memoize progress overlay circles with declarative interpolated strokeDashoffset
  const progressTrack = useMemo(() => {
    return progressAnimatedValues.map((animVal, key) => {
      const target = segmentTargets[key] ?? 0;
      const strokeDashoffset = computeStrokeDashoffset(
        animVal,
        target,
        circleCircumference,
        segments,
        segmentsGap
      );

      return (
        <ProgressCircle
          key={key}
          stroke={progressColor}
          cx={halfCircle}
          cy={halfCircle}
          r={radius}
          origin={`${halfCircle}, ${halfCircle}`}
          strokeWidth={strokeWidth}
          strokeDasharray={circleCircumference}
          strokeDashoffset={strokeDashoffset}
          rotation={rotation + (key * 360) / segments}
          strokeLinecap="round"
        />
      );
    });
  }, [
    circleCircumference,
    halfCircle,
    progressAnimatedValues,
    progressColor,
    radius,
    rotation,
    segmentTargets,
    segments,
    segmentsGap,
    strokeWidth,
  ]);

  useImperativeHandle(ref, () => ({ run }), [run]);

  return (
    <Svg
      viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
      width={'100%'}
      fill="none"
      height={radius * 2}
    >
      {centerComponent && (
        <View style={styles.centerComponent}>{centerComponent}</View>
      )}
      <G>
        {baseTrack}
        {progressTrack}

        {indicator?.show === true && (
          <>
            <IndicatorCircle
              stroke={progressColor}
              ref={indicatorCircleRef}
              fill="white"
            />
            <TSpan stroke={progressColor} fill={progressColor} ref={tSpanRef} />
          </>
        )}
      </G>
    </Svg>
  );
};

export default memo(forwardRef(RNSegmentedProgressBar));

const styles = StyleSheet.create({
  centerComponent: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
