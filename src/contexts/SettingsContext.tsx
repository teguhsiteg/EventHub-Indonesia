import React, { createContext, useContext, useEffect, useState } from 'react';
import { SystemSettings } from '../types';
import { getSystemSettings, DEFAULT_SYSTEM_SETTINGS } from '../services/settingsService';

interface NotificationToast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface SettingsContextType {
  settings: SystemSettings;
  reloadSettings: () => Promise<void>;
  notifications: NotificationToast[];
  addNotification: (type: NotificationToast['type'], title: string, message: string) => void;
  removeNotification: (id: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [notifications, setNotifications] = useState<NotificationToast[]>([]);

  const reloadSettings = async () => {
    const s = await getSystemSettings();
    setSettings(s);
  };

  useEffect(() => {
    reloadSettings();
  }, []);

  const addNotification = (type: NotificationToast['type'], title: string, message: string) => {
    const id = `notif_${Date.now()}_${Math.random()}`;
    setNotifications(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      reloadSettings,
      notifications,
      addNotification,
      removeNotification
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
