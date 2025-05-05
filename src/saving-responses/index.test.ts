/* eslint-disable unicorn/consistent-function-scoping */
/* eslint-disable @typescript-eslint/unbound-method */
import { DataSource } from 'typeorm'
import { ResponseDatabase, ResponseEndPoint } from './index'
import { DBResponse } from './response-entity'

// インターフェース定義を追加
interface MockDataSource {
  initialize: jest.Mock
  runMigrations: jest.Mock
  synchronize: jest.Mock
  destroy: jest.Mock
  isInitialized: boolean
  migrations: string[]
}

interface MockResponse {
  id: number
  method: string
  endpoint: string
  url: string
  urlHash: string
  requestHeaders: null
  requestBody: null
  responseType: string
  statusCode: number
  responseHeaders: null
  responseBody: string
  createdAt: Date
  save: jest.Mock
}

interface MockQueryBuilder {
  where: jest.Mock
  groupBy: jest.Mock
  select: jest.Mock
  getRawMany: jest.Mock
}

// モック用のJestの型拡張
interface MockDBResponseClass {
  new (): MockResponse
  find: jest.Mock
  count: jest.Mock
  createQueryBuilder: jest.Mock
}

// DataSourceをモック化する
jest.mock('typeorm', () => {
  const originalModule = jest.requireActual('typeorm')
  const mockDataSource: MockDataSource = {
    initialize: jest.fn().mockResolvedValue(null),
    runMigrations: jest.fn().mockResolvedValue(null),
    synchronize: jest.fn().mockResolvedValue(null),
    destroy: jest.fn().mockResolvedValue(null),
    isInitialized: false,
    migrations: [],
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    __esModule: true,
    ...originalModule,
    DataSource: jest.fn(() => mockDataSource),
  }
})

// DBResponseをモック化する
jest.mock('./response-entity', () => {
  // モックの応答オブジェクト
  const mockResponseObj: Omit<MockResponse, 'save'> = {
    id: 1,
    method: 'GET',
    endpoint: '/test',
    url: 'https://example.com',
    urlHash: 'hash',
    requestHeaders: null,
    requestBody: null,
    responseType: 'JSON',
    statusCode: 200,
    responseHeaders: null,
    responseBody: '{}',
    createdAt: new Date(),
  }

  // saveメソッドをモック
  const mockSave = jest.fn().mockResolvedValue({ ...mockResponseObj })

  // モックのクエリビルダー
  const mockQueryBuilder: MockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue([
      { method: 'GET', endpoint: '/test1', statusCode: 200, count: 3 },
      { method: 'POST', endpoint: '/test2', statusCode: 201, count: 2 },
    ]),
  }

  // コンストラクタとクラスメソッドの両方を持つモックオブジェクトを作成
  const MockDBResponseClass = jest.fn().mockImplementation(function () {
    return {
      ...mockResponseObj,
      save: mockSave,
    }
  }) as unknown as MockDBResponseClass

  // 静的メソッドを追加
  MockDBResponseClass.find = jest
    .fn()
    .mockResolvedValue([{ ...mockResponseObj }])
  MockDBResponseClass.count = jest.fn().mockResolvedValue(5)
  MockDBResponseClass.createQueryBuilder = jest
    .fn()
    .mockReturnValue(mockQueryBuilder)

  return {
    __esModule: true,
    DBResponse: MockDBResponseClass,
  }
})

