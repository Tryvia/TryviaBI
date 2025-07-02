// Função para agrupar status consecutivos iguais
function agruparStatusConsecutivos(statusArray) {
    if (!statusArray || statusArray.length === 0) return [];
    
    const grupos = [];
    let statusAtual = statusArray[0];
    let quantidade = 1;
    
    for (let i = 1; i < statusArray.length; i++) {
        if (statusArray[i] === statusAtual) {
            quantidade++;
        } else {
            grupos.push({ status: statusAtual, quantidade: quantidade });
            statusAtual = statusArray[i];
            quantidade = 1;
        }
    }
    
    // Adicionar o último grupo
    grupos.push({ status: statusAtual, quantidade: quantidade });
    
    return grupos;
}

// Variáveis globais
let implantacoes = [];
let implantacaoAtual = null;
const meses = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar conexão com Supabase
    const conexaoOk = await SupabaseService.verificarConexao();
    if (!conexaoOk) {
        mostrarMensagem('Erro na conexão com o banco de dados. Usando dados locais.', 'erro');
        carregarDadosLocais(); // Fallback para dados locais
    } else {
        await carregarDadosSupabase();
    }
    
    carregarPainelProjetos();
    configurarEventListeners();
});

// Carregar dados do Supabase
async function carregarDadosSupabase() {
    try {
        mostrarMensagem('Carregando dados...', 'info');
        const dados = await SupabaseService.carregarImplantacoes();
        
        // Converter dados do Supabase para o formato esperado
        implantacoes = dados.map(item => ({
            id: item.id,
            empresa: item.empresa,
            projeto: item.projeto,
            sistema: item.sistema,
            gestor: item.gestor,
            especialista: item.especialista,
            logo: item.logo_url,
            progresso: item.progresso,
            status: item.status,
            statusMeses: item.status_meses,
            fases: item.fases,
            resumoOperacional: item.resumo_operacional
        }));
        
        console.log('Dados carregados do Supabase:', implantacoes);
        
        if (implantacoes.length === 0) {
            mostrarMensagem('Nenhuma implantação encontrada. Adicione a primeira!', 'info');
        }
    } catch (error) {
        console.error('Erro ao carregar dados do Supabase:', error);
        mostrarMensagem('Erro ao carregar dados. Usando dados locais.', 'erro');
        carregarDadosLocais(); // Fallback
    }
}

// Carregar dados locais (fallback)
function carregarDadosLocais() {
    const dadosSalvos = localStorage.getItem('implantacoes');
    if (dadosSalvos) {
        implantacoes = JSON.parse(dadosSalvos);
    } else {
        // Dados de exemplo se não houver dados salvos
        implantacoes = [
            {
                id: 1,
                empresa: "Costa Verde",
                projeto: "Implantação",
                sistema: "OPTZ",
                gestor: "João Silva",
                especialista: "Maria Santos",
                logo: null,
                progresso: 85,
                status: "Em andamento",
                statusMeses: {
                    janeiro: ["concluido-prazo", "concluido-prazo", "concluido-prazo", "concluido-prazo"],
                    fevereiro: ["concluido-prazo", "concluido-prazo", "concluido-prazo", "concluido-prazo"],
                    marco: ["concluido-prazo", "concluido-prazo", "concluido-prazo", "concluido-prazo"],
                    abril: ["concluido-fora", "concluido-fora", "andamento", "andamento"],
                    maio: ["pendente", "pendente", "pendente", "pendente"],
                    junho: ["pendente", "pendente", "pendente", "pendente"],
                    julho: ["pendente", "pendente", "pendente", "pendente"],
                    agosto: ["pendente", "pendente", "pendente", "pendente"],
                    setembro: ["pendente", "pendente", "pendente", "pendente"],
                    outubro: ["pendente", "pendente", "pendente", "pendente"],
                    novembro: ["pendente", "pendente", "pendente", "pendente"],
                    dezembro: ["pendente", "pendente", "pendente", "pendente"]
                },
                fases: [
                    { nome: "Kick Off", etapas: 1, status: "concluido-prazo", inicio: "2024-03-01", fim: "2024-03-01" },
                    { nome: "Treinamento", etapas: 1, status: "concluido-prazo", inicio: "2024-03-15", fim: "2024-03-20" },
                    { nome: "Cadastros", etapas: "6/6", status: "concluido-prazo", inicio: "2024-04-01", fim: "2024-04-10" },
                    { nome: "Integrações", etapas: "1/2", status: "andamento", inicio: "2024-04-15", fim: "2024-04-25" },
                    { nome: "Testes", etapas: 1, status: "pendente", inicio: "2024-05-01", fim: "2024-05-05" },
                    { nome: "Validação", etapas: 1, status: "pendente", inicio: "2024-05-10", fim: "2024-05-15" },
                    { nome: "Go Live", etapas: 1, status: "pendente", inicio: "2024-05-20", fim: "2024-05-20" }
                ],
                resumoOperacional: [
                    "Cliente implantado desde 04/04.",
                    "Aguardando ok do cliente para ativar o E-Check."
                ]
            }
        ];
    }
}

