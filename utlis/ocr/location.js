/**
 * GPS & Location Utilities
 */

import axios from 'axios'

/**
 * Calculate distance between two GPS coordinates (Haversine formula)
 * @returns distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Get pincode and address from GPS coordinates (FREE - OpenStreetMap)
 */
async function getPincodeFromCoordinates(latitude, longitude) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

    const response = await axios.get(url, {
      headers: { 'User-Agent': 'PharmacyVerificationApp/1.0' },
      timeout: 10000
    });

    const address = response.data.address || {};

    return {
      pincode: address.postcode || 'Not available',
      city: address.city || address.town || address.village || 'Unknown',
      district: address.county || 'Unknown',
      state: address.state || 'Unknown',
      country: address.country || 'India',
      success: true
    };
  } catch (error) {
    console.error('Pincode fetch error:', error.message);
    return {
      pincode: null,
      success: false,
      error: error.message
    };
  }
}

/**
 * Detect fake GPS by checking impossible speed
 */
function detectFakeGPS(currentLocation, previousLocation) {
  if (!previousLocation) {
    return { fraud: false, reason: 'First submission' };
  }

  const distance = calculateDistance(
    previousLocation.lat,
    previousLocation.lon,
    currentLocation.lat,
    currentLocation.lon
  );

  const timeInHours = (currentLocation.timestamp - previousLocation.timestamp) / (1000 * 60 * 60);
  const speedKmH = distance / timeInHours;

  if (speedKmH > 100 && timeInHours < 1) {
    return {
      fraud: true,
      reason: `Impossible speed: ${speedKmH.toFixed(2)} km/h`
    };
  }

  if (distance > 50 && timeInHours < 0.5) {
    return {
      fraud: true,
      reason: `Teleported ${distance.toFixed(2)}km in ${(timeInHours * 60).toFixed(1)} minutes`
    };
  }

  return { fraud: false, reason: 'Location change is realistic' };
}

export {
  calculateDistance,
  getPincodeFromCoordinates,
  detectFakeGPS
};
