import { hash, compare } from 'bcrypt';
type HashParams = {
  plainText: string;
  salt_Rounds?: number;
};

type CompareParams = {
  plainText: string;
  cipherText: string;
};

export const Hash = async ({
  plainText,
  salt_Rounds = Number(process.env.SALT_ROUNDS!),
}: HashParams): Promise<string> => {
  return await hash(plainText, salt_Rounds);
};

export const Compare = async ({
  plainText,
  cipherText,
}: CompareParams): Promise<boolean> => {
  return await compare(plainText, cipherText);
};
