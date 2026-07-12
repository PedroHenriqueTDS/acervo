# Acervo — Sistema de Gestão de Biblioteca

O **Acervo** é uma plataforma web completa (fullstack) voltada para o gerenciamento de acervos físicos e fluxos de empréstimos de uma biblioteca. O sistema é dividido em dois painéis principais:
*   **Painel do Leitor (Usuário)**: Consulta de títulos, solicitação de empréstimo (limite de 3 ativos), reserva de livros esgotados com fila de espera, acompanhamento de multas por atraso e prazos de devolução.
*   **Painel do Bibliotecário (Admin)**: Gestão de estoque (CRUD de livros e categorias), recepção e processamento de devoluções com cálculo automático de multas, acompanhamento de atrasos gerais e dashboard analítico.

---

## 🛠️ Tecnologias Utilizadas

### Back-end (API REST)
*   **Java 17** (Spring Boot 3.3.x)
*   **Spring Security** (Autenticação/Autorização baseada em tokens JWT stateless)
*   **Spring Data JPA** (Persistência relacional)
*   **PostgreSQL** (Banco de dados relacional robusto)
*   **Flyway Migrations** (Controle e histórico de alterações de tabelas)
*   **Spring Mail** (Envio automático de e-mails para notificações de empréstimo, alertas de vencimento e reservas)
*   **Spring Scheduler** (Cron jobs automatizados para expirar reservas em 48h e calcular multas de R$ 1,00/dia)
*   **OpenAPI/Swagger UI** (Documentação interativa dos endpoints)
*   **JUnit 5 & Mockito** (Testes automatizados unitários nos fluxos de negócio críticos)

### Front-end (Web)
*   **React 18** + **TypeScript** (Interface dinâmica e fortemente tipada)
*   **Vite** (Ambiente de desenvolvimento e build rápido)
*   **Vanilla CSS / CSS Custom Properties** (Identidade visual estilizada sob medida inspirada em cartões de catalogação clássicos)
*   **Axios** (Integração e interceptadores automatizados de token JWT)
*   **Lucide React** (Ícones modernos)

### Infraestrutura & Ferramentas
*   **Docker & Docker Compose** (Containerização e orquestração de toda a stack local)
*   **Mailpit** (Servidor SMTP simulado localmente com caixa de entrada web em desenvolvimento)

---

## 🎨 Identidade Visual e Assinatura de Design

Fugindo do visual genérico de painéis SaaS azuis corporativos, a identidade visual do **Acervo** inspira-se em bibliotecas clássicas:
1.  **Paleta Retrô**: Contraste refinado entre **Marfim** (`#F5F1E8`), **Navy Escuro** (`#14181F`) e detalhes em **Verde-azeitona** (`#4A5D53`) para devoluções regulares, **Carmesim** (`#8B2635`) para atrasados e **Dourado** (`#C9A227`) para destaques e botões primários.
2.  **Tipografia Clássica**: Títulos serifados elegantes (`Source Serif 4`), textos de interface limpos (`Inter`) e metadados de catalogação monoespaçados (`IBM Plex Mono`).
3.  **Carimbo Retro (SeloCarimbo)**: Status de transações são estilizados como selos carimbados levemente rotacionados (simulando tinta sobre papel texturizado), substituindo badges arredondados genéricos.
4.  **Lombadas Ilustradas (Hardcover Fallback)**: Caso a API externa (Open Library Covers) não retorne a imagem da capa do livro via ISBN, o sistema calcula uma cor vintage exclusiva com base no hash do ISBN e renderiza localmente uma capa estilizada com a inicial do título em destaque.

---

## 🚀 Como Executar o Projeto Localmente

Certifique-se de ter o **Docker** e o **Docker Compose** instalados em sua máquina.

1.  Abra o terminal no diretório raiz do projeto.
2.  Inicie a orquestração de todos os containers com o comando:
    ```bash
    docker-compose up --build
    ```
3.  Aguarde o download das imagens e a inicialização dos serviços. Os endpoints estarão disponíveis em:
    *   **Front-end Web**: [http://localhost:3000](http://localhost:3000)
    *   **Swagger UI (API Doc)**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
    *   **Caixa de Entrada Web (Mailpit)**: [http://localhost:8025](http://localhost:8025)
    *   **Banco de Dados (Postgres)**: `localhost:5432` (Credenciais: user=`postgres` / pass=`postgres` / db=`acervo`)

---

## 🧪 Roteiro de Demonstração e Testes

Para avaliar o sistema rapidamente sem esperar tempos de cron de 24h ou configurar SMTPs reais, siga estas etapas:

1.  **Cadastrar Contas**:
    *   Acesse o front-end ([http://localhost:3000](http://localhost:3000)).
    *   Clique em "Criar Novo Cadastro".
    *   Crie um perfil do tipo **Leitor** (ex: `leitor@email.com`).
    *   Crie outro perfil do tipo **Bibliotecário** (ex: `admin@email.com`).
2.  **Catalogar Livros**:
    *   Faça login como **Bibliotecário** (`admin@email.com`).
    *   Vá na aba **Estoque Livros** e insira alguns títulos (digite ISBNs reais para ver as capas carregadas do Open Library, ou invente ISBNs curtos para ver o fallback das lombadas ilustradas). Defina quantidades como `1` para testar limites e reservas.
3.  **Fluxo de Locação e Estoque**:
    *   Faça login como **Leitor** (`leitor@email.com`).
    *   Na aba **Catálogo**, localize o livro e clique em **Emprestar**.
    *   Você será redirecionado para a aba **Meus Empréstimos** onde verá o comprovante de retirada ativo. O estoque disponível do livro é decrementado em tempo real.
4.  **Testar Limite e Reserva (Fila de Espera)**:
    *   Como Leitor, tente retirar mais de 3 livros. O sistema bloqueará a transação (`RN04`).
    *   Localize um livro sem estoque (Qtd. Disponível = 0). O botão mudará automaticamente para **Reservar**. Clique nele para entrar na fila.
5.  **Confirmação de Reserva na Devolução**:
    *   Faça login como **Bibliotecário**. Vá em **Empréstimos** e clique em **Devolver** para liberar a cópia que o Leitor reservou.
    *   Nesse momento, a cópia **não** volta ao estoque geral. Ela fica retida atrás do balcão e o Leitor que estava na fila é notificado via e-mail.
    *   Acesse o Mailpit ([http://localhost:8025](http://localhost:8025)) e observe o e-mail de reserva disponível enviado pelo sistema.
    *   Faça login novamente como o **Leitor**. Vá em **Meus Empréstimos** > aba **Fila de Reservas** e veja o status como **Notificado**. Você terá um botão para **Confirmar Empréstimo** e efetivar a retirada dentro do prazo de 48h.
6.  **Simular Multas e Atrasos (Manual Trigger)**:
    *   Como **Bibliotecário**, acesse a aba **Empréstimos** e clique no botão **Simular Job Diário (Multas)**.
    *   Isso força a execução manual do cron job diário de atrasos no back-end. Locações vencidas passarão a calcular multas cumulativas de R$ 1,00/dia e reservas pendentes com mais de 48h expirarão, passando o direito de retirada para o próximo da fila.
