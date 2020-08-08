import React from "react";
import { CircularProgress, Theme } from "@material-ui/core";

import Overlay from "./Overlay";

const OverlayLoading = (props: {
  zIndex: keyof Theme["zIndex"] | number;
}): JSX.Element => {
  return <Overlay {...props}>{<CircularProgress />}</Overlay>;
};

export default OverlayLoading;
