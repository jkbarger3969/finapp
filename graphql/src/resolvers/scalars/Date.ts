import { GraphQLScalarType, GraphQLScalarTypeConfig, Kind } from "graphql";

function parseDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  }
  return new Date(value);
}

const config: GraphQLScalarTypeConfig<Date, string> = {
  name: "Date",
  description: "ISO 8601 Date String",
  serialize(value: Date) {
    return value.toISOString();
  },
  parseValue(value: string) {
    return parseDate(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return parseDate(ast.value);
    }
    return null;
  },
};

export const dateScalar = new GraphQLScalarType(config);

export default dateScalar;
