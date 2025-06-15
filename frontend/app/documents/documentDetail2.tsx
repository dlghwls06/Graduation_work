import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';


interface RiskDetail {
    sentence: string;
    explanation: string;
    recommends: string[];
}

export default function DocumentDetail2() {
    const { situationId } = useLocalSearchParams();
    const [data, setData] = useState<RiskDetail[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`http://192.168.1.243:4000/stack2/detail_result/${situationId}`);
                setData(res.data);
            } catch (err: any) {
                console.error('위험 분석 결과 불러오기 실패:', err.response?.data || err.message);
            }
        };
        fetchData();
    }, []);

    return (
        <ScrollView style={styles.container}>
            {data.map((item, index) => (
                <View key={index} style={styles.block}>
                    <Text style={styles.sectionTitle}>위험 문장</Text>
                    <Text style={styles.riskSentence}>{item.sentence}</Text>
                    <Text style={styles.explanation}>→ {item.explanation}</Text>

                    <Text style={styles.sectionTitle}>추천 변경사항</Text>
                    {item.recommends.map((r, i) => (
                        <View key={i} style={styles.recommendCard}>
                            <Text>{r}</Text>
                        </View>
                    ))}
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    block: { marginBottom: 40 },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    riskSentence: {
        fontSize: 15,
        fontWeight: '600',
        color: '#d11a2a',
        marginBottom: 4,
    },
    explanation: {
        fontSize: 14,
        color: '#444',
        marginBottom: 12,
    },
    recommendCard: {
        padding: 10,
        borderRadius: 6,
        backgroundColor: '#f6f6f6',
        marginBottom: 8,
    },
});