// Configurar event listeners
function configurarEventListeners() {
    // Botão voltar para o portal
    document.getElementById("btn-voltar-portal").addEventListener("click", function() {
        window.location.href = "https://tryvia.github.io/TryviaBI/Portal.html";
    });
    
    // Botão adicionar nova implantação
    document.getElementById('btn-adicionar').addEventListener('click', abrirModalAdicionar);
    
    // Botão voltar
    document.getElementById('btn-voltar').addEventListener('click', voltarPainelProjetos);
    
    // Botões de edição e exclusão
    document.getElementById('btn-editar-timeline').addEventListener('click', abrirModalEditarTimeline);
    document.getElementById('btn-excluir-implantacao').addEventListener('click', abrirModalConfirmarExclusao);
    
    // Modal adicionar implantação
    document.getElementById('modal-close').addEventListener('click', fecharModal);
    document.getElementById('btn-cancelar').addEventListener('click', fecharModal);
    document.getElementById('form-adicionar').addEventListener('submit', adicionarNovaImplantacao);
    
    // Modal editar timeline
    document.getElementById('modal-editar-close').addEventListener('click', fecharModalEditarTimeline);
    document.getElementById('btn-adicionar-fase').addEventListener('click', adicionarNovaFase);
    document.getElementById('btn-salvar-timeline').addEventListener('click', salvarAlteracoesTimeline);
    
    // Modal confirmar exclusão
    document.getElementById('modal-exclusao-close').addEventListener('click', fecharModalConfirmarExclusao);
    document.getElementById('btn-cancelar-exclusao').addEventListener('click', fecharModalConfirmarExclusao);
    document.getElementById('btn-confirmar-exclusao').addEventListener('click', excluirImplantacao);
    
    // Filtro de busca
    document.getElementById('filtro-busca').addEventListener('input', filtrarImplantacoes);
    
    // Fechar modal clicando fora
    document.getElementById('modal-adicionar').addEventListener('click', function(e) {
        if (e.target === this) {
            fecharModal();
        }
    });
    
    document.getElementById('modal-editar-timeline').addEventListener('click', function(e) {
        if (e.target === this) {
            fecharModalEditarTimeline();
        }
    });
    
    document.getElementById('modal-confirmar-exclusao').addEventListener('click', function(e) {
        if (e.target === this) {
            fecharModalConfirmarExclusao();
        }
    });
}

// Carregar painel de projetos
function carregarPainelProjetos() {
    const tbody = document.getElementById('tabela-body');
    tbody.innerHTML = '';
    
    implantacoes.forEach(implantacao => {
        const row = criarLinhaImplantacao(implantacao);
        tbody.appendChild(row);
    });
}

