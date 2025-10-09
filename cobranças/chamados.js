const chamadosContainer = document.getElementById('chamadosContainer');
const editForm = document.getElementById('editForm');
const editCliente = document.getElementById('editCliente');
const editStatus = document.getElementById('editStatus');
const editDescricao = document.getElementById('editDescricao');
const editInformacoes = document.getElementById('editInformacoes');
const cancelEditBtn = document.getElementById('cancelEdit');

let chamados = JSON.parse(localStorage.getItem('chamados')) || [];
let currentEditId = null;

// Render cards of chamados
function renderTable() {
    chamadosContainer.innerHTML = '';

    const chamadosAbertos = chamados.filter(c => c.status !== '5 - Finalizado');

    chamadosAbertos.sort((a, b) => {
        const aNum = parseInt(a.trackingNumber) || 0;
        const bNum = parseInt(b.trackingNumber) || 0;
        return aNum - bNum;
    });

    chamadosAbertos.forEach(chamado => {
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
                <button class="btn-edit" data-id="${chamado.id}">Editar</button>
                <button class="btn-delete" data-id="${chamado.id}">Excluir</button>
                <button class="btn-finalize" data-id="${chamado.id}">Finalizar</button>
            </div>
        `;
        chamadosContainer.appendChild(card);
    });

    // Add event listeners to buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            editChamadoById(id);
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            if (confirm('Tem certeza que deseja excluir este chamado?')) {
                deleteChamadoById(id);
            }
        });
    });

    document.querySelectorAll('.btn-finalize').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            finalizarChamadoById(id);
        });
    });
}

// Delete chamado by id (move to lixeira)
function deleteChamadoById(id) {
    const index = chamados.findIndex(c => c.id === id);
    if (index !== -1) {
        const removed = chamados.splice(index, 1)[0];
        let chamadosLixeira = JSON.parse(localStorage.getItem('chamadosLixeira')) || [];
        chamadosLixeira.push(removed);
        localStorage.setItem('chamadosLixeira', JSON.stringify(chamadosLixeira));
        localStorage.setItem('chamados', JSON.stringify(chamados));
        renderTable();
    }
}

// Finalize chamado by id
function finalizarChamadoById(id) {
    const index = chamados.findIndex(c => c.id === id);
    if (index !== -1) {
        const finalizado = chamados.splice(index, 1)[0];
        finalizado.status = '5 - Finalizado';
        let chamadosFinalizados = JSON.parse(localStorage.getItem('chamadosFinalizados')) || [];
        chamadosFinalizados.push(finalizado);
        localStorage.setItem('chamadosFinalizados', JSON.stringify(chamadosFinalizados));
        localStorage.setItem('chamados', JSON.stringify(chamados));
        renderTable();
        window.location.href = 'finalizados.html';
    }
}

// Add chamado automatically from cobranca
function adicionarChamadoAutomatico(cobranca) {
    let trackingNumber = parseInt(localStorage.getItem('trackingNumber')) || 1;
    const newChamado = {
        id: String(Date.now()),
        trackingNumber: String(trackingNumber).padStart(2, '0'),
        cliente: cobranca.cliente,
        operadora: cobranca.operadora,
        cpfCnpj: cobranca.cpfCnpj,
        status: '1 - Cobrar a Operadora',
        descricao: 'Cobrança gerada automaticamente',
        informacoes: ''
    };
    chamados.push(newChamado);
    localStorage.setItem('chamados', JSON.stringify(chamados));
    localStorage.setItem('trackingNumber', trackingNumber + 1);
    renderTable();

    const operadora = cobranca.operadora.toLowerCase();
    if (window.opener && !window.opener.closed) {
        try {
            if (window.opener.location.href.includes(operadora + '.html')) {
                window.opener.location.reload();
            }
        } catch (e) {
            // Ignore cross-origin errors
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Event listeners
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveEdit();
    });

    cancelEditBtn.addEventListener('click', () => {
        editForm.style.display = 'none';
        currentEditId = null;
    });
});

// Save edit
function saveEdit() {
    if (currentEditId === null) return;

    const index = chamados.findIndex(c => c.id === currentEditId);
    if (index === -1) return;

    const previousStatus = chamados[index].status;
    const newStatus = editStatus.value;
    chamados[index].cliente = editCliente.value.trim();
    chamados[index].status = newStatus;
    chamados[index].descricao = editDescricao.value.trim();
    chamados[index].informacoes = editInformacoes.value.trim();

    if (newStatus === '5 - Finalizado' && previousStatus !== '5 - Finalizado') {
        // Move to finalizados
        const finalizado = chamados.splice(index, 1)[0];
        let chamadosFinalizados = JSON.parse(localStorage.getItem('chamadosFinalizados')) || [];
        chamadosFinalizados.push(finalizado);
        localStorage.setItem('chamadosFinalizados', JSON.stringify(chamadosFinalizados));
        window.location.href = 'finalizados.html';
    }

    localStorage.setItem('chamados', JSON.stringify(chamados));
    renderTable();

    editForm.style.display = 'none';
    currentEditId = null;
}

// Edit chamado by id
function editChamadoById(id) {
    const index = chamados.findIndex(c => c.id === id);
    if (index === -1) return;

    const chamado = chamados[index];
    editCliente.value = chamado.cliente;
    editStatus.value = chamado.status;
    editDescricao.value = chamado.descricao;
    editInformacoes.value = chamado.informacoes || '';

    currentEditId = id;
    editForm.style.display = 'block';
}

// Initial render
renderTable();
