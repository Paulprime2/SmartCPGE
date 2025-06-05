import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bell, Check, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { notifications, markNotificationAsRead, clearAllNotifications } = useAppContext();
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  if (notifications.length === 0) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center justify-center py-6">
          <Bell className="h-8 w-8 text-gray-300 mb-2" />
          <p className="text-gray-500 text-center">Aucune notification</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-2">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <h2 className="text-sm font-medium text-gray-900">Notifications</h2>
        <button
          type="button"
          onClick={clearAllNotifications}
          className="text-xs text-indigo-600 hover:text-indigo-900"
        >
          Tout effacer
        </button>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-4 py-3 border-b border-gray-200 flex items-start ${
              notification.read ? 'bg-white' : 'bg-indigo-50'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                <p className="text-xs text-gray-500">
                  {format(parseISO(notification.timestamp), 'HH:mm', { locale: fr })}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
              {!notification.read && (
                <button
                  onClick={() => markNotificationAsRead(notification.id)}
                  className="mt-1 flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-900"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Marquer comme lu
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPanel;