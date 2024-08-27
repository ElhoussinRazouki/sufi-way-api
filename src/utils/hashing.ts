import { hash, compare } from "bcrypt";

const saltRounds = 10;


export const hashPassword = async (password: string) => {
  return await hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string) => {
  return await compare(password, hashedPassword);
};