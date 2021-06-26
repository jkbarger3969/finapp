import React, { useMemo } from "react";
import {
  makeStyles,
  createStyles,
  Button,
  ButtonProps,
  IconButton,
  IconButtonProps,
  CircularProgress,
  CircularProgressProps,
  Box,
} from "@material-ui/core";

const useStyles = makeStyles(() =>
  createStyles({
    asyncButton: {
      position: "relative",
    },
  })
);

interface AsyncButtonProgressProps {
  showProgress?: boolean;
  progressColor?: CircularProgressProps["color"];
}

export type AsyncButtonProps = ButtonProps & AsyncButtonProgressProps;

const AsyncButtonInner = (
  props: AsyncButtonProps,
  ref: React.Ref<HTMLButtonElement>
): JSX.Element => {
  const classes = useStyles();

  const {
    showProgress = false,
    progressColor = "inherit",
    className = "",
    children,
    size,
    disabled,
    ...buttonProps
  } = props;

  const progressSize = useMemo(() => {
    switch (size) {
      case "medium":
        return 20;
      case "small":
        return 16;
      case "large":
        return 24;
      default:
        return 20;
    }
  }, [size]);

  return (
    <Button
      {...buttonProps}
      ref={ref}
      className={`${className} ${classes.asyncButton}`}
      size={size}
      disabled={disabled || showProgress}
    >
      {showProgress && (
        <Box
          position="absolute"
          display="flex"
          justifyContent="center"
          alignItems="center"
          top={0}
          bottom={0}
          left={0}
          right={0}
        >
          <CircularProgress color={progressColor} size={progressSize} />
        </Box>
      )}
      {children}
    </Button>
  );
};

export const AsyncButton = React.forwardRef(AsyncButtonInner);

export type AsyncIconButtonProps = IconButtonProps & AsyncButtonProgressProps;

const AsyncIconButtonInner = (
  props: AsyncIconButtonProps,
  ref: React.Ref<HTMLButtonElement>
): JSX.Element => {
  const classes = useStyles();

  const {
    showProgress = false,
    progressColor = "inherit",
    className = "",
    children,
    disabled,
    size,
    ...iconButtonProps
  } = props;

  return (
    <IconButton
      {...iconButtonProps}
      ref={ref}
      className={`${className} ${classes.asyncButton}`}
      size={size}
      disabled={disabled || showProgress}
    >
      {showProgress && (
        <Box
          position="absolute"
          display="flex"
          justifyContent="center"
          alignItems="center"
          top={0}
          bottom={0}
          left={0}
          right={0}
        >
          <CircularProgress
            color={progressColor}
            size={size === "small" ? 24 : 40}
          />
        </Box>
      )}
      {children}
    </IconButton>
  );
};

export const AsyncIconButton = React.forwardRef(AsyncIconButtonInner);
