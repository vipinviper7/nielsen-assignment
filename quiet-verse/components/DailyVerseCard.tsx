import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { AppPalette } from '@/constants/AppPalette';
import { useAppTheme, useThemeProgress } from '@/context/AppThemeContext';
import type { BibleVerseRef } from '@/lib/bibleTypes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function formatReference(v: BibleVerseRef, uppercase: boolean): string {
  const s = `${v.book} ${v.chapter}:${v.verse}`;
  return uppercase ? s.toUpperCase() : s;
}

const GRADIENT_LIGHT = ['#FFFCF6', '#F7F0E2', '#F0E6D3', 'rgba(190,160,80,0.12)'] as const;
const GRADIENT_DARK = ['#0D1B2A', '#142236', '#1A2D45', 'rgba(201,168,76,0.12)'] as const;

type Props = {
  verses: BibleVerseRef[];
  loading: boolean;
  topInset: number;
};

function VerseCard({
  verse,
  width,
  themeProgress,
}: {
  verse: BibleVerseRef;
  width: number;
  themeProgress: Animated.SharedValue<number>;
}) {
  const refStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      ['rgba(120,95,50,0.6)', 'rgba(245,237,216,0.72)'],
    ),
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      ['#2C2416', AppPalette.dark.text],
    ),
  }));

  return (
    <View style={[styles.cardContainer, { width }]}>
      <Animated.Text
        style={[
          styles.reference,
          refStyle,
          { fontFamily: 'CormorantGaramond_600SemiBold' },
          Platform.OS === 'ios'
            ? styles.referenceSmallCapsIos
            : styles.referenceSmallCapsDroid,
        ]}
        accessibilityRole="header">
        {formatReference(verse, Platform.OS !== 'ios')}
      </Animated.Text>
      <Animated.Text
        style={[
          styles.verseBody,
          bodyStyle,
          { fontFamily: 'CormorantGaramond_400Regular' },
        ]}>
        {verse.text}
      </Animated.Text>
    </View>
  );
}

export function DailyVerseCard({ verses, loading, topInset }: Props) {
  const { colors } = useAppTheme();
  const themeProgress = useThemeProgress();

  const lightLayerStyle = useAnimatedStyle(() => ({
    opacity: 1 - themeProgress.value,
  }));
  const darkLayerStyle = useAnimatedStyle(() => ({
    opacity: themeProgress.value,
  }));

  const hintColor = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      ['rgba(120,95,50,0.3)', 'rgba(245,237,216,0.25)'],
    ),
  }));

  const cardWidth = SCREEN_WIDTH;

  return (
    <View style={styles.screen}>
      <View style={[styles.gradientHost, { paddingTop: topInset + 8 }]}>
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, lightLayerStyle]}>
          <LinearGradient colors={[...GRADIENT_LIGHT]} locations={[0, 0.35, 0.72, 1]} start={{ x: 0.08, y: 0 }} end={{ x: 0.92, y: 1 }} style={StyleSheet.absoluteFillObject} />
        </Animated.View>
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, darkLayerStyle]}>
          <LinearGradient colors={[...GRADIENT_DARK]} locations={[0, 0.35, 0.72, 1]} start={{ x: 0.08, y: 0 }} end={{ x: 0.92, y: 1 }} style={StyleSheet.absoluteFillObject} />
        </Animated.View>

        {loading && verses.length === 0 ? (
          <View style={styles.centerWrap}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : verses.length > 0 ? (
          <View style={styles.content}>
            <FlatList
              data={verses}
              keyExtractor={(_, i) => String(i)}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              bounces={false}
              renderItem={({ item }) => (
                <VerseCard verse={item} width={cardWidth} themeProgress={themeProgress} />
              )}
              getItemLayout={(_, index) => ({
                length: cardWidth,
                offset: cardWidth * index,
                index,
              })}
            />
            <View style={styles.hintWrap}>
              <Animated.Text style={[styles.hintText, hintColor]}>
                swipe for more
              </Animated.Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  gradientHost: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  reference: {
    fontSize: 13,
    letterSpacing: 2.2,
    marginBottom: 20,
    textAlign: 'center',
  },
  referenceSmallCapsIos: {
    fontVariant: ['small-caps'],
  },
  referenceSmallCapsDroid: {
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  verseBody: {
    fontSize: 26,
    lineHeight: 38,
    textAlign: 'center',
  },
  hintWrap: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
  },
  hintText: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
