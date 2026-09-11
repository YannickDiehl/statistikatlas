import { useLayoutEffect,useRef,useState } from 'react';
// Memoized children get stable callbacks without closing over old form/data state.
export function useStableActions<T extends Record<string,(...args:any[])=>any>>(actions:T):T{
 const latest=useRef(actions);
 useLayoutEffect(()=>{latest.current=actions;});
 const [stable]=useState(()=>Object.fromEntries(Object.keys(actions).map(key=>[key,(...args:unknown[])=>latest.current[key](...args)])) as T);
 return stable;
}
