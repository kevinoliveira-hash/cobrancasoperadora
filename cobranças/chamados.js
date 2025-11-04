// Classe para gerenciar o armazenamento local
class StorageManager {
    static getItem(key) {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch {
            return null;
        }
    }

    static setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    }
}

// Classe para gerenciar chamados
class ChamadosManager {
    constructor() {
        this.container = document.getElementById('chamadosContainer');
        this.editForm = document.getElementById('editForm');
        this.editCliente = document.getElementById('editCliente');
        this.editStatus = document.getElementById('editStatus');
        this.editDescricao = document.getElementById('editDescricao');
        this.editInformacoes = document.getElementById('editInformacoes');
        this.cancelEditBtn = document.getElementById('cancelEdit');
        this.chamados = StorageManager.getItem('chamados') || [];
        this.currentEditId = null;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEdit();
        });

        this.cancelEditBtn.addEventListener('click', () => {
            this.hideEditForm();
        });
    }

    hideEditForm() {
        this.editForm.style.display = 'none';
        this.currentEditId = null;
    }
}

// Instância do gerenciador de chamados
const chamadosManager = new ChamadosManager();

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
