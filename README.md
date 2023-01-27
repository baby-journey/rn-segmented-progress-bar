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
| radius                       | radius of the progress indicator                                                                        | Number                        | 0                   | true     |
| strokeWidth                | Number |Thickness of the circular track and indicator                        | Number                        | 0                   | false    |
| baseColor       | color of the circular track                                                      | rgba                        | 'transparent'       | false    |
| progressColor                      | color of the indicator                                                                | rgba                        | 60                  | false    |
| baseParts           | number of segments                                                   | Number                        | 10                  | false    |
| gap           | number of segments                                                   | Number                        | 10                  | false    |
| centerComponent         | -                                                 | React.ReactNode                        | 10                  | false    |
| indicator         | -                                                 | React.ReactNode                        | 10                  | false    |
| focused         | -                                                 | React.ReactNode                        | 10                  | false    |
| duration         | -                                                 | React.ReactNode                        | 10                  | false    |
 
## [License](https://github.com/baby-journey/rn-segmented-progress-bar/blob/main/LICENSE)

## Author

* **BabyJourney** - [BabyJourney](https://github.com/baby-journey/rn-segmented-progress-bar)
