# Авторизация

[← Главная](../README.md)

> **Ветка:** эта документация актуальна только для ветки `auth`.

&nbsp;

## Выбор подхода

### Почему JWT access + refresh в HttpOnly куках

Существуют разные архитектурные подходы к аутентификации. Мы выбрали **JWT access token (15 мин) + refresh token с ротацией в PostgreSQL**.

| Подход                                              | Когда подходит                                                   | Почему не выбрали                                                            |
| --------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Сессионная кука** (nuxt-auth-utils, iron-session) | Монолит, простое приложение, не нужен logout на всех устройствах | Нельзя отозвать сессию мгновенно, нет истории устройств, нет reuse detection |
| **Чистый stateless JWT**                            | Микросервисы, service-to-service, очень короткий TTL             | JWT нельзя инвалидировать — украденный токен валиден до истечения            |
| **Managed auth** (Clerk, Auth0)                     | Стартап, нет требований к хранению данных                        | Внешняя зависимость, данные уходят третьей стороне, цена при масштабе        |
| **OAuth / OIDC** (Keycloak, Google)                 | B2B SaaS, корпоративный SSO                                      | Избыточно для шаблона; может быть добавлено поверх текущего решения          |
| **JWT access + refresh в БД** ← наш выбор           | Nuxt/Next + отдельный API, нужна полная безопасность             | —                                                                            |

### Почему не stateless JWT

Stateless JWT не требует обращения к БД при каждом запросе — токен самодостаточен. Но у него фундаментальное ограничение: **токен нельзя инвалидировать досрочно**. Если токен украден или пользователь сменил пароль — токен остаётся валидным до истечения TTL.

Единственное решение — blacklist в Redis, что фактически делает JWT stateful, но сложнее.

### Почему не сессионная кука

Сессионная кука (вся сессия зашифрована в куке, без БД) — простое решение, но не даёт:

- Принудительного logout: нельзя "отозвать" куку, которая уже у клиента
- Истории устройств: нет таблицы сессий — нечего показывать
- Reuse detection: без записи в БД невозможно определить повторное использование токена

### Наш выбор: гибрид

```
access_token  (JWT, 15 мин)  — проверка без БД на каждый запрос
refresh_token (в БД, 7 дней) — обновление access_token, полный контроль над сессией
```

Это **де-факто стандарт** для веб-приложений с отдельным бэкендом: баланс между производительностью (запрос к БД только раз в 15 минут) и безопасностью (refresh можно отозвать мгновенно, reuse detection, история сессий).

### Отличие от подхода в микросервисах

В микросервисной архитектуре JWT используется иначе:

```
Браузер → API Gateway → Service A (orders)
                      → Service B (payments)
                      → Service C (notifications)
```

Gateway проверяет JWT один раз на входе, каждый сервис получает уже верифицированный запрос. Refresh-токен живёт в централизованном Auth Service. Сервисы не трогают сессии вообще — это не их ответственность.

У нас один бэкенд, который сам управляет и access, и refresh токенами. Это правильно для монолита — переносить паттерн микросервисов сюда было бы избыточно.

&nbsp;

---

# <img src="https://nestjs.com/img/logo-small.svg" height="20" style="vertical-align:middle"> Бэкенд (NestJS)

## Как работает

- **Регистрация:** `POST /auth/register` — создаёт пользователя, устанавливает оба cookie
- **Вход:** `POST /auth/login` — проверяет email+пароль через bcrypt, устанавливает cookie
- **Cookies:** `access_token` (JWT, 15 мин) и `refresh_token` (7 дней) — оба httpOnly, недоступны из JS
- **Защищённые роуты:** глобальный `JwtAuthGuard` проверяет `access_token` на каждом запросе
- **Refresh:** при истечении access token фронтенд автоматически вызывает `POST /auth/refresh`. Refresh token ротируется при каждом обновлении
- **Сессии:** каждый refresh token хранится в таблице `Session` как HMAC-хэш. При каждом обновлении токена старая запись помечается `isUsed: true` и создаётся новая. Logout удаляет активную сессию из БД
- **Reuse detection:** если уже использованный refresh token предъявлен повторно — признак кражи токена. Все сессии семьи (`familyId`) инвалидируются

