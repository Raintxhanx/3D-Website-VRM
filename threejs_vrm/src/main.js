import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin  } from '@pixiv/three-vrm';

//Initialitation
let currentVRM = null;
const clock = new THREE.Clock();

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); 

// Camera
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.4, 2);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.4, 0);
controls.update();

// Light
const light = new THREE.DirectionalLight(0xffffff, 1.0);
light.position.set(1, 1, 1);
scene.add(light);

const directional = new THREE.DirectionalLight(0xffffff, 1.0);
directional.position.set(1, 2, 3);
scene.add(directional);

// Plane ground
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xf0f0f0 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // rotate agar horizontal
plane.position.y = 0; // di bawah kaki model
scene.add(plane);

  // Create a GLTFLoader - The loader for loading VRM models
  const loader = new GLTFLoader();

  // Install a GLTFLoader plugin that enables VRM support
  loader.register((parser) => {
    return new VRMLoaderPlugin(parser);
  });

  loader.load(
    // URL of the VRM you want to load
    '/2464006972577449610.vrm',

    // called when the resource is loaded
    (gltf) => {
      // retrieve a VRM instance from gltf
      const vrm = gltf.userData.vrm;

      // add the loaded vrm to the scene
      scene.add(vrm.scene);

      // globalVar
      currentVRM = vrm;

      // deal with vrm features
      console.log(vrm);
      
    },

    // called while loading is progressing
    (progress) => console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%'),

    // called when loading has errors
    (error) => console.error(error),
  );
  
// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const animate = () => {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (currentVRM) {
    // Contoh animasi: ayun tangan kanan
    const rightArm = currentVRM.humanoid.getBoneNode('rightUpperArm');
    if (rightArm) {
      rightArm.rotation.z = Math.sin(clock.elapsedTime * 2) * 0.5;
    }

    currentVRM.update(delta); // penting untuk update internal VRM
  }

  controls.update();
  renderer.render(scene, camera);
};
animate();
