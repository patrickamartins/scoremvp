import os
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Score MVP Image Service")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique os domínios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Caminho para a pasta de imagens
IMAGES_DIR = os.path.join(os.path.dirname(__file__), "images")
os.makedirs(IMAGES_DIR, exist_ok=True)

# Montar arquivos estáticos
app.mount("/images", StaticFiles(directory=IMAGES_DIR), name="images")

@app.get("/")
def root():
    return {"message": "Score MVP Image Service", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "ok", "images_dir": IMAGES_DIR}

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Endpoint para fazer upload de uma imagem"""
    try:
        # Verificar se é uma imagem
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Apenas imagens são permitidas")
        
        # Ler o conteúdo do arquivo
        contents = await file.read()
        
        # Salvar o arquivo
        file_path = os.path.join(IMAGES_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(contents)
        
        logger.info(f"Imagem salva: {file.filename} ({len(contents)} bytes)")
        
        return {
            "filename": file.filename,
            "size": len(contents),
            "url": f"/images/{file.filename}"
        }
    except Exception as e:
        logger.error(f"Erro ao fazer upload: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")

@app.get("/upload/{filename:path}")
async def get_image(filename: str):
    """Endpoint para buscar uma imagem específica"""
    file_path = os.path.join(IMAGES_DIR, filename)
    
    if os.path.exists(file_path):
        return FileResponse(file_path)
    else:
        logger.warning(f"Imagem não encontrada: {filename}")
        raise HTTPException(status_code=404, detail="Image not found")

@app.get("/list")
async def list_images():
    """Lista todas as imagens disponíveis"""
    try:
        files = []
        for filename in os.listdir(IMAGES_DIR):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                file_path = os.path.join(IMAGES_DIR, filename)
                size = os.path.getsize(file_path)
                files.append({
                    "filename": filename,
                    "size": size,
                    "url": f"/images/{filename}"
                })
        return {"images": files, "count": len(files)}
    except Exception as e:
        logger.error(f"Erro ao listar imagens: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Starting image service on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port) 