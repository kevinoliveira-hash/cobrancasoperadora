// Configuração para facilitar alterações
const config = {
    operadoras: ['AMIL', 'GNDI', 'TRASMONTANO', 'BLUEMED', 'UNIHOSP', 'UNICA SAUDE', 'SÃO CRISTOVÃO SAUDE'],
    tiposCobranca: ['Comissão', 'Repasse', 'DÚVIDAS EM GERAL'],
    templateBase: `Olá,

Poderiam, por gentileza, nos informar sobre o repasse da {parcela} parcela da proposta {proposta} do cliente: {cliente} – CPF: {cpfCnpj}?

Até o momento, não identificamos o repasse referente a esta parcela. Poderiam nos atualizar sobre o status do cliente e, caso esteja tudo regular, informar a previsão de quando o repasse será efetuado?

Agradecemos desde já pela atenção.

Atenciosamente,
Equipe Bestlife`,
    templateComissao: `\nPor se tratar de comissão, por favor, informe qual parcela está em questão para que possamos resolver da melhor forma possível.\n`
};

// Selecionar elementos
const form = document.getElementById('cobrancaForm');
const operadora = document.getElementById('operadora');
const cliente = document.getElementById('cliente');
const cpfCnpj = document.getElementById('cpfCnpj');
const tipoCobranca = document.getElementById('tipoCobranca');
const proposta = document.getElementById('proposta');
const parcela = document.getElementById('parcela');
const mensagem = document.getElementById('mensagem');
const copiarBtn = document.getElementById('copiar');
const limparBtn = document.getElementById('limpar');
const feedback = document.getElementById('feedback');

// Função para popular selects
function populateSelects() {
    config.operadoras.forEach(op => {
        const option = document.createElement('option');
        option.value = op;
        option.textContent = op;
        operadora.appendChild(option);
    });
    config.tiposCobranca.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        tipoCobranca.appendChild(option);
    });
}

// Função para formatar CPF/CNPJ
function formatCpfCnpj(value) {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
        // CPF
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
        // CNPJ
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
}

// Função para validar CPF/CNPJ básico
function validateCpfCnpj(value) {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length === 11 || cleaned.length === 14;
}

// Função para mostrar feedback
function showFeedback(message, type = 'info') {
    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
    setTimeout(() => {
        feedback.textContent = '';
        feedback.className = 'feedback';
    }, 3000);
}

// Função para atualizar mensagem em tempo real
function updateMessage() {
    const op = operadora.value;
    const cli = cliente.value.trim();
    const doc = cpfCnpj.value.trim();
    const tipo = tipoCobranca.value;
    const prop = proposta.value.trim();
    const parc = parcela.value.trim();

    if (op && cli && doc && tipo && prop && parc) {
        let msg = config.templateBase
            .replace('{parcela}', parc)
            .replace('{proposta}', prop)
            .replace('{cliente}', cli)
            .replace('{cpfCnpj}', doc);

        if (tipo === 'Comissão') {
            msg += config.templateComissao;
        }

        mensagem.value = msg;
    } else {
        mensagem.value = '';
    }
}

// Função para limpar formulário
function limparFormulario() {
    form.reset();
    mensagem.value = '';
    showFeedback('Formulário limpo.', 'success');
}

// Função para gerar a mensagem
function gerarMensagem() {
    const op = operadora.value;
    const cli = cliente.value.trim();
    const doc = cpfCnpj.value.trim();
    const tipo = tipoCobranca.value;
    const prop = proposta.value.trim();
    const parc = parcela.value.trim();

    if (!op || !cli || !doc || !tipo || !prop || !parc) {
        showFeedback('Por favor, preencha todos os campos.', 'error');
        return;
    }

    if (!validateCpfCnpj(doc)) {
        showFeedback('CPF/CNPJ inválido.', 'error');
        return;
    }

    // Use the current message or generate if empty
    let msg = mensagem.value || config.templateBase
        .replace('{parcela}', parc)
        .replace('{proposta}', prop)
        .replace('{cliente}', cli)
        .replace('{cpfCnpj}', doc);

    if (tipo === 'Comissão' && !msg.includes('Por se tratar de comissão')) {
        msg += config.templateComissao;
    }

    mensagem.value = msg;
    localStorage.setItem('cobrancaMessage', msg);
    localStorage.setItem('cobrancaData', JSON.stringify({ operadora: op, cliente: cli, cpfCnpj: doc, tipoCobranca: tipo, proposta: prop, parcela: parc }));

    // Adicionar ao chamados
    adicionarAoChamados({ operadora: op, cliente: cli, cpfCnpj: doc, tipoCobranca: tipo, proposta: prop, parcela: parc });
    showFeedback('Cobrança gerada e adicionada aos chamados!', 'success');
}

