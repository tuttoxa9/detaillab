'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Employee } from '@/types';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from '@/lib/firestore';

export default function EmployeeManager() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployeeName.trim()) return;

    setSaving(true);
    try {
      await addEmployee(newEmployeeName.trim());
      setNewEmployeeName('');
      setShowAddDialog(false);
      loadEmployees();
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Ошибка при добавлении сотрудника');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee || !newEmployeeName.trim()) return;

    setSaving(true);
    try {
      await updateEmployee(editingEmployee.id, newEmployeeName.trim());
      setEditingEmployee(null);
      setNewEmployeeName('');
      loadEmployees();
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Ошибка при обновлении сотрудника');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (!confirm(`Вы уверены, что хотите удалить сотрудника "${employee.name}"?`)) {
      return;
    }

    try {
      await deleteEmployee(employee.id);
      loadEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Ошибка при удалении сотрудника');
    }
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setNewEmployeeName(employee.name);
  };

  const closeDialogs = () => {
    setShowAddDialog(false);
    setEditingEmployee(null);
    setNewEmployeeName('');
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
            <Users className="w-5 h-5" />
            <span>Управление сотрудниками</span>
          </CardTitle>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить сотрудника
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <h3 className="font-medium">{employee.name}</h3>
                <p className="text-sm text-gray-500">
                  Добавлен: {employee.createdAt?.toLocaleDateString('ru-RU')}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(employee)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => handleDeleteEmployee(employee)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}

          {employees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Сотрудники не добавлены
            </div>
          )}
        </div>
      </CardContent>

      {/* Add Employee Dialog */}
      <Dialog open={showAddDialog} onOpenChange={closeDialogs}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить сотрудника</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Имя сотрудника:</label>
              <Input
                value={newEmployeeName}
                onChange={(e) => setNewEmployeeName(e.target.value)}
                placeholder="Введите имя сотрудника"
                onKeyDown={(e) => e.key === 'Enter' && handleAddEmployee()}
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={closeDialogs} className="flex-1">
                Отмена
              </Button>
              <Button
                onClick={handleAddEmployee}
                disabled={saving || !newEmployeeName.trim()}
                className="flex-1"
              >
                {saving ? 'Добавление...' : 'Добавить'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={!!editingEmployee} onOpenChange={closeDialogs}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать сотрудника</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Имя сотрудника:</label>
              <Input
                value={newEmployeeName}
                onChange={(e) => setNewEmployeeName(e.target.value)}
                placeholder="Введите имя сотрудника"
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateEmployee()}
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={closeDialogs} className="flex-1">
                Отмена
              </Button>
              <Button
                onClick={handleUpdateEmployee}
                disabled={saving || !newEmployeeName.trim()}
                className="flex-1"
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
