// Load face-api.js models and capture face for Face-ID
async function loadFaceAPIModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
}

// Capture Face-ID
async function captureFaceId() {
  const video = document.createElement('video');
  document.body.append(video);

  // Access camera and play video
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => {
      video.srcObject = stream;
      video.play();
    })
    .catch(err => {
      console.error("Error accessing camera:", err);
    });

  // Detect face when the video starts playing
  video.addEventListener('playing', async () => {
    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());
    if (detection) {
      console.log('Face detected');
      const faceData = detection.descriptor;  // Capture face descriptor
      sendFaceIdToServer(faceData);
      document.getElementById('faceIdMessage').innerText = 'Face captured successfully!';
    } else {
      document.getElementById('faceIdMessage').innerText = 'No face detected. Try again.';
    }
  });
}

// Send captured face descriptor to the server
function sendFaceIdToServer(faceData) {
  fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ faceId: faceData }),
  })
    .then(response => response.json())
    .then(data => console.log('Face-ID registered:', data))
    .catch(error => console.error('Error registering Face-ID:', error));
}

// Bind Capture Face-ID button click event
document.getElementById('captureFaceId').addEventListener('click', () => {
  loadFaceAPIModels().then(captureFaceId);
});