// Criar linha da tabela para uma implantação
function criarLinhaImplantacao(implantacao) {
    const row = document.createElement('tr');
    row.dataset.id = implantacao.id;
    
    // Adicionar classe destacado se houver atraso
    const temAtraso = Object.values(implantacao.statusMeses).some(semanas => 
        semanas.some(status => status === 'atrasado')
    );
    if (temAtraso) {
        row.classList.add('destacado');
    }
    
    // Células básicas
    row.innerHTML = `
        <td>${implantacao.empresa}</td>
        <td>${implantacao.projeto}</td>
        <td>${implantacao.sistema}</td>
    `;
    
    // Células dos meses
    meses.forEach(mes => {
        const cell = document.createElement('td');
        const statusSemanas = implantacao.statusMeses[mes];
        
        // Agrupar status consecutivos iguais
        const gruposStatus = agruparStatusConsecutivos(statusSemanas);
        
        gruposStatus.forEach(grupo => {
            const statusBar = document.createElement('div');
            statusBar.className = `status-bar status-${grupo.status}`;
            statusBar.style.width = `${(grupo.quantidade / statusSemanas.length) * 100}%`;
            statusBar.title = `${nomesMeses[meses.indexOf(mes)]}: ${grupo.status.replace('-', ' ')} (${grupo.quantidade} semana${grupo.quantidade > 1 ? 's' : ''})`;
            cell.appendChild(statusBar);
        });
        
        row.appendChild(cell);
    });
    
    // Event listener para clique na linha
    row.addEventListener('click', () => exibirStatusImplantacao(implantacao));
    
    return row;
}

// Exibir tela de status de implantação
function exibirStatusImplantacao(implantacao) {
    implantacaoAtual = implantacao;
    
    // Ocultar painel de projetos e mostrar status
    document.getElementById('painel-projetos').classList.add('hidden');
    document.getElementById('status-implantacao').classList.remove('hidden');
    
    // Preencher dados da empresa
    preencherDadosEmpresa(implantacao);
    
    // Atualizar barra de progresso
    atualizarBarraProgresso(implantacao.progresso);
    
    // Carregar timeline detalhada
    carregarTimelineDetalhada(implantacao);
    
    // Preencher resumo operacional e status
    preencherResumoStatus(implantacao);
}

// Preencher dados da empresa
function preencherDadosEmpresa(implantacao) {
    const logoImg = document.getElementById('logo-img');
    const logoText = document.getElementById('logo-text');
    
    if (implantacao.logo) {
        logoImg.src = implantacao.logo;
        logoImg.style.display = 'block';
        logoText.style.display = 'none';
    } else {
        logoImg.style.display = 'none';
        logoText.style.display = 'block';
        logoText.textContent = implantacao.empresa.substring(0, 3).toUpperCase();
    }
    
    const empresaDados = document.getElementById('empresa-dados');
    empresaDados.innerHTML = `
        <td>${implantacao.empresa}</td>
        <td>${implantacao.sistema}</td>
        <td>${implantacao.gestor}</td>
        <td>${implantacao.especialista}</td>
    `;
}

// Atualizar barra de progresso
function atualizarBarraProgresso(progresso) {
    const progressoFill = document.getElementById('progresso-fill');
    const progressoTexto = document.getElementById('progresso-texto');
    
    progressoFill.style.width = `${progresso}%`;
    progressoTexto.textContent = `${progresso}%`;
}

