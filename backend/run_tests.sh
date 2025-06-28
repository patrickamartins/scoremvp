#!/bin/bash

# Ativa o ambiente virtual (se estiver usando um)
# source venv/bin/activate

# Executa os testes com cobertura
pytest --cov=app --cov-report=term-missing

# Desativa o ambiente virtual (se estiver usando um)
# deactivate 