### Зачем хранить сессии в БД

JWT нельзя инвалидировать до истечения срока — это фундаментальное свойство стандарта. Если пользователь разлогинился или сменил пароль, access token всё равно остаётся валидным ещё до 15 минут.

Refresh token в БД решает эту проблему: при logout или смене пароля сессия удаляется из БД, и получить новый access token становится невозможным. Таким образом максимальное время "выживания" скомпрометированного токена ограничено временем жизни access token (15 мин).

Дополнительные возможности, которые даёт таблица `Session`:

- **Выйти со всех устройств** — удалить все сессии пользователя
- **Список активных сессий** — показать пользователю где он залогинен (браузер, IP, время)
- **Принудительный разлогин** — администратор может удалить сессию

### Ротация токенов и reuse detection

При каждом `POST /auth/refresh` происходит **ротация**: старый refresh token деактивируется, выдаётся новый. Это стандарт RFC 9700 (OAuth 2.0 Security BCP).

**Как выглядит таблица `Session` для одного пользователя:**

```
Событие                  | familyId | hash  | isUsed
-------------------------|----------|-------|-------
Логин с телефона         | f1       | "A"   | false   ← активная
Refresh (телефон)        | f1       | "A"   | true    ← деактивирована
                         | f1       | "B"   | false   ← активная
Refresh (телефон снова)  | f1       | "B"   | true    ← деактивирована
                         | f1       | "C"   | false   ← активная
Логин с ноутбука         | f2       | "D"   | false   ← активная (другая семья)
```

В каждой семье (`familyId`) всегда ровно одна активная запись (`isUsed: false`). Записи с `isUsed: true` — это "ловушки": если кто-то предъявит старый токен, сервер их обнаружит.

**Сценарий reuse attack:**

```
Логин                  → { familyId: f1, hash: "A", isUsed: false }

Refresh (легитимный)   → { familyId: f1, hash: "A", isUsed: true  }  (старая)
                          { familyId: f1, hash: "B", isUsed: false }  (новая, активная)

Refresh (атакующий украл токен "A" и использует его повторно):
  → сервер ищет hash("A") → находит запись с isUsed: true
  → признак компрометации: удаляет все записи с familyId: f1
  → пользователь принудительно разлогинен с телефона
  → сессия ноутбука (f2) не затронута
```

