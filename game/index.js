import { FBXLoader } from "./js/fbxloader.js";
/* ---------------------------- global variables ---------------------------- */
let scene, camera, renderer;
const start_position = 6;
const end_position = -start_position;
const text = document.querySelector(".text");
const timeLimit = 0;
/* ---------------------------- creating a scene ---------------------------- */
scene = new THREE.Scene();

/* --------------------------------- camera --------------------------------- */
camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 3, 15);

/* -------------------------------- geometry -------------------------------- */
const ground = new THREE.BoxGeometry(50, 0.1, 50);
function createCubes(size, positionX, rotY = 0, color = 0xfbc851) {
  const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
  const material = new THREE.MeshStandardMaterial({ color: color });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.x = positionX;
  cube.rotation.y = rotY;
  scene.add(cube);
  return cube;
}

/* ------------------------------ adding color ------------------------------ */
const ambient = new THREE.AmbientLight(0xffffff, 0.5);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
ambient.add(dirLight);
scene.add(ambient);
/* -------------------------------- renderer -------------------------------- */
renderer = new THREE.WebGL1Renderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0xb7c3f3, 1);
/* ---------------------------- loading the doll ---------------------------- */
const texture = new THREE.TextureLoader().load(
  "src/squidGameDoll_01_MAT_baseColor.jpg"
);
const fbxLoader = new FBXLoader();

/* -------------------------- doll class for methods ------------------------- */
function Delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
class Doll {
  constructor() {
    fbxLoader.load("src/squidGame_Doll.fbx", (object) => {
      object.traverse((child) => {
        if (child.isMesh) {
          child.material.shininess = 2;
          object.position.set(0, 0, 2);
          object.scale.set(0.01, 0.01, 0.01);
          scene.add(object);
          this.doll = object;
        }
      });
    });
  }
  lookBack() {
    gsap.to(this.doll.rotation, { y: -3.15, duration: 1 });
  }
  lookForward() {
    gsap.to(this.doll.rotation, { y: 0, duration: 1 });
  }
  async start() {
    this.lookBack();
    await Delay(Math.random() * 1000 + 1000);
    this.lookForward();
    await Delay(Math.random() * 1000 + 3000);
    this.start();
  }
}

let doll = new Doll();

/* ---------------------------- class for player ---------------------------- */
class Player {
  constructor() {
    const geometry = new THREE.SphereGeometry(0.5, 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.x = start_position;
    sphere.position.z = 2;
    scene.add(sphere);
    this.player = sphere;
    this.playerInfo = {
      positionX: start_position,
      velocity: 0,
    };
  }
  run() {
    this.playerInfo.velocity = 0.03;
  }
  stop() {
    gsap.to(this.playerInfo, { velocity: 0, duration: 0.1 });
  }
  update() {
    this.playerInfo.positionX -= this.playerInfo.velocity;
    this.player.position.x = this.playerInfo.positionX;
  }
}
let player = new Player();
/* ---------------------------- create the track ---------------------------- */
function createTrack() {
  createCubes({ w: 0.2, h: 1.9, d: 1 }, start_position, -0.15);
  createCubes({ w: 0.2, h: 1.9, d: 1 }, end_position, 0.15);
  createCubes(
    { w: start_position * 2 + 0.2, h: 1.9, d: 1 },
    0,
    0,
    0xe5a716
  ).position.z = -1;
}
createTrack();
/* -------------------------- implement game logic -------------------------- */
async function init() {
  await Delay(500);
  text.innerText = "Starting in 3";
  await Delay(1000);
  text.innerText = "Starting in 2";
  await Delay(1000);
  text.innerText = "Starting in 1";
  await Delay(1000);
  text.innerText = "Goo!";
  startGame();
}
function startGame() {
  let progressBar = createCubes({ w: 12, h: 0.1, d: 1 }, 0);
  progressBar.position.y = 3.35;
  doll.start();
}
init();
/* ---------------------------- animate function ---------------------------- */

function animate() {
  requestAnimationFrame(animate);
  player.update();
  renderer.render(scene, camera);
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
}
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  var width = window.innerWidth;
  var height = window.innerHeight;
  var canvasPixelWidth = canvas.width / window.devicePixelRatio;
  var canvasPixelHeight = canvas.height / window.devicePixelRatio;
  const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

animate();
window.addEventListener("keyup", (e) => {
  if (e.key == "ArrowUp") {
    player.run();
  }
});
window.addEventListener("keydown", (e) => {
  if (e.key == "ArrowDown") {
    player.stop();
  }
});
