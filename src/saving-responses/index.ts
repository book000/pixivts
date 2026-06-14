import { DataSource, MoreThan, MoreThanOrEqual } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { DBResponse } from './response-entity'
import crypto from 'node:crypto'

/**
 * HTTP method of the request
 */
export type HttpMethod = 'GET' | 'POST'

export interface AddResponseOptions {
  method: HttpMethod
  endpoint: string
  url: string | null
  requestHeaders: string | null
  requestBody: string | null
  responseType: string
  statusCode: number
  responseHeaders: string | null
  responseBody: string
}

/**
 * Options for the database that stores responses
 */
export interface ResponseDatabaseOptions {
  /**
   * Hostname (MySQL only)
   */
  hostname?: string

  /**
   * Port (MySQL only)
   */
  port?: string

  /**
   * Username (MySQL only)
   */
  username?: string

  /**
   * Password (MySQL only)
   */
  password?: string

  /**
   * Database name (MySQL only)
   */
  database?: string
}

export interface ResponseEndPoint {
  method: HttpMethod
  endpoint: string
  statusCode: number
}
export type ResponseEndPointWithCount = ResponseEndPoint & { count: number }

/**
 * Range options for retrieving saved responses
 */
export interface GetResponseRangeOptions {
  /**
   * Page number
   */
  page?: number

  /**
   * Number of items to retrieve per page
   */
  limit?: number
}

/**
 * Database that stores responses
 */
export class ResponseDatabase {
  private dataSource: DataSource

  constructor(options: ResponseDatabaseOptions = {}) {
    const configuration = {
      DB_HOSTNAME: options.hostname ?? process.env.RESPONSE_DB_HOSTNAME,
      DB_PORT: options.port ?? process.env.RESPONSE_DB_PORT,
      DB_USERNAME: options.username ?? process.env.RESPONSE_DB_USERNAME,
      DB_PASSWORD: options.password ?? process.env.RESPONSE_DB_PASSWORD,
      DB_DATABASE: options.database ?? process.env.RESPONSE_DB_DATABASE,
    }

    // An error occurs if DB_PORT cannot be parsed as an int
    // If DB_PORT is undefined, the default port is used
    const port = this.parsePort(configuration.DB_PORT)

    this.dataSource = new DataSource({
      type: 'mysql',
      host: configuration.DB_HOSTNAME,
      port,
      username: configuration.DB_USERNAME,
      password: configuration.DB_PASSWORD,
      database: configuration.DB_DATABASE,
      synchronize: true,
      logging: process.env.PRINT_DB_LOGS === 'true',
      namingStrategy: new SnakeNamingStrategy(),
      entities: [DBResponse],
      subscribers: [],
      migrations: [],
      timezone: '+09:00',
      supportBigNumbers: true,
      bigNumberStrings: true,
    })
  }

  /**
   * Initializes the data source
   *
   * @returns Whether the initialization succeeded
   */
  public async init(): Promise<boolean> {
    if (this.dataSource.isInitialized) {
      return true
    }
    try {
      await this.dataSource.initialize()
      ResponseDatabase.printDebug('Responses database initialized')
      return true
    } catch (error) {
      ResponseDatabase.printDebug(
        'Responses database initialization failed',
        error as Error
      )
      return false
    }
  }

