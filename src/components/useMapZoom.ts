import { useCallback,useLayoutEffect,useRef,useState,type RefObject } from 'react';
import { useStoreApi } from '@xyflow/react';
import { createZoomSync } from '../lib/zoomSync';

export function useMapZoom(container:RefObject<HTMLDivElement|null>){
 const store=useStoreApi(),[zoom,setZoom]=useState(()=>store.getState().transform[2]),flushRef=useRef(()=>{});
 useLayoutEffect(()=>{
  const sync=createZoomSync(inverse=>container.current?.style.setProperty('--map-inverse-zoom',String(inverse)),setZoom);
  sync.update(store.getState().transform[2]);flushRef.current=sync.flush;
  const unsubscribe=store.subscribe(state=>sync.update(state.transform[2]));
  return ()=>{unsubscribe();sync.dispose();flushRef.current=()=>{};};
 },[store,container]);
 const settleZoom=useCallback(()=>flushRef.current(),[]);
 return {zoom,settleZoom};
}
