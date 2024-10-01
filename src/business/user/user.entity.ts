// src/user/user.entity.ts
import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';
import { generateUuNumId } from '../../utils';
import {
  CreatedAtField,
  EmailField,
  IdField,
  UpdatedAtField,
  UsernameField,
} from '../../common';

@Entity()
export class User {
  @PrimaryColumn({ type: 'bigint' })
  @IdField()
  id!: string;

  @Column()
  @UsernameField()
  username: string;

  @Column()
  @EmailField()
  email!: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ unique: true, nullable: true })
  oauthId: string;

  @Column({ nullable: true })
  provider: string;

  @CreatedAtField()
  createdAt!: Date;

  @UpdatedAtField()
  updatedAt!: Date;

  // Use the BeforeInsert decorator to ensure execution before inserting data
  @BeforeInsert()
  async setId() {
    this.id = generateUuNumId();
  }
}
