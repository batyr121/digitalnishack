# Подключение Supabase и деплой

## Что прислать для настройки

- Project URL (`https://…supabase.co`).
- Publishable key (`sb_publishable_…`) из Connect / Settings → API Keys.
- Email аккаунта, которому нужно выдать роль администратора.
- Выбранный хостинг и домен, если он уже есть.

Service role / secret key, пароль базы и персональный access token в чат не нужны. Публичный ключ подключает приложение, но не позволяет создавать таблицы или назначать администратора.

## Создание базы

Для нового пустого проекта проще всего открыть `supabase/setup.sql`, скопировать целиком в Supabase SQL Editor и выполнить один раз. Файл содержит три миграции и seed в одной транзакции.

Альтернатива — выполнить файлы ниже по порядку (не выполнять оба способа):

1. `supabase/migrations/202609070001_platform.sql`
2. `supabase/migrations/202609070002_rewards.sql`
3. `supabase/migrations/202609070003_capacity.sql`
4. `supabase/seed.sql`

Если в проекте уже есть таблицы приложения, сначала проверить применённые миграции. Не запускать первую миграцию повторно и не удалять существующую базу.

До завершения настройки отключить подачу заявок:

```sql
update public.site_settings set value = 'false'::jsonb
where key = 'registrationEnabled';
```

## Vercel, если выбран этот хостинг

Import Git Repository → `batyr121/digitalnishack`.

- Framework: Next.js
- Root Directory: корень репозитория
- Node.js: 22.x
- Install Command: `npm ci`
- Build Command: `npm run build`

Добавить переменные окружения:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=https://YOUR_PRODUCTION_DOMAIN
```

После изменения публичных переменных нужен новый deployment. Для Preview желательно использовать отдельный тестовый Supabase-проект. Указать фактический production-домен, а не оставлять localhost.

## Вход по email и паролю

В Supabase Auth → Providers → Email включить email/password signups. Чтобы вход работал без открытия письма, выключить подтверждение email.

В Supabase Auth → URL Configuration:

- Site URL: фактический HTTPS-домен сайта.
- Redirect URLs: `https://YOUR_PRODUCTION_DOMAIN/auth/callback` и `http://localhost:3000/auth/callback` для локальной разработки.

В Auth → Email Templates → Magic Link установить ссылку:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Войти в DIGITAL NIS FORUM</a>
```

Этот маршрут поддерживает запасной вход через письмо. Настроить SMTP для реальной доставки писем, если magic link нужен в production.

Для текущей базы выполнить один раз `supabase/password-admin-bootstrap.sql`, затем открыть `/login`, создать аккаунт с email `amantaibatyrkhan11@gmail.com` и паролем. После этого `/admin` откроется. Если профиль уже создан, можно выполнить прямой SQL:

```sql
update public.profiles
set role = 'ADMIN'
where email = 'amantaibatyrkhan11@gmail.com';
```

Открыть `/admin`. Если SQL изменил 0 строк, сначала завершить первый вход, чтобы профиль был создан.

## Перед открытием регистрации

Проверить на подключённом проекте: вход из письма, заявку, одобрение, приглашение, QR, повторный scan, начисление баллов, сертификат и отзыв пропуска. Проверить камеру телефона по HTTPS. Утвердить контакты, политику конфиденциальности, переводы и информацию о площадке.

После проверки включить `registrationEnabled` через `/admin/content`. Код готовится к деплою; создание облачного проекта, настройка SMTP и применение миграций не происходят от одного Git push.

## Автоматические проверки GitHub

Шаблон workflow находится в `docs/github-actions-ci.yml.example`. Для включения GitHub Actions перенесите его в `.github/workflows/ci.yml` через GitHub или токен с правом `workflow`. Текущий OAuth-токен разрешает отправку исходников, но не создание workflows.
