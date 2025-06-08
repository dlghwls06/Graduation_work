import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

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

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(`http://192.168.1.176:4000/stack/result/${situationId}`);
        const json = await response.json();
        setImageUrl(`http://192.168.1.176:4000${json.imageUrl}`);
        setHighlightBoxes(json.coordinates);
        setImageWidth(json.imageWidth);
        setImageHeight(json.imageHeight);
      } catch (err) {
        console.error('문서 상세 불러오기 실패:', err);
      }
    };
    fetchDetail();
  }, [situationId]);

  if (!imageWidth || !imageHeight) {
    return <Text style={{ textAlign: 'center', marginTop: 40 }}>로딩 중...</Text>;
  }

  const screenWidth = Dimensions.get('window').width;
  const calculatedHeight = (screenWidth * imageHeight) / imageWidth;

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.imageWrapper, { height: calculatedHeight }]}>
        {imageUrl !== '' && (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        )}

        {/* 하이라이트 박스 오버레이 */}
        {highlightBoxes.map((box, index) => {
          const left = (box.x / imageWidth) * screenWidth;
          const top = (box.y / imageHeight) * calculatedHeight;
          const width = (box.width / imageWidth) * screenWidth;
          const height = (box.height / imageHeight) * calculatedHeight;

          return (
            <View
              key={index}
              style={[
                styles.highlightBox,
                { left, top, width, height }
              ]}
            />
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          console.log('자세히 보기 클릭됨');
        }}
      >
        <Text style={styles.buttonText}>자세히 보기</Text>
      </TouchableOpacity>
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