//import liraries
import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors, Sizes} from '../constant';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {MediumText} from './text';
import {NavigationProp, useNavigation} from '@react-navigation/native';

type HeaderProps = {
  left?: boolean;
  right?: boolean;
  title?: string;
  onRightPress?: () => void;
};
// create a component
const Header = ({left, right, title, onRightPress}: HeaderProps) => {
  const {goBack} = useNavigation();
  return (
    <View style={styles.container}>
      {/* left section */}
      <Pressable
        disabled={!left}
        style={!left && {opacity: 0}}
        onPress={goBack}>
        <Icon
          name="arrow-left"
          color={Colors.colors.white}
          size={Sizes.iconSize.xlarge}
        />
      </Pressable>

      {/* mid section */}
      {title && (
        <MediumText text={title} style={{color: Colors.colors.white}} />
      )}

      {/* right section */}
      <Pressable
        onPress={() => onRightPress?.()}
        disabled={!right}
        style={!right && {opacity: 0}}>
        <Icon
          name="alarm"
          color={Colors.colors.white}
          size={Sizes.iconSize.xlarge}
        />
      </Pressable>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.colors.primary,
    paddingHorizontal: wp(4),
    height: hp(6),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

//make this component available to the app
export default Header;
