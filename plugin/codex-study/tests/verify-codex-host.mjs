// 用实际 Codex 插件加载器检查注册，不以直接启动 server.mjs 代替安装验证。
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import assert from 'node:assert/strict';
const child=spawn('codex',['app-server','--stdio'],{stdio:['pipe','pipe','ignore']});
const pending=new Map();let id=0;
const lines=createInterface({input:child.stdout});
lines.on('line',line=>{try{const m=JSON.parse(line);if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}}catch{}});
function request(method,params){const key=++id;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pending.delete(key);reject(Error(`${method} 超时`));},15000);pending.set(key,{resolve,reject,timer});child.stdin.write(JSON.stringify({id:key,method,params})+'\n');});}
try {
 await request('initialize',{clientInfo:{name:'cet4-registration-test',version:'0.1.0'},capabilities:{experimentalApi:true}});
 const {plugin}=await request('plugin/read',{pluginName:'cet4-study',marketplacePath:'/Users/liu/.agents/plugins/marketplace.json'});
 assert.ok(plugin.summary.installed && plugin.summary.enabled,'插件未安装或未启用');
 assert.ok(plugin.mcpServers.includes('study'),'插件说明已加载，但没有注册 study 服务');
 const {data}=await request('mcpServerStatus/list',{serverName:'study'});
 const server=data.find(s=>s.pluginId==='cet4-study@cet4-local');assert.ok(server,'服务未连接');assert.equal(server.toolsError,null);
 for(const name of ['open_study','read_study','study_action'])assert.ok(server.tools[name],`缺少工具 ${name}`);
 assert.ok(server.tools.study_action.inputSchema.properties.action.enum.includes('import_preview'),'导入操作未载入');
 assert.ok(server.tools.read_study.inputSchema.properties.examId,'缺少多试卷参数');
 assert.equal(server.tools.open_study._meta['openai/ui'].entrypoints[0].type,'thread');
 assert.ok(server.resources.some(r=>r.uri==='ui://cet4-study/panel-v2.html'));
 console.log('PASS · Codex实际加载器已安装、启用并连接四级精练；3个工具与面板资源均已注册。');
} finally {
 child.kill();lines.close();for(const p of pending.values())clearTimeout(p.timer);
}