// Carregar timeline detalhada
function carregarTimelineDetalhada(implantacao) {
    const timelineBody = document.getElementById("timeline-body");
    timelineBody.innerHTML = "";

    // Encontrar o período mínimo e máximo das fases
    let minDate = null;
    let maxDate = null;

    implantacao.fases.forEach((fase) => {
        if (fase.inicio && fase.fim) {
            const inicio = new Date(fase.inicio + "T00:00:00");
            const fim = new Date(fase.fim + "T00:00:00");

            if (!minDate || inicio < minDate) {
                minDate = inicio;
            }
            if (!maxDate || fim > maxDate) {
                maxDate = fim;
            }
        }
    });

    // Se não houver fases com datas, usar um período padrão (ex: 3 meses a partir de hoje)
    if (!minDate || !maxDate) {
        minDate = new Date();
        minDate.setMonth(minDate.getMonth() - 1); // Começa 1 mês antes
        maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 2); // Termina 2 meses depois
    }

    // Ajustar minDate para o início do mês e maxDate para o final do mês
    minDate.setDate(1);
    maxDate.setMonth(maxDate.getMonth() + 1, 0); // Último dia do mês

    // Gerar cabeçalho dos dias e meses dinamicamente
    atualizarCabecalhoDias(minDate, maxDate);

    // Calcular o número total de dias no período
    const totalDias = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;

    implantacao.fases.forEach((fase) => {
        const row = document.createElement("tr");

        // Célula da fase
        const faseCell = document.createElement("td");
        faseCell.className = "fase-nome";
        faseCell.textContent = fase.nome;
        row.appendChild(faseCell);

        // Célula das etapas
        const etapaCell = document.createElement("td");
        etapaCell.className = "etapa-nome";
        etapaCell.textContent = fase.etapas;
        row.appendChild(etapaCell);

        // Células dos dias
        const timelineCells = [];
        for (let i = 0; i < totalDias; i++) {
            timelineCells.push(document.createElement("td"));
        }

        if (fase.inicio && fase.fim) {
            const dataInicioFase = new Date(fase.inicio + "T00:00:00");
            const dataFimFase = new Date(fase.fim + "T00:00:00");

            const startIndex = Math.max(0, Math.floor((dataInicioFase - minDate) / (1000 * 60 * 60 * 24)));
            const endIndex = Math.min(totalDias - 1, Math.floor((dataFimFase - minDate) / (1000 * 60 * 60 * 24)));
            const duration = endIndex - startIndex + 1;

            if (duration > 0) {
                const statusBar = document.createElement("div");
                statusBar.className = `status-bar status-${fase.status}`;
                statusBar.style.width = `calc(${duration} * var(--day-cell-width) + ${duration - 1} * var(--day-cell-spacing))`;
                statusBar.style.position = "absolute";
                statusBar.style.left = `calc(${startIndex} * var(--day-cell-width) + ${startIndex} * var(--day-cell-spacing))`;
                statusBar.style.height = "25px";
                statusBar.style.top = "50%";
                statusBar.style.transform = "translateY(-50%)";
                statusBar.style.borderRadius = "12px";
                statusBar.style.display = "flex";
                statusBar.style.alignItems = "center";
                statusBar.style.justifyContent = "center";
                statusBar.style.color = "white";
                statusBar.style.fontSize = "12px";
                statusBar.style.fontWeight = "bold";
                statusBar.textContent = fase.nome;

                // Adicionar marcadores especiais
                if (fase.nome === "Kick Off") {
                    statusBar.innerHTML = "⭐";
                    statusBar.className += " tooltip";
                    statusBar.setAttribute("data-tooltip", "Reunião de alinhamento");
                }

                timelineCells[0].style.position = "relative"; // Make the first cell a positioning context
                timelineCells[0].appendChild(statusBar);
            }
        }

        timelineCells.forEach(cell => row.appendChild(cell));

        timelineBody.appendChild(row);
    });
}

// Atualizar cabeçalho dos dias dinamicamente
function atualizarCabecalhoDias(minDate, maxDate) {
    const diasHeader = document.getElementById("dias-header");
    const mesesHeader = document.getElementById("meses-header");
    diasHeader.innerHTML = "<th></th><th></th>"; // Células vazias para fase e etapa
    mesesHeader.innerHTML = "<th></th><th></th>"; // Células vazias para fase e etapa

    let currentMonth = new Date(minDate);
    let monthColspan = 0;

    while (currentMonth <= maxDate) {
        const monthName = nomesMeses[currentMonth.getMonth()];
        const daysInMonth = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + 1,
            0
        ).getDate();

        let startDay = 1;
        let endDay = daysInMonth;

        if (currentMonth.getMonth() === minDate.getMonth() && currentMonth.getFullYear() === minDate.getFullYear()) {
            startDay = minDate.getDate();
        }
        if (currentMonth.getMonth() === maxDate.getMonth() && currentMonth.getFullYear() === maxDate.getFullYear()) {
            endDay = maxDate.getDate();
        }
        
        const currentMonthDays = endDay - startDay + 1;
        monthColspan += currentMonthDays;

        const thMonth = document.createElement("th");
        thMonth.setAttribute("colspan", currentMonthDays);
        thMonth.textContent = monthName;
        mesesHeader.appendChild(thMonth);

        for (let i = startDay; i <= endDay; i++) {
            const thDay = document.createElement("th");
            thDay.textContent = i;
            diasHeader.appendChild(thDay);
        }

        currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
}

