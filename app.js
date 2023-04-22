document.addEventListener('DOMContentLoaded', () => {
  const introVideo = document.getElementById('introVideo');
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const summaryBox = document.createElement('div');

  summaryBox.style.position = 'absolute';
  summaryBox.style.padding = '10px';
  summaryBox.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  summaryBox.style.color = 'white';
  summaryBox.style.borderRadius = '5px';
  summaryBox.style.fontSize = '14px';
  summaryBox.style.maxWidth = '250px';
  summaryBox.style.display = 'none';

  document.body.appendChild(summaryBox);

  introVideo.addEventListener('ended', async () => {
      introVideo.style.display = 'none';
      video.style.display = 'block';
      canvas.style.display = 'block';

      const videoElement = await setupCamera();
      videoElement.play();
      detectObjects();
  });

  async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    video.srcObject = stream;
    return new Promise(resolve => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
  }

  // ... rest of the code ...

  canvas.addEventListener('click', async event => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (const prediction of currentPredictions) {
        if (isPointInRect(x, y, prediction.bbox)) {
            const summary = await fetchWikipediaSummary(prediction.class);
            const opacity = Math.min(1, Math.max(0, prediction.score));
            summaryBox.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
            summaryBox.style.display =
