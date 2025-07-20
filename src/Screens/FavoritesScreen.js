// src/Screens/FavoritesScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const loadFont = async () => {
      await MaterialIcons.loadFont();
    };
    loadFont();

    const loadFavorites = async () => {
      const saved = await AsyncStorage.getItem('favorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    };

    loadFavorites();

    // Animate screen entrance
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const clearFavorites = async () => {
    await AsyncStorage.removeItem('favorites');
    setFavorites([]);
  };

  const removeFavorite = async city => {
    const newFavorites = favorites.filter(fav => fav !== city);
    setFavorites(newFavorites);
    await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  return (
    <LinearGradient
      colors={['#192f6a', '#3b5998', '#4c669f']}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Favorite Locations</Text>
          <TouchableOpacity
            onPress={clearFavorites}
            disabled={favorites.length === 0}
            style={styles.clearButton}
          >
            <MaterialIcons
              name="delete"
              size={24}
              color={favorites.length === 0 ? '#aaa' : '#fff'}
            />
          </TouchableOpacity>
        </View>

        {favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="favorite-border"
              size={60}
              color="rgba(255,255,255,0.3)"
            />
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>
              Save locations to see them here
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.listContainer}>
            {favorites.map((city, index) => (
              <TouchableOpacity
                key={index}
                style={styles.favoriteItem}
                onPress={() => {
                  navigation.navigate('Weather App', { city });
                }}
              >
                <MaterialIcons name="location-city" size={24} color="#fff" />
                <Text style={styles.favoriteText}>{city}</Text>
                <TouchableOpacity
                  onPress={() => removeFavorite(city)}
                  style={styles.deleteButton}
                >
                  <MaterialIcons name="close" size={24} color="#ff6b6b" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingTop: 20,
  },
  backButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  clearButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 20,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 10,
  },
  listContainer: {
    paddingBottom: 30,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  favoriteText: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    marginLeft: 15,
  },
  deleteButton: {
    padding: 5,
  },
});

export default FavoritesScreen;
