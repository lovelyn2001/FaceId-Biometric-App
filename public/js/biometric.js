// Biometric Authentication using WebAuthn
async function registerBiometric() {
    const publicKey = {
      challenge: Uint8Array.from('randomStringFromServer', c => c.charCodeAt(0)),
      rp: {
        name: "Medical Staff Secure App",
      },
      user: {
        id: Uint8Array.from('userId', c => c.charCodeAt(0)),
        name: "username@example.com",
        displayName: "User Name",
      },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
    };
  
    try {
      const credential = await navigator.credentials.create({ publicKey });
      console.log('Credential created:', credential);
      sendBiometricToServer(credential);
    } catch (err) {
      console.error('Error in Biometric registration:', err);
    }
  }
  
  function sendBiometricToServer(credential) {
    fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ biometric: credential.id })
    })
    .then(response => response.json())
    .then(data => console.log('Biometric registered:', data))
    .catch(error => console.error('Error:', error));
  }
  
  document.getElementById('captureBiometric').addEventListener('click', registerBiometric);
  