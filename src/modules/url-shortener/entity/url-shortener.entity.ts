import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ObjectIdColumn,
  ObjectId,
} from 'typeorm';

@Entity('url_shortener')
export class UrlShortener {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ type: 'text', unique: true })
  originalUrl: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  shortCode: string;

  @Column({ type: 'bigint', default: 0 })
  visits: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
