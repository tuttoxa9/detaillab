'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Edit, Trash2, Check, X, Phone, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { updateAppointment, deleteAppointment } from '@/lib/firestore';
import type { Appointment } from '@/types';

interface AppointmentCardProps {
  appointment: Appointment;
  onUpdate: () => void;
}

export default function AppointmentCard({ appointment, onUpdate }: AppointmentCardProps) {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: 'completed' | 'canceled') => {
    setLoading(true);
    try {
      await updateAppointment(appointment.id, { status: newStatus });
      onUpdate();
    } catch (error) {
      console.error('Error updating appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Вы уверены, что хотите удалить эту запись?')) {
      setLoading(true);
      try {
        await deleteAppointment(appointment.id);
        onUpdate();
      } catch (error) {
        console.error('Error deleting appointment:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planned':
        return <Badge className="bg-blue-100 text-blue-800">Запланировано</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Выполнено</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Отменено</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCardBorderColor = (status: string) => {
    switch (status) {
      case 'planned': return 'border-l-blue-500';
      case 'completed': return 'border-l-green-500';
      case 'canceled': return 'border-l-red-500';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <div className={`bg-white border-l-4 ${getCardBorderColor(appointment.status)} rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="font-semibold text-lg">{appointment.clientName}</h3>
            {getStatusBadge(appointment.status)}
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>{appointment.clientPhone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Car className="w-4 h-4" />
              <span>{appointment.carInfo}</span>
            </div>
            {appointment.service && (
              <div className="text-blue-600 font-medium">
                {appointment.service}
              </div>
            )}
          </div>

          <div className="mt-3 text-sm font-medium text-gray-800">
            {format(appointment.dateTime, 'EEEE, d MMMM yyyy в HH:mm', { locale: ru })}
          </div>
        </div>

        <div className="flex flex-col space-y-2 ml-4">
          {appointment.status === 'planned' && (
            <>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleStatusChange('completed')}
                disabled={loading}
              >
                <Check className="w-3 h-3 mr-1" />
                Выполнено
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => handleStatusChange('canceled')}
                disabled={loading}
              >
                <X className="w-3 h-3 mr-1" />
                Отменить
              </Button>
            </>
          )}

          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="outline"
              className="p-2"
              disabled={loading}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="p-2 border-red-300 text-red-600 hover:bg-red-50"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
