import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('responses')
@Index(['method', 'endpoint', 'statusCode', 'createdAt', 'urlHash'], {
  unique: true,
})
export class DBResponse extends BaseEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'int',
    comment: 'Response ID',
  })
  id!: number

  @Column({
    type: 'varchar',
    length: 10,
    comment: 'Endpoint method',
  })
  method!: string

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Endpoint name',
  })
  endpoint!: string

  @Column({
    type: 'text',
    comment: 'Request URL',
    nullable: true,
  })
  url!: string | null

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Hash value of the request URL',
  })
  urlHash!: string

  @Column({
    type: 'longtext',
    comment: 'Request headers',
    nullable: true,
  })
  requestHeaders!: string | null

  @Column({
    type: 'longtext',
    comment: 'Request body',
    nullable: true,
  })
  requestBody!: string | null

  @Column({
    type: 'varchar',
    length: 10,
    comment: 'Response type',
  })
  responseType!: string

  @Column({
    type: 'int',
    comment: 'Response status code',
  })
  statusCode!: number

  @Column({
    type: 'longtext',
    comment: 'Response headers',
    nullable: true,
  })
  responseHeaders!: string | null

  @Column({
    type: 'longtext',
    comment: 'Response body',
  })
  responseBody!: string

  @Column({
    type: 'datetime',
    comment: 'Date and time the record was created',
    precision: 3,
  })
  createdAt!: Date
}
