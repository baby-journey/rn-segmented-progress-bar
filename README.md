# React Native Segmented Progress Bar

A React Native progress bar that animates and draws the progress in a circular path. The progress bar indicator can move in number of segments to imply the percentage of the progress.

The following are customizable:
 - The circular track color
 - Indicator color
 - Number of segments. PS: The maximum number of segments is 10
 - Center element can be customized (e.g. you can pass a component that will be rendered)
 - Stroke width of a single segment
 - Radius of the component

## Installing

With npm

```
npm install rn-segmented-progress-bar --save
```

With yarn

```
yarn add rn-segmented-progress-bar
```

## Usage

```javascript
import RNSegmentedProgressBar from 'rn-segmented-progress-bar';

<RNSegmentedProgressBar
  ref={segmentedProgressBarRef}
  radius={114}
  strokeWidth={14}
  gap={30}
  baseParts={4}
/>
      
```

## Examples

1. Single circle
2. Mutiple segments
3. Multiple segments with animation and progress circle

## Props

| Prop                        | Description                                                                           | Type                          | Default Value       | Required |
| :--------------------------:|:--------------------------------------------------------------------------------------|:-----------------------------:|:-------------------:|:--------:|
| radius                       | Radius of the progress indicator                                                                        | Number                        | 100                   | True     |
| strokeWidth                 |Thickness of the circular track                      | Number                        | 10                   | True    |
| tintColor       | Color of the circular track                                                      | rgba                        | #FFEDE1       | False    |
| fillColor                      | Color of the progress indicator                                                                | rgba                        | #F39E93                  | False    |
| segments           | Number of segments                                                   | Number                        | 3                  | False    |
| segmentsGap           | Gap between segments                                                   | Number                        | 0                  | False    |
| centerComponent         | A component used to display the percentage of the progress                                         | React.ReactNode                        | -                  | False    |
| indicator         |  A colored progression path which shows the completed percentage                                               | Object. Refer IndicatorInterface given below.                        | -                  | False    |

```
indicator object structure:

interface IndicatorInterface {
  show?: boolean;
  radius?: number;
  strokeWidth?: number;
  color?: string;
}
```

 
## [License](https://github.com/baby-journey/rn-segmented-progress-bar/blob/main/LICENSE)

## Author

* **BabyJourney** - [BabyJourney](https://github.com/baby-journey/rn-segmented-progress-bar)
