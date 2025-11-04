// JavaScript for cobranca.html

document.addEventListener('DOMContentLoaded', () => {
    // Load the cobrança message from localStorage
    const mensagemCobranca = document.getElementById('mensagemCobranca');
    mensagemCobranca.value = localStorage.getItem('cobrancaMessage') || '';

    // Load the cobrança data and display details
    const cobrancaData = JSON.parse(localStorage.getItem('cobrancaData') || '{}');
    const detailsDiv = document.getElementById('cobrancaDetails');
    if (cobrancaData.operadora) {
        detailsDiv.innerHTML = `
            <h2>Detalhes da Cobrança</h2>
            <p><strong>Operadora:</strong> ${cobrancaData.operadora}</p>
            <p><strong>Cliente:</strong> ${cobrancaData.cliente}</p>
            <p><strong>CPF/CNPJ:</strong> ${cobrancaData.cpfCnpj}</p>
            <p><strong>Tipo de Cobrança:</strong> ${cobrancaData.tipoCobranca}</p>
            <p><strong>Proposta:</strong> ${cobrancaData.proposta}</p>
            <p><strong>Parcela:</strong> ${cobrancaData.parcela}</p>
        `;
    }

    // Load the tracking number from cobrancaData
    const trackingNumberSpan = document.getElementById('trackingNumber');
    trackingNumberSpan.textContent = cobrancaData.trackingNumber || 'N/A';

    // Copy button event
    document.getElementById('copiarCobranca').addEventListener('click', () => {
        navigator.clipboard.writeText(mensagemCobranca.value).then(() => {
            alert('Cobrança copiada!');
        }).catch(err => {
            alert('Erro ao copiar: ' + err);
        });
    });

    // Open chamados button
    document.getElementById('abrirChamados').addEventListener('click', () => {
        window.open('cobranças/chamados.html', '_blank');
    });
});
