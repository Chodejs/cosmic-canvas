import { useRef, useEffect, useState } from 'react';
import { Download, RefreshCw, Image as ImageIcon } from 'lucide-react'; 

export default function DrawingCanvas() {
  // ==================== REFS & STATE ====================
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const isDrawing = useRef(false);

  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);
  const [currentTemplate, setCurrentTemplate] = useState(null);

  // ==================== INITIAL SETUP ====================
  useEffect(() => {
    const canvas = canvasRef.current;
    
    // High-DPI support
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const context = canvas.getContext("2d");
    context.scale(2, 2);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    
    contextRef.current = context;
  }, []);

  // ==================== UPDATES ====================
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = lineWidth;
    }
  }, [color, lineWidth]);

  useEffect(() => {
    if (currentTemplate && contextRef.current) {
        loadImageToCanvas(currentTemplate);
    }
  }, [currentTemplate]);

  const loadImageToCanvas = (url) => {
      const canvas = canvasRef.current;
      const ctx = contextRef.current;
      
      const img = new Image();
      img.src = url;
      img.crossOrigin = "Anonymous"; 
      img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw image to fit (centered and scaled)
          const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.4; 
          const x = (canvas.width / 4) - (img.width * scale / 2); 
          const y = (canvas.height / 4) - (img.height * scale / 2);
          
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      };
  };

  // ==================== COORDINATE HELPER ====================
   const getCoordinates = (event) => {
    if (!canvasRef.current) return { x: 0, y: 0 };

    if (event.touches && event.touches.length > 0) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const touch = event.touches[0];
      
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } 
    
    return {
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY
    };
  };


  // ==================== DRAWING LOGIC ====================
  const startDrawing = (event) => {
    if (event.type === 'touchstart') {
       // Optional logic
    }

    const { x, y } = getCoordinates(event);
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    isDrawing.current = true;
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    isDrawing.current = false;
  };

  const draw = (event) => {
    if (!isDrawing.current) return;
    
    const { x, y } = getCoordinates(event);
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  // ==================== ACTIONS ====================
  
  const clearCanvas = () => {
     const canvas = canvasRef.current;
     contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
     if (currentTemplate) {
         loadImageToCanvas(currentTemplate);
     }
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.download = `cosmic-masterpiece-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const loadTestTemplate = () => {
      setCurrentTemplate("https://placehold.co/600x400/png?text=Ball+Zachary+Cloots");
  };

  return (
    <div className="relative w-full h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* HEADER: Adjusted text size for mobile */}
      <div className="absolute top-6 left-8 pointer-events-none select-none z-10">
        <h1 className="text-xl md:text-3xl font-extrabold text-gray-800 tracking-tight">
          Cosmic<span className="text-indigo-600">Canvas</span>
        </h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">Unleash your inner artist</p>
      </div>

      {/* TOOLBAR: THE BIG FIX */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 
                      w-[95%] md:w-auto max-w-lg md:max-w-none
                      bg-white/90 backdrop-blur-md border border-gray-200 
                      shadow-2xl rounded-2xl 
                      px-4 py-3 md:px-8 md:py-4 
                      flex justify-between md:justify-start items-center 
                      gap-2 md:gap-8 z-20">
        
        {/* Color Picker */}
        <div className="flex flex-col items-center gap-1 md:gap-2">
           <label className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Color</label>
           <div className="relative group">
             <input 
               type="color" 
               value={color}
               onChange={(e) => setColor(e.target.value)}
               className="absolute inset-0 opacity-0 w-8 h-8 md:w-10 md:h-10 cursor-pointer z-10"
             />
             <div 
               className="w-8 h-8 md:w-10 md:h-10 rounded-fullnD border-2 border-white shadow-sm ring-2 ring-gray-100 transition-transform group-hover:scale-110"
               style={{ backgroundColor: color }}
             />
           </div>
        </div>

        {/* Separator: Hidden on mobile */}
        <div className="hidden md:block w-px h-10 bg-gray-200"></div>

        {/* Brush Size: Flexible width on mobile */}
        <div className="flex flex-col items-center gap-1 md:gap-2 flex-grow md:flex-grow-0 md:min-w-[120px]">
           <label className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
             Size: {lineWidth}px
           </label>
           <input 
             type="range" 
             min="1" 
             max="50" 
             value={lineWidth} 
             onChange={(e) => setLineWidth(Number(e.target.value))}
             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
           />
        </div>

        {/* Separator: Hidden on mobile */}
        <div className="hidden md:block w-px h-10 bg-gray-200"></div>

        {/* Action Buttons: Tighter padding on mobile */}
        <div className="flex items-center gap-1 md:gap-3">
           <button 
            onClick={loadTestTemplate}
            className="p-2 md:p-3 text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
            title="Load Template"
          >
            <ImageIcon size={18} className="md:w-5 md:h-5" />
          </button>

          <button 
            onClick={clearCanvas}
            className="p-2 md:p-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Clear Canvas"
          >
            <RefreshCw size={18} className="md:w-5 md:h-5" />
          </button>
          
          <button 
            onClick={downloadImage}
            className="p-2 md:p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-indigo-200 transition-all transform hover:-translate-y-1"
            title="Save Image"
          >
            <Download size={18} className="md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* CANVAS */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        onMouseLeave={finishDrawing}
        onTouchStart={startDrawing}
        onTouchEnd={finishDrawing}
        onTouchMove={draw}
        className="cursor-crosshair w-full h-full touch-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"
      />
    </div>
  );
}