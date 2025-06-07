import React, { useState } from 'react';
import { Text, TouchableOpacity, Alert, View, ActivityIndicator, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

export default function ExamineButton() {
  const [uploading, setUploading] = useState(false);

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      const fileUri: string = file.uri;
      const fileName: string = file.name ?? 'document.jpg';
      const fileType: string = file.mimeType ?? 'application/octet-stream';

      const formData = new FormData();
      formData.append('image', {
        uri: fileUri,
        name: fileName,
        type: fileType,
      } as any);

      try {
        setUploading(true); // 로딩 시작
        const response = await fetch('http://192.168.1.193:4000/ocr/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        const json = await response.json();
        Alert.alert('OCR 결과', json.text ?? '결과 없음');
      } catch (err) {
        Alert.alert('오류 발생', '서버 업로드 또는 OCR 처리 실패');
        console.error(err);
      } finally {
        setUploading(false); // 로딩 종료
      }
    } else {
      Alert.alert('문서 선택이 취소되었습니다.');
    }
  };

  return (
    <View style={{ marginLeft: 44, marginTop: 6 }}>
      {uploading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="small" color="#6883DE" />
          <Text style={styles.loadingText}>OCR 업로드 중...</Text>
        </View>
      ) : (
        <TouchableOpacity onPress={pickDocument}>
          <Text style={styles.linkText}>계약서 검토하기</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  linkText: {
    fontSize: 12,
    textDecorationLine: 'underline',
    color: '#6883DE',
  },
  loadingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#6883DE',
  },
});
