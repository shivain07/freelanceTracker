import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notifyUser } from '../../utils/notifications';
import { clearToken } from '../../utils/secureToken';

const styles = {
  error: {
    icon: AlertCircle,
    container: 'border-rose-500/30 bg-slate-900 text-rose-100',
    iconColor: 'text-rose-400',
  },
  success: {
    icon: CheckCircle2,
    container: 'border-emerald-500/30 bg-slate-900 text-emerald-100',
    iconColor: 'text-emerald-400',
  },
  info: {
    icon: Info,
    container: 'border-indigo-500/30 bg-slate-900 text-indigo-100',
    iconColor: 'text-indigo-400',
  },
};

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const timers = useRef(new Map());
  const navigate = useNavigate();
  const { verifyUser } = useAuth();

  useEffect(() => {
    const removeNotification = (id) => {
      const timer = timers.current.get(id);
      if (timer) window.clearTimeout(timer);
      timers.current.delete(id);
      setNotifications((current) => current.filter((item) => item.id !== id));
    };

    const handleNotification = (event) => {
      const notification = event.detail;
      setNotifications((current) => [...current, notification]);
      timers.current.set(
        notification.id,
        window.setTimeout(() => removeNotification(notification.id), 6000),
      );
    };

    const handleAuthExpired = () => {
      clearToken();
      verifyUser(null);
      navigate('/', { replace: true });
      notifyUser('Your session has expired. Please sign in again.');
    };

    window.addEventListener('app:notification', handleNotification);
    window.addEventListener('app:auth-expired', handleAuthExpired);

    return () => {
      window.removeEventListener('app:notification', handleNotification);
      window.removeEventListener('app:auth-expired', handleAuthExpired);
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current.clear();
    };
  }, [navigate, verifyUser]);

  const dismiss = (id) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
    setNotifications((current) => current.filter((item) => item.id !== id));
  };

  return (
    <>
      {children}
      <div
        className="fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
        aria-live="polite"
        aria-relevant="additions"
      >
        {notifications.map((notification) => {
          const appearance = styles[notification.variant] || styles.error;
          const Icon = appearance.icon;

          return (
            <div
              key={notification.id}
              role={notification.variant === 'error' ? 'alert' : 'status'}
              className={`flex items-start gap-3 rounded-xl border p-4 shadow-xl shadow-slate-950/20 backdrop-blur ${appearance.container}`}
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${appearance.iconColor}`} />
              <p className="flex-1 text-sm leading-5">{notification.message}</p>
              <button
                type="button"
                onClick={() => dismiss(notification.id)}
                className="rounded p-0.5 text-slate-400 transition hover:text-white"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default NotificationProvider;
