import React from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import { useStore } from '../../hooks/useStore';

const icons = {
  success: Check,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
};

const styles = {
  success: 'bg-emerald-500 text-white',
  error: 'bg-rose-500 text-white',
  info: 'bg-blue-500 text-white',
  warning: 'bg-amber-500 text-white',
};

export const Notification = () => {
  const { notification, clearNotification } = useStore();
  
  if (!notification) return null;
  
  const Icon = icons[notification.type] || Info;
  const style = styles[notification.type] || styles.info;
  
  return (
    <div className={`
      fixed top-4 left-4 right-4 z-50
      max-w-lg mx-auto
      px-4 py-3 rounded-2xl shadow-lg
      flex items-center gap-3
      animate-slide-in
      ${style}
    `}>
      <Icon size={20} className="flex-shrink-0" />
      <span className="font-medium flex-1">{notification.message}</span>
      <button 
        onClick={clearNotification}
        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default Notification;
