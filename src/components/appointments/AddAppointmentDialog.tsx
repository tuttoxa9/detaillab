'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addAppointment } from '@/lib/firestore';

const appointmentSchema = z.object({
  dateTime: z.string().min(1, 'Дата и время обязательны'),
  clientName: z.string().min(1, 'Имя клиента обязательно'),
  clientPhone: z.string().min(1, 'Телефон обязателен'),
  carInfo: z.string().min(1, 'Информация об автомобиле обязательна'),
  service: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AddAppointmentDialogProps {
  onAppointmentAdded: () => void;
  trigger: React.ReactNode;
}

export default function AddAppointmentDialog({ onAppointmentAdded, trigger }: AddAppointmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      dateTime: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
      clientName: '',
      clientPhone: '',
      carInfo: '',
      service: '',
    },
  });

  const onSubmit = async (data: AppointmentFormData) => {
    setLoading(true);
    try {
      await addAppointment({
        dateTime: new Date(data.dateTime),
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        carInfo: data.carInfo,
        service: data.service,
        status: 'planned',
      });

      form.reset();
      setOpen(false);
      onAppointmentAdded();
    } catch (error) {
      console.error('Error adding appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Новая запись</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Дата и время</label>
            <Input
              type="datetime-local"
              {...form.register('dateTime')}
              className="w-full"
            />
            {form.formState.errors.dateTime && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.dateTime.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Имя клиента</label>
            <Input
              {...form.register('clientName')}
              placeholder="Иван Иванов"
              className="w-full"
            />
            {form.formState.errors.clientName && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.clientName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Телефон</label>
            <Input
              {...form.register('clientPhone')}
              placeholder="+7 (999) 123-45-67"
              className="w-full"
            />
            {form.formState.errors.clientPhone && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.clientPhone.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Автомобиль</label>
            <Input
              {...form.register('carInfo')}
              placeholder="Toyota Camry, черный"
              className="w-full"
            />
            {form.formState.errors.carInfo && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.carInfo.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Услуга (опционально)</label>
            <Input
              {...form.register('service')}
              placeholder="Комплексная мойка"
              className="w-full"
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
