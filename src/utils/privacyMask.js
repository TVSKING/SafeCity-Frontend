/**
 * SafeCity Privacy & Location Masking Utility
 * Protects victim privacy in public views while maintaining disaster awareness.
 */

// Adds a random jitter (approx 50-100m) to coordinates for public maps
export const maskLocation = (lat, lng) => {
  const jitterFactor = 0.0005; // Approx 50-70 meters
  const jitterLat = (Math.random() - 0.5) * jitterFactor;
  const jitterLng = (Math.random() - 0.5) * jitterFactor;
  
  return {
    lat: lat + jitterLat,
    lng: lng + jitterLng,
    isMasked: true
  };
};

// Formats sensitive text for public view (e.g. "John Doe" -> "J*** D***")
export const maskText = (text) => {
  if (!text) return 'Anonymous';
  const parts = text.split(' ');
  return parts.map(p => p[0] + '*'.repeat(Math.max(0, p.length - 1))).join(' ');
};

// "End-to-end encrypted communication for sensitive incident data"
export const encryptionNotice = "End-to-end encrypted communication for sensitive incident data";