// Preencher resumo operacional e status
function preencherResumoStatus(implantacao) {
    const resumoConteudo = document.getElementById('resumo-conteudo');
    resumoConteudo.innerHTML = '';
    
    implantacao.resumoOperacional.forEach(item => {
        const p = document.createElement('p');
        p.textContent = `• ${item}`;
        p.style.marginBottom = '10px';
        resumoConteudo.appendChild(p);
    });
    
    const statusBadge = document.getElementById('status-badge');
    statusBadge.textContent = implantacao.status;
    statusBadge.className = 'status-badge';
    
    switch (implantacao.status.toLowerCase()) {
        case 'finalizado':
            statusBadge.classList.add('status-finalizado');
            break;
        case 'em andamento':
            statusBadge.classList.add('status-em-andamento');
            break;
        case 'atrasado':
            statusBadge.classList.add('status-atrasado');
            break;
    }
}

// Abrir modal para editar timeline
function abrirModalEditarTimeline() {
    if (!implantacaoAtual) return;
    
    document.getElementById('modal-empresa-nome').textContent = implantacaoAtual.empresa;
    document.getElementById('modal-editar-timeline').classList.remove('hidden');
    
    carregarFasesEditor();
}

// Fechar modal de editar timeline
function fecharModalEditarTimeline() {
    document.getElementById('modal-editar-timeline').classList.add('hidden');
}

// Carregar fases no editor
function carregarFasesEditor() {
    const fasesEditor = document.getElementById('fases-editor');
    fasesEditor.innerHTML = '';
    
    implantacaoAtual.fases.forEach((fase, index) => {
        const faseItem = criarItemFaseEditor(fase, index);
        fasesEditor.appendChild(faseItem);
    });
}

// Criar item de fase no editor
function criarItemFaseEditor(fase, index) {
    const faseDiv = document.createElement('div');
    faseDiv.className = 'fase-item';
    faseDiv.dataset.index = index;
    
    faseDiv.innerHTML = `
        <div class="fase-header">
            <div class="fase-titulo">Fase ${index + 1}</div>
            <div class="fase-actions">
                <button type="button" class="btn-fase-action btn-remover-fase" onclick="removerFase(${index})">🗑️ Remover</button>
            </div>
        </div>
        <div class="fase-form">
            <div class="form-field">
                <label>Nome da Fase</label>
                <input type="text" value="${fase.nome}" data-field="nome">
            </div>
            <div class="form-field">
                <label>Etapas</label>
                <input type="text" value="${fase.etapas}" data-field="etapas">
            </div>
            <div class="form-field">
                <label>Status</label>
                <select data-field="status">
                    <option value="pendente" ${fase.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                    <option value="andamento" ${fase.status === 'andamento' ? 'selected' : ''}>Em Andamento</option>
                    <option value="concluido-prazo" ${fase.status === 'concluido-prazo' ? 'selected' : ''}>Concluído no Prazo</option>
                    <option value="concluido-fora" ${fase.status === 'concluido-fora' ? 'selected' : ''}>Concluído Fora do Prazo</option>
                    <option value="atrasado" ${fase.status === 'atrasado' ? 'selected' : ''}>Atrasado</option>
                </select>
            </div>
            <div class="form-field">
                <label>Data Início</label>
                <input type="date" value="${fase.inicio}" data-field="inicio">
            </div>
            <div class="form-field">
                <label>Data Fim</label>
                <input type="date" value="${fase.fim}" data-field="fim">
            </div>
        </div>
    `;
    
    return faseDiv;
}

