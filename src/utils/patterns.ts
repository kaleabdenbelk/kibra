export const API_PATTERN = `
/**
 * Simple API client pattern for Kibra projects.
 * You can swap this with TanStack Query or your preferred library.
 */
export async function fetchData<T>(path: string, options?: RequestInit): Promise<T> {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';
  
  const response = await fetch(\`\${baseUrl}\${path}\`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(\`API Error: \${response.status}\`);
  }

  return response.json();
}
`;

export const THEME_HOOK_PATTERN = `
import { useColorScheme } from 'nativewind';

/**
 * Enhanced Theme hook for Kibra.
 * Provides easy access to color scheme and toggle logic.
 */
export function useKibraTheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useColorScheme();
  
  const isDark = colorScheme === 'dark';
  
  return {
    isDark,
    theme: colorScheme,
    setTheme: setColorScheme,
    toggleTheme: toggleColorScheme,
  };
}
`;
