import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthScreen } from "../screens/auth/AuthScreen";
import { LoadingScreen } from "../screens/common/LoadingScreen";
import { AppTabs } from "./AppTabs";
import { useAuth } from "../providers/AuthProvider";
import { palette } from "../theme/palette";
import { RootStackParamList } from "../types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.background,
    card: palette.card,
    text: palette.text,
    border: palette.line,
    primary: palette.berry,
  },
};

export function RootNavigator() {
  const { initialized, userEmail } = useAuth();

  if (!initialized) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userEmail ? (
          <Stack.Screen name="App" component={AppTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
