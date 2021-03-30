import React from "react";

import {
  Plugin,
  Template,
  TemplatePlaceholder,
} from "@devexpress/dx-react-core";

export const FilterCell = (): JSX.Element => {
  return (
    <Plugin name="FilFterCell">
      <Template name="tableCell">
        <TemplatePlaceholder />
      </Template>
    </Plugin>
  );
};
