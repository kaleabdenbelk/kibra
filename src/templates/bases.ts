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
	index: (
		isLucide: boolean,
	) => `import { Text, View, ScrollView } from "react-native";
import { Button } from "@/components/ui/button";
import React from 'react';

export default function HomeScreen() {
  return (
    <ScrollView className="p-6 bg-slate-50 dark:bg-slate-950 flex-1">
      <View className="mb-8 mt-10">
        <Text className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome to your Kibra app!
        </Text>
        <Text className="text-slate-600 dark:text-slate-400 text-lg">
          Your playground for building React Native components with Kibra.
        </Text>
      </View>

      <View className="space-y-4">
        <Button onPress={() => alert('Button works!')}>
          Try Kibra Button
        </Button>
        <Button variant="secondary" onPress={() => alert('Explore Example')}>
          Explore Example
        </Button>
      </View>

      <View className="mt-12">
        <Text className="text-slate-500 dark:text-slate-500 text-sm">
          Tip: Use <Text className="font-mono text-primary font-bold">kibra add &lt;component&gt;</Text> to add components from the registry.
        </Text>
      </View>
    </ScrollView>
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
}`,
};
