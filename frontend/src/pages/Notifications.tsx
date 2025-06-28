import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
  id: number;
  content: string;
  url?: string;
  target: 'all' | 'players' | 'mvp' | 'team';
  created_at: string;
  created_by: number;
  creator_name: string;
}

interface UserNotification {
  id: number;
  notification: {
    id: number;
    content: string;
    url?: string;
    target: 'all' | 'players' | 'mvp' | 'team';
    created_at: string;
    created_by: number;
  };
  is_read: boolean;
  created_at: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [notificationLog, setNotificationLog] = useState<Notification[]>([]);
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [target, setTarget] = useState<'all' | 'players' | 'mvp' | 'team'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    if (isAdmin) {
      loadNotificationLog();
    }
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications/me');
      setNotifications(response.data);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const loadNotificationLog = async () => {
    try {
      const response = await api.get('/notifications/log');
      setNotificationLog(response.data);
    } catch (error) {
      console.error('Erro ao carregar log de notificações:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await api.post('/notifications', {
        content: content.trim(),
        url: url.trim() || undefined,
        target
      });
      setContent('');
      setUrl('');
      setTarget('all');
      loadNotificationLog();
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notificationId: number) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      loadNotifications();
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>

      {isAdmin && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Enviar Notificação</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={250}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite sua mensagem (máximo 250 caracteres)"
              />
              <p className="text-sm text-gray-500 mt-1">
                {content.length}/250 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL (opcional)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Público-alvo
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os usuários</option>
                <option value="players">Apenas Players</option>
                <option value="mvp">Apenas MVP</option>
                <option value="team">Apenas Team</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar Notificação'}
            </button>
          </form>
        </div>
      )}

      {isAdmin && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Log de Notificações</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mensagem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Público
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enviado por
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notificationLog.map((notification) => (
                  <tr key={notification.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(notification.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {notification.content}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {notification.url || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {notification.target === 'all' && 'Todos'}
                      {notification.target === 'players' && 'Players'}
                      {notification.target === 'mvp' && 'MVP'}
                      {notification.target === 'team' && 'Team'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {notification.creator_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Minhas Notificações</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Você não possui notificações no momento
          </p>
        ) : (
          <div className="space-y-4">
            {notifications.map((userNotification) => (
              <div
                key={userNotification.id}
                className={`p-4 rounded-lg border ${
                  userNotification.is_read
                    ? 'bg-white border-gray-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
                onClick={() => handleNotificationClick(userNotification.id)}
              >
                <div className="flex items-start gap-3">
                  {!userNotification.is_read && (
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                  )}
                  <div className="flex-1">
                    <p className="text-gray-900">
                      {userNotification.notification.content}
                    </p>
                    {userNotification.notification.url && (
                      <a
                        href={userNotification.notification.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm mt-1 block"
                      >
                        {userNotification.notification.url}
                      </a>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      {formatDate(userNotification.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 