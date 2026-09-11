type Timers={later:(callback:()=>void)=>unknown;cancel:(handle:unknown)=>void};
const timers:Timers={later:callback=>setTimeout(callback,100),cancel:handle=>clearTimeout(handle as ReturnType<typeof setTimeout>)};
// Smooth visual scale on each frame; expensive layout only after the gesture.
export function createZoomSync(writeScale:(inverse:number)=>void,settle:(zoom:number)=>void,clock:Timers=timers){
 let zoom=NaN,pending:unknown,disposed=false;
 function cancel(){if(pending!==undefined){clock.cancel(pending);pending=undefined;}}
 function flush(){cancel();if(!disposed&&Number.isFinite(zoom))settle(zoom);}
 return {update(next:number){if(disposed||!Number.isFinite(next)||next<=0||next===zoom)return;zoom=next;writeScale(1/zoom);cancel();pending=clock.later(flush);},flush,dispose(){disposed=true;cancel();}};
}
