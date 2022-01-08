import { pascalCase, snakeCase } from "change-case";

export const deserializeGQLEnum = <T extends string>(gqlEnum: T): string =>
  pascalCase(gqlEnum);

export const serializeGQLEnum = <T>(serializeGQLEnum: string): T =>
  snakeCase(serializeGQLEnum).toUpperCase() as unknown as T;
