/**
 * SafeCity Route Optimization & Unit Dispatcher
 * Implements Proximity Scanning and Hazard-Aware Routing
 */

// 1. Proximity Dispatcher (Find Closest Unit)
export const findClosestUnit = (incidentLocation, units) => {
  if (!units || units.length === 0) return null;

  const R = 6371; // Earth's radius in km
  
  const distances = units.map(unit => {
    const dLat = (unit.location.lat - incidentLocation.lat) * Math.PI / 180;
    const dLng = (unit.location.lng - incidentLocation.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(incidentLocation.lat * Math.PI / 180) * Math.cos(unit.location.lat * Math.PI / 180) * 
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return { ...unit, distance };
  });

  return distances.sort((a, b) => a.distance - b.distance)[0];
};

// 2. Hazard-Aware Route Optimization (Conceptual Dijkstra/A*)
// This calculates if a straight-line path intersects with any Hazard Zones
export const validatePathSafety = (start, end, hazards) => {
  const pointsOnPath = 10; // Number of checkpoints along the route
  const unsafeZones = [];

  for (let i = 0; i <= pointsOnPath; i++) {
    const checkLat = start.lat + (end.lat - start.lat) * (i / pointsOnPath);
    const checkLng = start.lng + (end.lng - start.lng) * (i / pointsOnPath);

    const hit = hazards.find(h => {
      const dist = getDistance(checkLat, checkLng, h.location.lat, h.location.lng);
      return dist <= h.radius;
    });

    if (hit && !unsafeZones.includes(hit)) {
      unsafeZones.push(hit);
    }
  }

  return {
    isSafe: unsafeZones.length === 0,
    conflicts: unsafeZones,
    suggestedReroute: unsafeZones.length > 0
  };
};

// Helper: Haversine Distance
const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // Radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// 3. OSRM Integration Wrapper (The Real-world deployable part)
export const getOptimizedRouteURL = (start, end) => {
  return `https://www.google.com/maps/dir/?api=1&origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&travelmode=driving`;
};
