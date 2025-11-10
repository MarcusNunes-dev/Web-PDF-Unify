// ========================================
// VARIÁVEIS GLOBAIS
// ========================================
let arquivosSelecionados = [];
let draggedElement = null; // Elemento sendo arrastado na lista

// Elementos do HTML
const inputArquivos = document.getElementById('pdfs');
const dropArea = document.getElementById('dropArea');
const btnSelecionar = document.getElementById('btnSelecionar');
const fileList = document.getElementById('fileList');
const fileListContainer = document.getElementById('fileListContainer');
const emptyState = document.getElementById('emptyState');
const btnUnificar = document.getElementById('btnUnificar');
const btnLimpar = document.getElementById('btnLimpar');
const mergeForm = document.getElementById('mergeForm');
const contadorBadge = document.getElementById('contadorBadge');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');


// ========================================
// DRAG & DROP NA ÁREA DE UPLOAD
// ========================================

// Previne comportamento padrão do navegador
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Visual feedback quando arrasta sobre a área
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
        dropArea.classList.add('drag-over');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => {
        dropArea.classList.remove('drag-over');
    }, false);
});

// Quando solta arquivos na área
dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// Clique na área ativa o input
btnSelecionar.addEventListener('click', () => {
    inputArquivos.click();
});

dropArea.addEventListener('click', (e) => {
    if (e.target === dropArea || e.target.classList.contains('upload-text') || 
        e.target.classList.contains('upload-icon')) {
        inputArquivos.click();
    }
});

// Seleção via input
inputArquivos.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    inputArquivos.value = ''; // Limpa para permitir reselecionar
});


// ========================================
// PROCESSAR ARQUIVOS
// ========================================
function handleFiles(files) {
    const novosArquivos = Array.from(files);
    
    // Filtra apenas PDFs
    const pdfsFiltrados = novosArquivos.filter(arquivo => {
        const ehPDF = arquivo.type === 'application/pdf' || arquivo.name.toLowerCase().endsWith('.pdf');
        
        if (!ehPDF) {
            mostrarNotificacao(`❌ ${arquivo.name} não é um PDF!`, 'error');
        }
        
        return ehPDF;
    });
    
    if (pdfsFiltrados.length === 0) return;
    
    // Adiciona evitando duplicados
    pdfsFiltrados.forEach(arquivo => {
        const jaExiste = arquivosSelecionados.some(a => 
            a.name === arquivo.name && a.size === arquivo.size
        );
        
        if (!jaExiste) {
            arquivosSelecionados.push(arquivo);
        }
    });
    
    atualizarLista();
    mostrarNotificacao(`✅ ${pdfsFiltrados.length} arquivo(s) adicionado(s)`, 'success');
}


// ========================================
// ATUALIZAR LISTA VISUAL
// ========================================
function atualizarLista() {
    fileList.innerHTML = '';
    
    // Atualiza contador
    document.getElementById('contador').textContent = arquivosSelecionados.length;
    
    if (arquivosSelecionados.length === 0) {
        fileListContainer.style.display = 'none';
        emptyState.style.display = 'block';
        contadorBadge.style.display = 'none';
        btnUnificar.disabled = true;
        btnLimpar.disabled = true;
        return;
    }
    
    fileListContainer.style.display = 'block';
    emptyState.style.display = 'none';
    contadorBadge.style.display = 'inline-block';
    
    // Cria itens da lista
    arquivosSelecionados.forEach((arquivo, index) => {
        const li = document.createElement('li');
        li.className = 'file-item';
        li.draggable = true; // Permite arrastar
        li.dataset.index = index; // Guarda o índice
        
        li.innerHTML = `
            <div class="file-info">
                <span class="file-number">${index + 1}</span>
                <span class="file-name">${arquivo.name}</span>
            </div>
            <div class="file-actions">
                <button type="button" class="btn-action up" onclick="moverParaCima(${index})" 
                        ${index === 0 ? 'disabled' : ''} title="Mover para cima">
                    ⬆️
                </button>
                <button type="button" class="btn-action down" onclick="moverParaBaixo(${index})" 
                        ${index === arquivosSelecionados.length - 1 ? 'disabled' : ''} title="Mover para baixo">
                    ⬇️
                </button>
                <button type="button" class="btn-action remove" onclick="removerArquivo(${index})" title="Remover">
                    ❌
                </button>
            </div>
        `;
        
        // Event listeners para drag & drop na lista
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragover', handleDragOver);
        li.addEventListener('drop', handleDropInList);
        li.addEventListener('dragend', handleDragEnd);
        
        fileList.appendChild(li);
    });
    
    btnUnificar.disabled = arquivosSelecionados.length < 2;
    btnLimpar.disabled = false;
}


// ========================================
// DRAG & DROP NA LISTA (REORDENAR)
// ========================================
function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    
    e.dataTransfer.dropEffect = 'move';
    
    // Visual feedback
    if (draggedElement !== this) {
        this.classList.add('drag-over');
    }
    
    return false;
}

