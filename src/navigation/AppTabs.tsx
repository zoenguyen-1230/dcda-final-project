import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AppTabParamList } from "../types";
import { HomeScreen } from "../screens/app/HomeScreen";
import { ConnectionsScreen } from "../screens/app/ConnectionsScreen";
import { ChatScreen } from "../screens/app/ChatScreen";
import { SharedScreen } from "../screens/app/SharedScreen";
import { PlansScreen } from "../screens/app/PlansScreen";
import { palette } from "../theme/palette";
import { useAuth } from "../providers/AuthProvider";

const Tab = createBottomTabNavigator<AppTabParamList>();

export function AppTabs() {
  const { signOut } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: palette.background,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: palette.text,
          fontSize: 22,
          fontWeight: "800",
        },
        headerTintColor: palette.text,
        tabBarStyle: {
          backgroundColor: palette.card,
          borderTopColor: palette.line,
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: palette.berry,
        tabBarInactiveTintColor: palette.muted,
        sceneStyle: {
          backgroundColor: palette.background,
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={() => {
              void signOut();
            }}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: palette.line,
              backgroundColor: palette.card,
            }}
          >
            <Text
              style={{
                color: palette.text,
                fontWeight: "700",
              }}
            >
              Sign out
            </Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="People" component={ConnectionsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Shared" component={SharedScreen} />
      <Tab.Screen name="Plans" component={PlansScreen} />
    </Tab.Navigator>
  );
}
