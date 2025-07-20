import { NewAppScreen } from '@react-native/new-app-screen';
import {
  Animated,
  Easing,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import HomeScreen from './src/Screens/HomeScreen';
import {
  createNativeStackNavigator,
  NativeStackHeaderProps,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import FavoritesScreen from './src/Screens/FavoritesScreen';

const Stack = createNativeStackNavigator();

type RootStackParamList = {
  Splash: undefined;
  'Weather App': undefined;
};

type SplashScreenProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen = ({ navigation }: SplashScreenProps) => {
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [moveAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.5,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim, {
          toValue: -100,
          duration: 600,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]).start(() => {
        navigation.replace('Weather App');
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.splashContainer}
    >
      <StatusBar barStyle="light-content" />

      <Animated.View
        style={[
          styles.splashContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: moveAnim }],
          },
        ]}
      >
        {/* <Image
          source={require('./assets/weather-icon.png')}
          style={styles.splashIcon}
        /> */}
        <Text style={styles.splashText}>Weather Forecast</Text>
      </Animated.View>
    </LinearGradient>
  );
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(true);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            header: ({
              navigation,
              route,
              options,
            }: NativeStackHeaderProps) => (
              <LinearGradient
                colors={['#4c669f', '#3b5998']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerGradient}
              >
                <View style={styles.headerContainer}>
                  <Text style={styles.headerTitle}>{route.name}</Text>
                </View>
              </LinearGradient>
            ),
            headerShown: true,
          }}
        >
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Weather App" component={HomeScreen} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    height: 100, // Increased height for better proportion
    justifyContent: 'flex-end',
    borderBottomWidth: 0, // Remove default border
    elevation: 0, // Remove shadow on Android
    shadowOpacity: 0, // Remove shadow on iOS
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
  },
  splashIcon: {
    width: 150,
    height: 150,
    marginBottom: 20,
    tintColor: 'white',
  },
  splashText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
});

export default App;
