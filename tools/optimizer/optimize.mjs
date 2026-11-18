import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dedup,prune,weld,simplify,textureCompress,meshopt} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder,MeshoptSimplifier} from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'node:fs/promises';
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const source=(process.argv[2] || './original-models').replace(/\/$/,'')+'/';const output=(process.argv[3] || './public/models').replace(/\/$/,'')+'/';await fs.mkdir(output,{recursive:true});
const pairs=[['extracted_model (2).glb','glacier'],['extracted_model.glb','onyx'],['extracted_model (1).glb','ember'],['extracted_model (3).glb','volt']];const report=[];
for(const [file,name] of pairs){
 const doc=await io.read(source+file);const tris=()=>doc.getRoot().listMeshes().reduce((sum,m)=>sum+m.listPrimitives().reduce((s,p)=>s+(p.getIndices()?.getCount()??p.getAttribute('POSITION').getCount())/3,0),0);const before=tris();
 await doc.transform(dedup(),weld(),simplify({simplifier:MeshoptSimplifier,ratio:.045,error:.007,lockBorder:false}),prune(),textureCompress({encoder:sharp,targetFormat:'webp',resize:[2048,2048],quality:88,slots:/baseColorTexture/}),textureCompress({encoder:sharp,targetFormat:'webp',resize:[1024,1024],quality:88,slots:/normalTexture|metallicRoughnessTexture|occlusionTexture/}));
 const after=tris();await doc.transform(meshopt({encoder:MeshoptEncoder,level:'high'}));await io.write(output+name+'.glb',doc);
 const item={source:file,output:name+'.glb',originalBytes:(await fs.stat(source+file)).size,optimizedBytes:(await fs.stat(output+name+'.glb')).size,originalTriangles:before,optimizedTriangles:after};report.push(item);console.log(JSON.stringify(item));
}
await fs.writeFile('optimization-report.json',JSON.stringify(report,null,2));
