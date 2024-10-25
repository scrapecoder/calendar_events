import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from '../main/home';
import AddEvent from '../main/addEvent';
import EventDetail from '../main/eventDetail';
import {CalendarEventReadable} from 'react-native-calendar-events';

export type nativeStackType = {
  Home: undefined;
  AddEvent: {event: CalendarEventReadable} | undefined;
  EventDetail: {event: CalendarEventReadable};
};

const NativeStack = createNativeStackNavigator<nativeStackType>();

const HomeStack = () => (
  <NativeStack.Navigator
    screenOptions={{headerShown: false}}
    initialRouteName="Home">
    <NativeStack.Screen component={Home} name="Home" />
    <NativeStack.Screen component={AddEvent} name="AddEvent" />
    <NativeStack.Screen component={EventDetail} name="EventDetail" />
  </NativeStack.Navigator>
);

export default HomeStack;
