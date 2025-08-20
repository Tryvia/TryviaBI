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
let anoSelecionado = new Date().getFullYear(); // Ano atual por padrão
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
    
    inicializarFiltroAno();
    carregarPainelProjetos();
    configurarEventListeners();
});

// Inicializar filtro por ano
function inicializarFiltroAno() {
    const filtroAno = document.getElementById('filtro-ano');
    const anoAtual = new Date().getFullYear();
    
    // Adicionar opções de anos (do ano atual até 3 anos atrás e 2 anos à frente)
    for (let ano = anoAtual - 3; ano <= anoAtual + 2; ano++) {
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        if (ano === anoAtual) {
            option.selected = true;
        }
        filtroAno.appendChild(option);
    }
    
    // Event listener para mudança de ano
    filtroAno.addEventListener('change', function() {
        anoSelecionado = parseInt(this.value);
        document.getElementById('ano-selecionado').textContent = anoSelecionado;
        carregarPainelProjetos();
    });
}

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
            resumoOperacional: item.resumo_operacional,
            anoInicio: new Date(item.created_at).getFullYear() // Adicionar ano de início baseado na data de criação
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
                    { nome: "Kick Off", previsto: 1, realizado: 1, status: "concluido-prazo", inicio: "2024-03-01", fim: "2024-03-01" },
                    { nome: "Treinamento", previsto: 1, realizado: 1, status: "concluido-prazo", inicio: "2024-03-15", fim: "2024-03-20" },
                    { nome: "Cadastros", previsto: 6, realizado: 6, status: "concluido-prazo", inicio: "2024-04-01", fim: "2024-04-10" },
                    { nome: "Integrações", previsto: 2, realizado: 1, status: "andamento", inicio: "2024-04-15", fim: "2024-04-25" },
                    { nome: "Testes", previsto: 1, realizado: 0, status: "pendente", inicio: "2024-05-01", fim: "2024-05-05" },
                    { nome: "Validação", previsto: 1, realizado: 0, status: "pendente", inicio: "2024-05-10", fim: "2024-05-15" },
                    { nome: "Go Live", previsto: 1, realizado: 0, status: "pendente", inicio: "2024-05-20", fim: "2024-05-20" }
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
    
    // Para compatibilidade, mostrar todas as implantações se não houver filtro específico por ano
    // ou se os dados não têm estrutura de anos
    let implantacoesFiltradas = implantacoes;
    
    // Se há implantações, verificar se alguma tem dados específicos para o ano
    if (implantacoes.length > 0) {
        implantacoesFiltradas = implantacoes.filter(implantacao => {
            // Se não tem anoInicio definido, assumir que é do ano atual
            const anoInicio = implantacao.anoInicio || new Date().getFullYear();
            
            // Verificar se a implantação tem dados para o ano selecionado
            return (anoInicio <= anoSelecionado && (implantacao.statusMeses[anoSelecionado] || implantacao.statusMeses.janeiro)) ||
                   implantacao.fases.some(fase => {
                       if (fase.inicio && fase.fim) {
                           const dataInicio = new Date(fase.inicio);
                           const dataFim = new Date(fase.fim);
                           const anoFaseInicio = dataInicio.getFullYear();
                           const anoFaseFim = dataFim.getFullYear();
                           return (anoFaseInicio <= anoSelecionado && anoFaseFim >= anoSelecionado);
                       }
                       return false;
                   });
        });
    }
    
    implantacoesFiltradas.forEach(implantacao => {
        const row = criarLinhaImplantacao(implantacao);
        tbody.appendChild(row);
    });
    
    // Mostrar mensagem se não houver dados para o ano
    if (implantacoesFiltradas.length === 0 && implantacoes.length > 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="16" style="text-align: center; padding: 20px; color: #666;">
                Nenhuma implantação encontrada para o ano ${anoSelecionado}
            </td>
        `;
        tbody.appendChild(row);
    }
}

// Criar linha da tabela para uma implantação
function criarLinhaImplantacao(implantacao) {
    const row = document.createElement('tr');
    row.dataset.id = implantacao.id;
    
    // Obter status dos meses para o ano selecionado
    const statusMesesAno = obterStatusMesesPorAno(implantacao, anoSelecionado);
    
    // Adicionar classe destacado se houver atraso
    const temAtraso = Object.values(statusMesesAno).some(semanas => 
        semanas && semanas.some(status => status === 'atrasado')
    );
    if (temAtraso) {
        row.classList.add('destacado');
    }
    
    // Verificar se tem Kick Off e Go Live
    const temKickOff = implantacao.fases && implantacao.fases.some(fase => 
        fase.nome.toLowerCase().includes('kick off') || fase.nome.toLowerCase().includes('kickoff')
    );
    const temGoLive = implantacao.fases && implantacao.fases.some(fase => 
        fase.nome.toLowerCase().includes('go live') || fase.nome.toLowerCase().includes('golive')
    );
    
    // Obter status do Kick Off e Go Live
    const kickOffFase = implantacao.fases && implantacao.fases.find(fase => 
        fase.nome.toLowerCase().includes('kick off') || fase.nome.toLowerCase().includes('kickoff')
    );
    const goLiveFase = implantacao.fases && implantacao.fases.find(fase => 
        fase.nome.toLowerCase().includes('go live') || fase.nome.toLowerCase().includes('golive')
    );
    
    // Células básicas
    row.innerHTML = `
        <td>${implantacao.empresa}</td>
        <td>${implantacao.projeto}</td>
        <td>${implantacao.sistema}</td>
        <td>${implantacao.progresso}%</td>
    `;
    
    // Células dos meses
    meses.forEach((mes, indexMes) => {
        const cell = document.createElement('td');
        const statusSemanas = statusMesesAno[mes] || ["pendente", "pendente", "pendente", "pendente"];
        
        // Agrupar status consecutivos iguais
        const gruposStatus = agruparStatusConsecutivos(statusSemanas);
        
        gruposStatus.forEach(grupo => {
            const statusBar = document.createElement('div');
            statusBar.className = `status-bar status-${grupo.status}`;
            statusBar.style.width = `${(grupo.quantidade / statusSemanas.length) * 100}%`;
            statusBar.title = `${nomesMeses[meses.indexOf(mes)]} ${anoSelecionado}: ${grupo.status.replace('-', ' ')} (${grupo.quantidade} semana${grupo.quantidade > 1 ? 's' : ''})`;
            cell.appendChild(statusBar);
        });
        
        // Adicionar ícones de Kick Off e Go Live se a fase ocorrer neste mês
        if (implantacao.fases) {
            implantacao.fases.forEach(fase => {
                const faseNomeLower = fase.nome.toLowerCase();
                const isKickOff = faseNomeLower.includes('kick off') || faseNomeLower.includes('kickoff');
                const isGoLive = faseNomeLower.includes('go live') || faseNomeLower.includes('golive');

                if ((isKickOff || isGoLive) && fase.inicio && fase.fim) {
                    const dataInicio = new Date(fase.inicio);
                    const dataFim = new Date(fase.fim);
                    const mesFaseInicio = dataInicio.getMonth();
                    const mesFaseFim = dataFim.getMonth();
                    const anoFaseInicio = dataInicio.getFullYear();
                    const anoFaseFim = dataFim.getFullYear();

                    // Verificar se a fase ocorre no mês e ano atual da iteração
                    if (anoFaseInicio <= anoSelecionado && anoFaseFim >= anoSelecionado &&
                        indexMes >= mesFaseInicio && indexMes <= mesFaseFim) {
                        
                        const icone = document.createElement('span');
                        icone.className = `icone-fase ${isKickOff ? 'icone-inicio' : 'icone-golive'} ${fase.status === 'concluido-prazo' ? 'concluido' : fase.status === 'andamento' ? 'andamento' : 'pendente'}`;
                        icone.title = `${fase.nome}: ${fase.status.replace('-', ' ')}`;
                        icone.textContent = isKickOff ? '📍' : '🏴';
                        cell.appendChild(icone);
                    }
                }
            });
        }
        
        row.appendChild(cell);
    });
    
    // Event listener para clique na linha
    row.addEventListener('click', () => exibirStatusImplantacao(implantacao));
    
    return row;
}

// Obter status dos meses para um ano específico
function obterStatusMesesPorAno(implantacao, ano) {
    // Se existe dados específicos para o ano
    if (implantacao.statusMeses && implantacao.statusMeses[ano]) {
        return implantacao.statusMeses[ano];
    }
    
    // Se existe o formato antigo (sem separação por ano)
    if (implantacao.statusMeses && !implantacao.statusMeses[ano] && typeof implantacao.statusMeses.janeiro !== 'undefined') {
        // Assumir que os dados são do ano atual ou ano de início
        if (ano === new Date().getFullYear() || ano === implantacao.anoInicio) {
            return implantacao.statusMeses;
        }
    }
    
    // Gerar status baseado nas fases para o ano
    const statusAno = {};
    meses.forEach(mes => {
        statusAno[mes] = ["sem-dados", "sem-dados", "sem-dados", "sem-dados"];
    });
    
    // Aplicar status das fases que ocorrem no ano
    if (implantacao.fases) {
        implantacao.fases.forEach(fase => {
            if (fase.inicio && fase.fim) {
                const dataInicio = new Date(fase.inicio);
                const dataFim = new Date(fase.fim);
                
                const anoInicio = dataInicio.getFullYear();
                const anoFim = dataFim.getFullYear();
                
                // Verificar se a fase se sobrepõe ao ano selecionado
                if (anoInicio <= ano && anoFim >= ano) {
                    const mesInicio = anoInicio === ano ? dataInicio.getMonth() : 0;
                    const mesFim = anoFim === ano ? dataFim.getMonth() : 11;
                    
                    for (let mes = mesInicio; mes <= mesFim; mes++) {
                        const nomeMes = meses[mes];
                        statusAno[nomeMes] = [fase.status, fase.status, fase.status, fase.status];
                    }
                }
            }
        });
    }
    
    return statusAno;
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

        // Célula do previsto
        const previstoCell = document.createElement("td");
        previstoCell.className = "previsto-nome";
        previstoCell.textContent = fase.previsto;
        row.appendChild(previstoCell);

        // Célula do realizado
        const realizadoCell = document.createElement("td");
        realizadoCell.className = "realizado-nome";
        realizadoCell.textContent = fase.realizado;
        row.appendChild(realizadoCell);

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
    diasHeader.innerHTML = "<th></th><th></th><th></th><th></th>"; // Células vazias para fase, previsto, realizado e porcentagem
    mesesHeader.innerHTML = "<th></th><th></th><th></th><th></th>"; // Células vazias para fase, previsto, realizado e porcentagem

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
    
    // Criar container para as frases editáveis
    const frasesContainer = document.createElement('div');
    frasesContainer.id = 'frases-container';
    
    implantacao.resumoOperacional.forEach((item, index) => {
        const fraseDiv = document.createElement('div');
        fraseDiv.className = 'frase-item';
        fraseDiv.style.marginBottom = '15px';
        fraseDiv.style.padding = '10px';
        fraseDiv.style.border = '1px solid #e0e0e0';
        fraseDiv.style.borderRadius = '5px';
        fraseDiv.style.backgroundColor = '#f9f9f9';
        
        const fraseTexto = document.createElement('p');
        fraseTexto.textContent = `• ${item}`;
        fraseTexto.style.marginBottom = '8px';
        fraseTexto.style.cursor = 'pointer';
        fraseTexto.title = 'Clique para editar';
        
        const fraseInput = document.createElement('textarea');
        fraseInput.value = item;
        fraseInput.style.width = '100%';
        fraseInput.style.minHeight = '60px';
        fraseInput.style.display = 'none';
        fraseInput.style.border = '1px solid #ccc';
        fraseInput.style.borderRadius = '3px';
        fraseInput.style.padding = '5px';
        fraseInput.style.fontSize = '14px';
        fraseInput.style.resize = 'vertical';
        
        const botoesDiv = document.createElement('div');
        botoesDiv.style.display = 'none';
        botoesDiv.style.marginTop = '8px';
        
        const btnSalvar = document.createElement('button');
        btnSalvar.textContent = 'Salvar';
        btnSalvar.style.marginRight = '8px';
        btnSalvar.style.padding = '5px 12px';
        btnSalvar.style.backgroundColor = '#4CAF50';
        btnSalvar.style.color = 'white';
        btnSalvar.style.border = 'none';
        btnSalvar.style.borderRadius = '3px';
        btnSalvar.style.cursor = 'pointer';
        
        const btnCancelar = document.createElement('button');
        btnCancelar.textContent = 'Cancelar';
        btnCancelar.style.padding = '5px 12px';
        btnCancelar.style.backgroundColor = '#f44336';
        btnCancelar.style.color = 'white';
        btnCancelar.style.border = 'none';
        btnCancelar.style.borderRadius = '3px';
        btnCancelar.style.cursor = 'pointer';
        
        const btnRemover = document.createElement('button');
        btnRemover.textContent = '🗑️';
        btnRemover.title = 'Remover observação';
        btnRemover.style.padding = '5px 8px';
        btnRemover.style.backgroundColor = '#ff9800';
        btnRemover.style.color = 'white';
        btnRemover.style.border = 'none';
        btnRemover.style.borderRadius = '3px';
        btnRemover.style.cursor = 'pointer';
        btnRemover.style.marginLeft = '8px';
        btnRemover.style.fontSize = '12px';
        
        // Event listeners para edição
        fraseTexto.addEventListener('click', () => {
            fraseTexto.style.display = 'none';
            fraseInput.style.display = 'block';
            botoesDiv.style.display = 'block';
            fraseInput.focus();
        });
        
        btnSalvar.addEventListener('click', async () => {
            const novoTexto = fraseInput.value.trim();
            if (novoTexto) {
                implantacaoAtual.resumoOperacional[index] = novoTexto;
                fraseTexto.textContent = `• ${novoTexto}`;
                
                try {
                    // Salvar no Supabase
                    await SupabaseService.atualizarImplantacao(implantacaoAtual.id, implantacaoAtual);
                    
                    // Atualizar na lista local
                    const indexImplantacao = implantacoes.findIndex(imp => imp.id === implantacaoAtual.id);
                    if (indexImplantacao !== -1) {
                        implantacoes[indexImplantacao] = { ...implantacaoAtual };
                    }
                    
                    mostrarMensagem('Observação atualizada com sucesso!', 'sucesso');
                } catch (error) {
                    console.error('Erro ao salvar observação:', error);
                    mostrarMensagem('Erro ao salvar observação. Tente novamente.', 'erro');
                }
            }
            
            fraseTexto.style.display = 'block';
            fraseInput.style.display = 'none';
            botoesDiv.style.display = 'none';
        });
        
        btnCancelar.addEventListener('click', () => {
            fraseInput.value = implantacaoAtual.resumoOperacional[index];
            fraseTexto.style.display = 'block';
            fraseInput.style.display = 'none';
            botoesDiv.style.display = 'none';
        });
        
        btnRemover.addEventListener('click', () => {
            removerObservacao(index);
        });
        
        botoesDiv.appendChild(btnSalvar);
        botoesDiv.appendChild(btnCancelar);
        botoesDiv.appendChild(btnRemover);
        
        fraseDiv.appendChild(fraseTexto);
        fraseDiv.appendChild(fraseInput);
        fraseDiv.appendChild(botoesDiv);
        
        frasesContainer.appendChild(fraseDiv);
    });
    
    // Botão para adicionar nova frase
    const btnAdicionarFrase = document.createElement('button');
    btnAdicionarFrase.textContent = '+ Adicionar Nova Observação';
    btnAdicionarFrase.style.padding = '10px 15px';
    btnAdicionarFrase.style.backgroundColor = '#2196F3';
    btnAdicionarFrase.style.color = 'white';
    btnAdicionarFrase.style.border = 'none';
    btnAdicionarFrase.style.borderRadius = '5px';
    btnAdicionarFrase.style.cursor = 'pointer';
    btnAdicionarFrase.style.marginTop = '15px';
    
    btnAdicionarFrase.addEventListener('click', () => {
        adicionarNovaObservacao();
    });
    
    resumoConteudo.appendChild(frasesContainer);
    resumoConteudo.appendChild(btnAdicionarFrase);
    
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
                <label>Previsto</label>
                <input type="number" value="${fase.previsto}" data-field="previsto" min="0">
            </div>
            <div class="form-field">
                <label>Realizado</label>
                <input type="number" value="${fase.realizado}" data-field="realizado" min="0" onchange="atualizarProgressoEmTempoReal()">
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
        previsto: 1,
        realizado: 0,
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
    let totalPrevisto = 0;
    let totalRealizado = 0;
    
    implantacaoAtual.fases.forEach(fase => {
        totalPrevisto += parseInt(fase.previsto) || 0;
        totalRealizado += parseInt(fase.realizado) || 0;
    });
    
    if (totalPrevisto > 0) {
        implantacaoAtual.progresso = Math.round((totalRealizado / totalPrevisto) * 100);
    } else {
        implantacaoAtual.progresso = 0;
    }
    
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
                { nome: "Kick Off", previsto: 1, realizado: 0, status: "pendente", inicio: "", fim: "" },
                { nome: "Treinamento", previsto: 1, realizado: 0, status: "pendente", inicio: "", fim: "" },
                { nome: "Cadastros", previsto: 6, realizado: 0, status: "pendente", inicio: "", fim: "" },
                { nome: "Integrações", previsto: 2, realizado: 0, status: "pendente", inicio: "", fim: "" },
                { nome: "Testes", previsto: 1, realizado: 0, status: "pendente", inicio: "", fim: "" },
                { nome: "Validação", previsto: 1, realizado: 0, status: "pendente", inicio: "", fim: "" },
                { nome: "Go Live", previsto: 1, realizado: 0, status: "pendente", inicio: "", fim: "" }
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



// Função para atualizar progresso em tempo real quando o campo "realizado" é alterado
function atualizarProgressoEmTempoReal() {
    if (!implantacaoAtual) return;
    
    // Recalcular progresso baseado nos valores atuais dos campos
    let totalPrevisto = 0;
    let totalRealizado = 0;
    
    const fasesItems = document.querySelectorAll('.fase-item');
    fasesItems.forEach((item, index) => {
        const previstoInput = item.querySelector('[data-field="previsto"]');
        const realizadoInput = item.querySelector('[data-field="realizado"]');
        
        if (previstoInput && realizadoInput) {
            totalPrevisto += parseInt(previstoInput.value) || 0;
            totalRealizado += parseInt(realizadoInput.value) || 0;
        }
    });
    
    let novoProgresso = 0;
    if (totalPrevisto > 0) {
        novoProgresso = Math.round((totalRealizado / totalPrevisto) * 100);
    }
    
    // Atualizar a barra de progresso na tela de status se estiver visível
    if (!document.getElementById('status-implantacao').classList.contains('hidden')) {
        atualizarBarraProgresso(novoProgresso);
    }
    
    // Mostrar feedback visual
    mostrarMensagem(`Progresso atualizado: ${novoProgresso}%`, 'info');
}



// Função para adicionar nova observação
async function adicionarNovaObservacao() {
    if (!implantacaoAtual) return;
    
    const novaObservacao = "Nova observação";
    implantacaoAtual.resumoOperacional.push(novaObservacao);
    
    try {
        // Salvar no Supabase
        await SupabaseService.atualizarImplantacao(implantacaoAtual.id, implantacaoAtual);
        
        // Atualizar na lista local
        const indexImplantacao = implantacoes.findIndex(imp => imp.id === implantacaoAtual.id);
        if (indexImplantacao !== -1) {
            implantacoes[indexImplantacao] = { ...implantacaoAtual };
        }
        
        // Recarregar o resumo para mostrar a nova observação
        preencherResumoStatus(implantacaoAtual);
        
        mostrarMensagem('Nova observação adicionada! Clique nela para editar.', 'sucesso');
    } catch (error) {
        console.error('Erro ao adicionar observação:', error);
        mostrarMensagem('Erro ao adicionar observação. Tente novamente.', 'erro');
        // Remover a observação da lista se houve erro
        implantacaoAtual.resumoOperacional.pop();
    }
}

// Função para remover observação
async function removerObservacao(index) {
    if (!implantacaoAtual || index < 0 || index >= implantacaoAtual.resumoOperacional.length) return;
    
    if (implantacaoAtual.resumoOperacional.length <= 1) {
        mostrarMensagem('Deve haver pelo menos uma observação!', 'erro');
        return;
    }
    
    if (confirm('Tem certeza que deseja remover esta observação?')) {
        const observacaoRemovida = implantacaoAtual.resumoOperacional[index];
        implantacaoAtual.resumoOperacional.splice(index, 1);
        
        try {
            // Salvar no Supabase
            await SupabaseService.atualizarImplantacao(implantacaoAtual.id, implantacaoAtual);
            
            // Atualizar na lista local
            const indexImplantacao = implantacoes.findIndex(imp => imp.id === implantacaoAtual.id);
            if (indexImplantacao !== -1) {
                implantacoes[indexImplantacao] = { ...implantacaoAtual };
            }
            
            // Recarregar o resumo
            preencherResumoStatus(implantacaoAtual);
            
            mostrarMensagem('Observação removida com sucesso!', 'sucesso');
        } catch (error) {
            console.error('Erro ao remover observação:', error);
            mostrarMensagem('Erro ao remover observação. Tente novamente.', 'erro');
            // Restaurar a observação se houve erro
            implantacaoAtual.resumoOperacional.splice(index, 0, observacaoRemovida);
        }
    }
}