function handleDropInList(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    this.classList.remove('drag-over');
    
    if (draggedElement !== this) {
        // Pega os índices
        const draggedIndex = parseInt(draggedElement.dataset.index);
        const targetIndex = parseInt(this.dataset.index);
        
        // Reordena o array
        const [removed] = arquivosSelecionados.splice(draggedIndex, 1);
        arquivosSelecionados.splice(targetIndex, 0, removed);
        
        atualizarLista();
    }
    
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    
    // Remove classe de todos
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}


// ========================================
// FUNÇÕES DE MANIPULAÇÃO
// ========================================
function moverParaCima(index) {
    if (index > 0) {
        [arquivosSelecionados[index], arquivosSelecionados[index - 1]] = 
        [arquivosSelecionados[index - 1], arquivosSelecionados[index]];
        atualizarLista();
    }
}

function moverParaBaixo(index) {
    if (index < arquivosSelecionados.length - 1) {
        [arquivosSelecionados[index], arquivosSelecionados[index + 1]] = 
        [arquivosSelecionados[index + 1], arquivosSelecionados[index]];
        atualizarLista();
    }
}

function removerArquivo(index) {
    const nomeArquivo = arquivosSelecionados[index].name;
    arquivosSelecionados.splice(index, 1);
    atualizarLista();
    mostrarNotificacao(`🗑️ ${nomeArquivo} removido`, 'warning');
}

function limparLista() {
    if (confirm('Deseja realmente limpar toda a lista?')) {
        arquivosSelecionados = [];
        atualizarLista();
        mostrarNotificacao('🗑️ Lista limpa', 'warning');
    }
}


// ========================================
// ENVIAR FORMULÁRIO
// ========================================
mergeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (arquivosSelecionados.length < 2) {
        mostrarNotificacao('⚠️ Selecione pelo menos 2 PDFs!', 'warning');
        return;
    }
    
    // Prepara FormData
    const formData = new FormData();
    arquivosSelecionados.forEach(arquivo => {
        formData.append('pdfs', arquivo);
    });
    
    // Mostra progresso
    mostrarProgresso(0);
    btnUnificar.disabled = true;
    btnLimpar.disabled = true;
    
    try {
        // Simula progresso (porque o servidor processa rápido demais)
        let progresso = 0;
        const intervalo = setInterval(() => {
            progresso += 10;
            if (progresso <= 90) {
                mostrarProgresso(progresso);
            }
        }, 150);
        
        // Envia requisição
        const response = await fetch('/merge', {
            method: 'POST',
            body: formData
        });
        
        clearInterval(intervalo);
        
        if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.erro || 'Erro ao unificar PDFs');
        }
        
        // Download do PDF
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'PDF_Unificado.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        // Finaliza progresso
        mostrarProgresso(100);
        
        setTimeout(() => {
            esconderProgresso();
            mostrarNotificacao('✅ PDF unificado com sucesso!', 'success');
            
            // Limpa lista após 2 segundos
            setTimeout(() => {
                arquivosSelecionados = [];
                atualizarLista();
            }, 2100);
        }, 500);
        
    } catch (error) {
        esconderProgresso();
        mostrarNotificacao(`❌ Erro: ${error.message}`, 'error');
        
        // Verifica se é erro de autenticação
        if (error.message.includes('autenticado')) {
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        }
    } finally {
        btnUnificar.disabled = false;
        btnLimpar.disabled = false;
    }
});


// ========================================
// BARRA DE PROGRESSO
// ========================================
function mostrarProgresso(porcentagem) {
    progressContainer.style.display = 'block';
    progressFill.style.width = porcentagem + '%';
    progressText.textContent = `Processando... ${porcentagem}%`;
}

function esconderProgresso() {
    setTimeout(() => {
        progressContainer.style.display = 'none';
        progressFill.style.width = '0%';
    }, 500);
}


// ========================================
// NOTIFICAÇÕES (Toast)
// ========================================
function mostrarNotificacao(mensagem, tipo = 'success') {
    // Remove notificações anteriores
    const notifAntigas = document.querySelectorAll('.toast-notification');
    notifAntigas.forEach(n => n.remove());
    
    // Cria nova notificação
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${tipo}`;
    toast.textContent = mensagem;
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 15px 25px;
        background: ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#f44336' : '#FF9800'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-size: 14px;
        font-weight: bold;
    `;
    
    document.body.appendChild(toast);
    
    // Remove após 3 segundos
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Adiciona animações no head
if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}


// ========================================
// VERIFICAR SESSÃO PERIODICAMENTE
// ========================================
setInterval(async () => {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        if (!data.autenticado) {
            alert('⚠️ Sua sessão expirou. Faça login novamente.');
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Erro ao verificar sessão:', error);
    }
}, 5 * 60 * 1000); // Verifica a cada 5 minutos


// ========================================
// INICIALIZAÇÃO
// ========================================
console.log('📄 PDF Unify - Sistema carregado!');
console.log('✅ Drag & Drop ativado');
console.log('🔐 Autenticação ativa');