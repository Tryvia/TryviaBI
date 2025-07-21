// fix_login.js
// Este arquivo foi criado para evitar erro 404 no portal.
// Adicione aqui qualquer lógica de login customizada se necessário.

console.log('fix_login.js carregado. Nenhuma lógica implementada.');

// Esconde a aba de início interna para clientes ao carregar a página
function esconderInicioParaCliente() {
    const userType = localStorage.getItem('user_type') || sessionStorage.getItem('user_type');
    const clientId = localStorage.getItem('client_id') || sessionStorage.getItem('client_id');
    const isClient = (userType === 'client' || userType === 'cliente') && clientId && clientId !== 'null' && clientId !== '' && clientId !== 'undefined';
    if (isClient) {
        const inicioInterno = document.getElementById('inicio');
        if (inicioInterno) {
            inicioInterno.style.display = 'none';
            inicioInterno.classList.remove('active');
        }
        // Opcional: garantir que a aba cliente fique ativa
        const inicioCliente = document.getElementById('inicio-cliente');
        if (inicioCliente) {
            inicioCliente.style.display = 'block';
            inicioCliente.classList.add('active');
        }
    }
}

// Executa ao carregar a página
window.addEventListener('DOMContentLoaded', esconderInicioParaCliente);
