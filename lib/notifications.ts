import { useEffect, useRef } from 'react';
import { useAuthStore } from './store/user-store';

type NotificationType = 'food-ready' | 'new-drinks' | 'new-food';

// Map notification types to sound files (these would be actual sound files in your public directory)
const NOTIFICATION_SOUNDS: Record<NotificationType, string> = {
  'food-ready': '/sounds/that-was-quick-606.mp3',
  'new-drinks': '/sounds/bonus-points-190035.mp3',
  'new-food': '/sounds/bonus-points-190035.mp3',
};

export const useNotifications = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio();

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playNotification = (type: NotificationType) => {
    // Check if notifications are allowed for this user role
    if (!user) return;

    // Only play relevant notifications based on user role
    if (
      (type === 'food-ready' && user.role !== 'waiter') ||
      (type === 'new-drinks' && user.role !== 'barman') ||
      (type === 'new-food' && user.role !== 'cook')
    ) {
      return;
    }

    if (audioRef.current) {
      audioRef.current.src = NOTIFICATION_SOUNDS[type];
      audioRef.current
        .play()
        .catch((err) =>
          console.error('Failed to play notification sound:', err)
        );
    }
  };

  return { playNotification };
};

// Hook to display browser notifications
export const useBrowserNotifications = () => {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Request notification permission when the component mounts
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!user) return;

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  };

  return { sendNotification };
};
