//import liraries
import React, {RefObject, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Modal,
  TouchableOpacity,
  Platform,
  TextStyle,
  TextInputProps,
  Alert,
} from 'react-native';
import Header from '../../component/header';
import {Colors, Sizes} from '../../constant';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolateColor,
  interpolate,
} from 'react-native-reanimated';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ReactNativeCalendarEvents from 'react-native-calendar-events';
import {
  CommonActions,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {ParamListBase} from '../eventDetail';
import {addTag, removeTag} from '../../utils';
import Toast, {ToastHandle} from '../../component/toast';

const contentHeight = hp(50);

type inputBoxtype = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: TextStyle;
  props?: TextInputProps;
};

function generateRandomId() {
  const randomString = Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now().toString(36);
  return randomString + timestamp;
}

type eventStateType = {
  eventName: string;
  date: moment.Moment | null;
  startTime: moment.Moment | null;
  endTime: moment.Moment | null;
  description: string;
  id?: string;
};
const InputBox = ({
  onChangeText,
  value,
  placeholder,
  style,
  props,
}: inputBoxtype) => {
  return (
    <View>
      <TextInput
        {...{placeholder}}
        placeholderTextColor={Colors.colors.grey0}
        value={value}
        style={[styles.input, style]}
        {...{onChangeText}}
        {...props}
      />
    </View>
  );
};

type datePickerType = {
  mode: 'date' | 'time';
  onChange: (date: moment.Moment) => void;
  placeholder: string;
  dateSelected?: moment.Moment | null;
};

const CustomDatePicker = ({
  mode,
  onChange,
  placeholder,
  dateSelected,
}: datePickerType) => {
  const [visible, setVisible] = useState<boolean>(false);
  const animated = useSharedValue(1);
  const [date, setDate] = useState<Date>();

  const props = mode === 'date' ? {minimumDate: new Date()} : {};

  useEffect(() => {
    animated.value = withTiming(visible ? 1 : 0);
  }, [animated, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      animated.value,
      [0, 1],
      ['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)'],
    ),
  }));

  const contentAimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateY: interpolate(animated.value, [0, 1], [contentHeight, 0])},
    ],
  }));

  const onClose = () => setVisible(false);

  const onDone = () => {
    onChange(moment(date));
    onClose();
  };

  useEffect(() => {
    if (Platform.OS === 'android' && date) {
      onChange(moment(date));
      onClose();
    }
  }, [date]);

  const picker = () => {
    if (Platform.OS === 'android') {
      if (!visible) {
        return null;
      }
      return (
        <DateTimePicker
          {...props}
          mode={mode}
          testID="dateTimePicker"
          display="spinner"
          value={date || new Date()}
          onChange={(ev, date) => {
            if (ev.type === 'dismissed') {
              setVisible(false);
              return;
            }
            date && setDate(date);
          }}
        />
      );
    } else
      return (
        <Modal
          transparent
          animationType="none"
          onRequestClose={onClose}
          {...{visible}}>
          {Platform.OS === 'ios' && (
            <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]} />
          )}
          <View
            style={{
              flex: 1,
              justifyContent: Platform.OS === 'ios' ? 'flex-end' : 'center',
            }}>
            <View
              style={{
                backgroundColor:
                  Platform.OS === 'ios' ? Colors.colors.white : 'transparent',
              }}>
              <Animated.View
                style={[Platform.OS === 'ios' && contentAimatedStyle]}>
                {Platform.OS === 'ios' && (
                  <View style={styles.row}>
                    <TouchableOpacity onPress={onClose}>
                      <Text style={styles.actionText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onDone}>
                      <Text style={styles.actionText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <DateTimePicker
                  {...props}
                  mode={mode}
                  testID="dateTimePicker"
                  display="spinner"
                  value={date || new Date()}
                  onChange={(ev, date) => {
                    date && setDate(date);
                  }}
                />
              </Animated.View>
            </View>
          </View>
        </Modal>
      );
  };

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(!visible)}>
        <View
          style={[
            styles.input,
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
          ]}>
          <Text
            style={{
              color: dateSelected ? Colors.colors.black : Colors.colors.grey0,
            }}>
            {dateSelected
              ? mode === 'date'
                ? moment(dateSelected).format('DD-MM-YYYY')
                : moment(dateSelected).format('hh:mm a')
              : placeholder}
          </Text>

          <Icon
            name={mode === 'date' ? 'calendar' : 'clock-outline'}
            size={Sizes.iconSize.large}
            color={Colors.colors.grey0}
          />

          {picker()}
        </View>
      </TouchableOpacity>
    </>
  );
};

