import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Material from 'react-native-vector-icons/MaterialIcons';
import Ionic from 'react-native-vector-icons/Ionicons';

LocaleConfig.locales['kr'] = {
  monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  dayNames: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
  dayNamesShort: ['일','월','화','수','목','금','토'],
  today: '오늘'
};
LocaleConfig.defaultLocale = 'kr';

const Home = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [diaries, setDiaries] = useState([]);
  const [markedDates, setMarkedDates] = useState({});

  useFocusEffect(
    useCallback(() => {
      loadDiaries();
    }, [])
  );

  const loadDiaries = async () => {
    try {
      const storedDiaries = await AsyncStorage.getItem('diaryList');
      if (storedDiaries) {
        setDiaries(JSON.parse(storedDiaries));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const newMarkedDates = {};
    diaries.forEach(diary => {
      newMarkedDates[diary.date] = { 
        marked: true, 
        dotColor: '#E10600'
      };
    });
    newMarkedDates[selectedDate] = {
      ...(newMarkedDates[selectedDate] || {}), 
      selected: true,
      selectedColor: 'black',
      disableTouchEvent: true 
    };
    setMarkedDates(newMarkedDates);
  }, [diaries, selectedDate]);

  const deleteDiary = async (id) => {
    Alert.alert(
      "기록 삭제",
      "정말로 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { 
          text: "삭제", 
          style: "destructive",
          onPress: async () => {
            try {
              const newDiaries = diaries.filter(item => item.id !== id);
              setDiaries(newDiaries); 
              await AsyncStorage.setItem('diaryList', JSON.stringify(newDiaries)); 
            } catch (e) {
              console.error(e);
              Alert.alert("에러", "삭제 중 문제가 발생했습니다.");
            }
          }
        }
      ]
    );
  };

  const filteredDiaries = diaries.filter(diary => diary.date === selectedDate);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.diaryItem}
      onPress={() => navigation.navigate('AddDiary', { diary: item })}
      onLongPress={() => deleteDiary(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.diaryHeader}>
        <Text style={styles.diaryTitle}>{item.title}</Text>
        <Text style={styles.diaryLocation}><Ionic name='location-sharp' size={14}/> {item.location}</Text>
      </View>
      
      {/* ★ 이미지가 있으면 표시 */}
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.diaryImage} />
      )}
      
      <View style={styles.podiumSummary}>
        <Material name="emoji-events" size={20} color="#FFD700" />
        <Text style={styles.podiumText}>1st: {item.podium.first || '-'}</Text>
        <Text style={styles.divider}>|</Text>
        <Text style={styles.podiumText}>2nd: {item.podium.second || '-'}</Text>
        <Text style={styles.divider}>|</Text>
        <Text style={styles.podiumText}>3rd: {item.podium.third || '-'}</Text>
      </View>

      <Text numberOfLines={2} style={styles.diaryContent}>{item.content}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>F1 Diary</Text>
      </View>

      <Calendar
        current={selectedDate} 
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        renderHeader={(date) => {
          const headerDate = new Date(date);
          const year = headerDate.getFullYear();
          const month = headerDate.getMonth() + 1;
          return (
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.headerYearText}>{year}</Text>
              <Text style={styles.headerMonthText}>{month}월</Text>
            </View>
          );
        }}
        theme={{
          selectedDayBackgroundColor: 'black',
          todayTextColor: '#E10600',
          arrowColor: 'black',
          dotColor: '#E10600',
          textDayFontWeight: '600',
          textDayHeaderFontWeight: 'bold',
          'stylesheet.calendar.header': {
            header: {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 10,
              marginBottom: 10,
            }
          }
        }}
      />

      <View style={styles.listContainer}>
        <Text style={styles.dateTitle}>{selectedDate} Records</Text>
        <FlatList
          data={filteredDiaries}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>작성된 기록이 없습니다.</Text>
            </View>
          }
        />
      </View>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddDiary', { diary: null })}
      >
        <Ionic name="add" size={36} color="white" />
      </TouchableOpacity>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  appTitle: {
    fontSize: 27,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  headerYearText: {
    fontSize: 14,
    color: 'gray',
    fontWeight: '600',
  },
  headerMonthText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginTop: -2, 
  },
  listContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  diaryItem: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  diaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  diaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  diaryLocation: {
    color: 'gray',
    fontSize: 14,
  },
  // 이미지 스타일
  diaryImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  podiumSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
  },
  podiumText: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 5,
  },
  divider: {
    color: '#ccc',
  },
  diaryContent: {
    color: '#555',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 30,
    backgroundColor: '#E10600',
    width: 55,
    height: 55,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default Home;