// Função para copiar a mensagem
function copiarMensagem() {
    if (!mensagem.value) {
        showFeedback('Gere a cobrança primeiro.', 'error');
        return;
    }

    navigator.clipboard.writeText(mensagem.value).then(() => {
        showFeedback('Cobrança copiada!', 'success');
    }).catch(err => {
        console.error('Erro ao copiar: ', err);
        showFeedback('Erro ao copiar. Tente novamente.', 'error');
    });
}

function clearChamadosStorage() {
    localStorage.removeItem('chamados');
    localStorage.removeItem('chamadosLixeira');
    localStorage.removeItem('chamadosFinalizados');
    localStorage.removeItem('trackingNumber');
    localStorage.removeItem('cobrancaData');
    localStorage.removeItem('cobrancaMessage');
}

// Função para adicionar cobrança aos chamados
function adicionarAoChamados(cobranca) {
    let chamados = JSON.parse(localStorage.getItem('chamados')) || [];
    let trackingNumber = parseInt(localStorage.getItem('trackingNumber')) || 1;
    const trackingStr = String(trackingNumber).padStart(2, '0');
    const newChamado = {
        id: Date.now(),
        trackingNumber: trackingStr,
        cliente: cobranca.cliente,
        operadora: cobranca.operadora,
        cpfCnpj: cobranca.cpfCnpj,
        status: '1 - Cobrar a Operadora',
        descricao: `Cobrança gerada: Tipo ${cobranca.tipoCobranca}, Proposta ${cobranca.proposta}, Parcela ${cobranca.parcela}`,
        informacoes: ''
    };
    chamados.push(newChamado);
    localStorage.setItem('chamados', JSON.stringify(chamados));
    localStorage.setItem('trackingNumber', trackingNumber + 1);
    // Update cobrancaData with trackingNumber
    const updatedData = { ...cobranca, trackingNumber: trackingStr };
    localStorage.setItem('cobrancaData', JSON.stringify(updatedData));
    window.open('cobranca.html', '_blank');
    alert('Cobrança adicionada aos chamados!');
}

populateSelects();

// Event listeners
document.getElementById('gerar').addEventListener('click', gerarMensagem);
copiarBtn.addEventListener('click', copiarMensagem);
limparBtn.addEventListener('click', limparFormulario);

// Atualizar mensagem em tempo real ao alterar campos
[operadora, cliente, cpfCnpj, tipoCobranca, proposta, parcela].forEach(el => {
    el.addEventListener('input', () => {
        if (el === cpfCnpj) {
            // Formatar CPF/CNPJ enquanto digita
            let formatted = formatCpfCnpj(el.value);
            if (formatted !== el.value) {
                el.value = formatted;
            }
        }
        updateMessage();
    });
});

// Render chamados on load
const chamadosContainer = document.getElementById('chamadosContainer');
if (chamadosContainer) {
    renderChamados();
}

// Function to render chamados cards
function renderChamados() {
    const chamados = JSON.parse(localStorage.getItem('chamados')) || [];
    const container = document.getElementById('chamadosContainer');
    if (!container) return;
    container.innerHTML = '';

    chamados.forEach(chamado => {
        if (chamado.status === '5 - Finalizado') return; // Skip finalized

        const card = document.createElement('div');
        card.className = 'chamado-card';

        card.innerHTML = `
            <div class="card-header">
                <span class="tracking-number">${chamado.trackingNumber}</span>
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

        container.appendChild(card);
    });

    // Add event listeners to buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            window.location.href = `cobranças/chamados.html?id=${id}`;
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            if (confirm('Tem certeza que deseja excluir este chamado?')) {
                deleteChamado(id);
            }
        });
    });

    document.querySelectorAll('.btn-finalize').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            finalizeChamado(id);
        });
    });
}

// Function to delete chamado
function deleteChamado(id) {
    let chamados = JSON.parse(localStorage.getItem('chamados')) || [];
    chamados = chamados.filter(c => c.id != id);
    localStorage.setItem('chamados', JSON.stringify(chamados));
    renderChamados();
}

// Function to finalize chamado
function finalizeChamado(id) {
    let chamados = JSON.parse(localStorage.getItem('chamados')) || [];
    const chamado = chamados.find(c => c.id == id);
    if (chamado) {
        chamado.status = '5 - Finalizado';
        localStorage.setItem('chamados', JSON.stringify(chamados));
        renderChamados();
    }
}
