import { GraphQLScalarType, GraphQLScalarTypeConfig, Kind } from "graphql";

const config: GraphQLScalarTypeConfig<Date, string> = {
  name: "Date",
  description: "ISO 8601 Date String",
  serialize(value: Date) {
    return value.toISOString();
  },
  // ISO 8601
  parseValue(value: string) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
};

export const dateScalar = new GraphQLScalarType(config);

export default dateScalar;