  /**
   * Runs migrations on the data source
   */
  public async migrate(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      throw new Error('Responses database is not initialized')
    }
    if (this.dataSource.migrations.length === 0) {
      return
    }
    await this.dataSource.runMigrations()
  }

  /**
   * Synchronizes the data source schema
   */
  public async sync(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      throw new Error('Responses database is not initialized')
    }
    await this.dataSource.synchronize()
  }

  /**
   * Adds a response
   *
   * @param options Options for adding a response
   * @returns The added response
   */
  public async addResponse(
    options: AddResponseOptions
  ): Promise<DBResponse | undefined> {
    if (!this.dataSource.isInitialized) {
      throw new Error('Responses database is not initialized')
    }
    const response = new DBResponse()
    response.method = options.method
    response.endpoint = options.endpoint
    response.url = options.url
    response.urlHash = crypto
      .createHash('sha256')
      .update(options.url ?? '')
      .digest('hex')
    response.requestHeaders = options.requestHeaders
    response.requestBody = options.requestBody
    response.responseType = options.responseType
    response.statusCode = options.statusCode
    response.responseHeaders = options.responseHeaders
    response.responseBody = options.responseBody
    response.createdAt = new Date()
    return response.save()
  }

  /**
   * Gets responses. Only responses from the last 90 days can be retrieved
   *
   * @param endpoint Endpoint information. If not specified, all responses are retrieved
   * @param rangeOptions Range of responses to retrieve
   *
   * @returns Array of responses
   */
  public async getResponses(
    endpoint?: ResponseEndPoint | ResponseEndPoint[],
    rangeOptions?: GetResponseRangeOptions
  ): Promise<DBResponse[]> {
    if (!this.dataSource.isInitialized) {
      throw new Error('Responses database is not initialized')
    }
    const options = rangeOptions ?? {}
    const page = options.page
    const limit = options.limit

    // It may come in as ResponseEndPointWithCount, so convert it to ResponseEndPoint
    // If it is not an array, convert it to an array
    const endpoints = endpoint
      ? Array.isArray(endpoint)
        ? endpoint.map((v) => ({
            method: v.method,
            endpoint: v.endpoint,
            statusCode: v.statusCode,
          }))
        : [
            {
              method: endpoint.method,
              endpoint: endpoint.endpoint,
              statusCode: endpoint.statusCode,
              // Only retrieve responses from 90 days ago or later
              createdAt: MoreThanOrEqual(
                new Date(Date.now() - 1000 * 60 * 60 * 24 * 90)
              ),
            },
          ]
      : {
          // Only retrieve responses from 90 days ago or later
          createdAt: MoreThanOrEqual(
            new Date(Date.now() - 1000 * 60 * 60 * 24 * 90)
          ),
        }
    if (page === undefined || limit === undefined) {
      return DBResponse.find({ where: endpoints, order: { id: 'DESC' } })
    }

    if (page <= 0 || limit <= 0) {
      throw new Error(
        `Responses database range is invalid (page: ${page}, limit: ${limit})`
      )
    }

    return DBResponse.find({
      where: endpoints,
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    })
  }

  /**
   * Gets the number of responses. Only responses from the last 90 days can be retrieved
   *
   * @param endpoint Endpoint information. If not specified, all responses are retrieved
   * @returns The number of responses
   */
  public async getResponseCount(
    endpoint?: ResponseEndPoint | ResponseEndPoint[]
  ): Promise<number> {
    if (!this.dataSource.isInitialized) {
      throw new Error('Responses database is not initialized')
    }
    const endpoints = endpoint
      ? Array.isArray(endpoint)
        ? endpoint.map((v) => ({
            method: v.method,
            endpoint: v.endpoint,
            statusCode: v.statusCode,
            createdAt: MoreThanOrEqual(
              new Date(Date.now() - 1000 * 60 * 60 * 24 * 90)
            ),
          }))
        : [
            {
              method: endpoint.method,
              endpoint: endpoint.endpoint,
              statusCode: endpoint.statusCode,
              createdAt: MoreThanOrEqual(
                new Date(Date.now() - 1000 * 60 * 60 * 24 * 90)
              ),
            },
          ]
      : {
          // Only retrieve responses from 90 days ago or later
          createdAt: MoreThanOrEqual(
            new Date(Date.now() - 1000 * 60 * 60 * 24 * 90)
          ),
        }
    return DBResponse.count({ where: endpoints })
  }

  /**
   * Gets endpoints. Only responses from the last 90 days can be retrieved
   */
  public async getEndpoints(): Promise<ResponseEndPointWithCount[]> {
    if (!this.dataSource.isInitialized) {
      throw new Error('Responses database is not initialized')
    }
    // Get the combination of method and endpoint
    return DBResponse.createQueryBuilder()
      .where({
        responseType: 'JSON',
        createdAt: MoreThan(new Date(Date.now() - 1000 * 60 * 60 * 24 * 90)),
      })
      .groupBy('method, endpoint, status_code')
      .select([
        'method',
        'endpoint',
        'status_code AS statusCode',
        'COUNT(*) AS count',
      ])
      .getRawMany<ResponseEndPointWithCount>()
  }

  public async close(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      return
    }
    await this.dataSource.destroy()
  }

  public isInitialized(): boolean {
    return this.dataSource.isInitialized
  }

  /**
   * Gets the data source
   *
   * @returns The data source
   */
  public getDataSource(): DataSource {
    return this.dataSource
  }

  /**
   * Parses the database port specified by the environment variable.
   * Throws an error if it cannot be parsed as a number or is not 1 or greater.
   * If it is undefined, the default port for each database is used
   *
   * @param port Database port
   * @returns The parsed port
   */
  private parsePort(port: string | undefined): number {
    if (port === undefined) {
      return 3306
    }

    const parsedPort = Number.parseInt(port)
    if (Number.isNaN(parsedPort) || parsedPort <= 0) {
      throw new Error('Responses database port is invalid')
    }

    return parsedPort
  }

  public static printDebug(text: string, error?: Error): void {
    if (
      process.env.NODE_ENV !== 'development' &&
      process.env.NODE_ENV !== 'test'
    ) {
      return
    }
    if (error !== undefined) {
      console.error(`[PixivTs@ResponseDatabase] ${text}`, error)
      return
    }

    console.debug(`[PixivTs@ResponseDatabase] ${text}`)
  }
}
