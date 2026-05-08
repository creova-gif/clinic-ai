import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { colors } from '@/constants/colors';

export default function Index() {
  const { userRole, isLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (userRole) {
      router.replace('/(tabs)');
    } else {
      router.replace('/onboarding');
    }
  }, [isLoading, userRole]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.light.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.light.primary },
});
