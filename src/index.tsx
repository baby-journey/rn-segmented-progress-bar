import React, {
  forwardRef,
  ForwardRefRenderFunction,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, TSpan } from 'react-native-svg';
import { getArcEndCoordinates, getPathValues } from './helpers';

interface IndicatorInterface {
  show?: boolean;
  radius?: number;
  strokeWidth?: number;
  color?: string;
}

interface ChartInterface {
  radius: number;
  strokeWidth?: number;
  baseColor?: string;
  progressColor?: string;
  baseParts?: number;
  gap?: number;
  centerComponent?: ReactNode;
  indicator?: IndicatorInterface;
}

export type RunAnimationHandler = {
  run: ({ progress }: { progress: number }) => void;
};

const PercentageCircle = Animated.createAnimatedComponent(Circle);
const Trimester = Animated.createAnimatedComponent(Circle);

const max = 100;
const duration = 1200;

const Chart: ForwardRefRenderFunction<RunAnimationHandler, ChartInterface> = (
  props,
  ref
) => {
  const {
    radius,
    strokeWidth = 10,
    baseColor = '#ffede1',
    progressColor = '#F39E93',
    baseParts = 3,
    gap = 0,
    indicator,
    centerComponent,
  } = props;

  const circleRef = useRef([]);

  const animatedValue = useRef(new Animated.Value(0)).current;
  const trimesterAnimatedValues = useRef(
    [...Array(baseParts)].map(() => new Animated.Value(0))
  ).current;

  const indicatorCircleRef = useRef(null);
  const tSpanRef = useRef(null);

  const indicatorGap = indicator?.radius ?? 0;
  const halfCircle = radius + strokeWidth + indicatorGap;
  const circleCircumference = 2 * Math.PI * radius;
  const rotation = -90 + (180 * (gap / 2 / radius)) / Math.PI;

  const getTrimesterValues = useCallback(
    (progress) => getPathValues(progress, max, baseParts),
    [baseParts]
  );

  const progressDelay = 10;

  const animation = useCallback(
    (
      animatedVal: Animated.Value,
      toValue: number,
      delay: number,
      durationValue: number
    ) => {
      return Animated.timing(animatedVal, {
        toValue,
        duration: durationValue,
        delay,
        useNativeDriver: true,
        easing: Easing.linear,
      });
    },
    []
  );

  useEffect(() => {
    () => {
      animatedValue.removeAllListeners();
      trimesterAnimatedValues.forEach((trimesterAnimatedValue) =>
        trimesterAnimatedValue.removeAllListeners()
      );
    };
  }, [animatedValue, trimesterAnimatedValues]);

  const getMeanGap = useCallback(
    (progress: number) => {
      const pathValues = getTrimesterValues(progress);
      return (
        ((progress / pathValues.filter((val) => val > 0).length || 1) *
          baseParts *
          gap) /
        100
      );
    },
    [getTrimesterValues, baseParts, gap]
  );

  const runIndicator = useCallback(
    (calculatedStrokeDashoffset: number, val: number) => {
      const { x: cx, y: cy } = getArcEndCoordinates(
        radius,
        calculatedStrokeDashoffset,
        halfCircle,
        halfCircle,
        rotation
      );

      if (!calculatedStrokeDashoffset) {
        return;
      }

      const calculatedProgress = `${Math.round(val)}%`;

      if (indicatorCircleRef?.current && tSpanRef?.current) {
        //@ts-ignore
        indicatorCircleRef.current.setNativeProps({
          r: indicator?.radius || 0,
          strokeWidth: indicator?.strokeWidth || 0,
          cx,
          cy,
        });

        //@ts-ignore
        tSpanRef?.current.setNativeProps({
          children: calculatedProgress,
          dx: cx,
          dy: cy + 5,
          font: {
            textAnchor: 'middle',
            // fontFamily: Font.CircularMedium,
            fontSize: 18,
          },
        });
      }
    },
    [radius, halfCircle, rotation, indicator?.radius, indicator?.strokeWidth]
  );

  const run = useCallback(
    ({ progress }: { progress: number }): void => {
      console.log('Hello');

      const trimesterProgressValues = getTrimesterValues(progress);
      trimesterAnimatedValues.forEach((trimesterAnimated, index) => {
        trimesterAnimated.addListener((v) => {
          if (circleRef?.current[index]) {
            var strokeDashoffset = circleCircumference;

            var val =
              v.value <= trimesterProgressValues[index]
                ? v.value
                : trimesterProgressValues[index];
            strokeDashoffset = trimesterProgressValues[index]
              ? circleCircumference - (circleCircumference * val) / 100
              : circleCircumference;

            const paintedLength =
              circleCircumference -
              strokeDashoffset -
              (baseParts * trimesterProgressValues[index] * gap) / 100;

            //@ts-ignore
            circleRef?.current[index]?.setNativeProps({
              strokeDashoffset:
                circleCircumference - paintedLength > circleCircumference
                  ? circleCircumference
                  : circleCircumference - paintedLength,
            });
          }
        });
      });
      if (indicator?.show) {
        animatedValue.addListener((v) => {
          var strokeDashoffset = circleCircumference;
          var val = v.value <= progress ? v.value : progress;
          strokeDashoffset = progress
            ? circleCircumference - (circleCircumference * val) / 100
            : circleCircumference;

          const paintedLength = circleCircumference - strokeDashoffset;

          const meanGap = getMeanGap(progress);
          const calculatedStrokeDashoffset = paintedLength - meanGap;
          runIndicator(calculatedStrokeDashoffset, progress);
        });
      }

      // Animate trimesters sequentially
      const trimesterAnimations = Animated.sequence(
        trimesterAnimatedValues.map((tav, index) =>
          animation(
            tav, // Animated value
            trimesterProgressValues[index], // To value
            index === 0 ? progressDelay : 0, // Delay
            (duration * trimesterProgressValues[index]) / max // Duration
          )
        )
      );

      if (indicator?.show) {
        // Animate percentage circle
        const percentageAnim = animation(
          animatedValue, // Animated value
          progress, // To value
          progressDelay, // Delay
          (duration * progress) / max // Duration
        );
        // trimester Animations run parallelly with percentage circle
        Animated.parallel([trimesterAnimations, percentageAnim]).start();
      } else {
        trimesterAnimations.start();
      }
    },
    [
      animatedValue,
      animation,
      baseParts,
      circleCircumference,
      gap,
      getMeanGap,
      indicator?.show,
      getTrimesterValues,
      runIndicator,
      trimesterAnimatedValues,
    ]
  );

  const getTrimester = useMemo(() => {
    const trimesterConfig = {
      stroke: progressColor,
      cx: halfCircle,
      cy: halfCircle,
      r: radius,
      origin: `${halfCircle}, ${halfCircle}`,
      strokeWidth: strokeWidth,
      strokeDasharray: circleCircumference,
      strokeDashoffset: circleCircumference,
    };

    return trimesterAnimatedValues.map((_, key) => (
      <Trimester
        key={key}
        //@ts-ignore
        ref={(el) => (circleRef.current[key] = el)}
        {...trimesterConfig}
        rotation={rotation + (key * 360) / baseParts}
        strokeLinecap="round"
      />
    ));
  }, [
    baseParts,
    circleCircumference,
    halfCircle,
    progressColor,
    radius,
    rotation,
    strokeWidth,
    trimesterAnimatedValues,
  ]);

  useImperativeHandle(ref, () => ({ run }));

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
        {[...Array(baseParts)].map((_, key) => {
          return (
            <Circle
              key={key}
              cx={halfCircle}
              cy={halfCircle}
              r={radius}
              stroke={baseColor}
              rotation={rotation + (key * 360) / baseParts}
              origin={`${halfCircle}, ${halfCircle}`}
              strokeWidth={strokeWidth}
              strokeDasharray={circleCircumference}
              strokeDashoffset={
                circleCircumference - circleCircumference / baseParts + gap
              }
              strokeLinecap="round"
            />
          );
        })}
        {getTrimester}

        {indicator?.show === true && (
          <>
            <PercentageCircle
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

export default memo(forwardRef(Chart));

const styles = StyleSheet.create({
  centerComponent: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
