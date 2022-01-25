declare module "@devexpress/dx-grid-core" {
  import { Filter } from "@devexpress/dx-react-grid";

  function changeColumnFilter(
    filters: Filter[],
    config: {
      columnName: Filter["columnName"];
      config: Omit<Filter, "columnName">;
    }
  ): Filter[];
}
