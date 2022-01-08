import { GraphQLScalarType } from "graphql";
import Fraction from "fraction.js";
export declare const rationalScalar: GraphQLScalarType<Fraction, string>;
export default rationalScalar;
