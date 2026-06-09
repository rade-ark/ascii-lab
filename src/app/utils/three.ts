// Centralized Three.js imports to prevent multiple instances
import * as THREE from 'three';

// Core Three.js exports
export * from 'three';
export { THREE };

// Additional imports for examples
export { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
export { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
export { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
export { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
export { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
export { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';