import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import RNSegmentedProgressBar, {
  RunAnimationHandler,
} from '@baby-journey/rn-segmented-progress-bar';

export default function App() {
  const circularProgressRef = React.useRef<RunAnimationHandler>(null);

  React.useEffect(() => {
    circularProgressRef?.current?.run({
      progress: 75,
    });
  }, []);

  return (
    <View style={styles.container}>
      <RNSegmentedProgressBar
        ref={circularProgressRef}
        radius={114}
        strokeWidth={14}
        segmentsGap={30}
        segments={4}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
