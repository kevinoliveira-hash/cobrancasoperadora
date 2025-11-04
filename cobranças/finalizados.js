// Selecionar elementos
const operadorasContainer = document.getElementById('operadorasContainer');

// Array para armazenar chamados finalizados
let chamadosFinalizados = JSON.parse(localStorage.getItem('chamadosFinalizados')) || [];

// Função para renderizar chamados finalizados por operadora
function renderFinalizados() {
    operadorasContainer.innerHTML = '';

    // Get unique operadoras from chamadosFinalizados
    const operadoras = [...new Set(chamadosFinalizados.map(c => c.operadora))];
    operadoras.forEach(operadora => {
        // Criar seção para a operadora
        const section = document.createElement('div');
        section.classList.add('operadora-section');

        // Título da seção
        const sectionTitle = document.createElement('h3');
        sectionTitle.textContent = operadora;
        section.appendChild(sectionTitle);

        // Criar container para chamados finalizados da operadora
        const container = document.createElement('div');
        container.classList.add('chamados-lista');

        // Filtrar chamados finalizados da operadora
        const chamadosFinalizadosOperadora = chamadosFinalizados.filter(c => c.operadora === operadora);

        if (chamadosFinalizadosOperadora.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.textContent = 'Nenhum chamado finalizado para esta operadora.';
            container.appendChild(emptyMsg);
        } else {
            chamadosFinalizadosOperadora.forEach(chamado => {
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
                `;
                container.appendChild(card);
            });
        }

        section.appendChild(container);
        operadorasContainer.appendChild(section);
    });
}

// Renderizar chamados finalizados ao carregar
renderFinalizados();
