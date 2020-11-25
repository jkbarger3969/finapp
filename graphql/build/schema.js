"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pathN = require("path");
const merge_1 = require("@graphql-tools/merge");
const load_files_1 = require("@graphql-tools/load-files");
const typesArray = load_files_1.loadFilesSync(pathN.resolve(__dirname, "../schema/**/*.gql"));
exports.default = merge_1.mergeTypeDefs(typesArray);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZW1hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NjaGVtYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhCQUE4QjtBQUU5QixnREFBcUQ7QUFDckQsMERBQTBEO0FBRTFELE1BQU0sVUFBVSxHQUFHLDBCQUFhLENBQzlCLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLG9CQUFvQixDQUFDLENBQy9DLENBQUM7QUFFRixrQkFBZSxxQkFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDIn0=