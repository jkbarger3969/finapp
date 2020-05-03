import Fraction from "fraction.js";

export const getRational = (
  number: string | number,
  fractionDigits = 2
): { num: number; den: number } => {
  const { n: num, d: den } = new Fraction(
    (typeof number === "string"
      ? Number.parseFloat(number.trim() || "0")
      : number
    ).toFixed(fractionDigits)
  );

  return { num, den };
};
