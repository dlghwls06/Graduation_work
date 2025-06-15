import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
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
    const { tempCount, recentId } = useLocalSearchParams<{
        tempCount?: string;
        recentId?: string;
    }>();


    const fetchDocuments = async () => {
    setLoading(true);
    try {
        const response = await axios.get<UploadedDoc[]>(`http://192.168.1.243:4000/document/documents`);
        let docs = response.data;
        console.log("받은 tempCount:", tempCount, "recentId:", recentId);

        if (recentId && tempCount && !isNaN(Number(tempCount))) {
            docs = docs.map((doc) =>
                doc.id === Number(recentId)
                    ? { ...doc, riskCount: Number(tempCount) }
                    : doc
            );
        }

        setUploadedDocs(docs);
    } catch (error) {
        console.error('문서 불러오기 실패:', error);
    } finally {
        setLoading(false);
    }
};


    useFocusEffect(
        useCallback(() => {
            fetchDocuments();
        }, [])
    );

    const handleDelete = (id: number) => {
        Alert.alert('문서 삭제', '정말 이 문서를 삭제하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            {
                text: '삭제',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await axios.delete(`http://192.168.1.243:4000/document/delete/${id}`);
                        Alert.alert('성공적으로 삭제되었습니다!');
                        fetchDocuments(); // 삭제 후 목록 갱신
                        
                        // setUploadedDocs((prev) => prev.filter((doc) => doc.id !== id));
                    } catch (err) {
                        Alert.alert('삭제 실패', '문서 삭제 중 오류가 발생했습니다.');
                        console.error('삭제 오류:', err);
                    }
                },
            },
        ]);
    };

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
        {uploadedDocs.length === 0 ? (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>업로드된 문서가 없습니다.</Text>
            </View>
        ) : (
            <FlatList
                data={uploadedDocs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.cardWrapper}>
                        <Text style={styles.date}>{item.date}</Text>
                        <TouchableOpacity
                            onPress={() => router.push(`/documents/documentDetail?situationId=${item.id}`)}
                            activeOpacity={0.8}
                        >
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
                                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                                    <Text style={styles.deleteText}>삭제</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
            />
        )}
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
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 12,
        backgroundColor: '#fff',
        alignItems: 'center',
        position: 'relative',
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
    deleteButton: {
        backgroundColor: '#f66',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    deleteText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
},
emptyText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
},

});



// import { BASE_URL } from '@env';
// import { useFocusEffect } from '@react-navigation/native';
// import axios from 'axios';
// import { router } from 'expo-router';
// import { useCallback, useState } from 'react';
// import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


// interface UploadedDoc {
//     id: number;
//     date: string;
//     title: string;
//     type: string;
//     riskCount: number;
//     file_url?: string;
// }

// export default function UploadedDocuments() {
//     const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
//     const [loading, setLoading] = useState(true);

//     useFocusEffect(
//         useCallback(() => {
//             const fetchDocuments = async () => {
//                 setLoading(true);
//                 try {
//                     const response = await axios.get(`${BASE_URL}/document/documents`);
//                     console.log("프론트베이스유알엘", BASE_URL);
//                     setUploadedDocs(response.data);
//                     // console.log('ㅇㅁㄴㅇㄴㅁㅇ', response.data);
//                 } catch (error) {
//                     console.error('문서 불러오기 실패:', error);
//                 } finally {
//                     setLoading(false);
//                 }
//             };

            
//             fetchDocuments();
//         }, [])
//     );

//     if (loading) {
//         return (
//             <View style={styles.loadingContainer}>
//                 <ActivityIndicator size="large" color="#888" />
//                 <Text>문서를 불러오는 중입니다...</Text>
//             </View>
//         );
//     }

//     return (
//         <View style={styles.container}>
//             <FlatList
//                 data={uploadedDocs}
//                 keyExtractor={(item) => item.id.toString()}
//                 renderItem={({ item }) => (
//                     <View style={styles.cardWrapper}>
//                         <Text style={styles.date}>{item.date}</Text>
//                         <TouchableOpacity
//                             onPress={() => router.push(`/documents/documentDetail?situationId=${item.id}`)}
//                             activeOpacity={0.8}
//                         >
//                             <View style={styles.card}>
//                                 {item.file_url ? (
//                                     <Image source={{ uri: item.file_url }} style={styles.image} />
//                                 ) : (
//                                     <View style={styles.imagePlaceholder} />
//                                 )}
//                                 <View style={styles.textContent}>
//                                     <Text style={styles.title}>{item.title}</Text>
//                                     <Text style={styles.type}>{item.type}</Text>
//                                     <Text style={styles.risk}>위험 문장 : {item.riskCount}</Text>
//                                 </View>
//                             </View>
//                         </TouchableOpacity>
//                     </View>
//                 )}
//             />
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 20 },
//     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//     cardWrapper: { marginBottom: 24 },
//     date: { fontSize: 13, color: '#888', marginBottom: 8 },
//     card: {
//         flexDirection: 'row',
//         borderWidth: 1,
//         borderColor: '#ddd',
//         borderRadius: 12,
//         padding: 12,
//         backgroundColor: '#fff',
//         alignItems: 'center',
//     },
//     image: { width: 70, height: 90, marginRight: 12, borderRadius: 4, resizeMode: 'cover' },
//     imagePlaceholder: {
//         width: 70,
//         height: 90,
//         marginRight: 12,
//         backgroundColor: '#ccc',
//         borderRadius: 4,
//     },
//     textContent: { flex: 1, justifyContent: 'center' },
//     title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
//     type: { fontSize: 14, color: '#333', marginBottom: 4 },
//     risk: { fontSize: 14, color: 'red', fontWeight: '600' },
// });
