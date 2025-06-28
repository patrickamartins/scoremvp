#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
sys.path.append('.')

from app.core.config import settings

def test_config():
    print("=== Testando Configurações ===")
    print(f"POSTGRES_SERVER: {settings.POSTGRES_SERVER}")
    print(f"POSTGRES_USER: {settings.POSTGRES_USER}")
    print(f"POSTGRES_DB: {settings.POSTGRES_DB}")
    print(f"SQLALCHEMY_DATABASE_URI: {settings.SQLALCHEMY_DATABASE_URI}")
    print(f"BACKEND_CORS_ORIGINS: {settings.BACKEND_CORS_ORIGINS}")
    print(f"FRONTEND_URL: {settings.FRONTEND_URL}")
    
    # Testar se a string de conexão está correta
    if settings.SQLALCHEMY_DATABASE_URI:
        print("✅ String de conexão gerada corretamente")
    else:
        print("❌ Erro na string de conexão")

if __name__ == "__main__":
    test_config() 