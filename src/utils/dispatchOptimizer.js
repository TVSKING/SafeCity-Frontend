/**
 * SafeCity Dispatch Optimizer
 * Uses Haversine Formula to find the nearest responders.
 */

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const findClosestUnit = (alert, departments) => {
  if (!alert.location || !departments || departments.length === 0) return null;

  // Filter departments by type matching the alert
  let targetType = 'none';
  if (alert.type === 'Fire') targetType = 'fire';
  else if (alert.type === 'Medical') targetType = 'ambulance';
  else if (alert.type === 'Accident') targetType = 'police';
  else if (alert.type === 'Crime') targetType = 'police';

  const filteredDepts = departments.filter(d => 
    d.departmentType === targetType || d.role === 'admin'
  );

  if (filteredDepts.length === 0) return null;

  // Find the one with minimum distance
  let closest = null;
  let minDistance = Infinity;

  filteredDepts.forEach(dept => {
    if (dept.location && dept.location.lat) {
      const dist = calculateDistance(
        alert.location.lat, alert.location.lng,
        dept.location.lat, dept.location.lng
      );
      if (dist < minDistance) {
        minDistance = dist;
        closest = { ...dept, distance: dist.toFixed(1) };
      }
    }
  });

  return closest;
};
