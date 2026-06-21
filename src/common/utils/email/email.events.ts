import { EventEmitter } from 'node:events';
import { EmailEnum } from 'src/common/enum/email.enum';

export const eventEmitter = new EventEmitter();

eventEmitter.on(EmailEnum.confirmEmail, async (fn) => {
  await fn();
});

eventEmitter.on(EmailEnum.forgetPassword, async (fn) => {
  await fn();
});
