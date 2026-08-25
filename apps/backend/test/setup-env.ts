// Выполняется до загрузки тестовых файлов (jest setupFiles).
//
// Это важно: AppModule вызывает ConfigModule.forRoot() прямо в декораторе
// @Module, то есть окружение валидируется в момент импорта — задать
// переменные внутри спека уже поздно.
//
// CORS_ORIGIN обязателен, а рабочего .env в CI нет.
process.env.CORS_ORIGIN ??= 'http://localhost:3200'
