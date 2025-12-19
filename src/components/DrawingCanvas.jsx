import { useRef, useEffect, useState } from 'react';
import { Download, RefreshCw, Type, X, Palette } from 'lucide-react';

export default function DrawingCanvas() {
  // ==================== STATE ====================
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const inputRef = useRef(null);
  const isDrawing = useRef(false);

  // Tools: 'brush' or 'text'
  const [tool, setTool] = useState('brush');
  
  // Appearance
  const [color, setColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState(5);
  
  // Background State
  const [background, setBackground] = useState({ type: 'color', value: '#1a1a2e' });

  // Text Input State
  const [textInput, setTextInput] = useState(null);

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
        context.font = "24px sans-serif";
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
      contextRef.current.font = `${12 + (lineWidth * 3)}px sans-serif`;
    }
  }, [color, lineWidth]);

  useEffect(() => {
    if (textInput && inputRef.current) {
        inputRef.current.focus();
    }
  }, [textInput]);

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
    if (tool === 'text') {
        event.preventDefault();
        const { x, y } = getCoordinates(event);
        setTextInput({ x, y });
        return;
    }
    const { x, y } = getCoordinates(event);
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    isDrawing.current = true;
  };

  const endInteraction = () => {
    if (tool === 'brush') {
        contextRef.current.closePath();
        isDrawing.current = false;
    }
  };

  const draw = (event) => {
    if (!isDrawing.current || tool !== 'brush') return;
    const { x, y } = getCoordinates(event);
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  // ==================== TEXT LOGIC ====================
  const finishText = (text, shouldSwitchToBrush = false) => {
      if (text && contextRef.current && textInput) {
          contextRef.current.fillText(text, textInput.x, textInput.y + 10);
      }
      setTextInput(null);
      if (shouldSwitchToBrush) {
        setTool('brush');
      }
  };

  const handleTextSubmit = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          finishText(e.target.value, true);
      }
  };

  const handleBlur = (e) => {
      finishText(e.target.value, false); 
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

    if (background.type === 'color') {
        ctx.fillStyle = background.value;
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    } 
    
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
        className={`absolute inset-0 z-10 w-full h-full touch-none ${tool === 'text' ? 'cursor-text' : 'cursor-crosshair'}`}
      />

      {/* TEXT INPUT */}
      {textInput && (
          <input
            ref={inputRef}
            className="absolute z-20 bg-transparent border-b border-white text-white outline-none p-0 m-0 font-sans"
            style={{ 
                left: textInput.x, 
                top: textInput.y, 
                color: color,
                width: '300px',
                fontSize: `${12 + (lineWidth * 3)}px`
            }}
            onKeyDown={handleTextSubmit}
            onBlur={handleBlur}
            placeholder="Type..."
          />
      )}

      {/* LOGO */}
      <div className="absolute top-6 left-8 pointer-events-none z-30">
        <h1 className="text-xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
          Fetch a <span className="text-indigo-400">Sketch</span>
        </h1>
      </div>

      {/* CONTROLS */}
      {/* UPDATE 1: Wider container on mobile (w-95%), smaller padding (px-4 py-3) */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 
                w-[96%] md:w-auto
                bg-gray-900/90 backdrop-blur-md border border-gray-700 
                shadow-2xl rounded-2xl 
                px-4 py-3 md:px-6 md:py-4 z-30 flex flex-col gap-3 md:gap-4">

        {/* Top Row: Tools */}
        {/* UPDATE 2: Reduced gap from 6 to 2 on mobile */}
        <div className="flex justify-between items-center gap-2 md:gap-6">
            
            {/* Color & Size Group */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* Slightly smaller color picker on mobile */}
                <input 
                    type="color" value={color} onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white cursor-pointer bg-transparent"
                />
                
                {/* Smaller width for slider container on mobile (w-20 vs w-24) */}
                <div className="flex flex-col w-20 md:w-24">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Size</span>
                    <input 
                        type="range" min="1" max="20" value={lineWidth} 
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                        className="h-2 bg-gray-700 rounded-lg appearance-none accent-indigo-500"
                    />
                </div>
            </div>

            {/* Tool Toggles */}
            <div className="flex gap-1 md:gap-2 bg-gray-800 p-1 rounded-lg">
                <button 
                    onClick={() => setTool('brush')}
                    className={`p-1.5 md:p-2 rounded-md transition ${tool === 'brush' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    <Palette size={18} className="md:w-5 md:h-5" />
                </button>
                <button 
                    onClick={() => setTool('text')}
                    className={`p-1.5 md:p-2 rounded-md transition ${tool === 'text' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    <Type size={18} className="md:w-5 md:h-5" />
                </button>
            </div>

            {/* Action Buttons (Clear/Download) */}
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
        {/* Minimal changes needed here since it scrolls, just ensuring gap is consistent */}
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
                🎅 Santa
            </button>
             <button 
                onClick={() => setTemplateImage("green-holiday.jpg")}
                className="px-3 py-1 bg-green-900/80 text-xs text-green-100 rounded-full border border-green-500 hover:bg-green-800 shrink-0"
            >
                🎄 Tree
            </button>
        </div>
      </div>
    </div>
  );
}