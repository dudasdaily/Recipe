import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import IngredientAddScreen from "./screens/IngredientAddScreen";
import PhotoInputScreen from "./screens/PhotoInputScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="재료 추가" component={IngredientAddScreen} />
        <Stack.Screen name="사진 촬영" component={PhotoInputScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
