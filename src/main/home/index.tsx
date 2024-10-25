//import liraries
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  ProgressBarAndroidBase,
} from 'react-native';
import {CalendarList, LocaleConfig} from 'react-native-calendars';
import Header from '../../component/header';
import {Colors, Sizes} from '../../constant';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {nativeStackType} from '../../navigation';
import ReactNativeCalendarEvents, {
  CalendarEventReadable,
} from 'react-native-calendar-events';
import {removeTag} from '../../utils';
import CustomLoader from '../../component/CustomLoader';

const {width} = Dimensions.get('window');
const CALENDAR_WIDTH = width;

interface FormattedData {
  [date: string]: {
    customStyles: any;
    dotColor: string;
    marked: boolean;
    selected: boolean;
  };
}

LocaleConfig.locales['en'] = {
  monthNames: [
    'January',
    'Febuary',
    'March',
    'April',
    'May',
    'June',
    'July',
    'Augest',
    'September',
    'October',
    'November',
    'December',
  ],

  dayNames: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Friday',
    'Saturday',
    'Suday',
  ],
  dayNamesShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
};

LocaleConfig.defaultLocale = 'en';

type calendarSectionType = {
  onDayPress: (date: moment.Moment) => void;
  data: CalendarEventReadable[];
};

const CalendarSection = memo(({onDayPress, data}: calendarSectionType) => {
  const [selectedDate, setSelectedDate] = useState(moment());
  const [month, setMonth] = useState(new Date());
  const calRef = useRef<any>();

  useEffect(() => {
    const _month = month.getMonth() + 1;
    const _year = month.getFullYear();
    const day = selectedDate.format('DD');
    var startDate = moment([_year, _month - 1]);

    var endDate = moment(startDate).endOf('month').format('DD');

    const date = `${day > endDate ? endDate : day}-${
      _month > 9 ? _month : '0' + _month
    }-${_year}`;

    setSelectedDate(moment(date, 'DD-MM-YYYY'));
    onDayPress(moment(date, 'DD-MM-YYYY'));
  }, [month]);

  const leftArrowPress = useCallback(() => {
    const momentDate = moment(month).subtract(1, 'months');
    const prevMonth = momentDate.toDate();
    setMonth(prevMonth);
    calRef.current?.scrollToMonth(prevMonth);
  }, [month]);

  const rightArrowPress = useCallback(() => {
    const momentDate = moment(month).add(1, 'months');
    const nextMonth = momentDate.toDate();
    setMonth(nextMonth);
    calRef.current?.scrollToMonth(nextMonth);
  }, [month]);
  const customHeader = () => {
    return (
      <View style={[styles.headerContaner, {width: CALENDAR_WIDTH * 0.9}]}>
        <Text style={styles.currentSelectedDate}>
          {moment(month).format('MMMM YYYY')}
        </Text>
        <View style={styles.row}>
          {/* left icon */}
          <Pressable style={styles.icon} onPress={leftArrowPress}>
            <Icon
              name="chevron-left"
              color={Colors.colors.grey0}
              size={Sizes.iconSize.large}
            />
          </Pressable>
          <View style={styles.iconSpace} />
          {/* right icon */}
          <Pressable style={styles.icon} onPress={rightArrowPress}>
            <Icon
              name="chevron-right"
              color={Colors.colors.grey0}
              size={Sizes.iconSize.large}
            />
          </Pressable>
        </View>
      </View>
    );
  };

  const getEventDate = useCallback(
    (selectedDate: moment.Moment) => {
      const result: FormattedData = {};

      const selectedDateStyle = {
        container: {
          backgroundColor: Colors.colors.primary,
          elevation: 2,
        },
        text: {
          color: Colors.colors.white,
        },
      };

      data.forEach((event: CalendarEventReadable) => {
        const occurrenceDate = moment(event.startDate).format('YYYY-MM-DD');

        const isSameDate = moment(occurrenceDate).isSame(
          selectedDate.format('YYYY-MM-DD'),
        );

        result[occurrenceDate] = {
          customStyles: isSameDate ? selectedDateStyle : {},
          selected: isSameDate ? true : false,
          dotColor: isSameDate ? Colors.colors.white : Colors.colors.primary,
          marked: true,
        };
      });

      return result;
    },
    [data],
  );

  const multiDotMarks = useMemo(() => {
    return {
      [moment(selectedDate).format('YYYY-MM-DD')]: {
        customStyles: {
          container: {
            backgroundColor: Colors.colors.primary,
            elevation: 2,
          },
          text: {
            color: Colors.colors.white,
          },
        },
        selected: true,
      },
      ...getEventDate(selectedDate),
    };
  }, [selectedDate, data]);

  return (
    <CalendarList
      ref={calRef}
      horizontal
      pagingEnabled
      staticHeader
      calendarWidth={CALENDAR_WIDTH}
      renderHeader={customHeader}
      scrollEnabled={false}
      markingType="dot"
      markedDates={multiDotMarks}
      onDayPress={day => {
        setSelectedDate(moment(day.timestamp));
        onDayPress(moment(day.timestamp));
      }}
      // @ts-ignore
      // dayComponent={renderDate}
      hideArrows
      theme={{
        // @ts-ignore
        'stylesheet.calendar.header': {
          dayHeader: {
            width: CALENDAR_WIDTH / 7,
            color: Colors.colors.grey2,
            fontSize: 15,
            textAlign: 'center',
          },
        },
      }}
    />
  );
});

