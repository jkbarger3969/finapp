import Fraction from "fraction.js";
import { Rational, RationalInput } from "../graphTypes";
export declare const fractionToRational: (fraction: Fraction | {
    s: number;
    n: number;
    d: number;
}) => Omit<Rational & RationalInput, "__typename">;
export declare const rationalToFraction: (rational: Rational | RationalInput) => Fraction;
