import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface UploadedDoc {
  id: number;
  date: string;
  title: string;
  type: string;
  riskCount: number;
  file_url?: string;
}

export default function UploadedDocuments() {
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchDocuments = async () => {
        setLoading(true);
        try {
          const response = await axios.get('http://192.168.1.176:4000/document/documents');
          setUploadedDocs(response.data);
        } catch (error) {
          console.error('문서 불러오기 실패:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchDocuments();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#888" />
        <Text>문서를 불러오는 중입니다...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={uploadedDocs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <Text style={styles.date}>{item.date}</Text>
            <View style={styles.card}>
              {item.file_url ? (
                <Image source={{ uri: item.file_url }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder} />
              )}
              <View style={styles.textContent}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.type}>{item.type}</Text>
                <Text style={styles.risk}>위험 문장 : {item.riskCount}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardWrapper: { marginBottom: 24 },
  date: { fontSize: 13, color: '#888', marginBottom: 8 },
  card: {
  flexDirection: 'row',
  borderWidth: 1,
  borderColor: '#ddd', // 연한 회색 테두리
  borderRadius: 12,
  padding: 12,
  backgroundColor: '#fff', // 흰색 배경
  alignItems: 'center',
},

  image: { width: 70, height: 90, marginRight: 12, borderRadius: 4, resizeMode: 'cover' },
  imagePlaceholder: {
    width: 70,
    height: 90,
    marginRight: 12,
    backgroundColor: '#ccc',
    borderRadius: 4,
  },
  textContent: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  type: { fontSize: 14, color: '#333', marginBottom: 4 },
  risk: { fontSize: 14, color: 'red', fontWeight: '600' },
});


// import { useFocusEffect } from '@react-navigation/native';
// import axios from 'axios';
// import React, { useCallback, useState } from 'react';
// import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

// interface UploadedDoc {
//   id: number;
//   date: string;
//   title: string;
//   type: string;
//   riskCount: number;
//   file_url?: string; // ← 썸네일용

// }

// export default function UploadedDocuments() {
//   const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
//   const [loading, setLoading] = useState(true);

//   useFocusEffect(
//   useCallback(() => {
//     const fetchDocuments = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get('http://192.168.1.176:4000/document/documents');
//         setUploadedDocs(response.data);
//       } catch (error) {
//         console.error('문서 불러오기 실패:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDocuments();
//   }, [])
// );


//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#888" />
//         <Text>문서를 불러오는 중입니다...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={uploadedDocs}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => (
//           <View style={styles.card}>
//             <Text style={styles.date}>{item.date}</Text>
//             <View style={styles.docContainer}>
//               <View style={styles.textContent}>
//                 <Text style={styles.title}>{item.title}</Text>
//                 <Text>{item.type}</Text>
//                 <Text style={styles.risk}>위험 문장 : {item.riskCount}</Text>
//               </View>
//             </View>
//           </View>
//         )}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff', padding: 16 },
//   date: { fontSize: 14, marginBottom: 8 },
//   card: { marginBottom: 24 },
//   docContainer: { flexDirection: 'row', backgroundColor: '#fafafa', borderRadius: 8, padding: 10 },
//   image: { width: 60, height: 80, marginRight: 12, resizeMode: 'cover' },
//   textContent: { flex: 1 },
//   title: { fontSize: 16, fontWeight: 'bold' },
//   risk: { color: 'red', marginTop: 2 },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
// });
