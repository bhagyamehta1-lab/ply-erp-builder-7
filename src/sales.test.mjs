import test from 'node:test';
import assert from 'node:assert/strict';
export function validateCreditLimit({outstanding,orderValue,creditLimit}) {
 if (![outstanding,orderValue,creditLimit].every(Number.isFinite)||outstanding<0||orderValue<0||creditLimit<0) throw new Error('Invalid credit values');
 return outstanding+orderValue<=creditLimit;
}
export function allocateOrderLines(lines,availableByLot) {
 if (!Array.isArray(lines)||!lines.length) throw new Error('Sales order lines required');
 return lines.map(line=>{
  if (!line.productId||!Number.isFinite(line.quantity)||line.quantity<=0) throw new Error('Invalid sales order line');
  const available=availableByLot[line.lotId]??0;
  if (line.quantity>available) throw new Error('Insufficient lot quantity');
  availableByLot[line.lotId]=available-line.quantity;
  return Object.freeze({...line,allocatedQuantity:line.quantity});
 });
}
export function dispatchRemainder(ordered,alreadyDispatched) {
 if (![ordered,alreadyDispatched].every(Number.isFinite)||ordered<=0||alreadyDispatched<0||alreadyDispatched>ordered) throw new Error('Invalid dispatch quantities');
 return ordered-alreadyDispatched;
}
test('credit checks include existing outstanding balance',()=>{
 assert.equal(validateCreditLimit({outstanding:50,orderValue:40,creditLimit:100}),true);
 assert.equal(validateCreditLimit({outstanding:80,orderValue:40,creditLimit:100}),false);
});
test('lot allocation rejects quantities beyond availability',()=>{
 assert.equal(allocateOrderLines([{productId:'P',lotId:'L',quantity:3}],{L:5})[0].allocatedQuantity,3);
 assert.throws(()=>allocateOrderLines([{productId:'P',lotId:'L',quantity:6}],{L:5}));
});
test('partial dispatch exposes remaining quantity',()=>assert.equal(dispatchRemainder(10,4),6));