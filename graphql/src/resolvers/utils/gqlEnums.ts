import { pascalCase, constantCase } from "change-case";
import { snakeCase } from "lodash";

export const deserializeGQLEnum = <T extends string>(gqlEnum: T): string =>
  pascalCase(gqlEnum);

export const serializeGQLEnum = <T>(serializeGQLEnum: string): T =>
  snakeCase(serializeGQLEnum).toUpperCase() as unknown as T;
