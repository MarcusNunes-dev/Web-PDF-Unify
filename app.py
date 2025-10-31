from flask import Flask, render_template, request, send_file, flash, redirect, url_for, session
from PyPDF2 import PdfMerger
import io
import os
from datetime import timedelta
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'sua-chave-secreta-aqui-123'
app.permanent_session_lifetime = timedelta(minutes=30)

# Configurações
USUARIOS_FILE = r'C:\Users\marcus.nunes\Projects\Project-PDF_WEB\usuarios.txt'
MAX_CONTENT_LENGTH = 100 * 1024 * 1024


# ============================================
# FUNÇÕES AUXILIARES
# ============================================

def carregar_usuarios_autorizados():
    """Carrega emails do arquivo"""
    print("\n" + "=" * 60)
    print("📂 CARREGANDO USUÁRIOS AUTORIZADOS...")
    print("=" * 60)
    
    # Verifica se arquivo existe
    if not os.path.exists(USUARIOS_FILE):
        print(f"❌ ERRO: Arquivo '{USUARIOS_FILE}' NÃO EXISTE!")
        print("📝 Criando arquivo vazio...")
        with open(USUARIOS_FILE, 'w', encoding='utf-8') as f:
            f.write('# Adicione emails aqui (um por linha)\n')
            f.write('teste@teste.com\n')
        print("✅ Arquivo criado com email de exemplo: teste@teste.com")
        return {'teste@teste.com'}
    
    # Lê o arquivo
    try:
        with open(USUARIOS_FILE, 'r', encoding='utf-8') as f:
            linhas = f.readlines()
            
        print(f"📄 Arquivo encontrado! Total de linhas: {len(linhas)}")
        print("\n📋 Conteúdo do arquivo:")
        for i, linha in enumerate(linhas, 1):
            print(f"  Linha {i}: '{linha.strip()}' (comprimento: {len(linha.strip())})")
        
        # Filtra emails válidos
        emails = []
        for linha in linhas:
            linha_limpa = linha.strip().lower()
            # Ignora linhas vazias e comentários
            if linha_limpa and not linha_limpa.startswith('#'):
                emails.append(linha_limpa)
        
        print(f"\n✅ Emails válidos encontrados: {len(emails)}")
        for email in emails:
            print(f"  ✓ '{email}'")
        
        print("=" * 60 + "\n")
        
        return set(emails)
        
    except Exception as e:
        print(f"❌ ERRO ao ler arquivo: {e}")
        print("=" * 60 + "\n")
        return set()


def validar_email(email):
    """Validação básica de email"""
    valido = '@' in email and '.' in email.split('@')[1]
    print(f"🔍 Validando email '{email}': {'✅ VÁLIDO' if valido else '❌ INVÁLIDO'}")
    return valido


def usuario_autenticado():
    """Verifica se usuário está logado"""
    autenticado = session.get('autenticado', False)
    print(f"🔐 Verificando autenticação: {'✅ LOGADO' if autenticado else '❌ NÃO LOGADO'}")
    return autenticado


# ============================================
# ROTAS
# ============================================

