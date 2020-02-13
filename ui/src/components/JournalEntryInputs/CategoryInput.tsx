import React, { useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@apollo/react-hooks";
import TextField, { TextFieldProps } from "@material-ui/core/TextField";
import Chip from "@material-ui/core/Chip";
import Box from "@material-ui/core/Box";
import Autocomplete, {
  AutocompleteProps,
  RenderInputParams
} from "@material-ui/lab/Autocomplete";
import ChevronRight from "@material-ui/icons/ChevronRight";
import gql from "graphql-tag";
import isEqual from "lodash.isequal";

import {
  CatInputOpts_1Query as CatInputOptsQuery,
  CatInputOptsCat_1Fragment as CatInputOptsCatFragment,
  JournalEntryType
} from "../../apollo/graphTypes";
import { Root } from "../../redux/reducers/root";
import { useDebounceDispatch } from "../../redux/hooks";
import {
  setCatInput,
  clearCatInput,
  clearCatValue,
  setCatOpen,
  setCatValue,
  validateCat
} from "../../redux/actions/journalEntryUpsert";
import {
  getCatInput,
  isRequired,
  isCatOpen,
  getCatError,
  getType,
  getCatValue
} from "../../redux/selectors/journalEntryUpsert";

const CAT_INPUT_OPTS_QUERY = gql`
  query CatInputOpts_1 {
    catOpts: journalEntryCategories {
      ...CatInputOptsCat_1Fragment
    }
  }
  fragment CatInputOptsCat_1Fragment on JournalEntryCategory {
    __typename
    id
    name
    type
    parent {
      id
    }
  }
`;

type Values = (JournalEntryType | CatInputOptsCatFragment)[];

// Static cbs for AutocompleteProps
const getOptionLabel = (opt: JournalEntryType | CatInputOptsCatFragment) => {
  if (typeof opt === "string") {
    return opt === JournalEntryType.Credit ? "Credit" : "Debit";
  }
  return opt.name;
};
const renderTags: AutocompleteProps["renderTags"] = (
  values: (CatInputOptsCatFragment | JournalEntryType)[],
  getTagProps
) => {
  const lastIndex = values.length - 1;
  return values.map((cat: any, index: number) => {
    const isLastIndex = lastIndex === index;
    return (
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="flex-start"
      >
        <Chip
          color={isLastIndex ? "primary" : "default"}
          disabled={!isLastIndex}
          variant={isLastIndex ? "default" : "outlined"}
          label={getOptionLabel(cat)}
          size="small"
          {...getTagProps({ index })}
        />{" "}
        {!isLastIndex && <ChevronRight fontSize="small" />}
      </Box>
    );
  });
};

interface SelectorResult {
  disabled: boolean;
  type: JournalEntryType | null;
  catId: string | null;
  catInput: string;
  required: boolean;
  open: boolean;
  hasError: boolean;
  errorMsg: string | null;
}

export interface CategoryInputProps {
  entryUpsertId: string;
  autoFocus?: boolean;
  variant?: "filled" | "outlined";
}

const CategoryInput = function(props: CategoryInputProps) {
  const { entryUpsertId, autoFocus = false, variant = "filled" } = props;

  const dispatch = useDebounceDispatch();

  const validate = useCallback(() => {
    dispatch(validateCat(entryUpsertId));
  }, [dispatch, entryUpsertId]);

  const onBlur = useCallback(() => {
    dispatch(setCatOpen(entryUpsertId, false));
    validate();
  }, [entryUpsertId, dispatch, validate]);
  const onFocus = useCallback(() => dispatch(setCatOpen(entryUpsertId, true)), [
    entryUpsertId,
    dispatch
  ]);
  const onClose = useCallback(() => {
    dispatch(setCatOpen(entryUpsertId, false));
    validate();
  }, [entryUpsertId, dispatch, validate]);
  const onOpen = useCallback(() => dispatch(setCatOpen(entryUpsertId, true)), [
    entryUpsertId,
    dispatch
  ]);

  const {
    disabled,
    type,
    catId,
    catInput,
    required,
    open,
    hasError,
    errorMsg
  } = useSelector<Root, SelectorResult>(state => {
    const error = getCatError(state, entryUpsertId);

    return {
      disabled: getType(state, entryUpsertId) === null,
      type: getType(state, entryUpsertId),
      catId: getCatValue(state, entryUpsertId),
      catInput: getCatInput(state, entryUpsertId),
      required: isRequired(state, entryUpsertId),
      open: isCatOpen(state, entryUpsertId),
      hasError: !!error,
      errorMsg: error?.message || null
    };
  }, isEqual);

  const { loading, error, data } = useQuery<CatInputOptsQuery>(
    CAT_INPUT_OPTS_QUERY
  );

  const catOpts = data?.catOpts || [];

  const values = useMemo<Values | []>(() => {
    if (type === null) {
      return [];
    }

    const values: CatInputOptsCatFragment[] = [];

    if (catId) {
      const searchCache = new Map<string, CatInputOptsCatFragment>();

      let findId: string | null = catId;

      for (const catOpt of catOpts) {
        if (catOpt.id === findId) {
          values.unshift(catOpt);

          findId = catOpt.parent?.id || null;

          while (findId && searchCache.has(findId)) {
            const catchedOpt = searchCache.get(
              findId
            ) as CatInputOptsCatFragment;

            values.unshift(catchedOpt);

            findId = catchedOpt.parent?.id || null;
          }

          if (!findId) {
            break;
          }

          continue;
        }

        searchCache.set(catOpt.id, catOpt);
      }
    }

    return values;
  }, [type, catOpts, catId]);

  const options = useMemo<Values>(() => {
    if (type === null) {
      return [];
    } else if (catId === null) {
      return catOpts.filter(opt => !opt.parent && opt.type === type);
    } else {
      return catOpts.filter(
        opt => opt.parent?.id === catId && opt.type === type
      );
    }
  }, [catOpts, catId, type]);

  const filterOptions = useCallback(
    (opts: (JournalEntryType | CatInputOptsCatFragment)[]) => {
      const searchStr = catInput
        .trimStart()
        .split(" ")
        .join("\\s");

      if (!searchStr) {
        return opts;
      }

      const test = new RegExp(`(^|\\s)${searchStr}`, "i");

      return opts.filter(opt => {
        if (typeof opt === "string") {
          return test.test(opt);
        }

        return test.test(opt.name);
      });
    },
    [catInput]
  );

  const hasOptions = options.length > 0;

  const onChange = useCallback(
    (event, value) => {
      dispatch(clearCatInput(entryUpsertId));

      if (!value || value?.length === 0) {
        dispatch(clearCatValue(entryUpsertId));

        return;
      }

      const val = Array.isArray(value) ? value[value.length - 1] : value;

      dispatch(setCatValue(entryUpsertId, val.id));
      validate();
    },
    [dispatch, entryUpsertId, validate]
  );

  const onInputChange = useCallback(
    (event: any, value: string) => {
      if (value) {
        dispatch(setCatInput(entryUpsertId, value));
      } else {
        dispatch(clearCatInput(entryUpsertId));
      }
    },
    [dispatch, entryUpsertId]
  );

  const textFieldProps: TextFieldProps = {
    required,
    autoFocus,
    fullWidth: true,
    label: "Category",
    variant,
    error: hasError,
    helperText: errorMsg
  };

  const renderInput = useCallback(
    (params: RenderInputParams) => {
      return <TextField {...textFieldProps} {...params} />;
    },
    [textFieldProps]
  );

  const autocompleteProps: AutocompleteProps = {
    disabled,
    loading,
    multiple: true,
    autoComplete: true,
    autoSelect: true,
    autoHighlight: true,
    disableCloseOnSelect: true,
    getOptionLabel,
    filterOptions,
    open,
    renderInput,
    options,
    onChange,
    onInputChange,
    value: values,
    inputValue: catInput,
    renderTags
  };

  if (error) {
    console.error(error);
    return <p>{error.message}</p>;
  }

  if (hasOptions) {
    autocompleteProps.onBlur = onBlur;
    autocompleteProps.onFocus = onFocus;
    autocompleteProps.onClose = onClose;
    autocompleteProps.onOpen = onOpen;
  } else {
    autocompleteProps.onBlur = validate as any;
    autocompleteProps.disabled = true;
    autocompleteProps.inputValue = "";
    autocompleteProps.open = false;
  }

  return <Autocomplete {...autocompleteProps} />;
};

export default CategoryInput;
