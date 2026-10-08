async function loadInfo() {
  const res = await fetch('/api/info');
  const data = await res.json();
  const info = document.getElementById('info');
  info.innerHTML = '';
  Object.entries(data).forEach(([key, value]) => {
    const li = document.createElement('li');
    li.textContent = `${key}: ${value}`;
    info.appendChild(li);
  });
}

async function loadPipeline() {
  const res = await fetch('/api/pipeline');
  const stages = await res.json();
  const box = document.getElementById('pipeline');
  box.innerHTML = '';
  stages.forEach(s => {
    const div = document.createElement('div');
    div.className = `stage ${s.status}`;
    div.innerHTML = `<strong>${s.stage}. ${s.name}</strong>
      <small>${s.tool}</small>
      <span class="badge">${s.status}</span>`;
    box.appendChild(div);
  });
}

document.getElementById('healthBtn').addEventListener('click', async () => {
  const out = document.getElementById('healthResult');
  try {
    const res = await fetch('/health');
    out.textContent = JSON.stringify(await res.json());
  } catch (e) {
    out.textContent = 'Health check failed';
  }
});

loadInfo();
loadPipeline();
