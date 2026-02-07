import { isSupabaseConfigured, supabase } from './supabase';

let currentStatus = navigator.onLine ? 'online' : 'offline';
const listeners = new Set();

const notifyListeners = (status) => {
  if (status !== currentStatus) {
    currentStatus = status;
    for (const listener of listeners) {
      listener(status);
    }
  }
};

const checkSupabaseConnection = async () => {
  if (!isSupabaseConfigured()) return true;
  try {
    const { error } = await supabase.from('products').select('id', { count: 'exact', head: true });
    return !error;
  } catch {
    return false;
  }
};

// Browser online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    if (!isSupabaseConfigured()) return;
    const isReachable = await checkSupabaseConnection();
    notifyListeners(isReachable ? 'online' : 'offline');
  });

  window.addEventListener('offline', () => {
    if (!isSupabaseConfigured()) return;
    notifyListeners('offline');
  });
}

export const connectionMonitor = {
  getStatus() {
    return currentStatus;
  },

  isOnline() {
    return currentStatus === 'online';
  },

  onStatusChange(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  markOffline() {
    notifyListeners('offline');
  },

  markOnline() {
    notifyListeners('online');
  },

  async checkConnection() {
    if (!isSupabaseConfigured()) {
      currentStatus = 'online';
      return true;
    }
    const isReachable = await checkSupabaseConnection();
    notifyListeners(isReachable ? 'online' : 'offline');
    return isReachable;
  },
};
