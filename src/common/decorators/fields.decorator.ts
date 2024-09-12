// src/common/decorators/fields.decorator.ts
import { ApiProperty } from '@nestjs/swagger';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsEmail, IsString, Length, Matches } from 'class-validator';

export function EmailField(entityName?: string) {
  return function (target: any, propertyKey: string) {
    if (!entityName) entityName = target.constructor.name;
    ApiProperty({
      description: `The email address of the ${entityName}`,
      example: 'john.doe@example.com',
    })(target, propertyKey);

    IsEmail()(target, propertyKey);
  };
}

export function UsernameField(entityName?: string) {
  return function (target: any, propertyKey: string) {
    if (!entityName) entityName = target.constructor.name;
    ApiProperty({
      description: `The name of the ${entityName}`,
      minLength: 3,
      maxLength: 20,
      example: 'John Doe',
    })(target, propertyKey);

    IsString()(target, propertyKey);
    Length(3, 20)(target, propertyKey);
  };
}

export function PasswordField(entityName?: string) {
  return function (target: any, propertyKey: string) {
    if (!entityName) entityName = target.constructor.name;
    IsString()(target, propertyKey);
    Length(8, 127)(target, propertyKey);
    ApiProperty({
      description: `The password of the ${entityName}`,
      example: 'Password123!',
    })(target, propertyKey);
  };
}

export function IdField(entityName?: string) {
  return function (target: any, propertyKey: string) {
    if (!entityName) entityName = target.constructor.name;
    ApiProperty({
      description: `The unique identifier of ${entityName}`,
      example: `913047779430638480`,
    })(target, propertyKey);
    IsString()(target, propertyKey);
    Matches(/^\d{18}$/, { message: `id must be a 18-digits string` })(
      target,
      propertyKey,
    );
    // Length(18)(target, propertyKey);
  };
}

export function CreatedAtField(entityName?: string) {
  return function (target: any, propertyKey: string) {
    if (!entityName) entityName = target.constructor.name;
    ApiProperty({
      description: `The date and time when the ${entityName} was created`,
    })(target, propertyKey);

    CreateDateColumn({
      name: 'created_at',
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    })(target, propertyKey);
  };
}

export function UpdatedAtField(entityName?: string) {
  return function (target: any, propertyKey: string) {
    if (!entityName) entityName = target.constructor.name;
    ApiProperty({
      description: `The date and time when the ${entityName} was last updated`,
    })(target, propertyKey);

    IsEmail()(target, propertyKey);

    UpdateDateColumn({
      name: 'updated_at',
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      onUpdate: 'CURRENT_TIMESTAMP',
    })(target, propertyKey);
  };
}
