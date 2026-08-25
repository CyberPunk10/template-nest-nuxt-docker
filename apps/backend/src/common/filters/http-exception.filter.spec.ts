import { ArgumentsHost, BadRequestException, HttpStatus, Logger } from '@nestjs/common'
import { HttpExceptionFilter } from './http-exception.filter'

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter()

  // Фильтр работает с express-объектами напрямую, поэтому подменяем
  // не весь HTTP-стек, а только те методы, которые он вызывает.
  function createHost(url = '/tasks') {
    const json = jest.fn()
    const status = jest.fn().mockReturnValue({ json })
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ url, method: 'POST' }),
      }),
    } as unknown as ArgumentsHost

    return { host, status, json }
  }

  it('отдаёт статус и сообщение HttpException', () => {
    const { host, status, json } = createHost()

    filter.catch(new BadRequestException('Так нельзя'), host)

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
    expect(json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'Так нельзя',
      path: '/tasks',
    })
  })

  it('сохраняет массив сообщений от ValidationPipe', () => {
    const { host, json } = createHost()

    filter.catch(new BadRequestException({ message: ['title should not be empty'] }), host)

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ message: ['title should not be empty'] }),
    )
  })

  // Неожиданное исключение не должно утекать наружу текстом ошибки:
  // клиент получает нейтральное сообщение, подробности уходят в лог.
  it('превращает любое другое исключение в 500 без деталей', () => {
    const { host, status, json } = createHost()
    const logError = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {})

    filter.catch(new Error('Пароль от базы: hunter2'), host)

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR)
    expect(json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal server error',
      path: '/tasks',
    })
    expect(logError).toHaveBeenCalled()
    logError.mockRestore()
  })

  it('логирует только неожиданные исключения', () => {
    const { host } = createHost()
    const logError = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {})

    filter.catch(new BadRequestException('Ожидаемая ошибка'), host)

    expect(logError).not.toHaveBeenCalled()
    logError.mockRestore()
  })
})
