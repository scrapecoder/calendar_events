//import liraries
import React, {RefObject, useRef} from 'react';
import {View, Text, StyleSheet, Pressable, Linking} from 'react-native';
import Header from '../../component/header';
import {
  CommonActions,
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import ReactNativeCalendarEvents, {
  CalendarEventReadable,
} from 'react-native-calendar-events';
import {Colors, Sizes} from '../../constant';
import moment from 'moment';
import Toast, {ToastHandle} from '../../component/toast';
import {nativeStackType} from '../../navigation';
import {TAG, removeTag} from '../../utils';

export type event = {
  event: CalendarEventReadable;
};
export type ParamListBase = {
  event: event;
};
type DetailSection = {
  title?: string;
  substitle?: string;
};

const DetailSection = ({title, substitle}: DetailSection) => {
  return (
    <View style={styles.section}>
      {title && (
        <Text style={[styles.smallText, styles.lightText]}>{title}</Text>
      )}
      <Text style={title ? styles.smallText : styles.bigText}>{substitle}</Text>
    </View>
  );
};

const handleLinkPress = (url: string) => {
  Linking.openURL(url);
};

// Function to format the description text with clickable links
const formatDescription = (description: string) => {
  // Define the pattern dynamically
  const startPattern = '-::~:';
  const endPattern = ':~::-';

  const cleanedString = description.replace(/-::~[:~]+-/g, '');

  const pattern = new RegExp(`${startPattern}.*${endPattern}`);

  // Remove the pattern from the description
  const cleanedDescription = cleanedString.replace(pattern, '');
  const regex = /(\b(?:https?|ftp):\/\/\S+\.\S+\b)/gi;

  const parts = cleanedDescription.split(regex);

  return parts.map((part, index) => {
    if (regex.test(part)) {
      return (
        <Text
          key={index}
          style={[
            styles.smallText,
            {color: 'blue', textDecorationLine: 'underline'},
          ]}
          onPress={() => handleLinkPress(part)}>
          {part}
        </Text>
      );
    }

    return (
      <Text style={styles.smallText} key={index}>
        {part}
      </Text>
    );
  });
};

// create a component
const EventDetail = () => {
  const {
    params: {event},
  } = useRoute<RouteProp<ParamListBase>>();

  const {navigate, dispatch} = useNavigation<NavigationProp<nativeStackType>>();

  const toastRef: RefObject<ToastHandle> = useRef<ToastHandle>(null);

  const deleteEvent = async () => {
    const permission = await ReactNativeCalendarEvents.checkPermissions();
    if (permission === 'authorized') {
      if (event.id) {
        const isDeleted = await ReactNativeCalendarEvents.removeEvent(event.id);

        if (isDeleted) {
          toastRef?.current?.success('Event deleted successfully.');
          setTimeout(() => {
            dispatch(
              CommonActions.reset({
                index: 1,
                routes: [{name: 'Home'}],
              }),
            );
          }, 1000);
        }
      }
    }
  };

  const editEvent = () => {
    navigate('AddEvent', {event});
  };

  return (
    <View style={styles.container}>
      <Header left title="Event detail" />
      <View style={styles.content}>
        <DetailSection substitle={removeTag(event.title)} />
        <DetailSection
          title="Start date"
          substitle={moment(event.startDate).format('DD-MM-YYYY')}
        />

        <View style={styles.row}>
          <DetailSection
            title="Start Time"
            substitle={moment(event.startDate).format('hh:mm a')}
          />
          <View style={{marginLeft: `${2 * Sizes.space.large}%`}}>
            <DetailSection
              title="End Time"
              substitle={moment(event.endDate).format('hh:mm a')}
            />
          </View>
        </View>
        <DetailSection
          title="Notes"
          substitle={formatDescription(event.notes || event.description)}
        />
      </View>

      {event.title.includes(TAG) && (
        <>
          <Pressable onPress={editEvent} style={styles.btn}>
            <Text style={styles.btnText}>Edit</Text>
          </Pressable>

          <Pressable
            onPress={deleteEvent}
            style={[styles.btn, {backgroundColor: 'tomato'}]}>
            <Text style={styles.btnText}>Delete</Text>
          </Pressable>
        </>
      )}
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
    padding: Sizes.space.xlarge,
  },
  bigText: {
    fontSize: Sizes.f_Size.xlarge,
    color: Colors.colors.black,
    fontWeight: '500',
    marginBottom: Sizes.space.large,
  },
  mediumText: {
    fontSize: Sizes.f_Size.large,
    color: Colors.colors.black,
    fontWeight: '500',
  },
  smallText: {
    fontSize: Sizes.f_Size.small,
    color: Colors.colors.black,
    fontWeight: '500',
  },
  section: {
    marginTop: 2 * Sizes.space.large,
  },
  lightText: {
    color: Colors.colors.grey3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btn: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Sizes.space.large,
    backgroundColor: Colors.colors.primary,
    paddingVertical: 1.2 * Sizes.space.xlarge,
    paddingHorizontal: Sizes.space.large,
  },
  btnText: {
    color: Colors.colors.white,
    fontSize: Sizes.iconSize.medium,
    fontWeight: '500',
  },
});

//make this component available to the app
export default EventDetail;
