export const BASE_TEMPLATES = {
  layout: (colorSchemeVar: string) => `import "../global.css";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}`,
  index: (isLucide: boolean) => `import { Text, View, Pressable, ScrollView } from "react-native";
import { useColorScheme } from "nativewind";
import { SafeAreaView } from "react-native-safe-area-context";
import React from 'react';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
${isLucide ? 'import { Sun, Moon, Zap, Layout, Smartphone, Code } from "lucide-react-native";' : 'import { SymbolView } from "expo-symbols";'}

export default function HomeScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView contentContainerClassName="p-6">
        <Animated.View entering={FadeInUp.delay(200).duration(1000)} className="items-center mt-10">
          <View className="w-20 h-20 bg-primary/10 rounded-3xl items-center justify-center mb-6">
             ${isLucide ? '<Zap size={40} color="#084baf" />' : '<SymbolView name="bolt.fill" size={40} tintColor="#084baf" />'}
          </View>
          <Text className="text-4xl font-bold text-slate-900 dark:text-white text-center">
            Kibra
          </Text>
          <Text className="text-lg text-slate-500 dark:text-slate-400 text-center mt-2 max-w-xs">
            The fastest way to build native-first Expo apps with Tailwind CSS.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(1000)} className="mt-12 space-y-4">
          <FeatureCard 
            icon={${isLucide ? '<Layout size={24} color="#0f172a" />' : '<SymbolView name="square.grid.2x2.fill" size={24} tintColor="#0f172a" />'}} 
            title="Tailwind Ready" 
            description="Write full Tailwind CSS classes on native components effortlessly." 
          />
          <FeatureCard 
            icon={${isLucide ? '<Smartphone size={24} color="#0f172a" />' : '<SymbolView name="iphone" size={24} tintColor="#0f172a" />'}} 
            title="Native First" 
            description="Optimized for iOS and Android with a smooth 60fps experience." 
          />
          <FeatureCard 
            icon={${isLucide ? '<Code size={24} color="#0f172a" />' : '<SymbolView name="terminal.fill" size={24} tintColor="#0f172a" />'}} 
            title="Modern Stack" 
            description="Built on Expo Router, NativeWind, and Reanimated." 
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(1000)} className="mt-12 items-center">
          <Pressable 
            onPress={toggleColorScheme}
            className="flex-row items-center px-6 py-3 rounded-full bg-slate-200 dark:bg-slate-800"
          >
            ${isLucide 
              ? `{colorScheme === "dark" 
                ? <Sun size={20} color="#eab308" /> 
                : <Moon size={20} color="#084baf" />}`
              : `<SymbolView 
              name={colorScheme === "dark" ? "sun.max.fill" : "moon.fill"} 
              size={20}
              tintColor={colorScheme === "dark" ? "#eab308" : "#084baf"}
            />`
            }
            <Text className="text-slate-900 dark:text-white font-medium ml-2">
              Toggle {colorScheme === "dark" ? "Light" : "Dark"} Mode
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureCard({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <View className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex-row items-start">
      <View className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 items-center justify-center mr-4">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-slate-900 dark:text-white">{title}</Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</Text>
      </View>
    </View>
  );
}
`,
  html: `import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = \`
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}\`;`,
  notFound: `import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5 bg-white dark:bg-black">
        <Text className="text-xl font-bold text-slate-900 dark:text-white">This screen doesn't exist.</Text>
        <Link href="/" className="mt-4 py-4">
          <Text className="text-sm text-primary">Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}`
};
