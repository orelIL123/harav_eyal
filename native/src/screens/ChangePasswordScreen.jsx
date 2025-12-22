import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../utils/AuthContext';
import { updateUserPassword } from '../services/authService';

const ChangePasswordScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('שגיאה', 'הסיסמה חייבת להכיל לפחות 6 תווים.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('שגיאה', 'הסיסמאות אינן תואמות.');
      return;
    }

    setLoading(true);
    const { error } = await updateUserPassword(newPassword);
    setLoading(false);

    if (error) {
      Alert.alert('שגיאה', error);
    } else {
      Alert.alert('הצלחה', 'הסיסמה שונתה בהצלחה.', [
        { text: 'אישור', onPress: () => navigation.goBack() },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-forward" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>שינוי סיסמה</Text>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.label}>סיסמה חדשה</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="הזן סיסמה חדשה"
        />
        <Text style={styles.label}>אימות סיסמה חדשה</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="הזן את הסיסמה החדשה שוב"
        />
        <Pressable
          style={({ pressed }) => [
            styles.button,
            (loading || !newPassword || newPassword !== confirmPassword) && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleChangePassword}
          disabled={loading || !newPassword || newPassword !== confirmPassword}
        >
          {loading ? (
            <Text style={styles.buttonText}>מעדכן...</Text>
          ) : (
            <Text style={styles.buttonText}>שנה סיסמה</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
    flex: 1
  },
  backButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: '#b91c1c',
  },
  buttonDisabled: {
    backgroundColor: '#fca5a5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePasswordScreen;
