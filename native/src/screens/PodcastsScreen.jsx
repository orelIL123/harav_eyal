import React, { useState, useEffect } from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable, Image, ActivityIndicator, Alert, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Audio } from 'expo-av'
import { getPodcasts } from '../services/podcastsService'
import { useAuth } from '../utils/AuthContext'

const PRIMARY_RED = '#DC2626'
const PRIMARY_GOLD = '#FFD700'
const BG = '#FFFFFF'
const DEEP_BLUE = '#0b1b3a'

export default function PodcastsScreen({ navigation }) {
  const { user } = useAuth()
  const [podcasts, setPodcasts] = useState([])
  const [loading, setLoading] = useState(true)
  const [playingPodcast, setPlayingPodcast] = useState(null)
  const [sound, setSound] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    loadPodcasts()
    
    // Cleanup sound on unmount
    return () => {
      if (sound) {
        sound.unloadAsync()
      }
    }
  }, [])

  useEffect(() => {
    // Update position while playing
    let interval
    if (isPlaying && sound) {
      interval = setInterval(async () => {
        const status = await sound.getStatusAsync()
        if (status.isLoaded) {
          setPosition(status.positionMillis)
          setDuration(status.durationMillis || 0)
        }
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, sound])

  const loadPodcasts = async () => {
    try {
      setLoading(true)
      const allPodcasts = await getPodcasts()
      setPodcasts(allPodcasts)
    } catch (error) {
      console.error('Error loading podcasts:', error)
      Alert.alert('שגיאה', 'לא ניתן לטעון את הפודקאסטים')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (millis) => {
    if (!millis) return '0:00'
    const totalSeconds = Math.floor(millis / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handlePlayPause = async (podcast) => {
    try {
      // If clicking the same podcast
      if (playingPodcast?.id === podcast.id) {
        if (isPlaying) {
          await sound.pauseAsync()
          setIsPlaying(false)
        } else {
          await sound.playAsync()
          setIsPlaying(true)
        }
        return
      }

      // Stop current sound if playing
      if (sound) {
        await sound.unloadAsync()
        setSound(null)
      }

      // Load and play new podcast
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      })

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: podcast.audioUrl },
        { shouldPlay: true }
      )

      setSound(newSound)
      setPlayingPodcast(podcast)
      setIsPlaying(true)

      // Get duration
      const status = await newSound.getStatusAsync()
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0)
        setPosition(0)
      }

      // Handle playback finish
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false)
          setPosition(0)
        }
      })
    } catch (error) {
      console.error('Error playing podcast:', error)
      Alert.alert('שגיאה', 'לא ניתן לנגן את הפודקאסט')
    }
  }

  const handleSeek = async (newPosition) => {
    if (sound) {
      await sound.setPositionAsync(newPosition)
      setPosition(newPosition)
    }
  }

  const handleStop = async () => {
    if (sound) {
      await sound.stopAsync()
      await sound.unloadAsync()
      setSound(null)
      setPlayingPodcast(null)
      setIsPlaying(false)
      setPosition(0)
      setDuration(0)
    }
  }

  // Check if user is logged in
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-forward" size={28} color={DEEP_BLUE} />
          </Pressable>
          <Text style={styles.headerTitle}>פודקאסטים</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loginPrompt}>
          <Ionicons name="lock-closed-outline" size={64} color={PRIMARY_RED} />
          <Text style={styles.loginPromptTitle}>התחבר כדי להאזין</Text>
          <Text style={styles.loginPromptText}>
            עליך להתחבר כדי להאזין לפודקאסטים
          </Text>
          <Pressable
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>התחבר</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-forward" size={28} color={DEEP_BLUE} />
        </Pressable>
        <Text style={styles.headerTitle}>פודקאסטים</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Now Playing Bar */}
      {playingPodcast && (
        <View style={styles.nowPlayingBar}>
          <View style={styles.nowPlayingContent}>
            {playingPodcast.thumbnailUrl ? (
              <Image
                source={{ uri: playingPodcast.thumbnailUrl }}
                style={styles.nowPlayingThumbnail}
              />
            ) : (
              <View style={styles.nowPlayingThumbnailPlaceholder}>
                <Ionicons name="musical-notes" size={24} color={PRIMARY_RED} />
              </View>
            )}
            <View style={styles.nowPlayingInfo}>
              <Text style={styles.nowPlayingTitle} numberOfLines={1}>
                {playingPodcast.title}
              </Text>
              <View style={styles.nowPlayingControls}>
                <Pressable
                  style={styles.controlButton}
                  onPress={() => handlePlayPause(playingPodcast)}
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={20}
                    color="#fff"
                  />
                </Pressable>
                <View style={styles.progressContainer}>
                  <Text style={styles.timeText}>{formatTime(position)}</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: duration
                            ? `${(position / duration) * 100}%`
                            : '0%',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>
                <Pressable style={styles.controlButton} onPress={handleStop}>
                  <Ionicons name="stop" size={20} color="#fff" />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={PRIMARY_RED} size="large" />
            <Text style={styles.loadingText}>טוען פודקאסטים...</Text>
          </View>
        ) : podcasts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="headset-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>אין פודקאסטים זמינים</Text>
            <Text style={styles.emptyText}>
              פודקאסטים חדשים יופיעו כאן בקרוב
            </Text>
          </View>
        ) : (
          <View style={styles.podcastsList}>
            {podcasts.map((podcast) => {
              const isCurrentlyPlaying = playingPodcast?.id === podcast.id
              return (
                <Pressable
                  key={podcast.id}
                  style={[
                    styles.podcastCard,
                    isCurrentlyPlaying && styles.podcastCardPlaying,
                  ]}
                  onPress={() => handlePlayPause(podcast)}
                >
                  {podcast.thumbnailUrl ? (
                    <Image
                      source={{ uri: podcast.thumbnailUrl }}
                      style={styles.podcastThumbnail}
                    />
                  ) : (
                    <View style={styles.podcastThumbnailPlaceholder}>
                      <Ionicons
                        name="musical-notes"
                        size={32}
                        color={PRIMARY_RED}
                      />
                    </View>
                  )}
                  <View style={styles.podcastInfo}>
                    <Text style={styles.podcastTitle}>{podcast.title}</Text>
                    {podcast.description && (
                      <Text style={styles.podcastDescription} numberOfLines={2}>
                        {podcast.description}
                      </Text>
                    )}
                    {podcast.category && (
                      <Text style={styles.podcastCategory}>
                        {podcast.category}
                      </Text>
                    )}
                  </View>
                  <View style={styles.playButton}>
                    <Ionicons
                      name={isCurrentlyPlaying && isPlaying ? 'pause' : 'play'}
                      size={28}
                      color={isCurrentlyPlaying ? PRIMARY_RED : DEEP_BLUE}
                    />
                  </View>
                </Pressable>
              )
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
    paddingTop: Platform.select({ ios: 12, android: 8 }),
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(11,27,58,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#9ca3af',
    textAlign: 'center',
  },
  loginPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loginPromptTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    marginTop: 16,
    marginBottom: 8,
  },
  loginPromptText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: PRIMARY_RED,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  podcastsList: {
    padding: 16,
    gap: 12,
  },
  podcastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(11,27,58,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  podcastCardPlaying: {
    borderColor: PRIMARY_RED,
    borderWidth: 2,
    backgroundColor: 'rgba(220,38,38,0.05)',
  },
  podcastThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(220,38,38,0.1)',
  },
  podcastThumbnailPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(220,38,38,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  podcastInfo: {
    flex: 1,
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  podcastTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: DEEP_BLUE,
    marginBottom: 4,
  },
  podcastDescription: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'right',
  },
  podcastCategory: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: PRIMARY_RED,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(220,38,38,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  nowPlayingBar: {
    backgroundColor: DEEP_BLUE,
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  nowPlayingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nowPlayingThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  nowPlayingThumbnailPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nowPlayingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nowPlayingTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
    marginBottom: 8,
  },
  nowPlayingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 10,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255,255,255,0.8)',
    minWidth: 35,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: PRIMARY_GOLD,
    borderRadius: 2,
  },
})

