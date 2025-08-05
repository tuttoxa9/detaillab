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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addCarWashed } from '@/lib/firestore';
import type { CarWashed } from '@/types';

const carSchema = z.object({
  time: z.string().min(1, 'Время обязательно'),
  carName: z.string().min(1, 'Марка автомобиля обязательна'),
  service: z.string().min(1, 'Услуга обязательна'),
  cost: z.number().min(0, 'Стоимость должна быть положительной'),
  paymentType: z.enum(['cash', 'card', 'organization']),
});

type CarFormData = z.infer<typeof carSchema>;

interface AddCarDialogProps {
  logId: string;
  onCarAdded: () => void;
  trigger: React.ReactNode;
  defaultData?: Partial<CarFormData>;
}

export default function AddCarDialog({ logId, onCarAdded, trigger, defaultData }: AddCarDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<CarFormData>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      time: format(new Date(), 'HH:mm'),
      carName: '',
      service: '',
      cost: 0,
      paymentType: 'cash',
      ...defaultData,
    },
  });

  const onSubmit = async (data: CarFormData) => {
    setLoading(true);
    try {
      await addCarWashed({
        logId,
        time: data.time,
        carName: data.carName,
        service: data.service,
        cost: data.cost,
        paymentType: data.paymentType,
      });

      form.reset();
      setOpen(false);
      onCarAdded();
    } catch (error) {
      console.error('Error adding car:', error);
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
          <DialogTitle>Добавить помытую машину</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Время</label>
            <Input
              type="time"
              {...form.register('time')}
              className="w-full"
            />
            {form.formState.errors.time && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.time.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Марка и модель</label>
            <Input
              {...form.register('carName')}
              placeholder="Toyota Camry"
              className="w-full"
            />
            {form.formState.errors.carName && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.carName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Услуга</label>
            <Input
              {...form.register('service')}
              placeholder="Комплексная мойка"
              className="w-full"
            />
            {form.formState.errors.service && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.service.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Стоимость (₽)</label>
            <Input
              type="number"
              {...form.register('cost', { valueAsNumber: true })}
              placeholder="1500"
              className="w-full"
            />
            {form.formState.errors.cost && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.cost.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Тип оплаты</label>
            <Select
              value={form.watch('paymentType')}
              onValueChange={(value) => form.setValue('paymentType', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Наличные</SelectItem>
                <SelectItem value="card">Карта</SelectItem>
                <SelectItem value="organization">Организация</SelectItem>
              </SelectContent>
            </Select>
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
              {loading ? 'Сохранение...' : 'Добавить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
