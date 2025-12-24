import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './src/screens/Home';
import Collect from './src/screens/Collect';
import AddDiary from './src/screens/AddDiary';
import Profile from './src/screens/Profile';
import { NavigationContainer } from '@react-navigation/native';
import Ionic from 'react-native-vector-icons/Ionicons'
import Status from './src/screens/Status'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

import { SafeAreaProvider } from 'react-native-safe-area-context';

const App = () => {
    const Stack = createNativeStackNavigator();
    const Tab = createBottomTabNavigator();

    const BottomTabScreen = () => {
        return (
            <Tab.Navigator
                screenOptions={({ route } ) => ({
                    tabBarHideOnKeyboard: true,
                    tabBarShowLabel: false,
                    headerShown: false,
                    tabBarStyle: {
                        height: 70,
                    },
                    tabBarIcon: ({ focused, size, color }) => {
                        let iconName;
                        color = 'black'
                        if (route.name === 'Home') {
                            iconName = focused ? 'home' : 'home';
                        } else if (route.name === 'Collect') {
                            iconName = focused ? 'th-large' : 'th-large';
                        } else if (route.name === 'AddDiary') {
                            iconName = focused ? 'plus-square' : 'plus-square-o';
                        } else if (route.name === 'Profile') {
                            iconName = focused ? 'user' : 'user-o';
                        }

                        return <FontAwesome name={iconName} size={size} color={color} />;
                    },
                })}>
                <Tab.Screen name="Home" component={Home} />
                <Tab.Screen name="Collect" component={Collect} />
                <Tab.Screen name="AddDiary" component={AddDiary} />
                <Tab.Screen name="Profile" component={Profile} />
            </Tab.Navigator>
        )
    }
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Bottom" component={BottomTabScreen} />
                    <Stack.Screen name="Status" component={Status} />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    )
};

export default App