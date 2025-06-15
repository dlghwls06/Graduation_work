// documents/_layout.tsx
import { Stack } from 'expo-router';

export default function CheckListLayout() {
    return <Stack screenOptions={{ title: '체크리스트', headerTitleAlign: 'center', headerShown: true }}/>;
}
