import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, StyleSheet, Image } from 'react-native';
import React, { useState, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionic from 'react-native-vector-icons/Ionicons';
import Material from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from 'react-native-date-picker';
import { useFocusEffect } from '@react-navigation/native';
//이미지 피커 라이브러리 가져오기
import { launchImageLibrary } from 'react-native-image-picker';

const GridSlot = ({ position, value, onChange }) => (
  <View style={styles.slotContainer}>
    <Material name='space-bar' style={styles.slotIcon} />
    <View style={styles.inputWrapper}>
      <TextInput
        placeholder={`P${position}`}
        placeholderTextColor="#ccc"
        maxLength={2} 
        keyboardType="number-pad"
        value={value} 
        onChangeText={onChange} 
        style={styles.slotInput}
      />
    </View>
  </View>
);

const AddDiary = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const editingDiary = route.params?.diary;

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [openDate, setOpenDate] = useState(false);
  const [location, setLocation] = useState('');
  
  const [rank1, setRank1] = useState('');
  const [rank2, setRank2] = useState('');
  const [rank3, setRank3] = useState('');

  const [gridData, setGridData] = useState({});
  const [content, setContent] = useState('');
  
  //이미지 주소를 저장할 상태 추가
  const [imageUri, setImageUri] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (editingDiary) {
        setTitle(editingDiary.title);
        setDate(new Date(editingDiary.date));
        setLocation(editingDiary.location);
        setRank1(editingDiary.podium.first);
        setRank2(editingDiary.podium.second);
        setRank3(editingDiary.podium.third);
        setGridData(editingDiary.grid || {});
        setContent(editingDiary.content);
        // 기존 이미지 불러오기
        setImageUri(editingDiary.image || null);
      } else {
        setTitle('');
        setDate(new Date());
        setLocation('');
        setRank1(''); setRank2(''); setRank3('');
        setGridData({});
        setContent('');
        setImageUri(null);
      }
    }, [editingDiary])
  );

  //갤러리 열기
  const openGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8, // 용량 최적화
    });

    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert('에러', '이미지를 불러오지 못했습니다.');
      return;
    }

    if (result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri); // 선택한 사진 주소 저장
    }
  };

  const formatDate = (date) => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  const updateGrid = (position, driverNumber) => {
    setGridData(prev => ({
      ...prev,
      [position]: driverNumber
    }));
  };

  const saveDiary = async () => {
    if(!title || !content) {
      Alert.alert('알림', '제목과 내용은 필수입니다!');
      return;
    }

    try {
      const existingDiaries = await AsyncStorage.getItem('diaryList');
      let newDiaryList = existingDiaries ? JSON.parse(existingDiaries) : [];

      const diaryData = {
        title,
        date: formatDate(date),
        location,
        podium: { first: rank1, second: rank2, third: rank3 },
        grid: gridData,
        content,
        image: imageUri, // 저장할 때 이미지도 포함
      };

      if (editingDiary) {
        diaryData.id = editingDiary.id;
        newDiaryList = newDiaryList.map(item => item.id === editingDiary.id ? diaryData : item);
        Alert.alert('성공', '일기가 수정되었습니다!');
      } else {
        diaryData.id = Date.now();
        newDiaryList.push(diaryData);
        Alert.alert('성공', '일기가 저장되었습니다!');
      }

      await AsyncStorage.setItem('diaryList', JSON.stringify(newDiaryList));
      navigation.navigate('Home'); 
      
    } catch (e) {
      console.error(e);
      Alert.alert('에러', '저장에 실패했습니다.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        > 
          
          <View style={styles.headerContainer}>
            <TextInput 
              placeholder="제목"
              value={title}
              onChangeText={setTitle}
              style={styles.titleInput}        
            />
            <TouchableOpacity onPress={() => setOpenDate(true)}>
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </TouchableOpacity>
            <DatePicker 
              modal 
              open={openDate} 
              date={date} 
              mode="date" 
              onConfirm={(d) => { setOpenDate(false); setDate(d) }} 
              onCancel={() => setOpenDate(false)} 
            />
          </View>

          <View style={styles.rowContainer}>
            <Ionic name='location-sharp' style={styles.iconStyle} />
            <TextInput 
              placeholder='Location' 
              value={location} 
              onChangeText={setLocation} 
              style={styles.locationInput} 
            />
          </View>

          <View style={styles.podiumContainer}>
            <Material name="emoji-events" style={styles.trophyIcon}/>
            <TextInput placeholder='1st' value={rank1} onChangeText={setRank1} maxLength={2} keyboardType="number-pad" style={styles.podiumInputLarge} />
            <Text style={styles.divider}>|</Text>
            <TextInput placeholder='2nd' value={rank2} onChangeText={setRank2} maxLength={2} keyboardType="number-pad" style={styles.podiumInputSmall} />
            <Text style={styles.divider}>|</Text>
            <TextInput placeholder='3rd' value={rank3} onChangeText={setRank3} maxLength={2} keyboardType="number-pad" style={styles.podiumInputSmall} />
          </View>

          <View style={styles.gridSection}>
            <Text style={styles.sectionTitle}>Grid Result</Text>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              style={styles.gridScrollView}
              contentContainerStyle={styles.gridContentContainer}
            >
              {Array.from({ length: 11 }, (_, i) => {
                const oddPosition = (i * 2) + 1; 
                const evenPosition = (i * 2) + 2; 

                return (
                  <View key={i} style={styles.gridColumn}>
                    <View style={styles.evenGridSlot}> 
                      <GridSlot 
                        position={evenPosition} 
                        value={gridData[evenPosition] || ''}
                        onChange={(text) => updateGrid(evenPosition, text)}
                      />
                    </View>
                    <View>
                      <GridSlot 
                        position={oddPosition} 
                        value={gridData[oddPosition] || ''}
                        onChange={(text) => updateGrid(oddPosition, text)}
                      />
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {/* 사진 추가하기 */}
          <View style={styles.imageSection}>
            <TouchableOpacity onPress={openGallery} style={styles.imagePickerButton}>
                <Ionic name="camera" size={24} color="black" style={{ marginRight: 8 }} />
                <Text style={styles.imagePickerText}>
                    {imageUri ? '사진 변경하기' : '사진 추가하기'}
                </Text>
            </TouchableOpacity>

            {imageUri && (
                <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                    <TouchableOpacity 
                        style={styles.removeImageButton} 
                        onPress={() => setImageUri(null)}
                    >
                        <Ionic name="close-circle" size={24} color="gray" />
                    </TouchableOpacity>
                </View>
            )}
          </View>

          <View style={styles.contentSection}>
            <TextInput 
              multiline={true}
              placeholder='오늘의 경기는...'
              value={content}
              onChangeText={setContent}
              textAlignVertical="top" 
              style={styles.contentInput}
            />
            <TouchableOpacity onPress={saveDiary} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>
                {editingDiary ? '수정완료' : '저장하기'}
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {},
  headerContainer: {
    flexDirection: 'row',
    paddingTop: 20, 
    paddingBottom: 15,
    paddingLeft: 50,
    alignItems: 'center',
  },
  titleInput: {
    fontSize: 30,
    fontWeight: 'bold',
    width: '50%',
    paddingRight: 10,
  },
  dateText: {
    fontSize: 17,
    color: '#333',
  },
  rowContainer: {
    paddingVertical: 15,
    paddingLeft: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconStyle: {
    fontSize: 22,
  },
  locationInput: {
    fontSize: 20,
    paddingLeft: 5,
    flex: 1,
  },
  podiumContainer: {
    paddingVertical: 15,
    paddingHorizontal: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trophyIcon: {
    fontSize: 36,
    marginRight: 10,
  },
  podiumInputLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    width: 60,
    textAlign: 'center',
  },
  podiumInputSmall: {
    fontSize: 20,
    fontWeight: 'bold',
    width: 60,
    textAlign: 'center',
    color: 'gray',
  },
  divider: {
    fontSize: 24,
    color: '#ddd',
  },
  gridSection: {
    marginTop: 10,
  },
  sectionTitle: {
    paddingLeft: 50,
    marginBottom: 20,
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
  gridScrollView: {},
  gridContentContainer: {
    gap: 0,
    paddingHorizontal: 50,
  },
  gridColumn: {
    flexDirection: 'column',
    gap: 20,
  },
  evenGridSlot: {
    marginLeft: 30,
  },
  slotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotIcon: {
    fontSize: 40,
    transform: [{ rotate: '90deg' }],
    color: 'black',
    marginRight: -5,
  },
  inputWrapper: {
    alignItems: 'center',
    zIndex: 1,
  },
  slotInput: {
    width: 35,
    height: 30,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'white',
  },

  // ★ 5. 사진 첨부 스타일 추가
  imageSection: {
    paddingHorizontal: 50,
    marginTop: 20,
    marginBottom: 10,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  imagePickerText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginTop: 5,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 12,
  },

  contentSection: {
    paddingVertical: 5,
    paddingHorizontal: 50,
    marginTop: 0,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    height: 250,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 15,
    padding: 15,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddDiary;