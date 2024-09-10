// src/user.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier of the user' })
  id!: number;

  @Column()
  @IsString()
  @Length(3, 20)
  @ApiProperty({
    description: 'The name of the user',
    minLength: 3,
    maxLength: 20,
  })
  username: string;

  @Column()
  @IsEmail()
  @ApiProperty({ description: 'The email address of the user' })
  email!: string;

  @Column()
  @IsString()
  @Length(8, 127)
  @Column({ nullable: true })
  @ApiProperty({ description: 'The password of the user' })
  password?: string;

  @Column({ unique: true, nullable: true })
  oauthId: string;

  @Column({ nullable: true })
  provider: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @ApiProperty({ description: 'The date and time when the user was created' })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  @ApiProperty({
    description: 'The date and time when the user was last updated',
  })
  updatedAt!: Date;
}
