import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import Chart, { RunAnimationHandler } from 'rn-segmented-progress-bar';

export default function App() {
  const circularProgressRef = React.useRef<RunAnimationHandler>(null);

  React.useEffect(() => {
    circularProgressRef?.current?.run({
      progress: 75,
    });
  }, []);

  return (
    <View style={styles.container}>
      <Chart
        ref={circularProgressRef}
        radius={114}
        strokeWidth={14}
        gap={30}
        baseParts={4}
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
