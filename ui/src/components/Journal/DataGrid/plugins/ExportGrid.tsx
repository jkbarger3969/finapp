import React, { useCallback } from "react";
import { Plugin, Action } from "@devexpress/dx-react-core";
import { unparse } from "papaparse";
import { saveAs } from "file-saver";

import { GridEntry } from "../Grid";
import { payMethodToStr } from "../cells/PayMethod";
import { sourceToStr } from "../cells";
import { EntryType } from "../../../../apollo/graphTypes";
import { format as formatDate } from "date-fns";

export const ExportGrid = () => {
  return (
    <Plugin name="ExportGrid">
      <Action
        name="exportGrid"
        action={useCallback((...args) => {
          const [, { rows, loadedNamedFilter }] = args as unknown as [
            unknown,
            { rows: GridEntry[]; loadedNamedFilter?: string }
          ];

          if (!rows.length) {
            return;
          }

          const csvStr = unparse(
            rows.map(
              ({
                __typename,
                date,
                dateOfRecord,
                department: { name: department },
                category,
                paymentMethod,
                description,
                total,
                source,
                reconciled,
              }) => ({
                Date: formatDate(date, "PP"),
                "Date off Record": formatDate(dateOfRecord?.date || date, "PP"),
                Category: category.name,
                Department: department,
                Source: sourceToStr(source),
                "Payment Method": payMethodToStr(paymentMethod),
                Description: description,
                Reconciled: reconciled ? "Y" : "N",
                Total: (() => {
                  if (__typename === "EntryRefund") {
                    return category.type === EntryType.Credit
                      ? `(${total.toString()})`
                      : total;
                  } else {
                    return category.type === EntryType.Credit
                      ? total
                      : `(${total.toString()})`;
                  }
                })(),
              })
            )
          );

          const blob = new Blob([csvStr], {
            type: "text/csv;charset=utf-8",
          });

          if (loadedNamedFilter) {
            saveAs(
              blob,
              `${loadedNamedFilter}-${formatDate(new Date(), "yyyy-MM-dd")}.csv`
            );
          } else {
            saveAs(blob, `journal-${formatDate(new Date(), "yyyy-MM-dd")}.csv`);
          }
        }, [])}
      />
    </Plugin>
  );
};
