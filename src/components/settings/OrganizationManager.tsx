'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Organization } from '@/types';
import { getOrganizations, addOrganization, deleteOrganization } from '@/lib/firestore';

export default function OrganizationManager() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDetails, setNewOrgDetails] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const data = await getOrganizations();
      setOrganizations(data);
    } catch (error) {
      console.error('Error loading organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrganization = async () => {
    if (!newOrgName.trim()) return;

    setSaving(true);
    try {
      await addOrganization(newOrgName.trim(), newOrgDetails.trim());
      setNewOrgName('');
      setNewOrgDetails('');
      setShowAddDialog(false);
      loadOrganizations();
    } catch (error) {
      console.error('Error adding organization:', error);
      alert('Ошибка при добавлении организации');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrganization = async (organization: Organization) => {
    if (!confirm(`Вы уверены, что хотите удалить организацию "${organization.name}"?`)) {
      return;
    }

    try {
      await deleteOrganization(organization.id);
      loadOrganizations();
    } catch (error) {
      console.error('Error deleting organization:', error);
      alert('Ошибка при удалении организации');
    }
  };

  const closeDialog = () => {
    setShowAddDialog(false);
    setNewOrgName('');
    setNewOrgDetails('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Организации-партнёры</span>
          </CardTitle>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить организацию
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {organizations.map((organization) => (
            <div
              key={organization.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <h3 className="font-medium">{organization.name}</h3>
                {organization.details && (
                  <p className="text-sm text-gray-600">{organization.details}</p>
                )}
                <p className="text-xs text-gray-500">
                  Добавлена: {organization.createdAt?.toLocaleDateString('ru-RU')}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => handleDeleteOrganization(organization)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}

          {organizations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Организации-партнёры не добавлены
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Информация:</h4>
          <p className="text-blue-800 text-sm">
            Организации-партнёры используются для оплаты услуг по безналичному расчёту.
            Добавленные организации будут доступны при выборе типа оплаты "Организация".
          </p>
        </div>
      </CardContent>

      {/* Add Organization Dialog */}
      <Dialog open={showAddDialog} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить организацию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Название организации:</label>
              <Input
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="ООО 'Рога и копыта'"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Дополнительная информация (опционально):</label>
              <Input
                value={newOrgDetails}
                onChange={(e) => setNewOrgDetails(e.target.value)}
                placeholder="Контактная информация, условия работы и т.д."
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={closeDialog} className="flex-1">
                Отмена
              </Button>
              <Button
                onClick={handleAddOrganization}
                disabled={saving || !newOrgName.trim()}
                className="flex-1"
              >
                {saving ? 'Добавление...' : 'Добавить'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
