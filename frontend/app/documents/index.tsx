import React from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';

//sadsa
const uploadedDocs = [
  {
    id: '1',
    date: '2025/06/01',
    title: '임대차 계약서',
    type: '월세',
    riskCount: 2,
    riskKeywords: ['위약금', '자동 연장'],
    // image: require('../../assets/sample-doc.png'),
  },
  // ... 더미 데이터 추가 가능
];

export default function UploadedDocuments() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>업로드된 문서</Text>
      <FlatList
        data={uploadedDocs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.date}>{item.date}</Text>
            <View style={styles.docContainer}>
              {/* <Image source={item.image} style={styles.image} /> */}
              <View style={styles.textContent}>
                <Text style={styles.title}>{item.title}</Text>
                <Text>{item.type}</Text>
                <Text style={styles.risk}>위험 문장 : {item.riskCount}</Text>
                <Text style={styles.risk}>위험 항목 : {item.riskKeywords.join(', ')}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  date: { fontSize: 14, marginBottom: 8 },
  card: { marginBottom: 24 },
  docContainer: { flexDirection: 'row', backgroundColor: '#fafafa', borderRadius: 8, padding: 10 },
  image: { width: 60, height: 80, marginRight: 12, resizeMode: 'cover' },
  textContent: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold' },
  risk: { color: 'red', marginTop: 2 },
});
