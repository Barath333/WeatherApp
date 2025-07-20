import axios from 'axios';

const API_KEY = '5ebe69b2ff42db4ce6511f82746817ae';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const getWeather = async location => {
  try {
    const params =
      typeof location === 'string'
        ? { q: location }
        : { lat: location.latitude, lon: location.longitude };

    const response = await axios.get(BASE_URL, {
      params: {
        ...params,
        units: 'metric',
        appid: API_KEY,
      },
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.error('Weather API Error:', error);
  }
};
