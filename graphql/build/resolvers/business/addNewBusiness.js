"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNewBusinessRecord = void 0;
const addNewBusinessRecord = ({ newBusiness, accountingDb, }) => {
    const newBusinessRecord = {
        name: newBusiness.name,
    };
    return accountingDb.insertOne({
        collection: "businesses",
        doc: newBusinessRecord,
    });
};
exports.addNewBusinessRecord = addNewBusinessRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkTmV3QnVzaW5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcmVzb2x2ZXJzL2J1c2luZXNzL2FkZE5ld0J1c2luZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUlPLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxFQUNuQyxXQUFXLEVBQ1gsWUFBWSxHQUliLEVBQUUsRUFBRTtJQUNILE1BQU0saUJBQWlCLEdBQWtDO1FBQ3ZELElBQUksRUFBRSxXQUFXLENBQUMsSUFBSTtLQUN2QixDQUFDO0lBRUYsT0FBTyxZQUFZLENBQUMsU0FBUyxDQUFDO1FBQzVCLFVBQVUsRUFBRSxZQUFZO1FBQ3hCLEdBQUcsRUFBRSxpQkFBaUI7S0FDdkIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDO0FBZlcsUUFBQSxvQkFBb0Isd0JBZS9CIn0=