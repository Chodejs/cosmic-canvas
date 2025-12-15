import { useRef, useEffect, useState } from 'react';
import { Download, Eraser, RefreshCw } from 'lucide-react'; // Make sure to install lucide-react or remove icons if you prefer text

// If you don't have lucide-react, run: npm install lucide-react
// Or just swap the icons in the JSX for text like "Save", "Clear", etc.

export default function DrawingCanvas() {
  // ==================== REFS & STATE ====================
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const isDrawing = useRef(false);

  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);

  // ==================== SETUP (Same as before) ====================
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
    context.lineJoin = "round"; // Smoother corners
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

  // ==================== DRAWING LOGIC ====================
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    isDrawing.current = true;
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    isDrawing.current = false;
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing.current) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  // ==================== NEW FEATURES ====================
  
  // CLEAR CANVAS
  const clearCanvas = () => {
     const canvas = canvasRef.current;
     contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
  };

  // SAVE IMAGE (The Bonus useRef Trick!)
  const downloadImage = () => {
    // 1. Access the DOM node directly to get the data URL (base64 string of the image)
    const link = document.createElement('a');
    link.download = `cosmic-masterpiece-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="relative w-full h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* 1. ELEGANT HEADER */}
      <div className="absolute top-6 left-8 pointer-events-none select-none z-10">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
          Cosmic<span className="text-indigo-600">Canvas</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Unleash your inner artist</p>
      </div>

      {/* 2. THE FLOATING DOCK TOOLBAR */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 
                      bg-white/90 backdrop-blur-md border border-gray-200 
                      shadow-2xl rounded-2xl px-8 py-4 flex items-center gap-8 z-20">
        
        {/* Color Picker Group */}
        <div className="flex flex-col items-center gap-2">
           <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Color</label>
           <div className="relative group">
             {/* We hide the ugly input but keep it clickable over the pretty div */}
             <input 
               type="color" 
               value={color}
               onChange={(e) => setColor(e.target.value)}
               className="absolute inset-0 opacity-0 w-10 h-10 cursor-pointer z-10"
             />
             <div 
               className="w-10 h-10 rounded-full border-2 border-white shadow-sm ring-2 ring-gray-100 transition-transform group-hover:scale-110"
               style={{ backgroundColor: color }}
             />
           </div>
        </div>

        {/* Separator */}
        <div className="w-px h-10 bg-gray-200"></div>

        {/* Brush Size Group */}
        <div className="flex flex-col items-center gap-2 min-w-[120px]">
           <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
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

        {/* Separator */}
        <div className="w-px h-10 bg-gray-200"></div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={clearCanvas}
            className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all tooltip-trigger"
            title="Clear Canvas"
          >
            <RefreshCw size={20} />
          </button>
          
          <button 
            onClick={downloadImage}
            className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-indigo-200 transition-all transform hover:-translate-y-1"
            title="Save Image"
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* 3. THE CANVAS */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        onMouseLeave={finishDrawing}
        className="cursor-crosshair w-full h-full touch-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"
      />
    </div>
  );
}