interface AgendaScreenProps {}

interface AgendaEntry {
  name: string;
  height: number;
  day: string;
}

// const CalEventSection = forwardRef((props, ref) => {
//   const [items, setItems] = useState<Record<string, AgendaEntry[]> | undefined>(
//     undefined,
//   );

//   const onDateChange = (date: moment.Moment) => {
//     console.log('onDateChange=>', date);
//   };

//   useImperativeHandle(
//     ref,
//     () => {
//       return {
//         onDateChange(date: moment.Moment) {
//           onDateChange(date);
//         },
//       };
//     },
//     [],
//   );

//   const loadItems = (day: any) => {
//     const existingItems = items || {};

//     setTimeout(() => {
//       for (let i = -15; i < 85; i++) {
//         const time = day.timestamp + i * 24 * 60 * 60 * 1000;
//         const strTime = timeToString(time);

//         if (!existingItems[strTime]) {
//           existingItems[strTime] = [];

//           const numItems = Math.floor(Math.random() * 3 + 1);
//           for (let j = 0; j < numItems; j++) {
//             existingItems[strTime].push({
//               name: 'Item for ' + strTime + ' #' + j,
//               height: Math.max(50, Math.floor(Math.random() * 150)),
//               day: strTime,
//             });
//           }
//         }
//       }

//       const newItems = {...existingItems};
//       setItems(newItems);
//     }, 1000);
//   };

//   const renderItem = (reservation: AgendaEntry, isFirst: boolean) => {
//     const fontSize = isFirst ? 16 : 14;
//     const color = isFirst ? 'black' : '#43515c';

//     return (
//       <TouchableOpacity
//         style={[styles.item, {height: reservation.height}]}
//         onPress={() => Alert.alert(reservation.name)}>
//         <Text style={{fontSize, color}}>{reservation.name}</Text>
//       </TouchableOpacity>
//     );
//   };

//   const renderEmptyDate = () => {
//     return (
//       <View style={styles.emptyDate}>
//         <Text>This is an empty date!</Text>
//       </View>
//     );
//   };

//   const rowHasChanged = (r1: AgendaEntry, r2: AgendaEntry) => {
//     return r1.name !== r2.name;
//   };

//   const timeToString = (time: number) => {
//     const date = new Date(time);
//     return date.toISOString().split('T')[0];
//   };

//   return (
//     <Agenda
//       items={items}
//       loadItemsForMonth={loadItems}
//       selected={'2017-05-16'}
//       renderItem={renderItem}
//       renderEmptyDate={renderEmptyDate}
//       rowHasChanged={rowHasChanged}
//       showClosingKnob={false}
//       theme={{
//         //@ts-ignore
//         'stylesheet.agenda.main': {
//           header: {
//             height: 0,
//             width: 0,
//           },
//           knobContainer: {
//             height: 0,
//             width: 0,
//           },
//           knob: {
//             height: 0,
//             width: 0,
//           },
//           weekdays: {
//             height: 0,
//             width: 0,
//           },
//           weekday: {
//             height: 0,
//             width: 0,
//           },
//           reservations: {
//             flex: 1,
//           },
//         },
//       }}
//     />
//   );
// });

type eventDataType = {
  data: Array<CalendarEventReadable>;
};

