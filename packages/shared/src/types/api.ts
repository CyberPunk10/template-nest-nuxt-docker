// Контракты HTTP-эндпоинтов бэкенда.
//
// Оба приложения импортируют отсюда: NestJS указывает тип возвращаемого
// значения контроллера, Nuxt — тип ответа useFetch. Если поле изменится
// только на одной стороне, type-check это поймает.

/** Ответ `GET /health` — используется в HEALTHCHECK и в DevPanel. */
export interface HealthResponse {
  status: string
}

/** Ответ `GET /dev/config` — сведения о бэкенде для DevPanel. */
export interface DevConfigResponse {
  /** Поднят ли Swagger UI на `/api/docs`. */
  swagger: boolean
  /**
   * Адрес, по которому браузер может обратиться к бэкенду напрямую.
   * Пустая строка — бэкенд за reverse proxy, свой адрес снаружи отсутствует.
   */
  publicUrl: string
}
