import { useRef, useEffect, useState } from 'react';
import { Download, RefreshCw, X, Palette } from 'lucide-react';

export default function DrawingCanvas() {
  // ==================== STATE ====================
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const isDrawing = useRef(false);

  // Appearance
  const [color, setColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState(5);
  
  // Background State
  const [background, setBackground] = useState({ type: 'color', value: '#1a1a2e' });

  // ==================== INITIAL SETUP ====================
  useEffect(() => {
    const canvas = canvasRef.current;
    
    const updateSize = () => {
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
    }

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // ==================== UPDATES ====================
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = lineWidth;
      contextRef.current.fillStyle = color;
    }
  }, [color, lineWidth]);

  // ==================== DRAWING LOGIC ====================
  const getCoordinates = (event) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    
    let clientX, clientY;
    if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startInteraction = (event) => {
    const { x, y } = getCoordinates(event);
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    isDrawing.current = true;
  };

  const endInteraction = () => {
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
  };

  const removeTemplate = () => {
      setBackground({ type: 'color', value: '#1a1a2e' });
  };

  const setTemplateImage = (filename) => {
      setBackground({ type: 'image', value: `/templates/${filename}` });
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');

    // 1. Draw Background
    if (background.type === 'color') {
        ctx.fillStyle = background.value;
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    } 
    // Note: Local images won't export in this version without CORS/Loading handling, 
    // so this mainly exports the drawing + solid colors.
    
    // 2. Draw Canvas
    ctx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = `fetch-a-sketch-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL();
    link.click();
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden font-sans select-none">
      
      {/* BACKGROUND LAYER */}
      <div 
        className="absolute inset-0 z-0 transition-all duration-500"
        style={{
            backgroundColor: background.type === 'color' ? background.value : '#000',
            backgroundImage: background.type === 'image' ? `url(${background.value})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}
      />

      {/* DRAWING LAYER */}
      <canvas
        ref={canvasRef}
        onMouseDown={startInteraction}
        onMouseUp={endInteraction}
        onMouseMove={draw}
        onMouseLeave={endInteraction}
        onTouchStart={startInteraction}
        onTouchEnd={endInteraction}
        onTouchMove={draw}
        className="absolute inset-0 z-10 w-full h-full touch-none cursor-crosshair"
      />

      {/* LOGO */}
      <div className="absolute top-6 left-8 pointer-events-none z-30">
        <h1 className="text-xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
          Fetch a <span className="text-indigo-400">Sketch</span>
        </h1>
      </div>

      {/* CONTROLS */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 
                w-[96%] md:w-auto
                bg-gray-900/90 backdrop-blur-md border border-gray-700 
                shadow-2xl rounded-2xl 
                px-4 py-3 md:px-6 md:py-4 z-30 flex flex-col gap-3 md:gap-4">

        {/* Top Row: Tools */}
        <div className="flex justify-between items-center gap-2 md:gap-6">
            
            {/* Color & Size Group */}
            <div className="flex items-center gap-2 md:gap-4">
                <input 
                    type="color" value={color} onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white cursor-pointer bg-transparent"
                />
                
                <div className="flex flex-col w-20 md:w-24">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Size</span>
                    <input 
                        type="range" min="1" max="20" value={lineWidth} 
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                        className="h-2 bg-gray-700 rounded-lg appearance-none accent-indigo-500"
                    />
                </div>
            </div>

            {/* Brush Indicator (Visual Only now) */}
            <div className="bg-gray-800 p-1.5 rounded-lg">
               <Palette size={18} className="text-indigo-400 md:w-5 md:h-5" />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1 md:gap-2 border-l border-gray-700 pl-2 md:pl-4">
                 <button onClick={clearCanvas} className="p-1.5 md:p-2 text-gray-400 hover:text-red-400 transition">
                    <RefreshCw size={18} className="md:w-5 md:h-5" />
                 </button>
                 <button onClick={downloadImage} className="p-1.5 md:p-2 text-gray-400 hover:text-indigo-400 transition">
                    <Download size={18} className="md:w-5 md:h-5" />
                 </button>
            </div>
        </div>

        {/* Bottom Row: Templates & Colors */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-xs text-gray-500 whitespace-nowrap mr-1 md:mr-2">Backdrop:</span>
            
            {background.value !== '#1a1a2e' && (
                <button 
                    onClick={removeTemplate}
                    className="flex items-center gap-1 px-3 py-1 bg-red-900/50 text-red-200 text-xs rounded-full border border-red-800 hover:bg-red-900 shrink-0"
                >
                    <X size={12} /> Reset
                </button>
            )}

            {/* Colors */}
            {['#1a1a2e', '#ffffff', '#000000', '#16213e', '#4a1c40'].map(c => (
                <button 
                    key={c}
                    onClick={() => setBackground({ type: 'color', value: c })}
                    className="w-6 h-6 rounded-full border border-gray-600 focus:ring-2 ring-indigo-500 shrink-0"
                    style={{ backgroundColor: c }}
                />
            ))}

            {/* HOLIDAY TEMPLATES */}
            <button 
                onClick={() => setTemplateImage("red-holiday.jpg")}
                className="px-3 py-1 bg-red-900/80 text-xs text-red-100 rounded-full border border-red-500 hover:bg-red-800 shrink-0"
            >
                🎅 Red
            </button>
             <button 
                onClick={() => setTemplateImage("green-holiday.jpg")}
                className="px-3 py-1 bg-green-900/80 text-xs text-green-100 rounded-full border border-green-500 hover:bg-green-800 shrink-0"
            >
                🎄 Green
            </button>
        </div>
      </div>
    </div>
  );
}