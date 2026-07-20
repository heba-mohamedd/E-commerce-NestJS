import { registerDecorator, ValidationOptions } from 'class-validator';

import { ValidationArguments } from 'class-validator';

// class decorator
export function AtLeastOne(
  requiredFields: string[],
  validationOptions?: ValidationOptions,
) {
  return function (constructor: any) {
    registerDecorator({
      target: constructor,
      propertyName: '',
      options: validationOptions,
      constraints: requiredFields,
      validator: {
        validate(value: string, args: ValidationArguments) {
          // console.log(args);

          return requiredFields.some((field) => args.object[field]);
        },

        defaultMessage(args: ValidationArguments) {
          // here you can provide default error message if validation failed
          return `At least one of required fields of ${requiredFields.join(' , ')} is missing. Received body: ${JSON.stringify(args.object)}`;
        },
      },
    });
  };
}
