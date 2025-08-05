import type { Settings, CarWashed, Employee, SalaryCalculation } from '@/types';

export const calculateDailySalary = (
  totalRevenue: number,
  settings: Settings,
  employeeCount: number = 1
): number => {
  if (employeeCount === 0) return 0;

  const revenuePerEmployee = totalRevenue / employeeCount;

  switch (settings.salaryMethod) {
    case 'percent':
      return (revenuePerEmployee * settings.salaryPercentValue) / 100;

    case 'min_plus_percent':
      const minRate = settings.minDailyRate || 0;
      const percentSalary = (revenuePerEmployee * settings.salaryPercentValue) / 100;
      const bonusPercent = settings.bonusPercentValue || 0;

      if (percentSalary < minRate) {
        return minRate;
      } else {
        return percentSalary + (totalRevenue * bonusPercent) / 100;
      }

    default:
      return 0;
  }
};

export const calculatePeriodSalary = (
  carsWashedData: CarWashed[],
  employees: Employee[],
  settings: Settings,
  workLogs: { [date: string]: string[] } // date -> employeeIds
): SalaryCalculation[] => {
  const employeeSalaries: { [employeeId: string]: SalaryCalculation } = {};

  // Initialize employee data
  employees.forEach(employee => {
    employeeSalaries[employee.id] = {
      employeeId: employee.id,
      employeeName: employee.name,
      shifts: 0,
      totalRevenue: 0,
      salary: 0,
    };
  });

  // Group cars washed by date
  const carsByDate: { [date: string]: CarWashed[] } = {};
  carsWashedData.forEach(car => {
    const date = car.logId;
    if (!carsByDate[date]) {
      carsByDate[date] = [];
    }
    carsByDate[date].push(car);
  });

  // Calculate salary for each date
  Object.entries(carsByDate).forEach(([date, cars]) => {
    const employeeIds = workLogs[date] || [];
    const dailyRevenue = cars.reduce((sum, car) => sum + car.cost, 0);
    const dailySalaryPerEmployee = calculateDailySalary(dailyRevenue, settings, employeeIds.length);

    employeeIds.forEach(employeeId => {
      if (employeeSalaries[employeeId]) {
        employeeSalaries[employeeId].shifts += 1;
        employeeSalaries[employeeId].totalRevenue += dailyRevenue / employeeIds.length;
        employeeSalaries[employeeId].salary += dailySalaryPerEmployee;
      }
    });
  });

  return Object.values(employeeSalaries).filter(calc => calc.shifts > 0);
};

export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('ru-RU')} ₽`;
};

export const formatTime = (time: string): string => {
  return time.slice(0, 5); // Format HH:MM
};
