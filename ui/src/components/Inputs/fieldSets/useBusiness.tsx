import { TextFieldProps } from "@material-ui/core";

import { UseFieldOptions } from "../../../useKISSForm/form";
import { PhoneProps, PhoneFieldDef } from "../Phone";
import {
  MailingAddressProps,
  MailingAddressFieldDef,
} from "./useMailingAddress";

export type BusinessProps = {
  showLabels?: boolean;
  insertNamePrefix?: string;
  required?: boolean;
  shouldUnregister?: boolean;
  mailingAddress?: Omit<MailingAddressProps, "form" | "name">;
  phone?: Omit<PhoneProps, "form" | "name">;
} & Partial<
  Pick<
    TextFieldProps,
    | "color"
    | "disabled"
    | "fullWidth"
    | "hiddenLabel"
    | "margin"
    | "required"
    | "size"
    | "variant"
  >
> &
  Pick<UseFieldOptions, "form">;

export type BusinessFieldDef = {
  business: MailingAddressFieldDef & PhoneFieldDef;
};

export const BUSINESS_NAME_PREFIX: keyof BusinessFieldDef = "business";

/* export const useBusiness = (props: BusinessProps) => {
  const {
    showLabels,
    insertNamePrefix,
    required,
    form,
    mailingAddress: mailingAddressProps,
    phone: phoneProps,
    ...rest
  } = props;
};
 */
