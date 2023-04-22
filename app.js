const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let model;
let tooltip = document.getElementById("tooltip");

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = 0;
renderer.domElement.style.zIndex = 1;
document.body.appendChild(renderer.domElement);

const loader = new THREE.GLTFLoader();
let object3D;

loader.load('https://raw.githubusercontent.com/aARdeLife/www/24c418c270c508983064244597f661b3791889a8/polforweb%20(3).glb', function (gltf) {
  object3D = gltf.scene;
  object3D.visible = false;
  scene.add(object3D);
  camera.position.z = 5;
}, undefined, function (error) {
  console.error(error);
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

canvas.addEventListener("mousemove", (event) => {
  handleTooltip(event);
});

canvas.addEventListener("mouseout", () => {
  hideTooltip();
});

canvas.addEventListener("click", (event) => {
  if (object3D) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    object3D.position.set(x / 100, -y / 100, 0);
    object3D.visible = true;
  }
});

async function loadModel() {
  model = await cocoSsd.load();
  console.log("Model loaded");
  detectFrame();
}

async function detectFrame() {
  const predictions = await model.detect(video);
  renderPredictions(predictions);
  requestAnimationFrame(() => {
    detectFrame();
  });
}

function renderPredictions(predictions) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.font = "16px sans-serif";
  ctx.strokeStyle = "green";
  ctx.lineWidth = 4;

  predictions.forEach((prediction) => {
    const [x, y, width, height] = prediction["bbox"];

    ctx.strokeRect(x, y, width, height);
  });
}

function handleTooltip(event) {
  const x = event.offsetX;
  const y = event.offsetY;

  const prediction = model
    ? model.predictions.find((p) => {
        const [px, py, pw, ph] = p["bbox"];
        return x >= px && x <= px + pw && y >= py && y <= py + ph;
      })
    : null;

  if (prediction) {
    tooltip.style.display = "block";
    tooltip.style.left = `${event.pageX}px`;
    tooltip.style.top = `${event.pageY}px`;

    const info = `Class: ${prediction.class}\nScore: ${prediction.score.toFixed(2)}`;

    tooltip.textContent = info;
  } else {
    hideTooltip();
  }
}

function hideTooltip() {
  tooltip.style.display = "none";
}

async function startVideo() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
  video.srcObject = stream;
  video.onloadedmetadata = () => {
    video.play();
    loadModel();
  };
}

startVideo();
