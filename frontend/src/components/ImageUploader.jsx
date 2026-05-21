import { useState, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faXmark, faArrowUp, faSpinner } from '@fortawesome/free-solid-svg-icons';

function ImageUploader({chatAtivo}) {
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // --- LÓGICA JAVASCRIPT (Inalterada) ---

  const handleFileSelect = async (event) => {
    const files = event.target.files;
    if (!files) return;

    const readFile = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ 
          id: Date.now() + Math.random(), 
          name: file.name, 
          preview: reader.result 
        });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    try {
      const newFilesPromises = Array.from(files).map(file => readFile(file));
      const newImages = await Promise.all(newFilesPromises);
      setImages(prevImages => [...prevImages, ...newImages]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error("Erro ao ler arquivos:", error);
    }
  };

  const handleRemoveImage = (idToRemove) => {
    setImages(prevImages => prevImages.filter(img => img.id !== idToRemove));
  };

  const handleUploadToServer = async () => {
    if (images.length === 0) return;

    setIsUploading(true);
    try {
      const payload = images.map(img => ({
        name: img.name,
        base64: img.preview
      }));

      // Substitua pelo seu endpoint real
      // await axios.post('/api/upload-multiplo', { images: payload });
      console.log("Enviando:", payload);
      let image_upload = await axios.post(`/api/apostilas/image_upload`, {imagens: images, chatUUID: chatAtivo}, {headers: {
        authorization: localStorage.getItem('h')
      }})
      console.log(image_upload.data)

      alert("Upload realizado com sucesso!");
      setImages([]); // Limpa após sucesso
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Falha no envio.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- FIM DA LÓGICA ---

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-end min-h-screen bg-gray-900 p-4">
      
      {/* 1. ÁREA DE PREVIEWS (Exibida apenas se houver imagens) */}
      {images.length > 0 && (
        <div className="w-full mb-3 p-3 bg-gray-800/50 rounded-2xl border border-gray-700 backdrop-blur-sm">
          <div className="flex flex-wrap gap-2 justify-center">
            {images.map((image) => (
              <div 
                key={image.id} 
                className="relative group w-20 h-20 flex-shrink-0"
              >
                <img 
                  src={image.preview} 
                  alt={image.name} 
                  className="w-full h-full object-cover rounded-xl border border-gray-600" 
                />
                
                {/* Botão X para remover */}
                <button 
                  onClick={() => handleRemoveImage(image.id)}
                  className="absolute -top-2 -right-2 bg-black/80 text-gray-300 hover:text-white hover:bg-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs transition-colors border border-gray-600"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. BARRA DE AÇÕES (O container estilo ChatGPT) */}
      <div className="w-full relative flex items-center justify-between bg-gray-800 rounded-2xl px-4 py-3 shadow-lg border border-gray-700">
        
        {/* Botão de Adicionar (Esquerda) */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
          title="Adicionar imagens"
        >
          <FontAwesomeIcon icon={faPlus} className="text-xl" />
        </button>
        
        {/* Input Escondido */}
        <input 
          ref={fileInputRef}
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileSelect} 
        />

        {/* Texto Central (Placeholder) */}
        <span className="flex-1 text-center text-gray-500 text-sm select-none pointer-events-none">
          {images.length > 0 ? `${images.length} imagem(ns) selecionada(s)` : "Selecione arquivos para upload"}
        </span>

        {/* Botão de Enviar (Direita) */}
        {/* Fica branco (ativo) só se tiver imagens */}
        <button 
          onClick={handleUploadToServer}
          disabled={isUploading || images.length === 0}
          className="p-2 rounded-full bg-white text-black hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 transition-colors duration-200"
        >
          {isUploading ? (
            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
          ) : (
            <FontAwesomeIcon icon={faArrowUp} className="text-xl" />
          )}
        </button>
      </div>
    </div>
  );
}

export default ImageUploader;