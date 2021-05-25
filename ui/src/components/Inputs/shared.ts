import { QueryHookOptions as QueryHookOptionsApollo } from "@apollo/client";

export type QueryHookOptions = Omit<QueryHookOptionsApollo, "variables">;
