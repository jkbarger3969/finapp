/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Getter,
  Plugin,
  Template,
  TemplateConnector,
  TemplatePlaceholder,
} from "@devexpress/dx-react-core";

export type PopupComponent<
  Row extends Record<string, unknown>,
  PopupEditorProps extends undefined | Record<string, unknown>
> = (props: {
  open: boolean;
  row: Row | null;
  editedRow: Row;
  popupEditorProps: PopupEditorProps;
  processValueChange: <Name extends keyof Row>(
    name: Name,
    value: Row[Name]
  ) => void;
  onApplyChanges: () => void;
  onCancelChanges: () => void;
}) => JSX.Element;

export const PopupEditingComponentState = function (props: {
  popupEditorProps: Record<string, unknown>;
}) {
  return (
    <Plugin name="PopupEditingComponentState">
      <Getter name="popupEditorComponentState" value={props} />
    </Plugin>
  );
};

export const PopupEditing = <Row extends Record<string, unknown>>(props: {
  popupComponent: PopupComponent<Row, any>;
}) => (
  <Plugin name="PopupEditing">
    <Template name="popupEditing">
      <TemplateConnector>
        {(
          {
            rows,
            getRowId,
            addedRows,
            editingRowIds,
            createRowChange,
            rowChanges,
            popupEditorComponentState,
          },
          {
            changeRow,
            changeAddedRow,
            commitChangedRows,
            commitAddedRows,
            stopEditRows,
            cancelAddedRows,
            cancelChangedRows,
          }
        ) => {
          const isNew = addedRows.length > 0;
          let row: Row | null = null;
          let editedRow: Row;
          let rowId: number;
          if (isNew) {
            rowId = 0;
            editedRow = addedRows[rowId];
          } else {
            [rowId] = editingRowIds;
            row = rows.find((row: any) => getRowId(row) === rowId);
            editedRow = { ...row, ...rowChanges[rowId] };
          }

          const processValueChange = (value: any, name: string) => {
            const changeArgs = {
              rowId,
              change: createRowChange(editedRow, value, name),
            };
            if (isNew) {
              changeAddedRow(changeArgs);
            } else {
              changeRow(changeArgs);
            }
          };
          const rowIds = isNew ? [0] : editingRowIds;
          const applyChanges = () => {
            if (isNew) {
              commitAddedRows({ rowIds });
            } else {
              stopEditRows({ rowIds });
              commitChangedRows({ rowIds });
            }
          };
          const cancelChanges = () => {
            if (isNew) {
              cancelAddedRows({ rowIds });
            } else {
              stopEditRows({ rowIds });
              cancelChangedRows({ rowIds });
            }
          };

          const Popup = props.popupComponent;

          const open = editingRowIds.length > 0 || isNew;
          return (
            <Popup
              {...popupEditorComponentState}
              open={open}
              row={row}
              editedRow={editedRow}
              processValueChange={processValueChange}
              onApplyChanges={applyChanges}
              onCancelChanges={cancelChanges}
            />
          );
        }}
      </TemplateConnector>
    </Template>
    <Template name="root">
      <TemplatePlaceholder />
      <TemplatePlaceholder name="popupEditing" />
    </Template>
  </Plugin>
);
