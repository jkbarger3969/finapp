import Fraction from "fraction.js";

const convertRational = (rational) => ({...(new Fraction({
    n:rational.num,
    d:rational.den,
}))});

const results = [];

db.budgets.find({}).forEach((it)=> { 
    const $set = {};
    if(it.amount && it.amount.num !== undefined) {
        $set.amount = convertRational(it.amount)
    }
    if(Object.keys($set).length > 0) {
        const result = db.budgets.updateOne({_id:it._id},{$set});
        results.push(result);
    }
});

db.journalEntries.find({}).forEach((it)=> {
    const $set = {};
    if(it.total) {
        $set.total = it.total.map((total) => {
        
            if(total.value.num !== undefined) {
                total.value = convertRational(total.value);
                
            }
            return total;
            
        });
    }
   
    if(it.refunds) {
        $set.refunds = it.refunds.map((refund) => {
            if(refund.total) {
                
                refund.total = refund.total.map((total) => {
            
                    if(total.value.num !== undefined) {
                        total.value = convertRational(total.value);
                        
                    }
                    return total;
                    
                });
            }
            
            return refund;
            
        });
    }
    
    if(it.items) {
        $set.items =  it.items.map((item) => {
            if(item.total) {
                
                item.total = item.total.map((total) => {
            
                    if(total.value.num !== undefined) {
                        total.value = convertRational(total.value);
                        
                    }
                    return total;
                    
                });
            }
            
            return item;
            
        });
        
    }
    
    if(Object.keys($set).length > 0) {
        const result = db.journalEntries.updateOne({_id:it._id},{$set});
        results.push(result);
    }
     
});

results;