Записи `isUsed: true` нужны только как ловушки, пока оригинальный токен мог бы быть жив. Cron-задача удаляет все записи у которых `expiresAt < now` — и `isUsed: true` ловушки, и активные сессии давно не заходивших пользователей (см. [Очистка истёкших сессий](#очистка-истёкших-сессий)).

**`familyId`** объединяет все ротации одного входа. Благодаря этому при компрометации инвалидируется только скомпрометированная цепочка, а не все устройства пользователя одновременно.

### Почему HMAC, а не bcrypt для refresh token

bcrypt недетерминирован — каждый раз даёт разный хэш, поэтому нельзя искать сессию в БД по хэшу напрямую. Пришлось бы загружать все сессии и перебирать — O(n) запросов.

HMAC детерминирован: один токен + один секрет = всегда один хэш. Это позволяет найти сессию за один запрос: `WHERE refreshTokenHash = hmac(token, secret)`.

Компромисс: если `REFRESH_TOKEN_SECRET` утечёт — все refresh tokens потенциально скомпрометированы одновременно. Mitigation: хранить секрет в защищённом хранилище (Vault, AWS Secrets Manager) и ротировать его периодически.

## Защита от email enumeration (timing attack)

При логине с несуществующим email наивная реализация возвращает ответ мгновенно — без bcrypt. Злоумышленник по времени ответа определяет, зарегистрирован ли email в системе.

Решение: `validateUser` всегда запускает `bcrypt.compare`, даже если пользователь не найден — используется `dummyHash`:

```
email найден    → bcrypt.compare(password, user.passwordHash)  ~2-100ms
email не найден → bcrypt.compare(password, dummyHash)          ~2-100ms (то же время)
```

`dummyHash` генерируется **один раз при старте** через `onModuleInit()` с текущим значением `BCRYPT_ROUNDS`. Это важно: захардкоженный хеш с фиксированным cost=12 создал бы timing разницу в тестах и staging-окружениях, где `BCRYPT_ROUNDS=4`.

## Архитектура Passport: стратегии и guards

Passport работает через два понятия: **стратегия** (как проверить пользователя) и **guard** (пускать ли его дальше).

### Стратегии

Стратегия — это класс с методом `validate()`, который отвечает на вопрос "кто этот пользователь?". Результат `validate()` Passport автоматически кладёт в `req.user`.

**`LocalStrategy`** — используется только при логине (`POST /auth/login`). Passport сам достаёт `email` и `password` из тела запроса и передаёт в `validate()`. Там происходит проверка пароля через `bcrypt.compare`. Если проверка провалилась — бросается `UnauthorizedException`.

**`JwtStrategy`** — используется на всех защищённых роутах. Passport сам достаёт `access_token` из cookie, верифицирует подпись и срок жизни, и передаёт payload (`{ sub, email }`) в `validate()`. Логику верификации токена писать не нужно — Passport делает это за вас.

### Guards

Guard решает — пускать запрос дальше или нет. Он вызывает стратегию внутри себя.

**`LocalAuthGuard`** — применяется вручную через `@UseGuards(LocalAuthGuard)` только на роуте логина. Запускает `LocalStrategy`.

**`JwtAuthGuard`** — зарегистрирован глобально через `APP_GUARD`, поэтому срабатывает на каждый входящий запрос. Логика:

1. Читает метаданные роута: есть ли `@Public()`?
2. Если да — пропускает запрос без проверки токена
3. Если нет — запускает `JwtStrategy` для проверки cookie

### Как запросы проходят через систему

**`POST /auth/login`** (роут помечен `@Public()` + `@UseGuards(LocalAuthGuard)`):

```
→ JwtAuthGuard: видит @Public() → пропускает JWT-проверку
→ LocalAuthGuard: запускает LocalStrategy
→ LocalStrategy.validate(email, password) → bcrypt.compare
→ req.user = объект пользователя без passwordHash
→ выполняется метод контроллера
```

**`GET /users`** (защищённый роут):

```
→ JwtAuthGuard: @Public() нет → запускает JwtStrategy
→ JwtStrategy: достаёт access_token из cookie → верифицирует JWT
→ req.user = { sub: userId, email }
→ выполняется метод контроллера
```

**`GET /users`** без токена:

```
→ JwtAuthGuard: @Public() нет → запускает JwtStrategy
→ JwtStrategy: cookie нет → стратегия возвращает false
→ JwtAuthGuard.handleRequest: бросает UnauthorizedException → 401
```

### `@Public()` — как работает декоратор

`@Public()` записывает метаданные прямо в класс или метод контроллера во время компиляции. `JwtAuthGuard` читает эти метаданные через `Reflector` перед каждым запросом. Это серверный механизм — клиент не может повлиять на метаданные роута, они живут в памяти процесса.

## Как открыть роут публично

По умолчанию все роуты NestJS закрыты глобальным `JwtAuthGuard`. Чтобы открыть конкретный роут:

```typescript
import { Public } from '../auth/decorators/public.decorator'

@Public()
@Get('health')
health() {
  return { status: 'ok' }
}
```

## Как работает `passthrough` в контроллере

```typescript
@Res({ passthrough: true }) res: Response
```

По умолчанию если вы инжектите `@Res()`, NestJS передаёт управление ответом полностью вам — нужно вызывать `res.send()` вручную. `passthrough: true` говорит NestJS: "я инжектирую `res` только чтобы установить cookies, а сам ответ всё равно отправляй ты". Без этого `return` из метода контроллера ничего не отправит.

## Rate limiting

Приложение защищено от брутфорса через `@nestjs/throttler`.

| ENV              | По умолчанию | Применяется к  |
| ---------------- | ------------ | -------------- |
| `THROTTLE_TTL`   | `60000` мс   | Окно подсчёта  |
| `THROTTLE_LIMIT` | `100`/min    | Всё приложение |

Лимит считается **на каждый IP отдельно**.

### Как ThrottlerGuard применяется к эндпоинтам

`ThrottlerGuard` зарегистрирован как глобальный guard через `APP_GUARD` — **каждый эндпоинт** автоматически защищён (100/min).

`@Throttle({ default: { ttl, limit } })` переопределяет лимит для конкретного эндпоинта:

```
APP_GUARD: ThrottlerGuard                                      ← 100/min на всё

POST /auth/login     @Throttle({ default: { limit: 10 } })     ← 10/min (перебор паролей)
POST /auth/register  @Throttle({ default: { limit: 10 } })     ← 10/min (массовая регистрация)
POST /auth/refresh   @Throttle({ default: { limit: 10 } })     ← 10/min (перебор токенов)
POST /auth/logout                                              ← 100/min (глобальный)
GET  /auth/me                                                  ← 100/min (глобальный)
```

Auth-эндпоинты получают более жёсткий лимит прямо в декораторе — сразу видно какой лимит и почему.

### За reverse proxy

В production приложение обычно стоит за nginx или Cloudflare. В этом случае все запросы приходят на NestJS с одного IP прокси — throttler будет считать лимит для всех пользователей как одного.

Решение — настроить `getTracker` на чтение реального IP из заголовка `X-Forwarded-For`:

```typescript
ThrottlerModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    throttlers: [
      { name: 'default', ttl: config.get('THROTTLE_TTL'), limit: config.get('THROTTLE_LIMIT') },
    ],
    getTracker: (req) => req.headers['x-forwarded-for'] ?? req.ip,
  }),
})
```

> **Важно:** доверять `X-Forwarded-For` можно только если он проставляется вашим доверенным прокси. Если заголовок может подделать клиент — это обход rate limiting. Убедитесь что nginx/Cloudflare перезаписывает этот заголовок, а не добавляет к существующему.

### Тесты

Throttler покрыт двумя наборами e2e тестов с разными конфигурациями:

**`jest-e2e.json`** — основные auth-тесты (`test/default/`). Throttler **отключён** через `skipIf`:

```typescript
skipIf: () => config.get('APP_ENV') === 'test',
```

`APP_ENV=test` выставляется в `test/setup-e2e.ts` до загрузки модулей. Без этого тесты падали бы на 429 при создании тестовых пользователей.

**`jest-e2e-throttle.json`** — throttle-тесты (`test/throttle/`). Throttler **включён** (`APP_ENV=production`, `test/setup-e2e-throttle.ts`). Проверяют реальное поведение:

- глобальный лимит (`THROTTLE_LIMIT=12`) срабатывает на `/auth/me` — 13-й запрос возвращает 429
- локальный лимит (`limit: 10` на auth-роутах) срабатывает раньше глобального — 11-й запрос на `/auth/register` возвращает 429

```bash
pnpm test:e2e           # основные тесты (throttler выключен)
pnpm test:e2e:throttle  # throttle-тесты (throttler включён)
```

## Очистка истёкших сессий

При каждой ротации старая запись остаётся в таблице `Session` с `isUsed: true`. Если пользователь делает refresh раз в день на протяжении 7 дней — накапливается 7 записей на одну цепочку. Без очистки таблица растёт бесконечно.

`SessionCleanupService` запускает cron-задачу каждую ночь в 03:00 и удаляет все записи, у которых `expiresAt < now`:

```typescript
@Cron(CronExpression.EVERY_DAY_AT_3AM)
async cleanupExpiredSessions() {
  await this.prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })
}
```

Это удаляет одновременно:

- `isUsed: true` записи, чей срок истёк (ловушки больше не нужны — токен уже не предъявить)
- Активные сессии с истёкшим `expiresAt` (пользователь не заходил 7+ дней)

## ENV переменные

| Переменная                   | Описание                                       | По умолчанию    |
| ---------------------------- | ---------------------------------------------- | --------------- |
| `THROTTLE_TTL`               | Окно rate limiting (мс)                        | `60000`         |
| `THROTTLE_LIMIT`             | Максимум запросов за окно (глобально)          | `100`           |
| `JWT_SECRET`                 | Секрет для подписи JWT (min 32 символа)        | — (обязательно) |
| `JWT_EXPIRES_IN`             | Время жизни access token                       | `15m`           |
| `REFRESH_TOKEN_SECRET`       | Секрет для HMAC refresh token (min 32 символа) | — (обязательно) |
| `REFRESH_TOKEN_EXPIRES_DAYS` | Время жизни refresh token (дней)               | `7`             |
| `BCRYPT_ROUNDS`              | Cost-фактор bcrypt для хэширования паролей     | `12`            |

## E2E тесты

**`test/default/auth.e2e-spec.ts`** — механизм авторизации (throttler отключён):

- Регистрация: создание пользователя, установка cookies, конфликт по email, валидация
- Логин: правильные и неправильные учётные данные
- `GET /auth/me`: с токеном и без
- Refresh: ротация токенов, инвалидация старого, новый токен валиден
- Reuse detection: повторное использование старого токена инвалидирует всю семью; сессии других устройств не затрагиваются
- Logout: очистка сессии в БД, идемпотентность, работа без токена

**`test/throttle/throttle.e2e-spec.ts`** — rate limiting (throttler включён, подробнее в разделе Rate limiting → Тесты).

```bash
pnpm test:e2e           # auth-тесты
pnpm test:e2e:throttle  # throttle-тесты
```

## Документация

- [NestJS Authentication](https://docs.nestjs.com/security/authentication) — Guards, `@Public()` паттерн, глобальный guard через `APP_GUARD`
- [NestJS Passport (recipes)](https://docs.nestjs.com/recipes/passport) — `LocalStrategy`, `JwtStrategy`, `PassportModule`
- [NestJS Guards](https://docs.nestjs.com/guards) — `canActivate`, `ExecutionContext`, `Reflector`
- [NestJS Custom Decorators](https://docs.nestjs.com/custom-decorators) — `SetMetadata`, как работает `@Public()`
- [@nestjs/jwt](https://github.com/nestjs/jwt) — `JwtModule.registerAsync`, `JwtService.sign()`, `JwtModuleOptions`
- [cookie-parser](https://www.npmjs.com/package/cookie-parser) — middleware для чтения cookies в Express/NestJS
- [RFC 9700 — OAuth 2.0 Security BCP](https://datatracker.ietf.org/doc/html/rfc9700) — refresh token rotation, reuse detection
- [@nestjs/throttler](https://docs.nestjs.com/security/rate-limiting) — rate limiting, `ThrottlerGuard`, `@Throttle()`, `getTracker`
- [@nestjs/schedule](https://docs.nestjs.com/techniques/task-scheduling) — cron-задачи, `@Cron()`, `CronExpression`

---

&nbsp;

# <img src="https://nuxt.com/assets/design-kit/icon-green.svg" height="20" style="vertical-align:middle"> Фронтенд (Nuxt)

## Архитектура

Фронтенд не хранит никакого состояния авторизации — ни в `localStorage`, ни в `sessionStorage`. Всё хранится в `httpOnly` cookies, которые браузер отправляет автоматически. Nuxt только **читает** текущее состояние и кладёт его в реактивный `useState`.

Авторизация обрабатывается в двух сценариях:

**Сценарий 1 — F5 (полная загрузка страницы):** access_token мог протухнуть пока пользователь не заходил. Нужно обновить токен до SSR-рендера, чтобы сервер и клиент видели одинаковое состояние и не было hydration mismatch.

**Сценарий 2 — SPA-навигация (без перезагрузки):** пользователь переходит между страницами или совершает действие (удалить, сохранить) когда access_token уже протух. API-запрос вернёт 401 — нужно автоматически обновить токен и повторить запрос.

Оба сценария решаются независимо разными инструментами.

## Правило: все запросы только через `$api` или `useApi`

> **Любой запрос к защищённому API должен идти через `$api` или `useApi` — никогда напрямую через `$fetch` или `useFetch`.**

Только `$api` и `useApi` содержат логику 401-retry: при истёкшем access_token они автоматически делают refresh и повторяют запрос. Прямой `$fetch`/`useFetch` при 401 просто упадёт с ошибкой — пользователь увидит сломанный интерфейс вместо прозрачного восстановления сессии.

```typescript
// ✅ правильно
const { $api } = useNuxtApp()
await $api('/tasks', { method: 'POST', body: { title } })

const { data } = await useApi<Task[]>('/tasks')

// ❌ неправильно — нет 401-retry
await $fetch('/api/backend/tasks', { method: 'POST', body: { title } })
const { data } = await useFetch('/api/backend/tasks')
```

Исключение — публичные эндпоинты (`/auth/login`, `/auth/register`) и запросы внутри самой логики авторизации (`plugins/02.auth.ts`, `composables/useAuth.ts`), где retry неприменим по определению.

## Файлы

| Файл                             | Сценарий | Роль                                             |
| -------------------------------- | -------- | ------------------------------------------------ |
| `server/middleware/auth.ts`      | F5       | Silent refresh до SSR-рендера                    |
| `plugins/01.api.ts`              | SPA      | `$api` с 401-retry для императивных запросов     |
| `composables/useApi.ts`          | SPA      | `useApi` с 401-retry для декларативных запросов  |
| `composables/useRefreshToken.ts` | —        | Дедупликация refresh: singleton промис           |
| `plugins/02.auth.ts`             | Оба      | Заполняет `user` через `/auth/me` при старте     |
| `composables/useAuth.ts`         | —        | `login`, `logout`, `register`, реактивный `user` |
| `middleware/auth.global.ts`      | —        | Защита роутов: редирект на `/login` или `/`      |

## Сценарий 1: F5 с протухшим токеном

При полной загрузке страницы нельзя допустить чтобы сервер рендерил страницу в состоянии "не авторизован", а клиент после гидратации оказывался авторизованным — это **hydration mismatch**, Vue выбросит предупреждение и возможны визуальные артефакты.

Решение — `server/middleware/auth.ts`: Nitro middleware, который перехватывает запрос **до Vue/SSR**.

| Шаг | Браузер                                                    | Nitro                                                                    | Vue / SSR                                                           |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| 1   | `GET /profile` (только `refresh_token`)                    |                                                                          |                                                                     |
| 2   |                                                            | `server/middleware/auth.ts`: нет `access_token`, есть `refresh_token`    |                                                                     |
| 3   |                                                            | `POST /auth/refresh` → NestJS напрямую (server-to-server)                |                                                                     |
| 4   |                                                            | Новые токены: `Set-Cookie` → в ответ страницы; cookie → в текущий запрос |                                                                     |
| 5   |                                                            |                                                                          | `plugins/02.auth.ts`: `GET /auth/me` → `user.value = {…}`           |
| 6   |                                                            |                                                                          | `middleware/auth.global.ts`: `user != null` → пускает на `/profile` |
| 7   |                                                            |                                                                          | SSR рендер: `layout = default`, user есть                           |
| 8   | Получает HTML + `Set-Cookie`, сохраняет новые токены       |                                                                          |                                                                     |
| 9   | Vue гидратируется: `user != null` → нет hydration mismatch |                                                                          |                                                                     |

**Почему refresh именно здесь, а не в Vue-плагине:** `Set-Cookie` должен попасть в браузер _и_ быть виден SSR-рендеру в рамках одного запроса. Nitro middleware выполняется раньше Vue — он обновляет cookie-заголовок текущего запроса (для SSR) и добавляет `Set-Cookie` в HTTP-ответ (для браузера). Из Vue-плагина сделать то же самое невозможно — Vue уже запущен.

## Сценарий 2: SPA-навигация с протухшим токеном

Пользователь открыл страницу, токен был жив. Через минуту access_token протух, пользователь нажал "Удалить" — `$api` получит 401. Без retry запрос просто упадёт с ошибкой, действие не выполнится.

Решение — встроенный механизм `ofetch`: `retry: 1` + `retryStatusCodes: [401]`. При 401 `ofetch` вызывает `onResponseError`, где мы делаем refresh, а затем **автоматически повторяет** оригинальный запрос уже с новым токеном.

```
$api('/users/1', { method: 'DELETE' })
  → 401
  → onResponseError: POST /auth/refresh → 200, новый токен в куках
  → ofetch автоматически повторяет DELETE /users/1
  → 204 No Content ✓
```

Если refresh провалился (сессия истекла) — `options.retry = 0` отменяет повторный запрос, `user.value = null`, редирект на `/login`.

## plugins/01.api.ts — `$api`

Предоставляет `$api` — императивный HTTP-клиент для действий по событию (клик, submit).

```typescript
const { $api } = useNuxtApp()
await $api('/users/1', { method: 'DELETE' })
await $api('/auth/login', { method: 'POST', body: { email, password } })
```

Построен на `$fetch.create` с `retry: 1` и `retryStatusCodes: [401]`. При 401 делает refresh и повторяет запрос автоматически.

**Когда использовать:** всегда когда запрос инициируется пользователем — удаление, создание, обновление, логин, логаут.

## composables/useApi.ts — `useApi`

Предоставляет `useApi` — декларативный способ загрузки данных для компонента.

```typescript
const { data: users, refresh } = await useApi<User[]>('/users', { default: () => [] })
```

Построен на `createUseFetch` (Nuxt 4) с теми же `retry: 1` и `retryStatusCodes: [401]`.

**Чем отличается от `$api`:** `useFetch` делает больше чем просто запрос:

- Результат **реактивен** — компонент обновится автоматически
- Участвует в **SSR payload** — данные загруженные на сервере передаются клиенту, не нужен повторный запрос при гидратации
- **Дедуплицирует** одинаковые запросы — если два компонента вызывают `useApi('/users')`, запрос уйдёт один раз

**Когда использовать:** когда данные нужны компоненту при рендере — списки, профиль, любые данные для отображения.

### `useApi` vs `$api` — итог

|              | `useApi`                                  | `$api`                                         |
| ------------ | ----------------------------------------- | ---------------------------------------------- |
| Тип          | Декларативный (`useFetch`)                | Императивный (`$fetch`)                        |
| Когда        | При рендере компонента                    | По событию (клик, submit)                      |
| Реактивность | Да — `data` обновляется автоматически     | Нет — просто Promise                           |
| SSR payload  | Да — данные передаются клиенту            | Нет                                            |
| Пример       | `const { data } = await useApi('/users')` | `await $api('/users/1', { method: 'DELETE' })` |

## composables/useRefreshToken.ts

Содержит дедуплицированный refresh — singleton промис, общий для `$api` и `useApi`.

**Проблема без дедупликации:** если на странице несколько компонентов делают запросы одновременно (например `HomeTasks` и `HomeDbTables`) и access_token протух — оба получают 401 и оба пытаются сделать `/auth/refresh`. Первый успевает, второй использует уже помеченный `isUsed: true` refresh token → reuse detection → вся семья сессий уничтожается → разлогин.

**Решение:** `refreshPromise` — модульная переменная (живёт вне функции). Пока refresh выполняется, все последующие вызовы получают тот же промис и ждут его результата. После завершения промис сбрасывается в `null`.

```typescript
let refreshPromise: Promise<boolean> | null = null  // singleton на модуль

async function refresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise  // уже выполняется — ждём
  refreshPromise = $fetch('/auth/refresh', { method: 'POST', ... })
    .finally(() => { refreshPromise = null })
  return refreshPromise
}
```

## plugins/02.auth.ts

Выполняется при каждом старте приложения — на сервере (SSR) и на клиенте (после гидратации). Заполняет `useState('auth.user')` через `/auth/me`.

**На сервере:** к этому моменту `server/middleware/auth.ts` уже обновил куки — `/auth/me` выполняется с актуальным `access_token`. Куки прокидываются вручную (`headers: { cookie: ... }`), потому что `$fetch` на сервере работает в контексте Node.js и не имеет доступа к браузерным кукам.

**На клиенте:** пробует `/auth/me`. Если 401 (edge-case: токен протух между SSR и гидратацией) — делает refresh, затем снова `/auth/me`. В штатном сценарии браузер уже получил новые токены в `Set-Cookie` от Nitro и `/auth/me` проходит сразу.

## composables/useAuth.ts

Содержит действия авторизации и реактивный `user`.

`user` хранится в `useState('auth.user')` — per-request state (не глобальная переменная). Nuxt сериализует его в SSR payload и восстанавливает на клиенте при гидратации. Благодаря этому `user`, установленный на сервере, сразу доступен клиенту без повторного запроса.

После `login` и `register` явно запрашивает `/auth/me` и кладёт результат в `user` — надёжнее чем парсить ответ самого логина, потому что `/auth/me` всегда возвращает актуальные данные из БД.

## middleware/auth.global.ts

Выполняется при каждой навигации. Читает `user.value`:

| Условие                                           | Действие             |
| ------------------------------------------------- | -------------------- |
| Роут `guestOnly` и `user != null`                 | Редирект на `/`      |
| Роут не `public` и не `guestOnly`, `user == null` | Редирект на `/login` |
| Остальное                                         | Пропускает           |

Метаданные роутов задаются через `definePageMeta`:

```typescript
definePageMeta({ layout: 'auth', guestOnly: true }) // /login, /register
definePageMeta({ public: true }) // публичные страницы
// защищённый роут — ничего не указывать (по умолчанию)
```

## Layouts

`default` — для авторизованных пользователей, с шапкой. `auth` — для гостевых страниц (`/login`, `/register`), чистый фон без навигации.

## BFF proxy

Все запросы идут через Nuxt BFF proxy (`server/api/backend/[...path].ts`), а не напрямую к NestJS. Это решает две проблемы:

1. **CORS:** браузер обращается к тому же origin — прокси форвардит на NestJS
2. **Cookies:** `SameSite=Strict` работает корректно — запрос к тому же домену

`apiBase = '/api/backend'` (публичный, для браузера и SSR через прокси). `backendUrl` (приватный) используется только в Nitro middleware для прямого server-to-server запроса к NestJS.

## Документация

- [Nuxt: Custom useFetch](https://nuxt.com/docs/4.x/guide/recipes/custom-usefetch) — `createUseFetch`, вшитый `baseURL`, interceptors
- [Nuxt: useState](https://nuxt.com/docs/api/composables/use-state) — per-request SSR-совместимый state
- [Nuxt: Server Middleware](https://nuxt.com/docs/guide/directory-structure/server#server-middleware) — Nitro middleware, выполняется до рендера
- [Nuxt: Plugins](https://nuxt.com/docs/guide/directory-structure/plugins) — порядок выполнения, нумерация файлов
- [Nuxt: Route Middleware](https://nuxt.com/docs/guide/directory-structure/middleware) — `defineNuxtRouteMiddleware`, `navigateTo`
- [ofetch: retry](https://github.com/unjs/ofetch#%EF%B8%8F-auto-retry) — `retry`, `retryStatusCodes`, `retryDelay`
- [nuxt/nuxt Discussion #22441](https://github.com/nuxt/nuxt/discussions/22441) — паттерн 401-retry с ofetch в Nuxt
