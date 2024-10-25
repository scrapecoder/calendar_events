//import liraries
import React, {Component} from 'react';
import {View, Text, StyleSheet, TextStyle} from 'react-native';
import {Colors, Sizes} from '../constant';

type TextProps = {
  style?: TextStyle;
  text: string;
};
// create a component
const SmallText = ({style = {}, text = ''}: TextProps) => {
  return <Text style={[styles.smallText, style]}>{text}</Text>;
};

const MediumText = ({style = {}, text}: TextProps) => {
  return <Text style={[styles.mediumText, style]}>{text}</Text>;
};

const LargeText = ({style = {}, text}: TextProps) => {
  return <Text style={[styles.largeText, style]}>{text}</Text>;
};

// define your styles
const styles = StyleSheet.create({
  smallText: {
    fontSize: Sizes.f_Size.small,
    color: Colors.colors.black,
  },
  mediumText: {
    fontSize: Sizes.f_Size.medium,
    color: Colors.colors.black,
  },
  largeText: {
    fontSize: Sizes.f_Size.large,
    color: Colors.colors.black,
  },
});

//make this component available to the app
export {SmallText, MediumText, LargeText};
