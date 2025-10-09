const lixeiraContainer = document.getElementById('lixeiraContainer');

let chamadosLixeira = JSON.parse(localStorage.getItem('chamadosLixeira')) || [];

// Render cards of chamados in lixeira
function renderLixeira() {
    lixeiraContainer.innerHTML = '';

    chamadosLixeira.sort((a, b) => {
        const aNum = parseInt(a.trackingNumber) || 0;
        const bNum = parseInt(b.trackingNumber) || 0;
        return aNum - bNum;
    });

    chamadosLixeira.forEach(chamado => {
        const card = document.createElement('div');
        card.className = 'chamado-card';
        card.innerHTML = `
            <div class="card-header">
                <span class="tracking-number">${chamado.trackingNumber || chamado.id}</span>
                <span class="operadora">${chamado.operadora}</span>
            </div>
            <div class="card-body">
                <p><strong>Cliente:</strong> ${chamado.cliente}</p>
                <p><strong>CPF/CNPJ:</strong> ${chamado.cpfCnpj || 'N/A'}</p>
                <p><strong>Status:</strong> ${chamado.status}</p>
                <p><strong>Descrição:</strong> ${chamado.descricao}</p>
                <p><strong>Informações:</strong> ${chamado.informacoes || 'Nenhuma'}</p>
            </div>
            <div class="card-actions">
                <button class="btn-recover" data-id="${chamado.id}">Recuperar</button>
            </div>
        `;
        lixeiraContainer.appendChild(card);
    });

    // Add event listeners to recover buttons
    document.querySelectorAll('.btn-recover').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            if (confirm('Tem certeza que deseja recuperar este chamado?')) {
                recoverChamadoById(id);
            }
        });
    });
}

// Recover chamado by id
function recoverChamadoById(id) {
    const index = chamadosLixeira.findIndex(c => c.id === id);
    if (index !== -1) {
        const recovered = chamadosLixeira.splice(index, 1)[0];
        let chamados = JSON.parse(localStorage.getItem('chamados')) || [];
        chamados.push(recovered);
        localStorage.setItem('chamados', JSON.stringify(chamados));
        localStorage.setItem('chamadosLixeira', JSON.stringify(chamadosLixeira));
        renderLixeira();
    }
}

// Initial render
renderLixeira();
