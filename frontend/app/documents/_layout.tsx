import { Stack } from 'expo-router';

export default function DocumentsStackLayout() {
    return (
        <Stack>
            {/* 문서 목록 화면 - 헤더 감춤 */}
            <Stack.Screen name="index" options={{ title: '업로드된 문서', headerTitleAlign: 'center', headerShown: true }} />

            {/* 문서 상세 화면 - 헤더 표시 + 뒤로가기 */}
            <Stack.Screen
                name="documentDetail"
                options={{ title: '문서 보기', headerTitleAlign: 'center', headerShown: true }}
            />
            <Stack.Screen
                name="documentDetail2"
                options={{ title: '자세히 보기', headerTitleAlign: 'center', headerShown: true }}
            />
        </Stack>
    );
}


// // documents/_layout.tsx
// import { Stack } from 'expo-router';

// export default function DocumentsStackLayout() {
//     return <Stack screenOptions={{ headerShown: false }} />;
// }
