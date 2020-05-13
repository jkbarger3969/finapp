import React from "react";
import { useTheme, Box, BoxProps, Theme } from "@material-ui/core";
import { fade } from "@material-ui/core/styles/colorManipulator";

const Overlay = (
  props: {
    children: React.ReactNode;
    zIndex: keyof Theme["zIndex"] | number;
    opacity?: number;
  } & Pick<
    BoxProps,
    | "p"
    | "pt"
    | "pr"
    | "pb"
    | "pl"
    | "px"
    | "py"
    | "padding"
    | "paddingTop"
    | "paddingRight"
    | "paddingBottom"
    | "paddingLeft"
    | "paddingX"
    | "paddingY"
  >
) => {
  const theme = useTheme();

  const { opacity = 0.62, ...boxProps } = props;

  return (
    <Box
      {...boxProps}
      overflow="auto"
      position="absolute"
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="100%"
      top="0px"
      bottom="0px"
      bgcolor={fade(theme.palette.background.paper, opacity)}
    />
  );
};

export default Overlay;
