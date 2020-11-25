import * as pathN from "path";

import { mergeTypeDefs } from "@graphql-tools/merge";
import { loadFilesSync } from "@graphql-tools/load-files";

const typesArray = loadFilesSync(
  pathN.resolve(__dirname, "../schema/**/*.gql")
);

export default mergeTypeDefs(typesArray);
