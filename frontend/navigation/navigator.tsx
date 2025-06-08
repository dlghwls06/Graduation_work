// navigation/navigator.tsx
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';

import Checklist from '../app/checklist/index';
import Documents from '../app/documents/index';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#007aff',
          tabBarInactiveTintColor: 'gray',
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
            if (route.name === '체크리스트') iconName = 'list-outline';
            else if (route.name === '업로드된 문서') iconName = 'document-text-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="체크리스트" component={Checklist} />
        <Tab.Screen name="업로드된 문서" component={Documents} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
