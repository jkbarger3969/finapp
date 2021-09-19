import React from "react";
import {
  IDependency,
  Plugin,
  Template,
  TemplateConnector,
  TemplatePlaceholder,
} from "@devexpress/dx-react-core";
import { Typography } from "@material-ui/core";
import { SummaryItem } from "@devexpress/dx-react-grid";

const gridTitleDeps: IDependency[] = [
  {
    name: "SummaryState",
    optional: false,
  },
  {
    name: "IntegratedSummary",
    optional: false,
  },
];

export const GridTitle = ({ title }: { title?: string }): JSX.Element => {
  return (
    <Plugin name="GridTitle" dependencies={gridTitleDeps}>
      <Template name="toolbarContent">
        <TemplateConnector>
          {({ totalSummaryValues, totalSummaryItems }) => {
            const totalAggregate = totalSummaryValues[
              (totalSummaryItems as SummaryItem[]).findIndex(
                ({ type, columnName }) =>
                  columnName === "total" && type === "totalAggregate"
              )
            ] as string;

            return (
              <>
                <Typography variant="h6">
                  {title ? `${title}: ${totalAggregate}` : totalAggregate}
                </Typography>
                <TemplatePlaceholder />
              </>
            );
          }}
        </TemplateConnector>
      </Template>
    </Plugin>
  );
};
