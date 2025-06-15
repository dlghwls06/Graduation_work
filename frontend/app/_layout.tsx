// app/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function RootLayout() {
    return (
        <Tabs>
            <Tabs.Screen
                name="checklist"
                options={{
                    title: "체크리스트",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="documents"
                options={{
                    title: "업로드된 문서",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="document-text-outline" color={color} size={size} />
                    ),
                }}
            />
            {/* app/index.tsx에 파일이 위치하게 되면 자동 라우팅이 되서 index파일이 하단바에 생성되는데, 이거 방지 */}
            <Tabs.Screen name="index" options={{ href: null }} />

        </Tabs>
    );
}
