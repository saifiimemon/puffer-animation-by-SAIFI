import {useMemo} from 'react';
import {useLoader} from '@react-three/fiber';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export const variants=[
 {name:'Glacier',color:'#bed1dd',bg:'#455f70',accent:'#d5e6ed',file:'/models/glacier.glb',desc:'Cool precision. Effortless presence.'},
 {name:'Onyx',color:'#202422',bg:'#484d45',accent:'#d2c9ac',file:'/models/onyx.glb',desc:'Quiet confidence, after dark.'},
 {name:'Ember',color:'#f27612',bg:'#724631',accent:'#f5be86',file:'/models/ember.glb',desc:'Bring a little heat to the cold.'},
 {name:'Volt',color:'#d0e246',bg:'#414b38',accent:'#d8e993',file:'/models/volt.glb',desc:'A flash of energy. A grounded finish.'},
];

export function prepareModel(source:THREE.Group){
 const scene=source.clone(true);
 scene.rotation.y=-Math.PI/2;
 scene.updateMatrixWorld(true);
 const box=new THREE.Box3().setFromObject(scene);
 const center=box.getCenter(new THREE.Vector3());
 const size=box.getSize(new THREE.Vector3());
 const root=new THREE.Group();root.add(scene);
 scene.position.sub(center);
 root.scale.setScalar(2.85/size.y);
 root.position.y=-.14;
 scene.traverse(object=>{
  if(!(object instanceof THREE.Mesh))return;
  object.castShadow=true;object.receiveShadow=true;
  const tune=(base:THREE.Material)=>{
   if(!(base instanceof THREE.MeshStandardMaterial))return base;
   const material=new THREE.MeshPhysicalMaterial();
   THREE.MeshStandardMaterial.prototype.copy.call(material,base);
   // Retain authored PBR maps and colors. Broad softboxes define the finish.
   material.metalness=Math.min(base.metalness,.22);
   material.roughness=.94;
   material.clearcoat=.16;material.clearcoatRoughness=.34;
   material.envMapIntensity=.8;
   material.normalScale.multiplyScalar(.75);
   material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor = max(roughnessFactor, 0.27);');
   };
   material.customProgramCacheKey=()=> 'puffer-satin-v1';
   return material;
  };
  object.material=Array.isArray(object.material)?object.material.map(tune):tune(object.material);
 });
 return root;
}
export function ProductModel({index}:{index:number}){
 const gltf=useLoader(GLTFLoader,variants[index].file,loader=>loader.setMeshoptDecoder(MeshoptDecoder));
 const root=useMemo(()=>prepareModel(gltf.scene),[gltf.scene]);
 return <primitive object={root} dispose={null}/>;
}