// create a component
const AddEvent = () => {
  const [event, stateEvent] = useState<eventStateType>({
    date: null,
    description: '',
    endTime: null,
    eventName: '',
    startTime: null,
  });

  const {params} = useRoute<RouteProp<ParamListBase>>();

  const {dispatch} = useNavigation();

  const eventData = params?.event;

  const toastRef: RefObject<ToastHandle> = useRef<ToastHandle>(null);

  const formatDateTime = (
    date: moment.Moment | null,
    time: moment.Moment | null,
  ) => {
    if (!date || !time) return;
    return (
      moment(date).format('DD-MM-YYYY') + ' ' + moment(time).format('hh:mm a')
    );
  };

  const createEvent = async () => {
    const hasEmptyData = Object.values(event).some(item => !item);

    if (hasEmptyData) {
      toastRef.current?.success('All fields are required.');
      return;
    }

    const startTimeFormatted = moment(
      formatDateTime(event.date, event.startTime),
      'DD-MM-YYYY hh:mm a',
    );
    const endTimeFormatted = moment(
      formatDateTime(event.date, event.endTime),
      'DD-MM-YYYY hh:mm a',
    );

    if (startTimeFormatted.isAfter(endTimeFormatted)) {
      toastRef.current?.success('End Time should be greater than Start Time');
      return;
    }

    const status = await ReactNativeCalendarEvents.requestPermissions();
    if (status === 'authorized') {
      const eventDate = moment(event.date).format('YYYY-MM-DD');
      const startTime = moment(event.startTime).format('HH:mm:ss');
      const endTime = moment(event.endTime).format('HH:mm:ss');
      const startDateTime = moment(`${eventDate} ${startTime}`).toISOString();
      const endDateTime = moment(`${eventDate} ${endTime}`).toISOString();
      let defaultConfigId: string;
      try {
        let calenders = await ReactNativeCalendarEvents.findCalendars();

        if (calenders.length === 0) {
          Alert.alert('', 'No calendar found.');
          return;
        }

        const defaultCalendar = calenders.find(calendar => calendar.isPrimary);

        if (defaultCalendar) {
          defaultConfigId = defaultCalendar.id;
        } else {
          Alert.alert(
            '',
            'No default calendar found. please make a default one',
          );
          return;
        }

        const calendarEventData: any = {
          startDate: startDateTime,
          endDate: endDateTime,
          calendarId: defaultConfigId,
          notes: event.description,
          description: event.description,
        };

        if (eventData?.id) {
          calendarEventData['id'] = eventData.id;
        }

        const eventDetails = await ReactNativeCalendarEvents.saveEvent(
          `${addTag(event.eventName)}`,
          calendarEventData,
        );
        5;
        stateEvent({
          date: null,
          description: '',
          endTime: null,
          eventName: '',
          startTime: null,
        });

        toastRef.current?.success(
          eventData
            ? 'Event updated successfully'
            : 'Event created successfully',
        );

        dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{name: 'Home'}],
          }),
        );
      } catch (err) {
        console.log('err0---->', err);
      }
    }
  };

  useEffect(() => {
    if (eventData) {
      stateEvent({
        date: moment(eventData.startDate),
        description: eventData.notes || eventData.description || '',
        startTime: moment(eventData.startDate),
        endTime: moment(eventData.endDate),
        eventName: removeTag(eventData.title),
        id: eventData.id,
      });
    }
  }, [eventData]);

  console.log('event--->', event);

  return (
    <View style={styles.container}>
      <Header left title={eventData ? 'Update Event' : 'Add New Event'} />

      <View style={styles.content}>
        <Text style={styles.title}>Information Event</Text>
        <InputBox
          placeholder="Event name"
          value={event.eventName}
          onChangeText={(text: string) => {
            stateEvent({
              ...event,
              eventName: text,
            });
          }}
        />
        <CustomDatePicker
          mode="date"
          dateSelected={event.date}
          placeholder="Date"
          onChange={(date: moment.Moment) => {
            stateEvent({
              ...event,
              date: date,
            });
          }}
        />

        <View
          style={[
            styles.row,
            {
              marginVertical: 0,
              paddingHorizontal: 0,
            },
          ]}>
          <View style={{flex: 0.45}}>
            <CustomDatePicker
              mode="time"
              dateSelected={event.startTime}
              placeholder="Start time"
              onChange={(date: moment.Moment) => {
                stateEvent({
                  ...event,
                  startTime: date,
                });
              }}
            />
          </View>
          <View style={{flex: 0.45}}>
            <CustomDatePicker
              mode="time"
              dateSelected={event.endTime}
              placeholder="End time"
              onChange={(date: moment.Moment) => {
                stateEvent({
                  ...event,
                  endTime: date,
                });
              }}
            />
          </View>
        </View>
        <InputBox
          placeholder="Notes"
          value={event.description}
          props={{multiline: true}}
          style={{height: 120, textAlignVertical: 'top'}}
          onChangeText={(text: string) => {
            stateEvent({
              ...event,
              description: text,
            });
          }}
        />
      </View>

      <TouchableOpacity style={styles.btn} onPress={createEvent}>
        <Text style={styles.btnText}>
          {eventData ? 'Update Event' : 'Create Event'}
        </Text>
      </TouchableOpacity>
      <Toast ref={toastRef} />
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 1.5 * Sizes.space.xlarge,
  },
  input: {
    marginTop: Sizes.space.large,
    paddingHorizontal: Sizes.space.medium,
    height: 50,
    borderColor: Colors.colors.grey0,
    borderRadius: Sizes.space.small,
    borderWidth: 1,
  },
  title: {
    marginBottom: 2 * Sizes.space.xlarge,
    fontSize: Sizes.f_Size.large,
    color: Colors.colors.primary,
    fontWeight: '600',
  },
  row: {
    marginVertical: Sizes.space.large,
    paddingHorizontal: Sizes.space.large,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionText: {
    color: Colors.colors.blue1,
    fontSize: Sizes.f_Size.large,
  },
  btn: {
    backgroundColor: Colors.colors.primary,
    paddingVertical: 1.5 * Sizes.space.large,
    margin: 2 * Sizes.space.large,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  btnText: {
    color: Colors.colors.white,
    fontSize: Sizes.f_Size.large,
  },
});

//make this component available to the app
export default AddEvent;
