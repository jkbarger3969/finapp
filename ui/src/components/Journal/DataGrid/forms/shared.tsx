import React from "react";

export const preventDefaultFormSubmit: React.FormEventHandler<HTMLFormElement> = (
  event
) => event.preventDefault();
