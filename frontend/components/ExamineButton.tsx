import { BASE_URL } from '@env';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ExamineButton() {
    const [uploading, setUploading] = useState<boolean>(false);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const fileUri: string = asset.uri;
            const fileName: string = fileUri.split('/').pop() ?? 'image.jpg';
            const match = /\.(\w+)$/.exec(fileName);
            const fileType: string = match ? `image/${match[1]}` : 'image/jpeg';

            try {
                setUploading(true);

                // ✅ 이미지 해상도 가져오기
                const getSize = (): Promise<{ width: number; height: number }> =>
                    new Promise((resolve, reject) => {
                        Image.getSize(
                            fileUri,
                            (width, height) => resolve({ width, height }),
                            (error) => reject(error)
                        );
                    });

                const { width, height } = await getSize();
                console.log('이미지 해상도:', width, height);

                const formData = new FormData();
                formData.append('image', {
                    uri: fileUri,
                    name: fileName,
                    type: fileType,
                } as any);

                // 해상도 정보
                formData.append('width', String(width));
                formData.append('height', String(height));

                const response = await fetch(`${BASE_URL}/ocr/upload`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formData,
                });

                const json = await response.json();
                Alert.alert('성공적으로 업로드 되었습니다!');
                // Alert.alert('성공적으로 업로드 되었습니다!', json.text ?? '결과 없음');
            } catch (err) {
                Alert.alert('오류 발생', '서버 업로드 또는 OCR 처리 실패');
                console.error(err);
            } finally {
                setUploading(false);
            }
        } else {
            Alert.alert('이미지 선택이 취소되었습니다.');
        }
    };

    return (
        <View style={{ marginLeft: 44, marginTop: 6 }}>
            {uploading ? (
                <View style={styles.loadingWrapper}>
                    <ActivityIndicator size="small" color="#6883DE" />
                    <Text style={styles.loadingText}>업로드 중...</Text>
                </View>
            ) : (
                <TouchableOpacity onPress={pickImage}>
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

// import React, { useState } from 'react';
// import { Text, TouchableOpacity, Alert, View, ActivityIndicator, StyleSheet } from 'react-native';
// import * as DocumentPicker from 'expo-document-picker';

// export default function ExamineButton() {
//   const [uploading, setUploading] = useState(false);

//   const pickDocument = async () => {
//     const result = await DocumentPicker.getDocumentAsync({
//       type: ['image/*', 'application/pdf'],
//       copyToCacheDirectory: true,
//       multiple: false,
//     });

//     if (result.assets && result.assets.length > 0) {
//       const file = result.assets[0];
//       const fileUri: string = file.uri;
//       const fileName: string = file.name ?? 'document.jpg';
//       const fileType: string = file.mimeType ?? 'application/octet-stream';

//       const formData = new FormData();
//       formData.append('image', {
//         uri: fileUri,
//         name: fileName,
//         type: fileType,
//       } as any);

//       try {
//         setUploading(true); // 로딩 시작
//         const response = await fetch('http://192.168.1.176:4000/ocr/upload', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//           body: formData,
//         });

//         const json = await response.json();
//         Alert.alert('OCR 결과', json.text ?? '결과 없음');
//       } catch (err) {
//         Alert.alert('오류 발생', '서버 업로드 또는 OCR 처리 실패');
//         console.error(err);
//       } finally {
//         setUploading(false); // 로딩 종료
//       }
//     } else {
//       Alert.alert('문서 선택이 취소되었습니다.');
//     }
//   };

//   return (
//     <View style={{ marginLeft: 44, marginTop: 6 }}>
//       {uploading ? (
//         <View style={styles.loadingWrapper}>
//           <ActivityIndicator size="small" color="#6883DE" />
//           <Text style={styles.loadingText}>OCR 업로드 중...</Text>
//         </View>
//       ) : (
//         <TouchableOpacity onPress={pickDocument}>
//           <Text style={styles.linkText}>계약서 검토하기</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   linkText: {
//     fontSize: 12,
//     textDecorationLine: 'underline',
//     color: '#6883DE',
//   },
//   loadingWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginLeft: 8,
//     fontSize: 12,
//     color: '#6883DE',
//   },
// });