@app.route('/login', methods=['GET', 'POST'])
def login():
    print("\n" + "🌐 " + "=" * 58)
    print(f"🌐 ROTA /login - Método: {request.method}")
    print("=" * 60)
    
    if usuario_autenticado():
        print("👤 Usuário já está logado, redirecionando...")
        print("=" * 60 + "\n")
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        print("\n📨 RECEBENDO DADOS DO FORMULÁRIO...")
        
        # Pega o email do formulário
        email = request.form.get('email', '').strip().lower()
        
        print(f"📧 Email recebido: '{email}'")
        print(f"📏 Comprimento: {len(email)} caracteres")
        print(f"🔤 Bytes: {email.encode('utf-8')}")
        
        # Validações
        if not email:
            print("❌ Email vazio!")
            flash('Digite seu email!', 'error')
            return render_template('login.html')
        
        if not validar_email(email):
            print("❌ Email com formato inválido!")
            flash('Email inválido!', 'error')
            return render_template('login.html')
        
        # Carrega usuários autorizados
        usuarios_autorizados = carregar_usuarios_autorizados()
        
        print("\n🔍 VERIFICANDO AUTORIZAÇÃO...")
        print(f"📧 Email digitado: '{email}'")
        print(f"📋 Total de emails autorizados: {len(usuarios_autorizados)}")
        print(f"📝 Lista completa: {usuarios_autorizados}")
        
        # Verifica se está na lista
        esta_autorizado = email in usuarios_autorizados
        
        print(f"\n{'✅ AUTORIZADO!' if esta_autorizado else '❌ NÃO AUTORIZADO!'}")
        
        if esta_autorizado:
            # Login bem-sucedido!
            session.permanent = True
            session['autenticado'] = True
            session['email'] = email
            session['nome'] = email.split('@')[0].title()
            
            print(f"🎉 LOGIN BEM-SUCEDIDO!")
            print(f"👤 Nome: {session['nome']}")
            print(f"📧 Email: {session['email']}")
            print("=" * 60 + "\n")
            
            flash(f'Bem-vindo(a), {session["nome"]}!', 'success')
            return redirect(url_for('index'))
        else:
            print("🚫 LOGIN NEGADO - Email não autorizado")
            print("\n💡 DICA: Verifique se o email está exatamente igual no arquivo usuarios.txt")
            print("=" * 60 + "\n")
            
            flash('Email não autorizado! Contate o administrador.', 'error')
            return render_template('login.html')
    
    # GET - Apenas mostra o formulário
    print("📄 Exibindo formulário de login")
    print("=" * 60 + "\n")
    return render_template('login.html')


@app.route('/logout')
def logout():
    print("\n🚪 LOGOUT")
    session.clear()
    flash('Você saiu do sistema.', 'success')
    return redirect(url_for('login'))


@app.route('/')
def index():
    print("\n🏠 ROTA /")
    if not usuario_autenticado():
        print("❌ Não autenticado, redirecionando para login")
        flash('Faça login para acessar o sistema.', 'warning')
        return redirect(url_for('login'))
    
    print(f"✅ Usuário autenticado: {session.get('nome')}")
    return render_template('index.html', nome_usuario=session.get('nome', 'Usuário'))


@app.route('/merge', methods=['POST'])
def merge_pdfs():
    if not usuario_autenticado():
        return {'erro': 'Não autenticado'}, 401
    
    try:
        files = request.files.getlist('pdfs')
        
        if not files or len(files) < 2:
            return {'erro': 'Selecione pelo menos 2 PDFs!'}, 400
        
        for pdf_file in files:
            if not pdf_file.filename or not pdf_file.filename.lower().endswith('.pdf'):
                return {'erro': f'Arquivo {pdf_file.filename} não é PDF!'}, 400
        
        merger = PdfMerger()
        
        for pdf_file in files:
            merger.append(pdf_file)
        
        output = io.BytesIO()
        merger.write(output)
        output.seek(0)
        merger.close()

        # 👉 GERA NOME COM DATA/HORA
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        nome_arquivo = f'PDF_Unificado_{timestamp}.pdf'
        
        print(f"[LOG] {session.get('email')} unificou {len(files)} PDFs → {nome_arquivo}")
        
        return send_file(
            output,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=nome_arquivo  # 👉 USA O NOME COM TIMESTAMP
        )
    
    except Exception as e:
        print(f"[ERRO] {str(e)}")
        return {'erro': f'Erro ao processar: {str(e)}'}, 500



@app.route('/api/status')
def api_status():
    return {
        'autenticado': usuario_autenticado(),
        'usuario': session.get('nome', None)
    }


@app.errorhandler(404)
def nao_encontrado(e):
    return redirect(url_for('index'))


# ============================================
# INICIALIZAÇÃO
# ============================================

if __name__ == '__main__':
    print("\n" + "🚀 " + "=" * 58)
    print("🚀 PDF UNIFY - SERVIDOR INICIANDO")
    print("=" * 60)
    
    # Carrega usuários na inicialização
    usuarios = carregar_usuarios_autorizados()
    
    print(f"📊 Total de usuários autorizados: {len(usuarios)}")
    print(f"🔒 Autenticação: {'✅ ATIVA' if usuarios else '⚠️ NENHUM USUÁRIO!'}")
    print(f"🌐 Acesse: http://localhost:5000")
    print("=" * 60)
    print("💡 DICA: Olhe as mensagens acima para debugar problemas")
    print("=" * 60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)