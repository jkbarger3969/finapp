import { pascalCase, constantCase } from "change-case";
import { snakeCase } from "lodash";

export const serializeGQLEnum = <T extends string>(gqlEnum: T): string =>
  pascalCase(gqlEnum);

export const deserializeGQLEnum = <T>(serializeGQLEnum: string): T =>
  snakeCase(serializeGQLEnum).toUpperCase() as unknown as T;