describe('ResponseDatabase', () => {
  let responseDB: ResponseDatabase
  let mockDataSource: MockDataSource

  beforeEach(() => {
    jest.clearAllMocks()

    // テスト用の環境変数をクリア
    delete process.env.RESPONSE_DB_HOSTNAME
    delete process.env.RESPONSE_DB_PORT
    delete process.env.RESPONSE_DB_USERNAME
    delete process.env.RESPONSE_DB_PASSWORD
    delete process.env.RESPONSE_DB_DATABASE

    responseDB = new ResponseDatabase({
      hostname: 'localhost',
      port: '3306',
      username: 'testuser',
      password: 'testpass',
      database: 'testdb',
    })

    // モックされたDataSourceを取得
    mockDataSource = responseDB.getDataSource() as unknown as MockDataSource
  })

  describe('constructor', () => {
    it('should use options from constructor parameters', () => {
      // 副作用のためだけにnewを使わないように変数を宣言して結果を検証する
      const testDB = new ResponseDatabase({
        hostname: 'custom-host',
        port: '1234',
        username: 'custom-user',
        password: 'custom-pass',
        database: 'custom-db',
      })

      expect(testDB).toBeDefined()
      expect(DataSource).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'custom-host',
          port: 1234,
          username: 'custom-user',
          password: 'custom-pass',
          database: 'custom-db',
        })
      )
    })

    it('should use options from environment variables', () => {
      process.env.RESPONSE_DB_HOSTNAME = 'env-host'
      process.env.RESPONSE_DB_PORT = '5678'
      process.env.RESPONSE_DB_USERNAME = 'env-user'
      process.env.RESPONSE_DB_PASSWORD = 'env-pass'
      process.env.RESPONSE_DB_DATABASE = 'env-db'

      // 副作用のためだけにnewを使わないように変数を宣言して結果を検証する
      const testDB = new ResponseDatabase()

      expect(testDB).toBeDefined()
      expect(DataSource).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'env-host',
          port: 5678,
          username: 'env-user',
          password: 'env-pass',
          database: 'env-db',
        })
      )
    })

    it('should throw error when port is invalid', () => {
      expect(() => new ResponseDatabase({ port: 'invalid' })).toThrow(
        'Responses database port is invalid'
      )
      expect(() => new ResponseDatabase({ port: '-1' })).toThrow(
        'Responses database port is invalid'
      )
      expect(() => new ResponseDatabase({ port: '0' })).toThrow(
        'Responses database port is invalid'
      )
    })
  })

  describe('init', () => {
    let originalPrintDebug: any

    beforeEach(() => {
      // テスト中のログ出力を抑制するためにprintDebugをモック化
      originalPrintDebug = ResponseDatabase.printDebug
      ResponseDatabase.printDebug = jest.fn()
    })

    afterEach(() => {
      // テスト後に元に戻す
      ResponseDatabase.printDebug = originalPrintDebug
    })

    it('should return true when initialization succeeds', async () => {
      mockDataSource.isInitialized = false
      mockDataSource.initialize.mockResolvedValueOnce(null)

      const result = await responseDB.init()

      expect(mockDataSource.initialize).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should return true if already initialized', async () => {
      mockDataSource.isInitialized = true

      const result = await responseDB.init()

      expect(mockDataSource.initialize).not.toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should return false when initialization fails', async () => {
      mockDataSource.isInitialized = false
      mockDataSource.initialize.mockRejectedValueOnce(new Error('Init error'))

      const result = await responseDB.init()

      expect(mockDataSource.initialize).toHaveBeenCalled()
      expect(result).toBe(false)
    })

    // カバレッジ向上のための追加テスト - 行252を実行するケース
    it('should correctly handle initialization error and return false', async () => {
      mockDataSource.isInitialized = false
      const initError = new Error('Database connection failed')
      mockDataSource.initialize.mockRejectedValueOnce(initError)

      // printDebugをさらにスパイして実際に呼び出されたことを確認
      const printDebugSpy = jest.spyOn(ResponseDatabase, 'printDebug')

      const result = await responseDB.init()

      // ケース内で失敗し、falseを返すことを確認
      expect(result).toBe(false)

      // エラーメッセージでprintDebugが呼ばれたことを確認
      expect(printDebugSpy).toHaveBeenCalledWith(
        'Responses database initialization failed',
        initError
      )

      printDebugSpy.mockRestore()
    })
  })

  describe('migrate', () => {
    it('should run migrations when there are migrations', async () => {
      mockDataSource.isInitialized = true
      mockDataSource.migrations = ['migration1', 'migration2']

      await responseDB.migrate()

      expect(mockDataSource.runMigrations).toHaveBeenCalled()
    })

    it('should not run migrations when there are no migrations', async () => {
      mockDataSource.isInitialized = true
      mockDataSource.migrations = []

      await responseDB.migrate()

      expect(mockDataSource.runMigrations).not.toHaveBeenCalled()
    })

    it('should throw error when not initialized', async () => {
      mockDataSource.isInitialized = false

      await expect(responseDB.migrate()).rejects.toThrow(
        'Responses database is not initialized'
      )
      expect(mockDataSource.runMigrations).not.toHaveBeenCalled()
    })
  })

  describe('sync', () => {
    it('should synchronize schema', async () => {
      mockDataSource.isInitialized = true

      await responseDB.sync()

      expect(mockDataSource.synchronize).toHaveBeenCalled()
    })

    it('should throw error when not initialized', async () => {
      mockDataSource.isInitialized = false

      await expect(responseDB.sync()).rejects.toThrow(
        'Responses database is not initialized'
      )
      expect(mockDataSource.synchronize).not.toHaveBeenCalled()
    })
  })

  describe('addResponse', () => {
    it('should add a response when initialized', async () => {
      mockDataSource.isInitialized = true

      const response = await responseDB.addResponse({
        method: 'GET',
        endpoint: '/test',
        url: 'https://example.com',
        requestHeaders: null,
        requestBody: null,
        responseType: 'JSON',
        statusCode: 200,
        responseHeaders: null,
        responseBody: '{}',
      })

      expect(response).toBeDefined()
      expect(response?.method).toBe('GET')
      expect(response?.endpoint).toBe('/test')
    })

    it('should throw error when not initialized', async () => {
      mockDataSource.isInitialized = false

      await expect(
        responseDB.addResponse({
          method: 'GET',
          endpoint: '/test',
          url: 'https://example.com',
          requestHeaders: null,
          requestBody: null,
          responseType: 'JSON',
          statusCode: 200,
          responseHeaders: null,
          responseBody: '{}',
        })
      ).rejects.toThrow('Responses database is not initialized')
    })
  })

  describe('getResponses', () => {
    beforeEach(() => {
      mockDataSource.isInitialized = true

      const mockResponses = [
        { id: 1, method: 'GET', endpoint: '/test1', statusCode: 200 },
        { id: 2, method: 'POST', endpoint: '/test2', statusCode: 201 },
      ]

      // DBResponse.findをモック
      jest.spyOn(DBResponse, 'find').mockResolvedValue(mockResponses as any)
    })

    it('should get all responses when endpoint is not specified', async () => {
      await responseDB.getResponses()

      expect(DBResponse.find).toHaveBeenCalledWith({
        where: {
          createdAt: expect.any(Object),
        },
        order: { id: 'DESC' },
      })
    })

    it('should get responses for specific endpoint', async () => {
      const endpoint: ResponseEndPoint = {
        method: 'GET',
        endpoint: '/test',
        statusCode: 200,
      }

      await responseDB.getResponses(endpoint)

      expect(DBResponse.find).toHaveBeenCalledWith({
        where: [
          {
            method: 'GET',
            endpoint: '/test',
            statusCode: 200,
            createdAt: expect.any(Object),
          },
        ],
        order: { id: 'DESC' },
      })
    })

    it('should get responses for multiple endpoints', async () => {
      const endpoints: ResponseEndPoint[] = [
        { method: 'GET', endpoint: '/test1', statusCode: 200 },
        { method: 'POST', endpoint: '/test2', statusCode: 201 },
      ]

      await responseDB.getResponses(endpoints)

      expect(DBResponse.find).toHaveBeenCalledWith({
        where: [
          { method: 'GET', endpoint: '/test1', statusCode: 200 },
          { method: 'POST', endpoint: '/test2', statusCode: 201 },
        ],
        order: { id: 'DESC' },
      })
    })

    it('should apply pagination when specified', async () => {
      await responseDB.getResponses(undefined, { page: 2, limit: 10 })

      expect(DBResponse.find).toHaveBeenCalledWith({
        where: {
          createdAt: expect.any(Object),
        },
        order: { id: 'DESC' },
        skip: 10,
        take: 10,
      })
    })

    it('should throw error when pagination parameters are invalid', async () => {
      await expect(
        responseDB.getResponses(undefined, { page: 0, limit: 10 })
      ).rejects.toThrow(
        'Responses database range is invalid (page: 0, limit: 10)'
      )

      await expect(
        responseDB.getResponses(undefined, { page: 1, limit: 0 })
      ).rejects.toThrow(
        'Responses database range is invalid (page: 1, limit: 0)'
      )
    })

    it('should throw error when not initialized', async () => {
      mockDataSource.isInitialized = false

      await expect(responseDB.getResponses()).rejects.toThrow(
        'Responses database is not initialized'
      )
    })
  })

  describe('getResponseCount', () => {
    beforeEach(() => {
      mockDataSource.isInitialized = true
      jest.spyOn(DBResponse, 'count').mockResolvedValue(5)
    })

    it('should get count of all responses when endpoint is not specified', async () => {
      const count = await responseDB.getResponseCount()

      expect(DBResponse.count).toHaveBeenCalledWith({
        where: {
          createdAt: expect.any(Object),
        },
      })
      expect(count).toBe(5)
    })

    it('should get count for specific endpoint', async () => {
      const endpoint: ResponseEndPoint = {
        method: 'GET',
        endpoint: '/test',
        statusCode: 200,
      }

      const count = await responseDB.getResponseCount(endpoint)

      expect(DBResponse.count).toHaveBeenCalledWith({
        where: [
          {
            method: 'GET',
            endpoint: '/test',
            statusCode: 200,
            createdAt: expect.any(Object),
          },
        ],
      })
      expect(count).toBe(5)
    })

    it('should throw error when not initialized', async () => {
      mockDataSource.isInitialized = false

      await expect(responseDB.getResponseCount()).rejects.toThrow(
        'Responses database is not initialized'
      )
    })
  })

  describe('getEndpoints', () => {
    beforeEach(() => {
      mockDataSource.isInitialized = true

      const mockEndpoints = [
        { method: 'GET', endpoint: '/test1', statusCode: 200, count: 3 },
        { method: 'POST', endpoint: '/test2', statusCode: 201, count: 2 },
      ]

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockEndpoints),
      }

      jest
        .spyOn(DBResponse, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
    })

    it('should get all endpoints', async () => {
      const endpoints = await responseDB.getEndpoints()

      expect(DBResponse.createQueryBuilder).toHaveBeenCalled()
      expect(endpoints).toEqual([
        { method: 'GET', endpoint: '/test1', statusCode: 200, count: 3 },
        { method: 'POST', endpoint: '/test2', statusCode: 201, count: 2 },
      ])
    })

    it('should throw error when not initialized', async () => {
      mockDataSource.isInitialized = false

      await expect(responseDB.getEndpoints()).rejects.toThrow(
        'Responses database is not initialized'
      )
    })
  })

  describe('close', () => {
    it('should close the database connection when initialized', async () => {
      mockDataSource.isInitialized = true

      await responseDB.close()

      expect(mockDataSource.destroy).toHaveBeenCalled()
    })

    it('should do nothing when not initialized', async () => {
      mockDataSource.isInitialized = false

      await responseDB.close()

      expect(mockDataSource.destroy).not.toHaveBeenCalled()
    })
  })

  describe('isInitialized', () => {
    it('should return true when database is initialized', () => {
      mockDataSource.isInitialized = true

      expect(responseDB.isInitialized()).toBe(true)
    })

    it('should return false when database is not initialized', () => {
      mockDataSource.isInitialized = false

      expect(responseDB.isInitialized()).toBe(false)
    })
  })

  describe('getDataSource', () => {
    it('should return data source', () => {
      const dataSource = responseDB.getDataSource()

      expect(dataSource).toBe(mockDataSource)
    })
  })

  describe('parsePort', () => {
    // プライベートメソッドをテストするためのヘルパー関数
    const testParsePort = (port?: string): number => {
      // @ts-expect-error プライベートメソッドへのアクセス
      return responseDB.parsePort(port)
    }

    it('should return default port when port is undefined', () => {
      // eslint-disable-next-line unicorn/no-useless-undefined
      expect(testParsePort(undefined)).toBe(3306)
    })

    it('should parse valid port', () => {
      expect(testParsePort('1234')).toBe(1234)
    })

    it('should throw error on invalid port', () => {
      expect(() => testParsePort('invalid')).toThrow(
        'Responses database port is invalid'
      )
      expect(() => testParsePort('-1')).toThrow(
        'Responses database port is invalid'
      )
      expect(() => testParsePort('0')).toThrow(
        'Responses database port is invalid'
      )
    })
  })

  describe('printDebug', () => {
    let consoleDebugSpy: jest.SpyInstance
    let consoleErrorSpy: jest.SpyInstance

    beforeEach(() => {
      consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation()
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    })

    afterEach(() => {
      consoleDebugSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    })

    it('should print debug message in development environment', () => {
      process.env.NODE_ENV = 'development'

      ResponseDatabase.printDebug('Debug message')

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[PixivTs@ResponseDatabase] Debug message'
      )
    })

    it('should print debug message in test environment', () => {
      process.env.NODE_ENV = 'test'

      ResponseDatabase.printDebug('Debug message')

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[PixivTs@ResponseDatabase] Debug message'
      )
    })

    it('should print error message with error object', () => {
      process.env.NODE_ENV = 'test'
      const error = new Error('Test error')

      ResponseDatabase.printDebug('Error message', error)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[PixivTs@ResponseDatabase] Error message',
        error
      )
    })

    it('should not print in production environment', () => {
      process.env.NODE_ENV = 'production'

      ResponseDatabase.printDebug('Debug message')

      expect(consoleDebugSpy).not.toHaveBeenCalled()
    })
  })
})