const CalEventSection = ({data}: eventDataType) => {
  const {navigate} = useNavigation<NavigationProp<nativeStackType>>();

  const detailAction = useCallback((event: CalendarEventReadable) => {
    navigate('EventDetail', {event});
  }, []);
  const eventSection = (item: CalendarEventReadable) => {
    const notes = item.description || item.notes;
    return (
      <TouchableOpacity onPress={() => detailAction(item)} key={item.id}>
        <View
          style={[
            styles.row,
            {
              borderColor: Colors.colors.grey0,
              borderTopWidth: 1,
              justifyContent: 'space-between',
              backgroundColor: Colors.colors.blue0,
            },
          ]}>
          <View style={styles.leftSectionContainer}>
            <Text style={[styles.sectionMidText, {textAlign: 'center'}]}>
              {moment(item.startDate).format('hh:mm a')}
            </Text>
          </View>
          <View style={styles.rightSectionContainer}>
            <View style={styles.rightContentContainer}>
              <Text style={styles.sectionText}>{removeTag(item.title)}</Text>
              <View style={[styles.row, {justifyContent: 'flex-start'}]}>
                <View style={[styles.row, {justifyContent: 'flex-start'}]}>
                  <Text style={styles.sectionSmallText}>
                    {moment(item.startDate).format('hh:mm a')}
                  </Text>
                  <Text>{' - '}</Text>
                  <Text style={styles.sectionSmallText}>
                    {moment(item.endDate).format('hh:mm a')}
                  </Text>
                </View>
              </View>
              {notes && (
                <Text numberOfLines={2} style={styles.sectionMidText}>
                  {notes}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.sectionMidText,
                {paddingHorizontal: Sizes.space.medium},
              ]}>
              {moment(item.endDate).diff(item.startDate, 'hours') + ' Hrs'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={[styles.container, styles.shadow]}>
      <Text
        style={[
          styles.sectionText,
          {
            paddingBottom: Sizes.space.medium,
            paddingHorizontal: Sizes.space.xlarge,
          },
        ]}>
        Event
      </Text>
      <ScrollView>{data.map(eventSection)}</ScrollView>
    </View>
  );
};

// create a component
const Home = () => {
  const navigation = useNavigation<NavigationProp<nativeStackType>>();
  const [eventData, setEventData] = useState<any>([]);
  const currentSelectedYear = useRef<moment.Moment>();
  const [selectedDate, setSelectedDate] = useState<moment.Moment>(moment());

  const [loader, setLoader] = useState(false);

  const getEvents = React.useCallback(() => {
    (async () => {
      const permission = await ReactNativeCalendarEvents.requestPermissions();

      if (permission === 'authorized') {
        if (
          eventData[0]?.startDate &&
          moment(moment(currentSelectedYear.current)).isSame(
            moment(selectedDate),
            'year',
          )
        ) {
          return;
        }

        setLoader(true);

        let events: CalendarEventReadable[];
        // Get the current month's first and last date
        const currentDate = moment(selectedDate);
        const firstDateOfMonth = currentDate
          .clone()
          .startOf('year')
          .toISOString();
        const lastDateOfMonth = currentDate.clone().endOf('year').toISOString();

        events = await ReactNativeCalendarEvents.fetchAllEvents(
          firstDateOfMonth,
          lastDateOfMonth,
        );

        currentSelectedYear.current = selectedDate;

        if (events.length) setEventData(events);

        setTimeout(() => {
          setLoader(false);
        }, 1000);
      }
    })();
  }, [selectedDate]);

  useFocusEffect(getEvents);

  const onDayPress = (day: moment.Moment) => {
    setSelectedDate(day);
  };

  const data = useMemo(
    () =>
      eventData.filter((event: CalendarEventReadable) => {
        return moment(moment(event.startDate).format('DD-MM-YYYY')).isSame(
          moment(selectedDate).format('DD-MM-YYYY'),
        );
      }),
    [eventData, selectedDate],
  );

  return (
    <View style={styles.container}>
      <Header
        right
        onRightPress={() => {
          navigation.navigate('AddEvent');
        }}
      />

      <View style={styles.contentContainer}>
        <View
          style={[{width: CALENDAR_WIDTH, alignSelf: 'center'}, styles.shadow]}>
          <CalendarSection data={eventData} {...{onDayPress}} />
        </View>
        <CalEventSection {...{data}} />
      </View>
      {loader && <CustomLoader />}
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.colors.white,
  },
  contentContainer: {
    flex: 1,
  },
  currentSelectedDate: {
    color: Colors.colors.primary,
    fontWeight: 'bold',
    fontSize: Sizes.f_Size.medium,
  },
  headerContaner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 10,
    marginVertical: 2 * Sizes.space.large,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    backgroundColor: Colors.colors.grey1,
    borderRadius: 2,
    height: 25,
    width: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  iconSpace: {
    width: Sizes.space.medium,
  },
  day: {
    color: Colors.colors.grey2,
    fontWeight: '700',
  },

  fakeDayContainer: {},
  dayContainer: {
    width: 40,
    height: 40,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
  customDay: {
    margin: 10,
    fontSize: 24,
    color: 'green',
  },
  dayItem: {
    marginLeft: 34,
  },
  rightSectionContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.colors.white,
  },
  rightContentContainer: {
    paddingHorizontal: 1.5 * Sizes.space.large,
    paddingVertical: 2 * Sizes.space.large,
    flex: 1,
    borderStartWidth: 1,
    borderColor: Colors.colors.grey0,
  },
  leftSectionContainer: {
    flex: 0.2,

    paddingVertical: 1.5 * Sizes.space.large,
    paddingHorizontal: Sizes.space.medium,
  },
  sectionText: {
    fontSize: Sizes.f_Size.medium,
    lineHeight: Sizes.f_Size.medium * 1.5,
    color: Colors.colors.grey2,
    fontWeight: '500',
  },
  sectionMidText: {
    fontSize: Sizes.f_Size.xs,
    lineHeight: Sizes.f_Size.xs * 1.5,
    color: Colors.colors.grey2,
    fontWeight: '500',
  },

  sectionSmallText: {
    fontSize: Sizes.f_Size.xxs,
    lineHeight: Sizes.f_Size.xxs * 1.5,
    color: Colors.colors.grey2,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    marginHorizontal: Sizes.space.small,
    backgroundColor: Colors.colors.grey2,
    height: '80%',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.colors.primary,
  },
});

//make this component available to the app
export default Home;
