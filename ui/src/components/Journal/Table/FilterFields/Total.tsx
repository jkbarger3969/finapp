import React, { useMemo } from "react";
import sift from "sift";
import { Formik } from "formik";

import { EntryFilter, Entry } from "../Journal";
import { rationalToFraction } from "../../../../utils/rational";
import { Rational } from "../../../../apollo/graphTypes";

const isRational = (rational) =>
  "s" in rational && "n" in rational && "d" in rational;

const opSymbol = {
  $eq: "=",
  $ne: "!=",
  $gt: ">",
  $lt: "<",
  $gte: ">=",
  $lte: "<=",
};

const Total = (props: {
  filter: EntryFilter;
  setFilter: (filter: EntryFilter) => void;
}) => {
  const { filter, setFilter } = props;

  const opValues = useMemo(() => {
    if (!filter.total) {
      return [];
    }

    if (isRational(filter.total)) {
      return [
        {
          op: "$eq",
          value: rationalToFraction(filter.total as Rational),
        },
      ];
    }
  }, [filter.total]);
  // return <Formik></Formik>;
};

export default Total;
