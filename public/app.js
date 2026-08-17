let currentStep = 1;
let idPhoto = null;
let selfie = null;
let stream = null;

const steps = document.querySelectorAll('.step');
const stepTitle = document.getElementById('step-title');
const mainBtn = document.getElementById('mainBtn');

// Llenar fechas
for(let i=1; i<=31; i++) document.getElementById('day').innerHTML += `<option>${i}</option>`;
['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'].forEach(m => document.getElementById('month').innerHTML += `<option>${m}</option>`);
for(let i=2026; i>=1986; i--) document.getElementById('year').innerHTML += `<option>${i}</option>`;

// Subir cédula
document.getElementById('fileInput').onchange = e => {
  const reader = new FileReader();
  reader.onload = () => {
    idPhoto = reader.result;
    document.getElementById('idPreview').src = idPhoto;
    document.getElementById('idPreview').style.display = 'block';
    document.getElementById('idPlaceholder').style.display = 'none';
  }
  reader.readAsDataURL(e.target.files[0]);
}

// Cámara
async function startCamera() {
  stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
  document.getElementById('video').srcObject = stream;
}
document.getElementById('captureBtn').onclick = () => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  selfie = canvas.toDataURL('image/jpeg');
  video.style.display = 'none';
  document.getElementById('captureBtn').style.display = 'none';
  document.getElementById('retakeBtn').style.display = 'block';
  stream.getTracks().forEach(t => t.stop());
}
document.getElementById('retakeBtn').onclick = () => {
  selfie = null;
  document.getElementById('video').style.display = 'block';
  document.getElementById('captureBtn').style.display = 'block';
  document.getElementById('retakeBtn').style.display = 'none';
  startCamera();
}

// Enviar a server
async function enviarKYC() {
  mainBtn.innerHTML = 'Enviando...';
  mainBtn.disabled = true;
  try {
    const res = await fetch('/enviar-kyc', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ fotos: { cedula: idPhoto, selfie: selfie } })
    });
    const data = await res.json();
    if(data.ok) goToStep(3);
    else alert('Error: ' + data.error);
  } catch { alert('Error de conexión'); }
  mainBtn.innerHTML = 'Finalizar';
  mainBtn.disabled = false;
}

function goToStep(n) {
  document.getElementById(`step-${currentStep}`).style.display = 'none';
  currentStep = n;
  document.getElementById(`step-${currentStep}`).style.display = 'block';
  steps.forEach((s,i) => s.classList.toggle('active', i < n));
  if(n === 2) { stepTitle.innerText = 'Valida tu rostro'; startCamera(); }
  if(n === 3) { stepTitle.innerText = 'Listo!'; }
}

mainBtn.onclick = () => {
  if(currentStep === 1) {
    const d = document.getElementById('day').value;
    if(!idPhoto || d === 'DÍA') return alert('Completa todos los campos');
    goToStep(2);
  }
  else if(currentStep === 2) {
    if(!selfie) return alert('Toma la selfie');
    enviarKYC();
  }
  else window.location.reload();
}

lucide.createIcons();
