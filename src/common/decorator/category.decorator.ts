import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Types } from 'mongoose';
@ValidatorConstraint({ name: 'ValidateIds', async: false })
export class ValidateIds implements ValidatorConstraintInterface {
  validate(value: string[], args: ValidationArguments) {
    if (!Array.isArray(value)) return false;
    return (
      value.filter((id) => Types.ObjectId.isValid(id)).length == value.length
    );
  }

  defaultMessage(args: ValidationArguments) {
    return `some id is not valid`;
  }
}
