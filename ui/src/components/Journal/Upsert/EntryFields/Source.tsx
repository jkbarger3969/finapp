import React, { useCallback, useMemo, useState } from "react";
import Autocomplete, {
  AutocompleteProps,
  RenderInputParams
} from "@material-ui/lab/Autocomplete";
import { useField } from "formik";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { TextFieldProps, TextField, Box, Chip } from "@material-ui/core";
import { ChevronRight } from "@material-ui/icons";

import { JournalEntrySourceType } from "../../../../apollo/graphTypes";

export interface SourceProps {
  variant?: "filled" | "outlined";
  autoFocus?: boolean;
}

const Source = function(props: SourceProps) {};

export default Source;
