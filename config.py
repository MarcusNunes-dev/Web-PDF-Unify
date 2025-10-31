"""
Configurações da aplicação
"""
import os

class Config:
    # Chave secreta para sessões (mude isso!)
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'sua-chave-super-secreta-aqui-mude-em-producao'
    
    # Arquivo com emails autorizados
    USUARIOS_FILE = 'usuarios.txt'
    
    # Configurações de upload
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB
    UPLOAD_EXTENSIONS = ['.pdf']
    
    # Timeout de sessão (30 minutos)
    PERMANENT_SESSION_LIFETIME = 1800