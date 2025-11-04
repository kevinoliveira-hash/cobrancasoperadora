// Configuração do sistema
const config = {
    // Operadoras conforme solicitado
    operadoras: ['AMIL', 'TRASMONTANO', 'UNIHOSP', 'SÃO CRISTOVÃO'],
    tiposCobranca: ['Comissão', 'Repasse', 'Dúvidas em Geral'],
    templates: {
    repasse: `Olá,

Poderiam, por gentileza, nos informar sobre o repasse da {parcela}ª parcela da proposta {proposta} do cliente: {cliente} (Operadora: {operadora}) – CPF/CNPJ: {cpfCnpj}?

Até o momento, não identificamos o repasse referente a esta parcela. Poderiam nos atualizar sobre o status do cliente e, caso esteja tudo regular, informar a previsão de quando o repasse será efetuado?

Agradecemos desde já pela atenção.

Atenciosamente,
Equipe Bestlife`,
        
    comissao: `Olá,

Poderiam, por gentileza, nos informar sobre a comissão da {parcela}ª parcela da proposta {proposta} do cliente: {cliente} (Operadora: {operadora}) – CPF/CNPJ: {cpfCnpj}?

Por se tratar de comissão, solicitamos a gentileza de verificar a parcela em questão e nos informar sobre a previsão de pagamento.

Agradecemos desde já pela atenção.

Atenciosamente,
Equipe Bestlife`,
        
    duvida: `Olá,

Gostaria de solicitar esclarecimentos sobre a proposta {proposta} do cliente: {cliente} (Operadora: {operadora}) – CPF/CNPJ: {cpfCnpj}, referente à {parcela}ª parcela.

Poderiam, por gentileza, nos auxiliar com informações sobre a situação atual desta proposta?

Agradecemos desde já pela atenção.

Atenciosamente,
Equipe Bestlife`
    }
};

// Classes principais
class FormValidator {
    static formatCpfCnpj(value) {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length <= 11) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    static validateCpfCnpj(value) {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length !== 11 && cleaned.length !== 14) return false;

        if (/^(\d)\1+$/.test(cleaned)) return false;

        if (cleaned.length === 11) {
            let sum = 0;
            for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
            let digit = (sum * 10) % 11;
            if (digit === 10) digit = 0;
            if (digit !== parseInt(cleaned[9])) return false;

            sum = 0;
            for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
            digit = (sum * 10) % 11;
            if (digit === 10) digit = 0;
            if (digit !== parseInt(cleaned[10])) return false;

            return true;
        }

        if (cleaned.length === 14) {
            let sum = 0;
            let pos = 5;
            for (let i = 0; i < 12; i++) {
                sum += parseInt(cleaned[i]) * pos;
                pos = pos === 2 ? 9 : pos - 1;
            }
            let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
            if (digit !== parseInt(cleaned[12])) return false;

            sum = 0;
            pos = 6;
            for (let i = 0; i < 13; i++) {
                sum += parseInt(cleaned[i]) * pos;
                pos = pos === 2 ? 9 : pos - 1;
            }
            digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
            if (digit !== parseInt(cleaned[13])) return false;

            return true;
        }

        return false;
    }

    static validateFields(fields) {
        const fieldLabels = {
            parcela: 'Parcela',
            proposta: 'Número da Proposta',
            cliente: 'Nome do Cliente',
            cpfCnpj: 'CPF ou CNPJ',
            tipoCobranca: 'Tipo de Cobrança',
            operadora: 'Operadora'
        };

        for (const [field, value] of Object.entries(fields)) {
            if (!value || value.trim() === '') {
                // foco no primeiro campo faltante para melhor usabilidade
                const el = document.getElementById(field);
                if (el) el.focus();
                UI.showFeedback(`Por favor, preencha o campo ${fieldLabels[field]}`, 'error');
                return false;
            }
        }
        return true;
    }
}

class UI {
    static showFeedback(message, type = 'info') {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `feedback ${type}`;
        setTimeout(() => {
            feedback.textContent = '';
            feedback.className = 'feedback';
        }, 3000);
    }

    static copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => this.showFeedback('Cobrança copiada com sucesso!', 'success'))
            .catch(() => this.showFeedback('Erro ao copiar. Tente novamente.', 'error'));
    }

    static clearForm() {
        document.getElementById('cobrancaForm').reset();
        document.getElementById('mensagem').value = '';
        this.showFeedback('Formulário limpo com sucesso!', 'success');
    }
}

class MessageGenerator {
    static generateMessage(fields) {
        const template = fields.tipoCobranca === 'Comissão' 
            ? config.templates.comissao 
            : fields.tipoCobranca === 'Repasse'
                ? config.templates.repasse
                : config.templates.duvida;

        return Object.entries(fields).reduce((msg, [key, value]) => {
            return msg.replace(new RegExp(`{${key}}`, 'g'), value.trim());
        }, template);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Popular selects
    const operadoraSelect = document.getElementById('operadora');
    const tipoCobrancaSelect = document.getElementById('tipoCobranca');

    // Se o select de operadora já tiver opções (HTML já pode conter as desejadas), não duplicar
    if (operadoraSelect.options.length <= 1) {
        config.operadoras.forEach(op => {
            const option = document.createElement('option');
            option.value = op;
            option.textContent = op;
            operadoraSelect.appendChild(option);
        });
    }

    config.tiposCobranca.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        tipoCobrancaSelect.appendChild(option);
    });

    // Event Listeners
    const form = document.getElementById('cobrancaForm');
    const cpfCnpjInput = document.getElementById('cpfCnpj');
    const mensagemTextarea = document.getElementById('mensagem');

    // Formatação do CPF/CNPJ
    cpfCnpjInput.addEventListener('input', (e) => {
        e.target.value = FormValidator.formatCpfCnpj(e.target.value);
    });

    // Geração da mensagem
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const fields = {
            parcela: document.getElementById('parcela').value,
            proposta: document.getElementById('proposta').value,
            cliente: document.getElementById('cliente').value,
            cpfCnpj: document.getElementById('cpfCnpj').value,
            tipoCobranca: document.getElementById('tipoCobranca').value,
            operadora: document.getElementById('operadora').value
        };

        if (!FormValidator.validateFields(fields)) return;
        if (!FormValidator.validateCpfCnpj(fields.cpfCnpj)) {
            UI.showFeedback('CPF/CNPJ inválido', 'error');
            return;
        }

        mensagemTextarea.value = MessageGenerator.generateMessage(fields);
        UI.showFeedback('Cobrança gerada com sucesso!', 'success');
    });

    // Copiar mensagem
    document.getElementById('copiar').addEventListener('click', () => {
        const text = mensagemTextarea.value;
        if (!text) {
            UI.showFeedback('Gere uma cobrança primeiro', 'error');
            return;
        }
        UI.copyToClipboard(text);
    });

    // Limpar formulário
    document.getElementById('limpar').addEventListener('click', () => UI.clearForm());
});