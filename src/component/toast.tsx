import React, {
  forwardRef,
  useRef,
  useState,
  useImperativeHandle,
  ReactNode,
} from 'react';
import {
  View,
  Animated,
  Platform,
  Text,
  StatusBar,
  StyleSheet,
} from 'react-native';
import {Colors} from '../constant';

interface ToastProps {
  children?: ReactNode;
}

export interface ToastHandle {
  success(message: string): void;
  error(message: string): void;
}

const Toast = forwardRef<ToastHandle, ToastProps>((props, ref) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [modalShown, setModalShown] = useState(false);
  const [message, setMessage] = useState('Success!');
  const [toastColor, setToastColor] = useState(Colors.colors.primary);
  const [textColor, setTextColor] = useState(Colors.colors.white);

  const closeToast = () => {
    setTimeout(() => {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 350,
        useNativeDriver: false,
      }).start(() => {
        StatusBar.setBarStyle('light-content');
        Platform.OS === 'android' &&
          StatusBar.setBackgroundColor(Colors.colors.primary);
        setModalShown(false);
      });
    }, 2000);
  };

  const callToast = (message: string, type: 'success' | 'error') => {
    if (modalShown) return;
    setToastType(message, type);
    setModalShown(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 350,
      useNativeDriver: false,
    }).start(closeToast);
  };

  let animation = animatedValue.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [-100, -10, 0],
  });

  useImperativeHandle(ref, () => ({
    success(message: string) {
      callToast(message, 'success');
      StatusBar.setBarStyle('dark-content');
    },
    error(message: string) {
      callToast(message, 'error');
      StatusBar.setBarStyle('light-content');
    },
  }));

  const setToastType = (
    message: string = 'Success!',
    type: 'success' | 'error' = 'success',
  ) => {
    let color;
    let textColorValue;
    if (type === 'error') {
      color = 'tomato';
      textColorValue = Colors.colors.white;
      Platform.OS === 'android' && StatusBar.setBackgroundColor('tomato');
    } else {
      color = Colors.colors.primary;
      textColorValue = Colors.colors.white;
      Platform.OS === 'android' &&
        StatusBar.setBackgroundColor(Colors.colors.primary);
    }
    setMessage(message);
    setToastColor(color);
    setTextColor(textColorValue);
  };

  return modalShown ? (
    <Animated.View
      style={[
        styles.container,
        {backgroundColor: toastColor, transform: [{translateY: animation}]},
      ]}>
      <View style={styles.row}>
        <Text style={[styles.message, {color: textColor}]}>{message}</Text>
      </View>
    </Animated.View>
  ) : null;
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    minHeight: 60,
    width: '100%',
    backgroundColor: 'green',
    zIndex: 1000,
    justifyContent: 'flex-end',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 4,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6.27,
    elevation: 10,
  },
  message: {
    fontSize: 14,
    color: Colors.colors.white,
    fontWeight: 'bold',
    marginHorizontal: 10,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Toast;
