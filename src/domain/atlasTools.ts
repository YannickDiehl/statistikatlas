import {conceptById,concepts} from './concepts';
import {functionToConcept,mariposaVersion} from './mariposaCatalog';
export type AtlasTool={name:string;title:string;description:string;inputSchema:object;annotations:{readOnlyHint:boolean;untrustedContentHint:boolean};execute:(input:unknown)=>unknown|Promise<unknown>};
export type AtlasToolContext={registerTool:(tool:AtlasTool,options:{signal:AbortSignal})=>void|Promise<void>};
export function registerAtlasTools(context:AtlasToolContext|undefined,api:{read:()=>unknown;open:(id:string)=>void}){
 const lifecycle=new AbortController();if(!context?.registerTool)return ()=>{};
 const definitions:AtlasTool[]=[
 {name:'read_atlas_state',title:'Statistikatlas lesen',description:'Liest den geöffneten Baustein und die Auswahl im Statistikatlas.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>api.read()},
 {name:'open_atlas_concept',title:'Baustein in der Karte öffnen',description:'Öffnet einen Baustein und dessen Erklärung in derselben Netzkarte. Akzeptiert eine Konzept-ID oder einen öffentlichen mariposa-Funktionsnamen.',inputSchema:{type:'object',properties:{id:{type:'string',enum:[...concepts.map(c=>c.id),...Object.keys(functionToConcept)]}},required:['id'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:(input)=>{if(!input||typeof input!=='object'||!('id' in input)||typeof input.id!=='string')throw new Error('Eine Konzept-ID wird benötigt.');const id=functionToConcept[input.id]||input.id;if(!conceptById[id])throw new Error('Unbekannter Baustein.');api.open(id);return {opened:id,title:conceptById[id].title,mariposa:mariposaVersion};}}
 ];
 for(const tool of definitions)try{void Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}
 return ()=>lifecycle.abort();
}
