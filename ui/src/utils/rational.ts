import Fraction from "fraction.js";

import { Scalars } from "../apollo/graphTypes";

export type RationalScalar = Scalars["Rational"];

export class Rational extends Fraction {
  constructor(rational: Rational | RationalScalar | number) {
    super(typeof rational === "string" ? JSON.parse(rational) : rational);
  }

  toScalar(): RationalScalar {
    return JSON.stringify(this);
  }
}
