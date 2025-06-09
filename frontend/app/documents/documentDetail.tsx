import { BASE_URL } from '@env';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Coordinate {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface RouteParams {
    situationId: number;
}

export default function DocumentDetail() {
    const route = useRoute();
    const { situationId } = route.params as RouteParams;

    const [imageUrl, setImageUrl] = useState('');
    const [highlightBoxes, setHighlightBoxes] = useState<Coordinate[]>([]);
    const [imageWidth, setImageWidth] = useState<number | null>(null);
    const [imageHeight, setImageHeight] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [noRiskMessage, setNoRiskMessage] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            let retries = 5;
            const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

            while (retries > 0) {
                try {
                    const response = await axios.get(`${BASE_URL}/stack/result/${situationId}`);
                    const data = response.data;
                    console.log('📡 전체 응답:', response.data);

                    console.log('@@@@@', response.data);

                    setImageUrl(`${BASE_URL}${data.imageUrl}`);
                    setImageWidth(data.imageWidth);
                    setImageHeight(data.imageHeight);
                    console.log('이미지 넓이', data.imageWidth);
                    console.log('이미지 높이', data.imageHeight);

                    if (data.coordinates && data.coordinates.length > 0) {
                        setHighlightBoxes(data.coordinates);
                        setNoRiskMessage(false); // ✅ 위험 조항 존재
                    } else {
                        setHighlightBoxes([]);
                        setNoRiskMessage(true); // ✅ 위험 조항 없음
                    }

                    setLoading(false);
                    return;
                } catch (err) {
                    if (axios.isAxiosError(err)) {
                        if (err.response?.status === 404) {
                            console.warn('⚠️ 위험 문장이 없는 문서입니다.');
                            // 이미지라도 가져올 수 있도록 fallback 처리
                            const fallback = await axios.get(`${BASE_URL}/fallback-image/${situationId}`);
                            const fallbackData = fallback.data;

                            setImageUrl(`${BASE_URL}${fallbackData.imageUrl}`);
                            setImageWidth(fallbackData.imageWidth);
                            setImageHeight(fallbackData.imageHeight);
                            setHighlightBoxes([]);
                            setNoRiskMessage(true);
                            setLoading(false);
                            return;
                        } else {
                            console.error('❌ 문서 상세 불러오기 실패:', err.message);
                        }
                    } else {
                        console.error('❌ 예외 발생:', err);
                    }
                }

                retries--;
                await delay(1000);
            }

            setLoading(false);
            console.warn('⚠️ 5번 재시도에도 실패했습니다. 좌표가 없는 상태입니다.');
        };

        fetchDetail();
    }, [situationId]);

    if (loading || !imageWidth || !imageHeight) {
        return <Text style={{ textAlign: 'center', marginTop: 40 }}>로딩 중...</Text>;
    }

    const screenWidth = Dimensions.get('window').width;
    const calculatedHeight = (screenWidth * imageHeight) / imageWidth;

    return (
        <ScrollView style={styles.container}>
            <View style={[styles.imageWrapper, { height: calculatedHeight }]}>
                {/* 이미지는 항상 보여줌 */}
                {imageUrl !== '' && <Image source={{ uri: imageUrl }} style={styles.image} />}

                {/* 위험 문장 highlight 박스가 존재하면 렌더링 */}
                {highlightBoxes.map((box, index) => {
                    const left = (box.x / imageWidth) * screenWidth;
                    const top = (box.y / imageHeight) * calculatedHeight;
                    const width = (box.width / imageWidth) * screenWidth;
                    const height = (box.height / imageHeight) * calculatedHeight + 10;

                    return <View key={index} style={[styles.highlightBox, { left, top, width, height }]} />;
                })}
            </View>

            {/* 위험 문장이 없을 경우 안내 메시지 */}
            {noRiskMessage && (
                <Text style={{ textAlign: 'center', marginTop: 20, color: '#6883DE', fontWeight: 'bold', fontSize: 18 }}>
                    위험한 조항이 존재하지 않습니다.
                </Text>
            )}

            {/* 위험 문장이 있을 때만 "자세히 보기" 버튼 렌더링 */}
            {!noRiskMessage && (
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        router.push(`/documents/documentDetail2?situationId=${situationId}`);
                        console.log('자세히 보기 클릭됨');
                    }}
                >
                    <Text style={styles.buttonText}>자세히 보기</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
    },
    imageWrapper: {
        position: 'relative',
        width: '100%',
        marginTop: 30,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'stretch',
    },
    highlightBox: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: 'rgba(255, 0, 0, 0.6)',
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        borderRadius: 4,
    },
    button: {
        backgroundColor: '#6883DE',
        paddingVertical: 12,
        marginVertical: 24,
        borderRadius: 8,
        alignSelf: 'center',
        width: 180,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
