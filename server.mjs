import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('.');
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json'};
const server=http.createServer(async(req,res)=>{
  try {
    let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(path==='/')path='/app/index.html';
    if(!path.startsWith('/app/')&&!path.startsWith('/node_modules/')){res.writeHead(404).end();return;}
    const file=resolve(root,'.'+path);
    if(!file.startsWith(root+sep)){res.writeHead(403).end();return;}
    res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');
    res.end(await readFile(file));
  }catch{res.writeHead(404).end('Not found');}
});
const port=Number(process.env.PORT||4317);
server.listen(port,'127.0.0.1',()=>console.log(`NashZone: http://127.0.0.1:${server.address().port}`));
