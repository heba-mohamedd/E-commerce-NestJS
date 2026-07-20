import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { registerDecorator, ValidationOptions } from 'class-validator';

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
@ValidatorConstraint({ name: 'matchKey', async: false })
export class matchKey implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    // console.log(args);

    return value === args.object[args.constraints[0]]; // for async validations you must return a Promise<boolean> here
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return `${args.property} is not matched ${args.constraints[0]}`;
  }
}

export function IsMatch(
  constraints: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints,
      validator: matchKey,
    });
  };
}

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
