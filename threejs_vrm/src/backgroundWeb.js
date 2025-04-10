import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin  } from '@pixiv/three-vrm';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcce0ff);

const camera = new THREE.PerspectiveCamera(
  75, 
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('bg'),
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Kontrol
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enabled = false; // disable dulu agar user tidak ganggu saat animasi

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

// Generate blocks with varied height
function createBlock(x, z) {
  const width = 3;
  const depth = 3;
  const height = Math.random() * 20 + 1;

  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({ color: 0x55aa55 });
  const cube = new THREE.Mesh(geometry, material);

  cube.position.set(x, height / 2, z);
  return cube;
}

// Generate Block Utama
function BlockUtama(){
  const geometry = new THREE.BoxGeometry(7, 60, 7);
  const material = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(0,30,0)
  scene.add(cube)
}

BlockUtama();

// Plane
const geometry = new THREE.PlaneGeometry(200, 200); // ukuran bidang
const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
const plane = new THREE.Mesh(geometry, material);

plane.rotation.x = -Math.PI / 2;

plane.receiveShadow = true;

// Tambahkan ke scene
scene.add(plane);

// Add blocks in a grid
const gridSize = 10;
for (let i = -gridSize; i <= gridSize; i++) {
  for (let j = -gridSize; j <= gridSize; j++) {
    if (Math.random() < 0.3) {
      const block = createBlock(i * 7, j * 8);
      scene.add(block);
    }
  }
}

// Kamera awal
camera.position.set(0, 100, 0);
controls.target.set(0,0,0);
const lookTarget = new THREE.Vector3(0, 0, 0);

// Memulai loading semua aset
//loadVRMModel().then((vrm) => {
// Semua sudah dimuat, mulai animasi dan tampilkan UI
  gsap.to(camera.position, {
    duration: 3,
    x: -25.43,
    y: 32.19,
    z: 10.32,
    ease: "power2.out",
    onUpdate: () => {
      controls.target.copy(lookTarget);
      controls.update();  
    },
    onComplete: () => {
      controls.enabled = true;
      document.getElementById('content').classList.remove('hidden');
      document.getElementById('myButton').classList.remove('hidden');
    }
  });

  // Target kamera
  gsap.to(lookTarget, {
    duration: 3,
    x: 10.53,
    y: 32.32,
    z: 31.39,
    ease: "power2.out",
});

//}).catch((error) => {
//  console.error('Gagal load semua objek:', error);
//});

// Scene Kamera 1
function sceneCamera1(){
gsap.to(camera.position, {
    duration: 3,
    x: 73.61,
    y: 2.00,
    z: -94.87,
    ease: "power2.out",
    onUpdate: () => {
      controls.target.copy(lookTarget); // update setiap frame
      controls.update();  
    },
    onComplete: () => {
      controls.enabled = true; // nyalakan kontrol setelah animasi selesai
      document.getElementById('content').classList.remove('hidden');
      document.getElementById('ButtonScene1').classList.remove('hidden');
      document.getElementById('ButtonScene2').classList.remove('hidden');
    }
  });

// Animasi target arah pandang
gsap.to(lookTarget, {
    duration: 3,
    x: 34.51,
    y: -2.69,
    z: -55.05,
    ease: "power2.out",
});
}

// Display posisi kamera
const infoDiv = document.getElementById('info');
let lastCameraPos = new THREE.Vector3();
let lastTarget = new THREE.Vector3();

// Update posisi kamera dan target
function updateInfo() {
  const pos = camera.position;
  const target = controls.target;

  // Cek apakah posisi berubah
  if (!pos.equals(lastCameraPos) || !target.equals(lastTarget)) {
    infoDiv.innerText =
      `Camera: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})\n` +
      `Look At: (${target.x.toFixed(2)}, ${target.y.toFixed(2)}, ${target.z.toFixed(2)})`;

    // Simpan posisi terakhir
    lastCameraPos.copy(pos);
    lastTarget.copy(target);
  }
}

let currentVRM = null; // Global reference untuk model yang sedang aktif

function removeVRMModel() {
  if (currentVRM) {
    scene.remove(currentVRM.scene); // Hapus dari scene
    currentVRM.scene.traverse((child) => {
      if (child.isMesh) {
        child.geometry.dispose();
        if (child.material.isMaterial) {
          cleanMaterial(child.material);
        } else {
          // Jika material array (beberapa material)
          for (const material of child.material) {
            cleanMaterial(material);
          }
        }
      }
    });
    console.log('VRM removed');
    currentVRM = null;
  }
}

function cleanMaterial(material) {
  material.dispose();
  // Bersihkan tekstur juga
  for (const key in material) {
    const value = material[key];
    if (value && typeof value === 'object' && 'minFilter' in value) {
      value.dispose();
    }
  }
}

function loadVRMModel(x) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.register(parser => new VRMLoaderPlugin(parser));

    loader.load(
      x,
      (gltf) => {
        const vrm = gltf.userData.vrm;
        scene.add(vrm.scene);

        vrm.scene.position.set(69.94, 0, -91.13);
        vrm.scene.rotation.y = Math.PI;
        vrm.scene.scale.set(1.0, 1.0, 1.0);

        currentVRM = vrm; // Simpan yang aktif
        console.log('VRM loaded:', vrm);
        resolve(vrm); // success
      },
      (progress) => {
        console.log(`Loading: ${(progress.loaded / progress.total) * 100}%`);
      },
      (error) => {
        console.error('Error loading VRM:', error);
        reject(error); // fail
      }
    );
  });
}

async function deleteVRMFile(name) {
  const response = await fetch('http://127.0.0.1:5000/api/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name }) // hanya nama file
  });

  const data = await response.json();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // penting untuk OrbitControls
    renderer.render(scene, camera);

    // Update posisi kamera dan target
   updateInfo();
  }
animate();

// Menghubungi API
async function getHelloFromFlask(x) {
  const response = await fetch('http://127.0.0.1:5000/api/restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: `D:/(II)All_NodeJS_Folder/ThreeJS_3d/threejs_vrm/public/${x}.vrm`,
      name: x
    })
  });

  const data = await response.json();
}

document.getElementById("myButton").addEventListener("click", () => {
  document.getElementById('content').classList.add('hidden');
  document.getElementById('myButton').classList.add('hidden');
  sceneCamera1();
});

document.getElementById("ButtonScene1").addEventListener("click", async () => {
  removeVRMModel();
  deleteVRMFile("Sparkle")
  await getHelloFromFlask("Maomao");
  loadVRMModel("/Maomao.vrm");
});

document.getElementById("ButtonScene2").addEventListener("click", async () => {
  removeVRMModel();
  deleteVRMFile("Maomao")
  await getHelloFromFlask("Sparkle");
  loadVRMModel("/Sparkle.vrm");
});

// Responsif
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
