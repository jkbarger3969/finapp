import Fraction from "fraction.js";
import { Scalars } from "./graphTypes";

export type RationalScalar = Scalars["Rational"];
export type DateScalar = Scalars["Date"];

export type Rational = Fraction;
export const Rational = Fraction;

export const serializeRational = (rational: Rational): RationalScalar =>
  JSON.stringify(rational);
export const deserializeRational = (rationalScaler: RationalScalar): Rational =>
  new Fraction(JSON.parse(rationalScaler));

export const serializeDate = (date: Date): DateScalar => date.toISOString();
export const deserializeDate = (dateScaler: DateScalar): Date =>
  new Date(dateScaler);
