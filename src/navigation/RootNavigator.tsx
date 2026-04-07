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
  const { initialized, previewMode, userEmail } = useAuth();
  const appShellKey = previewMode ?? userEmail ?? "auth";

  if (!initialized) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer key={appShellKey} theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userEmail ? (
          <Stack.Screen key={appShellKey} name="App" component={AppTabs} />
        ) : (
          <Stack.Screen key={appShellKey} name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
