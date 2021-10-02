"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateScalar = void 0;
const graphql_1 = require("graphql");
const config = {
    name: "Date",
    description: "ISO 8601 Date String",
    serialize(value) {
        return value.toISOString();
    },
    // ISO 8601
    parseValue(value) {
        return new Date(value);
    },
    parseLiteral(ast) {
        if (ast.kind === graphql_1.Kind.STRING) {
            return new Date(ast.value);
        }
        return null;
    },
};
exports.dateScalar = new graphql_1.GraphQLScalarType(config);
exports.default = exports.dateScalar;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZXNvbHZlcnMvc2NhbGFycy9EYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUEyRTtBQUUzRSxNQUFNLE1BQU0sR0FBMEM7SUFDcEQsSUFBSSxFQUFFLE1BQU07SUFDWixXQUFXLEVBQUUsc0JBQXNCO0lBQ25DLFNBQVMsQ0FBQyxLQUFXO1FBQ25CLE9BQU8sS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFDRCxXQUFXO0lBQ1gsVUFBVSxDQUFDLEtBQWE7UUFDdEIsT0FBTyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBQ0QsWUFBWSxDQUFDLEdBQUc7UUFDZCxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssY0FBSSxDQUFDLE1BQU0sRUFBRTtZQUM1QixPQUFPLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUM1QjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztDQUNGLENBQUM7QUFFVyxRQUFBLFVBQVUsR0FBRyxJQUFJLDJCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBRXhELGtCQUFlLGtCQUFVLENBQUMifQ==