# Инструкция по деплою Detail Lab на Vercel

## 🚀 Быстрый деплой

### 1. Подключение к Vercel

1. Перейдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub аккаунт
3. Нажмите "New Project"
4. Выберите репозиторий `tuttoxa9/detaillab`
5. Нажмите "Import"

### 2. Настройка проекта

Vercel автоматически определит, что это Next.js проект. Настройки по умолчанию:

- **Framework**: Next.js
- **Build Command**: `bun run build`
- **Output Directory**: `.next`
- **Install Command**: `bun install`

### 3. Переменные окружения

В разделе "Environment Variables" добавьте переменные из `.env.example`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBiXPi2xKdwbQZ36PV0hH9iTCz0kIV01q8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=detaillab-98ede.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=detaillab-98ede
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=detaillab-98ede.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=16207443199
NEXT_PUBLIC_FIREBASE_APP_ID=1:16207443199:web:3f9f396defdeb2892688ca
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-SFL4VVJ7TB
```

### 4. Деплой

1. Нажмите "Deploy"
2. Ожидайте завершения сборки (обычно 1-3 минуты)
3. После успешного деплоя получите URL вашего приложения

## 📋 Важные моменты

### Firebase настройки
- Firestore база данных уже настроена
- Правила безопасности по умолчанию разрешают чтение/запись
- При необходимости настройте правила безопасности в Firebase Console

### Начальная настройка
1. Откройте приложение
2. Перейдите в "Настройки" (пароль по умолчанию: `admin`)
3. Добавьте сотрудников
4. Настройте метод расчёта зарплаты
5. Добавьте организации-партнёры при необходимости

### Домен
- Vercel предоставит автоматический домен вида `detaillab-xyz.vercel.app`
- Для пользовательского домена добавьте его в настройках проекта Vercel

## 🔄 Автоматические деплои

После первоначального деплоя:
- Любой push в ветку `main` автоматически запустит новый деплой
- Pull requests создают preview-деплои
- Откат к предыдущим версиям доступен в панели Vercel

## 🛠 Локальная разработка

Для локального запуска:

```bash
git clone https://github.com/tuttoxa9/detaillab.git
cd detaillab
bun install
bun dev
```

Приложение будет доступно на `http://localhost:3000`

## 📞 Поддержка

В случае проблем с деплоем:
1. Проверьте логи сборки в Vercel Dashboard
2. Убедитесь, что все переменные окружения заданы корректно
3. Проверьте статус Firebase проекта

Приложение полностью готово к продакшен использованию! 🎯
