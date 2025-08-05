'use client';

import { useState } from 'react';
import { Database, Trash2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { checkDatabaseConnection, deleteAllData } from '@/lib/firestore';

export default function DatabaseManager() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error' | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleCheckConnection = async () => {
    setConnectionStatus('checking');
    try {
      const isConnected = await checkDatabaseConnection();
      setConnectionStatus(isConnected ? 'connected' : 'error');
    } catch (error) {
      console.error('Connection check error:', error);
      setConnectionStatus('error');
    }
  };

  const handleDeleteAllData = async () => {
    if (confirmText !== 'УДАЛИТЬ ВСЁ') {
      alert('Пожалуйста, введите "УДАЛИТЬ ВСЁ" для подтверждения');
      return;
    }

    setDeleting(true);
    try {
      await deleteAllData();
      alert('Все данные успешно удалены из базы данных');
      setShowDeleteDialog(false);
      setConfirmText('');
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Ошибка при удалении данных');
    } finally {
      setDeleting(false);
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'checking':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'Проверка соединения...';
      case 'connected':
        return 'Соединение установлено';
      case 'error':
        return 'Ошибка соединения';
      default:
        return 'Состояние не проверено';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5" />
          <span>Управление базой данных</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div>
          <h3 className="font-medium mb-3">Состояние подключения</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getConnectionStatusIcon()}
              <span className={`font-medium ${getConnectionStatusColor()}`}>
                {getConnectionStatusText()}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={handleCheckConnection}
              disabled={connectionStatus === 'checking'}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${connectionStatus === 'checking' ? 'animate-spin' : ''}`} />
              Проверить соединение
            </Button>
          </div>
        </div>

        {/* Database Info */}
        <div>
          <h3 className="font-medium mb-3">Информация о базе данных</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Тип базы данных:</span>
                <span className="font-medium">Google Firestore</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Проект:</span>
                <span className="font-medium">detaillab-98ede</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Регион:</span>
                <span className="font-medium">us-central1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dangerous Operations */}
        <div>
          <h3 className="font-medium mb-3 text-red-600">Опасные операции</h3>
          <div className="border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-900">Удаление всех данных</h4>
                <p className="text-red-700 text-sm mt-1">
                  Это действие необратимо удалит все данные из базы: сотрудников, записи,
                  ведомости, организации и настройки. Используйте с особой осторожностью!
                </p>
                <Button
                  variant="outline"
                  className="mt-3 border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Удалить все данные
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Backup Recommendation */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">Рекомендация</h4>
          <p className="text-yellow-800 text-sm">
            Регулярно создавайте экспорты важных данных через раздел "Отчёты" для обеспечения безопасности информации.
          </p>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Удаление всех данных</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">ВНИМАНИЕ!</p>
                  <p className="text-red-700 text-sm mt-1">
                    Это действие полностью удалит все данные из базы данных.
                    Восстановление будет невозможно.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Для подтверждения введите: <span className="font-bold text-red-600">УДАЛИТЬ ВСЁ</span>
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="УДАЛИТЬ ВСЁ"
                className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setConfirmText('');
                }}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleDeleteAllData}
                disabled={deleting || confirmText !== 'УДАЛИТЬ ВСЁ'}
              >
                {deleting ? 'Удаление...' : 'Удалить всё'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
