import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DailyVerseCard } from '@/components/DailyVerseCard';
import { ReflectionTimer } from '@/components/ReflectionTimer';
import { useComfortingVerses } from '@/hooks/useComfortingVerses';
import { useAppTheme } from '@/context/AppThemeContext';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { verses, loading } = useComfortingVerses();
  const { resolvedScheme, setPreference, preference } = useAppTheme();
  const isDark = resolvedScheme === 'dark';

  const toggleTheme = () => {
    if (preference === 'system') {
      setPreference(isDark ? 'light' : 'dark');
    } else {
      setPreference(isDark ? 'light' : 'dark');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Theme toggle */}
      <Pressable
        onPress={toggleTheme}
        style={[styles.themeToggle, { top: insets.top + 10 }]}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
        <FontAwesome
          name={isDark ? 'sun-o' : 'moon-o'}
          size={20}
          color={isDark ? 'rgba(245,237,216,0.6)' : 'rgba(100,80,40,0.55)'}
        />
      </Pressable>

      <View style={styles.verseSlot}>
        <DailyVerseCard
          verses={verses}
          loading={loading}
          topInset={insets.top}
        />
      </View>
      <ReflectionTimer />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  themeToggle: {
    position: 'absolute',
    right: 18,
    zIndex: 10,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseSlot: {
    flex: 1,
    minHeight: 0,
  },
});
