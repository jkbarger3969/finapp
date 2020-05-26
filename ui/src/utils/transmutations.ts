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

export const addRational = (
  a: { num: number; den: number },
  b: { num: number; den: number },
  ...rest: { num: number; den: number }[]
): { num: number; den: number } => {
  let sum = new Fraction({
    n: a.num,
    d: a.den,
  }).add({
    n: b.num,
    d: b.den,
  });

  for (const rational of rest) {
    sum = sum.add(
      new Fraction({
        n: rational.num,
        d: rational.den,
      })
    );
  }

  return {
    num: sum.n,
    den: sum.d,
  };
};

export const subRational = (
  a: { num: number; den: number },
  b: { num: number; den: number },
  ...rest: { num: number; den: number }[]
): { num: number; den: number } => {
  let sum = new Fraction({
    n: a.num,
    d: a.den,
  }).sub({
    n: b.num,
    d: b.den,
  });

  for (const rational of rest) {
    sum = sum.sub(
      new Fraction({
        n: rational.num,
        d: rational.den,
      })
    );
  }

  return {
    num: sum.n,
    den: sum.d,
  };
};

export const rationalToDecimal = (rational: {
  num: number;
  den: number;
}): number => {
  return Number.parseFloat(
    new Fraction({
      n: rational.num,
      d: rational.den,
    }).toString()
  );
};
