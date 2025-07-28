import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Button,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getWeather } from '../weather';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState();
  const [favorites, setFavourite] = useState([]);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const [isOnline, setIsOnline] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
      if (!state.isConnected) {
        setError('No internet connection');
      } else if (error === 'No internet connection') {
        setError('');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadFont = async () => {
      await MaterialIcons.loadFont(); // Ensure fonts are loaded
    };
    loadFont();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadFav = async () => {
        const saved = await AsyncStorage.getItem('favorites');
        if (saved) setFavourite(JSON.parse(saved));
      };
      loadFav();
    }, []),
  );

  useEffect(() => {
    const loadParams = async () => {
      const params = navigation.getParam('city');
      if (params) {
        setCity(params);
        await getCityWeather(params);
      }
    };

    loadParams();
  }, [navigation]);

  useEffect(() => {
    if (weather) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [weather]);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permissions',
          message: 'App needs the permission to access your location',
          buttonNeutral: 'Ask me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Ok',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  };

  const getLocationWeather = async () => {
    if (!isOnline) {
      setError('No internet connection');
      return;
    }
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        console.warn('Permission is not granted');
        console.log('Failed');
        return;
      }

      setLoading(true);
      Geolocation.getCurrentPosition(
        async position => {
          try {
            const data = await getWeather(position.coords);
            setWeather(data);
          } catch (e) {
            console.error(e);
          } finally {
            setLoading(false);
          }
        },
        error => {
          console.error(error);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 1500 },
      );
    } catch (e) {
      setError('Failed to get location data');
    }
  };

  const getCityWeather = async (cityName = city) => {
    if (!city) return;
    setLoading(true);
    try {
      const data = await getWeather(city);
      setWeather(data);
    } catch {
      console.log('City Request is Failed');
    } finally {
      setLoading(false);
    }
  };

  const getOutfitSuggestion = () => {
    if (!weather) return;
    const temp = weather.main.temp;

    if (temp < 0) return '⛄ Heavy coat, thermals, gloves, beanie';
    if (temp < 10) return '🧥 Warm jacket, sweater, long pants';
    if (temp < 20) return '👕 Light jacket, t-shirt, jeans';
    return '🩳 Shorts, t-shirt, sunglasses';
  };

  const saveFavorite = async () => {
    if (!weather) return;

    // Check if already exists
    if (favorites.includes(weather.name)) return;

    const newFav = [...favorites, weather.name];
    setFavourite(newFav);
    await AsyncStorage.setItem('favorites', JSON.stringify(newFav));
  };

  const getWeatherIcon = condition => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return '☀️';
      case 'clouds':
        return '☁️';
      case 'rain':
        return '🌧️';
      case 'thunderstorm':
        return '⛈️';
      case 'snow':
        return '❄️';
      case 'mist':
      case 'haze':
      case 'fog':
        return '🌫️';
      default:
        return '🌈';
    }
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>No internet connection</Text>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Weather Forecast</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Favorites')}
            style={styles.favoritesButton}
          >
            <MaterialIcons name="favorite" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter city name"
            placeholderTextColor="#aaa"
            value={city}
            onChangeText={setCity}
          />

          <TouchableOpacity
            style={styles.searchButton}
            onPress={getCityWeather}
            disabled={!city}
          >
            <MaterialIcons name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={getLocationWeather}
          >
            <MaterialIcons name="my-location" size={20} color="#fff" />
            <Text style={styles.buttonText}>My Location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={saveFavorite}
            disabled={!weather}
          >
            <MaterialIcons name="favorite-border" size={20} color="#fff" />
            <Text style={styles.buttonText}>Save Favorite</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <ActivityIndicator size="large" color="#fff" style={styles.loader} />
        )}

        {weather && (
          <Animated.View
            style={[
              styles.weatherCard,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.weatherHeader}>
              <Text style={styles.cityName}>{weather.name}</Text>
              <Text style={styles.weatherIcon}>
                {getWeatherIcon(weather.weather[0].main)}
              </Text>
            </View>

            <Text style={styles.temperature}>
              {Math.round(weather.main.temp)}°C
            </Text>

            <Text style={styles.weatherDescription}>
              {weather.weather[0].description}
            </Text>

            <View style={styles.weatherDetails}>
              <View style={styles.detailItem}>
                <Icon name="device-thermostat" size={20} color="#fff" />
                <Text style={styles.detailText}>
                  Feels like: {Math.round(weather.main.feels_like)}°C
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Icon name="water" size={20} color="#fff" />
                <Text style={styles.detailText}>
                  Humidity: {weather.main.humidity}%
                </Text>
              </View>
            </View>

            <View style={styles.outfitContainer}>
              <Text style={styles.outfitTitle}>Recommended Outfit:</Text>
              <Text style={styles.outfitSuggestion}>
                {getOutfitSuggestion()}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* {favorites.length > 0 && (
          <View style={styles.favoritesContainer}>
            <Text style={styles.sectionTitle}>Your Favorites</Text>
            {favorites.map((city, index) => (
              <TouchableOpacity
                key={index}
                style={styles.favoriteItem}
                onPress={() => {
                  setCity(city);
                  getCityWeather();
                }}
              >
                <Text style={styles.favoriteText}>{city}</Text>
                <Icon name="chevron-right" size={20} color="#fff" />
              </TouchableOpacity>
            ))}
          </View>
        )} */}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
    position: 'relative', // Needed for absolute positioning of button
  },
  searchContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1e88e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  locationButton: {
    flexDirection: 'row',
    backgroundColor: '#1e88e5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  favoriteButton: {
    flexDirection: 'row',
    backgroundColor: '#e91e63',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 30,
  },
  weatherCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  weatherIcon: {
    fontSize: 40,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 10,
  },
  weatherDescription: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    textTransform: 'capitalize',
    marginBottom: 20,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: '#fff',
    marginLeft: 5,
  },
  outfitContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
  },
  outfitTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  outfitSuggestion: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },

  favoriteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  favoriteText: {
    color: '#fff',
    fontSize: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  favoritesButton: {
    position: 'absolute', // Position absolutely within header
    right: 0, // Place on the right side
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: 3,
  },
  offlineBanner: {
    backgroundColor: '#ff6b6b',
    padding: 10,
    width: '100%',
    alignItems: 'center',
    zIndex: 100,
  },
  offlineText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginVertical: 10,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
