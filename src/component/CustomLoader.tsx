//import liraries
import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {Colors} from '../constant';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const {width} = Dimensions.get('screen');

// create a component
const CustomLoader = () => {
  const offset = useSharedValue(width);

  const animatedStyles = useAnimatedStyle(() => ({
    opacity: interpolate(offset.value, [-200, width], [1, 0.8]),
    transform: [{translateX: offset.value}],
  }));

  React.useEffect(() => {
    offset.value = withRepeat(
      withTiming(-offset.value / 2, {duration: 1000}),
      -1,
      true,
    );
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.fill, animatedStyles]} />
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: 'white',
  },
  fill: {
    width: 100,
    height: 5,
    borderRadius: 2,
    backgroundColor: Colors.colors.primary,
  },
});

//make this component available to the app
export default CustomLoader;
