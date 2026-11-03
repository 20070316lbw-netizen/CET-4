import { Importer } from './importer.mjs';
import { createInterface } from 'node:readline';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Store, loadExam, exam } from './store.mjs';
const base = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.CET4_ROOT ?? '/Users/liu/CET-4';
const stores = new Map();
async function getStore(id=exam.id){ if(!stores.has(id))stores.set(id,new Store(root,await loadExam(root,id)));return stores.get(id); }
const importer = new Importer(root);
const URI = 'ui://cet4-study/panel-v2.html';
const schema = { type: 'object', properties: {examId:{type:'string'}}, additionalProperties: false };
const operations = ['answer','draft','reveal','mark','note','collect','thought','remove','vocab','import_preview','import_read','import_update','import_commit'];
const tools = [
  { name: 'open_study', title: '打开四级精练', description: '打开四级试卷的刷题面板，examId 可选；返回试卷列表，返回题目、答题与标记状态。不会自动显示答案。', inputSchema: schema, outputSchema: { type:'object',additionalProperties:true }, annotations: {readOnlyHint:true,destructiveHint:false,openWorldHint:false}, _meta: { ui: { resourceUri: URI, visibility:['model','app'] }, 'openai/ui': { entrypoints:[{type:'thread'}] } } },
  { name:'read_study', title:'读取刷题记录', description:'读取试卷原文块及稳定编号、现有标记和笔记。助手标记前先读取原文，用 blockId 与 start/end 指定位置。', inputSchema:schema, outputSchema:{type:'object',additionalProperties:true}, annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}, _meta:{ui:{visibility:['model','app']}} },
  { name:'study_action', title:'保存刷题操作', description:'通过 args.examId 指定试卷。import_preview 传 path（学习目录内PDF）或 pdfBase64+filename，先提取识别预览；import_read 传 importId 读取原文和草稿；import_update 传 importId 与修正后的完整 paper；import_commit 仅在用户确认预览后传 importId、confirmed=true。不要自行编造缺失的题目或答案。保存答题、草稿、词句积累、标记及笔记。mark/collect 要提供 blockId、start/end（JS UTF-16下标）与精确原文 text。助手创建 mark/note 时 by=assistant；note 用 refs 引用 M- 编号。vocab 仅在用户要求收录时追加单词短语。reveal 仅在用户要求看答案时使用。', inputSchema:{type:'object',properties:{action:{type:'string',enum:operations},args:{type:'object',additionalProperties:true}},required:['action','args'],additionalProperties:false}, outputSchema:{type:'object',additionalProperties:true}, annotations:{readOnlyHint:false,destructiveHint:true,openWorldHint:false}, _meta:{ui:{visibility:['model','app']}} }
];
async function html() { return (await readFile(path.join(base,'web/index.html'),'utf8')).replace('/*__APP__*/',await readFile(path.join(base,'web/app.js'),'utf8')).replace('/*__CSS__*/',await readFile(path.join(base,'web/style.css'),'utf8')); }
async function call(name, args={}) {
  try {
    let value;
    if (['open_study','read_study'].includes(name)) value=await (await getStore(args.examId)).snapshot();
    else if(name==='study_action') {
      const a=args.args??{};
      if(args.action==='import_preview')value=await importer.preview(a);
      else if(args.action==='import_read')value=await importer.read(a.importId);
      else if(args.action==='import_update')value=await importer.update(a);
      else if(args.action==='import_commit'){const result=await importer.commit(a);value={...await (await getStore(result.examId)).snapshot(),result};}
      else value=await (await getStore(a.examId)).run(args.action,a);
    }
    else throw Error('未知工具');
    return {content:[{type:'text',text:name==='study_action'?'刷题记录已保存':'四级精练已就绪；答案默认隐藏。'}],structuredContent:value};
  } catch(e) { return {isError:true,content:[{type:'text',text:e.message}]}; }
}
async function dispatch(req) {
  const p=req.params??{};
  switch(req.method) {
    case 'initialize': return {protocolVersion: '2025-11-25',capabilities:{tools:{},resources:{}},serverInfo:{name:'cet4-study',version:'0.2.0'}};
    case 'ping': return {};
    case 'tools/list':return {tools};
    case 'tools/call':return call(p.name,p.arguments);
    case 'resources/list':return {resources:[{uri:URI,name:'四级精练',mimeType:'text/html;profile=mcp-app'}]};
    case 'resources/templates/list':return {resourceTemplates:[]};
    case 'resources/read':if(p.uri!==URI)throw Error('资源不存在');return {contents:[{uri:URI,mimeType:'text/html;profile=mcp-app',text:await html(),_meta:{ui:{prefersBorder:false,csp:{connectDomains:[],resourceDomains:[]}},'openai/ui':{availableDisplayModes:['inline','fullscreen']}}}]};
    default: throw Error(`不支持的方法: ${req.method}`);
  }
}
if(process.argv.includes('--preview')) {
  const server=createServer(async(req,res)=>{
    const host=req.headers.host;
    if(!host || !/^127\.0\.0\.1:\d+$/.test(host) || (req.headers.origin && req.headers.origin!==`http://${host}`)) {res.writeHead(403).end();return;}
    res.setHeader('cache-control','no-store'); res.setHeader('x-content-type-options','nosniff');
    try {
      if(req.url==='/' && req.method==='GET'){res.setHeader('content-type','text/html;charset=utf-8');res.end(await html());return;}
      if(req.url==='/api' && req.method==='POST' && req.headers['content-type']?.startsWith('application/json')){
        let body='';for await(const chunk of req){body+=chunk;if(body.length>44e6)throw Error('请求过大');}
        const {name,args}=JSON.parse(body);res.setHeader('content-type','application/json');res.end(JSON.stringify(await call(name,args)));return;
      }
      res.writeHead(404).end();
    }catch(e){res.writeHead(400,{'content-type':'application/json'}).end(JSON.stringify({error:e.message}));}
  });
  server.listen(Number(process.env.PORT??43184),'127.0.0.1',()=>console.error(`四级精练预览 http://127.0.0.1:${server.address().port}（数据目录 ${root}）`));
} else {
  const lines=createInterface({input:process.stdin,crlfDelay:Infinity});
  let queue=Promise.resolve();
  lines.on('line',line=>{queue=queue.then(async()=>{
    let req;try{req=JSON.parse(line);}catch{process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:null,error:{code:-32700,message:'Parse error'}})+'\n');return;}
    if(req.id===undefined)return;
    let response;try{response={jsonrpc:'2.0',id:req.id,result:await dispatch(req)};}catch(e){response={jsonrpc:'2.0',id:req.id,error:{code:-32601,message:e.message}};}
    process.stdout.write(JSON.stringify(response)+'\n');
  }).catch(e=>console.error(e));});
}