// Adicionar nova fase
function adicionarNovaFase() {
    const novaFase = {
        nome: "Nova Fase",
        etapas: 1,
        status: "pendente",
        inicio: "",
        fim: ""
    };
    
    implantacaoAtual.fases.push(novaFase);
    carregarFasesEditor();
    mostrarMensagem('Nova fase adicionada!', 'sucesso');
}

// Remover fase
function removerFase(index) {
    if (implantacaoAtual.fases.length <= 1) {
        mostrarMensagem('Não é possível remover a última fase!', 'erro');
        return;
    }
    
    if (confirm('Tem certeza que deseja remover esta fase?')) {
        implantacaoAtual.fases.splice(index, 1);
        carregarFasesEditor();
        mostrarMensagem('Fase removida com sucesso!', 'sucesso');
    }
}

// Salvar alterações da timeline
async function salvarAlteracoesTimeline() {
    const fasesItems = document.querySelectorAll('.fase-item');
    
    fasesItems.forEach((item, index) => {
        const fase = implantacaoAtual.fases[index];
        if (!fase) return;
        
        const inputs = item.querySelectorAll('[data-field]');
        inputs.forEach(input => {
            const field = input.dataset.field;
            fase[field] = input.value;
        });
    });
    
    // Recalcular progresso baseado nas fases
    recalcularProgresso();
    
    // Atualizar status dos meses baseado nas fases
    atualizarStatusMeses();
    
    try {
        mostrarMensagem('Salvando alterações...', 'info');
        
        // Salvar no Supabase
        await SupabaseService.atualizarImplantacao(implantacaoAtual.id, implantacaoAtual);
        
        // Atualizar na lista local
        const index = implantacoes.findIndex(imp => imp.id === implantacaoAtual.id);
        if (index !== -1) {
            implantacoes[index] = { ...implantacaoAtual };
        }
        
        // Recarregar interfaces
        carregarPainelProjetos();
        carregarTimelineDetalhada(implantacaoAtual);
        atualizarBarraProgresso(implantacaoAtual.progresso);
        
        fecharModalEditarTimeline();
        mostrarMensagem('Timeline atualizada com sucesso!', 'sucesso');
        
    } catch (error) {
        console.error('Erro ao salvar alterações:', error);
        mostrarMensagem('Erro ao salvar alterações. Tente novamente.', 'erro');
    }
}

// Recalcular progresso baseado nas fases
function recalcularProgresso() {
    const totalFases = implantacaoAtual.fases.length;
    const fasesConcluidas = implantacaoAtual.fases.filter(fase => 
        fase.status === 'concluido-prazo' || fase.status === 'concluido-fora'
    ).length;
    
    implantacaoAtual.progresso = Math.round((fasesConcluidas / totalFases) * 100);
    
    // Atualizar status geral
    if (implantacaoAtual.progresso === 100) {
        implantacaoAtual.status = "Finalizado";
    } else if (implantacaoAtual.progresso > 0) {
        const temAtraso = implantacaoAtual.fases.some(fase => fase.status === 'atrasado');
        implantacaoAtual.status = temAtraso ? "Atrasado" : "Em andamento";
    } else {
        implantacaoAtual.status = "Pendente";
    }
}

// Atualizar status dos meses baseado nas fases
function atualizarStatusMeses() {
    // Resetar todos os meses para pendente
    Object.keys(implantacaoAtual.statusMeses).forEach(mes => {
        implantacaoAtual.statusMeses[mes] = ["pendente", "pendente", "pendente", "pendente"];
    });
    
    // Aplicar status das fases aos meses correspondentes
    implantacaoAtual.fases.forEach(fase => {
        if (fase.inicio && fase.fim) {
            const dataInicio = new Date(fase.inicio);
            const dataFim = new Date(fase.fim);
            
            // Simplificação: aplicar status aos meses entre início e fim
            const mesInicio = dataInicio.getMonth();
            const mesFim = dataFim.getMonth();
            
            for (let mes = mesInicio; mes <= mesFim; mes++) {
                const nomeMes = meses[mes];
                if (implantacaoAtual.statusMeses[nomeMes]) {
                    implantacaoAtual.statusMeses[nomeMes] = [fase.status, fase.status, fase.status, fase.status];
                }
            }
        }
    });
}

