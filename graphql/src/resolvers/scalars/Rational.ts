import { GraphQLScalarType, GraphQLScalarTypeConfig, Kind } from "graphql";
import Fraction from "fraction.js";

const config: GraphQLScalarTypeConfig<Fraction, string> = {
  name: "Rational",
  description: `Rational Number JSON String: "{"s":-1|1,"n":Int,"d":Int}"`,
  serialize(value: Fraction) {
    return JSON.stringify(value);
  },
  // JSON "{"s":-1|1,"n":Int,"d":Int}"
  parseValue(value: string) {
    return new Fraction(JSON.parse(value));
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Fraction(JSON.parse(ast.value));
    }
    return null; // Invalid
  },
};

export const rationalScalar = new GraphQLScalarType(config);

export default rationalScalar;
