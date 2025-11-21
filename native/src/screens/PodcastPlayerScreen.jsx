import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator, Alert, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Audio } from 'expo-av'
import Slider from '@react-native-community/slider'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

export default function PodcastPlayerScreen({ navigation, route }) {
  const { t } = useTranslation()
  const { podcast } = route.params

  const [sound, setSound] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isBuffering, setIsBuffering] = useState(false)

  // Load and setup audio
  useEffect(() => {
    let isMounted = true

    const setupAudio = async () => {
      try {
        // Configure audio mode for playback
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        })

        // Create and load sound
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: podcast.audioUrl },
          { shouldPlay: false },
          onPlaybackStatusUpdate
        )

        if (isMounted) {
          setSound(newSound)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error loading audio:', error)
        if (isMounted) {
          setIsLoading(false)
          Alert.alert(t('error'), t('home.errorLoadingAudio'))
        }
      }
    }

    setupAudio()

    return () => {
      isMounted = false
      if (sound) {
        sound.unloadAsync()
      }
    }
  }, [podcast.audioUrl])

  // Playback status update handler
  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis)
      setDuration(status.durationMillis)
      setIsPlaying(status.isPlaying)
      setIsBuffering(status.isBuffering)
    }
  }

  // Play/Pause toggle
  const handlePlayPause = async () => {
    if (!sound) return

    try {
      if (isPlaying) {
        await sound.pauseAsync()
      } else {
        await sound.playAsync()
      }
    } catch (error) {
      console.error('Error toggling playback:', error)
      Alert.alert(t('error'), t('home.errorPlayback'))
    }
  }

  // Seek to position
  const handleSeek = async (value) => {
    if (!sound) return

    try {
      await sound.setPositionAsync(value)
    } catch (error) {
      console.error('Error seeking:', error)
    }
  }

  // Skip forward 15 seconds
  const handleSkipForward = async () => {
    if (!sound || !duration) return

    try {
      const newPosition = Math.min(position + 15000, duration)
      await sound.setPositionAsync(newPosition)
    } catch (error) {
      console.error('Error skipping forward:', error)
    }
  }

  // Skip backward 15 seconds
  const handleSkipBackward = async () => {
    if (!sound) return

    try {
      const newPosition = Math.max(position - 15000, 0)
      await sound.setPositionAsync(newPosition)
    } catch (error) {
      console.error('Error skipping backward:', error)
    }
  }

  // Format time in mm:ss
  const formatTime = (millis) => {
    const totalSeconds = Math.floor(millis / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[BG, '#f7f7f7']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={PRIMARY_RED} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('home.podcasts')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Album Art */}
      <View style={styles.albumArtContainer}>
        {podcast.thumbnailUrl ? (
          <Image
            source={{ uri: podcast.thumbnailUrl }}
            style={styles.albumArt}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.albumArtPlaceholder}>
            <Ionicons name="headset" size={80} color={PRIMARY_RED} />
          </View>
        )}
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>{podcast.title}</Text>
        {podcast.description && (
          <Text style={styles.trackDesc} numberOfLines={2}>{podcast.description}</Text>
        )}
        {podcast.category && (
          <Text style={styles.trackCategory}>{podcast.category}</Text>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
        <Slider
          style={styles.slider}
          value={position}
          minimumValue={0}
          maximumValue={duration || 1}
          minimumTrackTintColor={PRIMARY_RED}
          maximumTrackTintColor="#d1d5db"
          thumbTintColor={PRIMARY_RED}
          onSlidingComplete={handleSeek}
          disabled={isLoading || !duration}
        />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable
          style={styles.controlBtn}
          onPress={handleSkipBackward}
          disabled={isLoading || !sound}
        >
          <Ionicons name="play-back" size={32} color={isLoading ? '#d1d5db' : DEEP_BLUE} />
        </Pressable>

        <Pressable
          style={[styles.playBtn, isLoading && styles.playBtnDisabled]}
          onPress={handlePlayPause}
          disabled={isLoading || !sound}
        >
          {isLoading || isBuffering ? (
            <ActivityIndicator size="large" color="#ffffff" />
          ) : (
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={40}
              color="#ffffff"
            />
          )}
        </Pressable>

        <Pressable
          style={styles.controlBtn}
          onPress={handleSkipForward}
          disabled={isLoading || !sound}
        >
          <Ionicons name="play-forward" size={32} color={isLoading ? '#d1d5db' : DEEP_BLUE} />
        </Pressable>
      </View>

      {/* Skip Labels */}
      <View style={styles.skipLabels}>
        <Text style={styles.skipLabel}>15 {t('home.seconds')}</Text>
        <View style={{ width: 100 }} />
        <Text style={styles.skipLabel}>15 {t('home.seconds')}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.select({ ios: 54, android: 42, default: 48 }),
    paddingBottom: 16,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
  },
  albumArtContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  albumArt: {
    width: 280,
    height: 280,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  albumArtPlaceholder: {
    width: 280,
    height: 280,
    borderRadius: 20,
    backgroundColor: 'rgba(220,38,38,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  trackInfo: {
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  trackTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: DEEP_BLUE,
    textAlign: 'center',
    marginBottom: 8,
  },
  trackDesc: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  trackCategory: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: PRIMARY_RED,
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 32,
    marginBottom: 10,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#6b7280',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: 20,
    gap: 30,
  },
  controlBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PRIMARY_RED,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY_RED,
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  playBtnDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0.2,
  },
  skipLabels: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 8,
    gap: 30,
  },
  skipLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: '#9ca3af',
    width: 60,
    textAlign: 'center',
  },
})