// Abrir modal para confirmar exclusão
function abrirModalConfirmarExclusao() {
    if (!implantacaoAtual) return;
    
    document.getElementById('exclusao-empresa-nome').textContent = implantacaoAtual.empresa;
    document.getElementById('modal-confirmar-exclusao').classList.remove('hidden');
}

// Fechar modal de confirmar exclusão
function fecharModalConfirmarExclusao() {
    document.getElementById('modal-confirmar-exclusao').classList.add('hidden');
}

// Excluir implantação
async function excluirImplantacao() {
    if (!implantacaoAtual) return;
    
    try {
        mostrarMensagem('Excluindo implantação...', 'info');
        
        // Excluir do Supabase
        await SupabaseService.excluirImplantacao(implantacaoAtual.id);
        
        // Remover da lista local
        const index = implantacoes.findIndex(imp => imp.id === implantacaoAtual.id);
        if (index !== -1) {
            implantacoes.splice(index, 1);
        }
        
        // Recarregar painel e voltar
        carregarPainelProjetos();
        voltarPainelProjetos();
        fecharModalConfirmarExclusao();
        
        mostrarMensagem(`Implantação "${implantacaoAtual.empresa}" excluída com sucesso!`, 'sucesso');
        
    } catch (error) {
        console.error('Erro ao excluir implantação:', error);
        mostrarMensagem('Erro ao excluir implantação. Tente novamente.', 'erro');
    }
}

// Voltar ao painel de projetos
function voltarPainelProjetos() {
    document.getElementById('status-implantacao').classList.add('hidden');
    document.getElementById('painel-projetos').classList.remove('hidden');
    implantacaoAtual = null;
}

// Abrir modal para adicionar nova implantação
function abrirModalAdicionar() {
    document.getElementById('modal-adicionar').classList.remove('hidden');
    document.getElementById('form-adicionar').reset();
}

