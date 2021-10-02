"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rationalScalar = void 0;
const graphql_1 = require("graphql");
const fraction_js_1 = require("fraction.js");
const config = {
    name: "Rational",
    description: `Rational Number JSON String: "{"s":-1|1,"n":Int,"d":Int}"`,
    serialize(value) {
        return JSON.stringify(value);
    },
    // JSON "{"s":-1|1,"n":Int,"d":Int}"
    parseValue(value) {
        return new fraction_js_1.default(JSON.parse(value));
    },
    parseLiteral(ast) {
        if (ast.kind === graphql_1.Kind.STRING) {
            return new fraction_js_1.default(JSON.parse(ast.value));
        }
        return null; // Invalid
    },
};
exports.rationalScalar = new graphql_1.GraphQLScalarType(config);
exports.default = exports.rationalScalar;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmF0aW9uYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL3NjYWxhcnMvUmF0aW9uYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUNBQTJFO0FBQzNFLDZDQUFtQztBQUVuQyxNQUFNLE1BQU0sR0FBOEM7SUFDeEQsSUFBSSxFQUFFLFVBQVU7SUFDaEIsV0FBVyxFQUFFLDJEQUEyRDtJQUN4RSxTQUFTLENBQUMsS0FBZTtRQUN2QixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUNELG9DQUFvQztJQUNwQyxVQUFVLENBQUMsS0FBYTtRQUN0QixPQUFPLElBQUkscUJBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUNELFlBQVksQ0FBQyxHQUFHO1FBQ2QsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLGNBQUksQ0FBQyxNQUFNLEVBQUU7WUFDNUIsT0FBTyxJQUFJLHFCQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUM1QztRQUNELE9BQU8sSUFBSSxDQUFDLENBQUMsVUFBVTtJQUN6QixDQUFDO0NBQ0YsQ0FBQztBQUVXLFFBQUEsY0FBYyxHQUFHLElBQUksMkJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7QUFFNUQsa0JBQWUsc0JBQWMsQ0FBQyJ9