import mergeWith from 'lodash.mergewith';

// Objects or arrays with this symbol replace Objects or arrays with the same
// on the target object instead of being merged
const REPLACE_WITH = Symbol();
export const replaceWith = function<TSource extends object | Array<any>>(
  source:TSource):TSource 
{
  source[REPLACE_WITH] = REPLACE_WITH;
  return source;
}

const replaceWithCustomizer = (v:any, srcValue:any) => 
  typeof srcValue === 'object' && srcValue !== null && REPLACE_WITH in srcValue
  ? srcValue : undefined;

export function merge<TObject, TSource>(object: TObject, source: TSource):TObject & TSource;
export function merge<TObject, TSource1, TSource2>(object: TObject, source1: TSource1, source2: TSource2): TObject & TSource1 & TSource2;
export function merge<TObject, TSource1, TSource2, TSource3>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3):TObject & TSource1 & TSource2 & TSource3;
export function merge<TObject, TSource1, TSource2, TSource3, TSource4>(object: TObject, source1: TSource1,source2: TSource2, source3: TSource3, source4: TSource4):TObject & TSource1 & TSource2 & TSource3 & TSource4;
export function merge<TObject, TSource1, TSource2, TSource3, TSource4, TSource5>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3, source4: TSource4, TSource5):TObject & TSource1 & TSource2 & TSource3 & TSource4 & TSource5;
export function merge<TObject, TSource1, TSource2, TSource3, TSource4, TSource5, TSource6>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3, source4: TSource4, TSource5, TSource6):TObject & TSource1 & TSource2 & TSource3 & TSource4 & TSource5 & TSource6;
export function merge<TObject, TSource1, TSource2, TSource3, TSource4, TSource5, TSource6, TSource7>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3, source4: TSource4, TSource5, TSource6, TSource7):TObject & TSource1 & TSource2 & TSource3 & TSource4 & TSource5 & TSource6 & TSource7;
export function merge<TObject, TSource1, TSource2, TSource3, TSource4, TSource5, TSource6, TSource7>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3, source4: TSource4, TSource5, TSource6, TSource7):TObject & TSource1 & TSource2 & TSource3 & TSource4 & TSource5 & TSource6 & TSource7;
export function merge<TObject, TSource1, TSource2, TSource3, TSource4, TSource5, TSource6, TSource7, TSource8>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3, source4: TSource4, TSource5, TSource6, TSource7, TSource8):TObject & TSource1 & TSource2 & TSource3 & TSource4 & TSource5 & TSource6 & TSource7 & TSource8;
export function merge<TObject, TSource1, TSource2, TSource3, TSource4, TSource5, TSource6, TSource7, TSource8, TSource9>(object: TObject, source1: TSource1, source2: TSource2, source3: TSource3, source4: TSource4, TSource5, TSource6, TSource7, TSource8, TSource9):TObject & TSource1 & TSource2 & TSource3 & TSource4 & TSource5 & TSource6 & TSource7 & TSource8 & TSource9;
// If you are merging more than 10 objects... please stop
export default function merge(object, ...source) {
  return mergeWith(object, ...source, replaceWithCustomizer);
}