// Fechar modal
function fecharModal() {
    document.getElementById('modal-adicionar').classList.add('hidden');
}
// Adicionar nova implantação
async function adicionarNovaImplantacao(e) {
    e.preventDefault();
    
    const empresa = document.getElementById('nova-empresa').value;
    const projeto = document.getElementById('novo-projeto').value;
    const sistema = document.getElementById('novo-sistema').value;
    const gestor = document.getElementById('novo-gestor').value;
    const especialista = document.getElementById('especialista').value;
    const logoFile = document.getElementById('logo-cliente').files[0];
    
    try {
        // Processar logo se foi fornecida
        let logoUrl = null;
        if (logoFile) {
            mostrarMensagem('Fazendo upload do logo...', 'info');
            const fileName = `${Date.now()}_${logoFile.name}`;
            logoUrl = await SupabaseService.uploadLogo(logoFile, fileName);
        }
        
        const novaImplantacao = {
            empresa: empresa,
            projeto: projeto,
            sistema: sistema,
            gestor: gestor,
            especialista: especialista,
            logo: logoUrl,
            progresso: 0,
            status: "Pendente",
            statusMeses: {
                janeiro: ["pendente", "pendente", "pendente", "pendente"],
                fevereiro: ["pendente", "pendente", "pendente", "pendente"],
                marco: ["pendente", "pendente", "pendente", "pendente"],
                abril: ["pendente", "pendente", "pendente", "pendente"],
                maio: ["pendente", "pendente", "pendente", "pendente"],
                junho: ["pendente", "pendente", "pendente", "pendente"],
                julho: ["pendente", "pendente", "pendente", "pendente"],
                agosto: ["pendente", "pendente", "pendente", "pendente"],
                setembro: ["pendente", "pendente", "pendente", "pendente"],
                outubro: ["pendente", "pendente", "pendente", "pendente"],
                novembro: ["pendente", "pendente", "pendente", "pendente"],
                dezembro: ["pendente", "pendente", "pendente", "pendente"]
            },
            fases: [
                { nome: "Kick Off", etapas: 1, status: "pendente", inicio: "", fim: "" },
                { nome: "Treinamento", etapas: 1, status: "pendente", inicio: "", fim: "" },
                { nome: "Cadastros", etapas: "0/6", status: "pendente", inicio: "", fim: "" },
                { nome: "Integrações", etapas: "0/2", status: "pendente", inicio: "", fim: "" },
                { nome: "Testes", etapas: 1, status: "pendente", inicio: "", fim: "" },
                { nome: "Validação", etapas: 1, status: "pendente", inicio: "", fim: "" },
                { nome: "Go Live", etapas: 1, status: "pendente", inicio: "", fim: "" }
            ],
            resumoOperacional: [
                "Projeto recém-criado.",
                "Aguardando início das atividades."
            ]
        };
        
        mostrarMensagem('Salvando implantação...', 'info');
        
        // Salvar no Supabase
        const implantacaoSalva = await SupabaseService.salvarImplantacao(novaImplantacao);
        
        // Adicionar à lista local
        const implantacaoCompleta = {
            id: implantacaoSalva.id,
            empresa: implantacaoSalva.empresa,
            projeto: implantacaoSalva.projeto,
            sistema: implantacaoSalva.sistema,
            gestor: implantacaoSalva.gestor,
            especialista: implantacaoSalva.especialista,
            logo: implantacaoSalva.logo_url,
            progresso: implantacaoSalva.progresso,
            status: implantacaoSalva.status,
            statusMeses: implantacaoSalva.status_meses,
            fases: implantacaoSalva.fases,
            resumoOperacional: implantacaoSalva.resumo_operacional
        };
        
        implantacoes.push(implantacaoCompleta);
        
        // Definir a implantação recém-adicionada como a implantação atual
        implantacaoAtual = implantacaoCompleta;
        
        // Recarregar painel
        carregarPainelProjetos();
        fecharModal();
        
        // Mostrar mensagem de sucesso
        mostrarMensagem(`Implantação "${empresa}" adicionada com sucesso!`, 'sucesso');
        
    } catch (error) {
        console.error('Erro ao adicionar implantação:', error);
        mostrarMensagem('Erro ao salvar implantação. Tente novamente.', 'erro');
    }
}

// Filtrar implantações
function filtrarImplantacoes() {
    const filtro = document.getElementById('filtro-busca').value.toLowerCase();
    const rows = document.querySelectorAll('#tabela-body tr');
    
    rows.forEach(row => {
        const empresa = row.cells[0].textContent.toLowerCase();
        const projeto = row.cells[1].textContent.toLowerCase();
        const sistema = row.cells[2].textContent.toLowerCase();
        
        const corresponde = empresa.includes(filtro) || 
                           projeto.includes(filtro) || 
                           sistema.includes(filtro);
        
        row.style.display = corresponde ? '' : 'none';
    });
}

// Mostrar mensagem de feedback
function mostrarMensagem(texto, tipo) {
    const mensagem = document.createElement('div');
    mensagem.className = `mensagem mensagem-${tipo}`;
    mensagem.textContent = texto;
    mensagem.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    if (tipo === 'sucesso') {
        mensagem.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
    } else if (tipo === 'erro') {
        mensagem.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
    } else if (tipo === 'info') {
        mensagem.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
    }
    
    document.body.appendChild(mensagem);
    
    setTimeout(() => {
        mensagem.remove();
    }, 3000);
}

// Adicionar animação CSS para mensagens
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Funcionalidades extras
document.addEventListener('keydown', function(e) {
    // Esc para fechar modal
    if (e.key === 'Escape') {
        fecharModal();
    }
    
    // Ctrl+N para nova implantação
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        abrirModalAdicionar();
    }
    
    // Backspace para voltar (quando não estiver em input)
    if (e.key === 'Backspace' && !e.target.matches('input, textarea, select')) {
        e.preventDefault();
        if (!document.getElementById('status-implantacao').classList.contains('hidden')) {
            voltarPainelProjetos();
        }
    }
});

