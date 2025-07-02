# Painel de Projetos - Implantação com Supabase

Este projeto é um sistema de gestão de implantações que utiliza o Supabase como base de dados para armazenar todas as informações.

## Configuração do Supabase

### 1. Estrutura da Base de Dados

Para que a aplicação funcione corretamente, é necessário criar a seguinte tabela no Supabase:

```sql
-- Criar tabela de implantações
CREATE TABLE implantacoes (
    id BIGSERIAL PRIMARY KEY,
    empresa TEXT NOT NULL,
    projeto TEXT NOT NULL,
    sistema TEXT NOT NULL,
    gestor TEXT NOT NULL,
    especialista TEXT NOT NULL,
    logo_url TEXT,
    progresso INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Pendente',
    status_meses JSONB,
    fases JSONB,
    resumo_operacional TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar bucket para armazenamento de logos
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

-- Política de acesso para a tabela implantacoes (permitir todas as operações)
CREATE POLICY "Permitir todas as operações" ON implantacoes
FOR ALL USING (true) WITH CHECK (true);

-- Política de acesso para o bucket logos (permitir upload e download)
CREATE POLICY "Permitir upload de logos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'logos');

CREATE POLICY "Permitir download de logos" ON storage.objects
FOR SELECT USING (bucket_id = 'logos');

CREATE POLICY "Permitir atualização de logos" ON storage.objects
FOR UPDATE USING (bucket_id = 'logos');

CREATE POLICY "Permitir exclusão de logos" ON storage.objects
FOR DELETE USING (bucket_id = 'logos');
```

### 2. Configuração das Credenciais

As credenciais do Supabase já estão configuradas no ficheiro `supabase-config.js`:

- **URL**: https://obwgegvrtxrlombmkaej.supabase.co
- **Chave Anon**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9id2dlZ3ZydHhybG9tYm1rYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NDcxOTMsImV4cCI6MjA2NDAyMzE5M30.0Ng21Ywqrm6eDqbclFyeOhARpJCyWvX7b-0dJLE1QwM

## Funcionalidades Implementadas

### 1. Gestão de Implantações
- ✅ Adicionar nova implantação
- ✅ Visualizar lista de implantações
- ✅ Editar timeline de implantação
- ✅ Excluir implantação
- ✅ Upload de logos de clientes

### 2. Integração com Supabase
- ✅ Carregamento automático de dados
- ✅ Salvamento em tempo real
- ✅ Upload de ficheiros (logos)
- ✅ Sincronização automática
- ✅ Fallback para dados locais em caso de erro

### 3. Interface de Utilizador
- ✅ Painel principal com timeline visual
- ✅ Tela de detalhes de implantação
- ✅ Modais para edição e confirmação
- ✅ Filtros de pesquisa
- ✅ Mensagens de feedback
- ✅ Design responsivo

## Como Utilizar

### 1. Abrir a Aplicação
Abra o ficheiro `index.html` num navegador web moderno.

### 2. Primeira Utilização
- A aplicação tentará conectar-se ao Supabase automaticamente
- Se a conexão falhar, utilizará dados locais como fallback
- Mensagens informativas aparecerão no canto superior direito

### 3. Adicionar Nova Implantação
1. Clique no botão "Adicionar Nova Implantação"
2. Preencha todos os campos obrigatórios
3. Opcionalmente, faça upload do logo do cliente
4. Clique em "Salvar"

### 4. Editar Timeline
1. Clique numa implantação para ver os detalhes
2. Clique em "Editar Timeline"
3. Modifique as fases conforme necessário
4. Clique em "Salvar Alterações"

### 5. Funcionalidades Adicionais
- **Pesquisa**: Use o campo de filtro para encontrar implantações
- **Atalhos de Teclado**:
  - `Ctrl+N`: Nova implantação
  - `Esc`: Fechar modal
  - `Backspace`: Voltar ao painel principal

## Estrutura de Ficheiros

```
/
├── index.html          # Página principal
├── style.css           # Estilos da aplicação
├── script.js           # Lógica principal da aplicação
├── supabase-config.js  # Configuração e serviços do Supabase
└── README.md           # Este ficheiro
```

## Resolução de Problemas

### Erro de Conexão com Supabase
- Verifique se as credenciais estão corretas
- Confirme se a tabela foi criada corretamente
- Verifique as políticas de acesso (RLS)

### Upload de Logo Não Funciona
- Confirme se o bucket 'logos' foi criado
- Verifique as políticas de acesso ao storage
- Certifique-se de que o ficheiro é uma imagem válida

### Dados Não Aparecem
- Abra as ferramentas de desenvolvimento (F12)
- Verifique a consola para erros
- Confirme se a estrutura da tabela está correta

## Suporte Técnico

Para questões técnicas ou problemas com a integração do Supabase, verifique:

1. Console do navegador para erros JavaScript
2. Painel do Supabase para logs de API
3. Configuração das políticas de segurança (RLS)
4. Estrutura da base de dados

A aplicação foi desenvolvida para ser robusta e incluir fallbacks para garantir funcionamento mesmo em caso de problemas de conectividade.

