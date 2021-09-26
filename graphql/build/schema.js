"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pathN = require("path");
const merge_1 = require("@graphql-tools/merge");
const load_files_1 = require("@graphql-tools/load-files");
const typesArray = (0, load_files_1.loadFilesSync)(pathN.resolve(__dirname, "../schema/**/*.gql"));
exports.default = (0, merge_1.mergeTypeDefs)(typesArray);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZW1hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NjaGVtYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhCQUE4QjtBQUU5QixnREFBcUQ7QUFDckQsMERBQTBEO0FBRTFELE1BQU0sVUFBVSxHQUFHLElBQUEsMEJBQWEsRUFDOUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsb0JBQW9CLENBQUMsQ0FDL0MsQ0FBQztBQUVGLGtCQUFlLElBQUEscUJBQWEsRUFBQyxVQUFVLENBQUMsQ0FBQyJ9