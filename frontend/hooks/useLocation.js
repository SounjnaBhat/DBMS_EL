
import { useState, useEffect } from 'react';

/**
 * Hook to get user's current location using Browser Geolocation API
 */
export function useLocation() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data && data.address) {
        const city = data.address.city || data.address.town || data.address.village || data.address.county;
        const state = data.address.state; // or country
        // Construct vague address for privacy
        const formatted = city && state ? `${city}, ${state}` : city || "Unknown Location";
        return formatted;
      }
      return null;
    } catch (err) {
      console.warn("Reverse geocoding failed", err);
      return null;
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        
        // Fetch human-readable address
        const addr = await reverseGeocode(latitude, longitude);
        if (addr) setAddress(addr);
        
        setLoading(false);
      },
      (err) => {
        setError("Unable to retrieve your location. Please check permissions.");
        setLoading(false);
      }
    );
  };

  return { location, address, error, loading, getCurrentLocation };
}

/**
 * Calculates distance between two coordinates in km using Haversine formula
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d.toFixed(1);
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
