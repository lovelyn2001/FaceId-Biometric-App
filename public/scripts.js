// main.js
document.addEventListener('DOMContentLoaded', function() {
    const faceIdRadio = document.getElementById('face-id');
    const passwordRadio = document.getElementById('username-password');

    const captureFaceButton = document.getElementById('captureFaceButton');
    const submitFormButton = document.getElementById('submitFormButton');

    const videoContainer = document.getElementById('videoContainer');
    const passwordSection = document.getElementById('passwordSection');

    // Hide/Show elements based on the selected radio button
    faceIdRadio.addEventListener('change', function() {
        if (faceIdRadio.checked) {
            // Show Face ID capture button
            hideAllOptionsExcept('face');
        }
    });

    passwordRadio.addEventListener('change', function() {
        if (passwordRadio.checked) {
            // Show name and password form
            hideAllOptionsExcept('password');
        }
    });

    // Function to hide other options
    function hideAllOptionsExcept(selectedOption) {
        captureFaceButton.style.display = (selectedOption === 'face') ? 'block' : 'none';
        passwordSection.style.display = (selectedOption === 'password') ? 'block' : 'none';
        videoContainer.style.display = (selectedOption === 'face') ? 'block' : 'none';
    }

    // Start Camera for Face ID Registration/Login
    captureFaceButton.addEventListener('click', startCamera);

    // Capture Face and Store in Hidden Input
    function startCamera() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                const video = document.createElement('video');
                video.srcObject = stream;
                video.play();
                videoContainer.innerHTML = '';
                videoContainer.appendChild(video);
                
                // Button to capture face image
                const takePictureButton = document.createElement('button');
                takePictureButton.textContent = 'Take Picture';
                videoContainer.appendChild(takePictureButton);

                takePictureButton.addEventListener('click', function() {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const context = canvas.getContext('2d');
                    context.drawImage(video, 0, 0);

                    // Stop the webcam stream
                    stream.getTracks().forEach(track => track.stop());

                    // Capture the face data and store it
                    const faceData = canvas.toDataURL('image/png');
                    document.getElementById('faceData').value = faceData;

                    alert('Face captured successfully! Redirecting to login...');
                    window.location.href = '/login';
                });
            })
            .catch(err => {
                console.error("Error accessing camera:", err);
                alert("Unable to access camera.");
            });
    }
});
