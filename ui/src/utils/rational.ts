import Fraction from "fraction.js";

import { RationalSign, Rational, RationalInput } from "../apollo/graphTypes";

export const isRational = (rational: unknown): boolean =>
  typeof rational === "object" &&
  rational !== null &&
  "s" in rational &&
  "n" in rational &&
  "d" in rational;

export const fractionToRational = (
  fraction: Fraction | { s: number; n: number; d: number }
): Omit<Rational & RationalInput, "__typename"> => ({
  n: Math.abs(fraction.n),
  d: Math.abs(fraction.d),
  s: fraction.s === -1 ? RationalSign.Neg : RationalSign.Pos,
});

export const rationalToFraction = (
  rational: Rational | RationalInput
): Fraction =>
  new Fraction({
    n:
      rational.s === RationalSign.Neg
        ? -Math.abs(rational.n)
        : Math.abs(rational.n),
    d: Math.abs(rational.d),
  });
