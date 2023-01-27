import * as React from 'react';
import { render } from '@testing-library/react-native';
import RNSegmentedProgressBar from '../index';

const noOfParts = 4;

test('Validate number of base parts', async () => {
  const ProgressComp = () => {
    return (
      <RNSegmentedProgressBar
        radius={100}
        strokeWidth={14}
        baseColor={'#F00'}
        progressColor={'#000'}
        segments={noOfParts}
        segmentsGap={30}
      />
    );
  };
  const renderedComp = render(<ProgressComp />);
  const svgCircles = renderedComp?.toJSON()?.children[0].children[0].children;
  console.log(
    `No of circles rendered -> ${
      svgCircles.length
    }\nNo of circles should render -> ${noOfParts * 2}`
  );
  expect(svgCircles.length).toBe(noOfParts * 2);
});
