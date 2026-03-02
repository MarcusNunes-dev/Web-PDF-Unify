Web-PDF-Unify
Web-PDF-Unify é uma aplicação web desenvolvida para simplificar a gestão de documentos digitais. Com ela, os usuários podem realizar o upload de múltiplos arquivos PDF e unificá-los em um único documento de forma rápida e eficiente.

Funcionalidades
Upload Dinâmico: Seleção de múltiplos arquivos PDF para processamento.

Unificação (Merge): Combinação dos arquivos enviados em um único PDF final.

Interface Web: Ambiente amigável desenvolvido com Flask para interação direta no navegador.

Download Direto: Após a unificação, o arquivo consolidado fica disponível para download imediato.

Tecnologias Utilizadas
Este projeto foi construído utilizando as seguintes ferramentas:

Linguagem: Python

Framework Web: Flask

Manipulação de PDF: PyPDF2 (ou outra biblioteca de manipulação de PDF utilizada)

Frontend: HTML5 e CSS3

Pré-requisitos
Antes de começar, você precisará ter instalado em sua máquina:

Python 3.x

pip (Gerenciador de pacotes do Python)

Git.

Instalação e Execução
Clone o repositório:

Bash
git clone https://github.com/MarcusNunes-dev/Web-PDF-Unify.git
Entre no diretório do projeto:

Bash
cd Web-PDF-Unify
Crie um ambiente virtual (recomendado):

Bash
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
Instale as dependências:

Bash
pip install -r requirements.txt
Execute a aplicação:

Bash
flask run
Ou, se houver um arquivo principal: python app.py

Acesse no navegador:
Abra http://127.0.0.1:5000 para visualizar a aplicação.

Contribuição
Contribuições são bem-vindas! Siga os passos abaixo:

Faça um Fork do projeto.

Crie uma Branch para sua funcionalidade (git checkout -b feature/NovaFuncionalidade).

Faça o Commit de suas alterações (git commit -m 'Adicionando nova funcionalidade').

Envie para o repositório remoto (Push) (git push origin feature/NovaFuncionalidade).

Abra um Pull Request.

Desenvolvido por Marcus Nunes
