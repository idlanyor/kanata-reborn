const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    // Handle sidebar navigation
    document.querySelectorAll('.list-group-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            loadPage(e.target.dataset.page);
            
            // Update active state
            document.querySelectorAll('.list-group-item').forEach(el => {
                el.classList.remove('active');
            });
            e.target.classList.add('active');
        });
    });

    // Load connections page by default
    loadPage('connections');
});

async function loadPage(page) {
    const content = document.getElementById('content');
    
    switch(page) {
        case 'connections':
            const connections = await fetch('/api/connections').then(res => res.json());
            content.innerHTML = `
                <h2>Manajemen Koneksi</h2>
                <div class="mb-3">
                    <input type="text" class="form-control" id="phoneNumber" placeholder="Masukkan nomor telepon (62xxx)">
                    <button class="btn btn-primary mt-2" onclick="generateQR()">Generate QR</button>
                </div>
                <div id="connectionsList">
                    ${connections.map(session => `
                        <div class="card mb-2">
                            <div class="card-body">
                                <h5 class="card-title">${session}</h5>
                                <button class="btn btn-danger btn-sm">Disconnect</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            break;
            
        case 'plugins':
            const plugins = await fetch('/api/plugins').then(res => res.json());
            content.innerHTML = `
                <h2>Manajemen Plugin</h2>
                <div class="list-group">
                    ${plugins.map(plugin => `
                        <div class="list-group-item">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">${plugin.name}</h5>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" ${plugin.active ? 'checked' : ''}>
                                </div>
                            </div>
                            <small class="text-muted">${plugin.path}</small>
                        </div>
                    `).join('')}
                </div>
            `;
            break;
    }
}

function generateQR() {
    const phoneNumber = document.getElementById('phoneNumber').value;
    socket.emit('generateQR', phoneNumber);
}

socket.on('broadcastMessage', (message) => {
    // Tampilkan pesan dalam toast atau alert
    alert(message);
});
