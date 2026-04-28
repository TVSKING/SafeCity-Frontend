/**
 * SafeCity Disaster Mode Utility
 * Handles Offline Storage and Synchronization
 */

const OFFLINE_REPORTS_KEY = 'safecity_offline_reports';

export const saveReportOffline = (report) => {
  const existing = JSON.parse(localStorage.getItem(OFFLINE_REPORTS_KEY) || '[]');
  const newReport = {
    ...report,
    id: `offline_${Date.now()}`,
    offlineAt: new Date().toISOString()
  };
  existing.push(newReport);
  localStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify(existing));
  console.log('📡 DISASTER MODE: Report saved locally for future sync.');
  return newReport;
};

export const getOfflineReports = () => {
  return JSON.parse(localStorage.getItem(OFFLINE_REPORTS_KEY) || '[]');
};

export const clearOfflineReports = () => {
  localStorage.removeItem(OFFLINE_REPORTS_KEY);
};

export const syncOfflineReports = async (axiosInstance) => {
  const reports = getOfflineReports();
  if (reports.length === 0) return { synced: 0 };

  console.log(`📡 DISASTER MODE: Syncing ${reports.length} pending reports...`);
  let successCount = 0;

  for (const report of reports) {
    try {
      await axiosInstance.post('/api/alerts', report);
      successCount++;
    } catch (err) {
      console.error('Sync failed for report:', report.id, err);
    }
  }

  if (successCount === reports.length) {
    clearOfflineReports();
  } else {
    // Remove only successful ones
    const remaining = reports.slice(successCount);
    localStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify(remaining));
  }

  return { synced: successCount };
};

export const generateSMSText = (report) => {
  return `SOS! ${report.type.toUpperCase()} reported at https://www.google.com/maps?q=${report.location.lat},${report.location.lng}. Reporter: ${report.reporterName}. Message: ${report.description || 'No description'}`;
};
