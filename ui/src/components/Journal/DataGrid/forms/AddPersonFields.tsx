import React, { useCallback } from "react";
import { Grid, TextField, TextFieldProps } from "@material-ui/core";
import { FormikErrors, useFormik } from "formik";

import { inputGridContainerProps } from "./shared";
import { DeepNonNullable, DeepRequired } from "ts-essentials";

export type AddPersonValues = {
  person?: {
    name?: {
      first?: string;
      last?: string;
    };
    email?: string;
    phone?: string;
  };
};

export const initialValues: AddPersonValues = {
  person: {
    name: {
      first: "",
      last: "",
    },
    email: "",
    phone: "",
  },
};

export const validate = function <T extends AddPersonValues>(
  values: T,
  errors: FormikErrors<T> = {}
): FormikErrors<T> {
  if (!values.person?.name?.first) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((errors.person ||= {} as any).name ||= {}).first = "Required.";
  }

  if (!values.person?.name?.last) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((errors.person ||= {} as any).name ||= {}).last = "Required.";
  }

  if (!values.person?.email && !values.person?.phone) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (errors.person ||= {} as any).email = "Email or Phone Required.";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (errors.person as any).phone = "Phone or Email Required.";
  }

  return errors;
};

const _formikReturnType = <T extends AddPersonValues>() =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFormik<T>({} as any);
type UseFormikReturn = ReturnType<typeof _formikReturnType>;

export type AddPersonFieldsProps = {
  formik: UseFormikReturn;
  onChange?: TextFieldProps["onChange"];
  disabled?: boolean;
};

const AddPersonFields = (props: AddPersonFieldsProps): JSX.Element => {
  const { formik, onChange } = props;

  const { handleChange: handelChangeFormik } = formik;

  const handleChange = useCallback<NonNullable<TextFieldProps["onChange"]>>(
    (...args) => {
      handelChangeFormik(...args);

      if (onChange) {
        onChange(...args);
      }
    },
    [handelChangeFormik, onChange]
  );

  const errors = formik.errors as FormikErrors<
    DeepRequired<DeepNonNullable<AddPersonValues>>
  >;

  return (
    <Grid container spacing={2}>
      <Grid {...inputGridContainerProps} justify="center" container>
        <TextField
          fullWidth
          variant="filled"
          required
          name="person.name.first"
          label="First Name"
          onChange={handleChange}
          value={formik.values?.person?.name?.first ?? ""}
          onBlur={formik.handleBlur}
          error={!!errors.person}
          helperText={errors?.person?.name?.first}
          disabled={!!props.disabled}
        />
      </Grid>
      <Grid {...inputGridContainerProps} justify="center" container>
        <TextField
          fullWidth
          variant="filled"
          label="Last Name"
          required
          name="person.name.last"
          onChange={handleChange}
          value={formik.values?.person?.name?.last ?? ""}
          onBlur={formik.handleBlur}
          error={!!errors.person?.name?.last}
          helperText={errors.person?.name?.last}
          disabled={!!props.disabled}
        />
      </Grid>
      <Grid {...inputGridContainerProps} justify="center" container>
        <TextField
          fullWidth
          variant="filled"
          label="Email"
          required={!formik.values?.person?.phone}
          name="person.email"
          onChange={handleChange}
          value={formik.values?.person?.email ?? ""}
          onBlur={formik.handleBlur}
          error={!!errors.person?.email}
          helperText={errors.person?.email}
          disabled={!!props.disabled}
        />
      </Grid>
      <Grid {...inputGridContainerProps} justify="center" container>
        <TextField
          fullWidth
          variant="filled"
          label="Phone"
          required={!formik.values?.person?.email}
          name="person.phone"
          onChange={handleChange}
          value={formik.values?.person?.phone ?? ""}
          onBlur={formik.handleBlur}
          error={!!errors.person?.phone}
          helperText={errors.person?.phone}
          disabled={!!props.disabled}
        />
      </Grid>
    </Grid>
  );
};

export default AddPersonFields;
