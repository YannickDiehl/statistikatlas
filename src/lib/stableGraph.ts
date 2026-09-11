function shallow(a:object|undefined,b:object|undefined){if(a===b)return true;if(!a||!b)return false;const keys=Object.keys(a);return keys.length===Object.keys(b).length&&keys.every(key=>Object.is((a as Record<string,unknown>)[key],(b as Record<string,unknown>)[key]));}
export function retainGraphItems<T extends {id:string;data?:object;style?:object}>(previous:T[],next:T[]):T[]{
 const oldById=new Map(previous.map(item=>[item.id,item]));
 const result=next.map(item=>{const old=oldById.get(item.id);if(!old)return item;
  const keys=Object.keys(item) as (keyof T)[];
  return keys.length===Object.keys(old).length&&keys.every(key=>key==='data'||key==='style'?shallow(old[key] as object,item[key] as object):Object.is(old[key],item[key]))?old:item;
 });
 return result.length===previous.length&&result.every((item,i)=>item===previous[i])?previous:result;
}
