/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';

import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import {Colors} from './src/constant';
import HomeStack from './src/navigation';
import {NavigationContainer} from '@react-navigation/native';
import {enableScreens} from 'react-native-screens';

function App(): React.JSX.Element {
  useEffect(() => {
    enableScreens();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor={Colors.colors.primary}
        barStyle={'light-content'}
      />

      <NavigationContainer>
        <HomeStack />
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.colors.primary,
  },
});

export default App;
