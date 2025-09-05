import { useEffect, useRef, useState } from "react";

export default function App() {
  const [textBoxes, setTextBoxes] = useState([]);
  const [selectedBox, setSelectedBox] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingBox, setEditingBox] = useState(null);
  const [dragState, setDragState] = useState({ 
    isDragging: false, 
    dragId: null, 
    startX: 0, 
    startY: 0, 
    startMouseX: 0, 
    startMouseY: 0 
  });
  const [rotateState, setRotateState] = useState({
    isRotating: false,
    rotateId: null,
    centerX: 0,
    centerY: 0,
    startAngle: 0,
    currentRotation: 0
  });

  const containerRef = useRef(null);
  const boxesRef = useRef([]);

  const addTextBox = () => {
    setTextBoxes((prev) => [
      ...prev,
      { 
        text: "Double click to edit", 
        color: "#000000", 
        size: 16, 
        bold: false, 
        x: 50, 
        y: 50,
        rotation: 0
      },
    ]);
  };

  const handleDelete = (index) => {
    setTextBoxes((prev) => prev.filter((_, i) => i !== index));
    boxesRef.current = boxesRef.current.filter((_, i) => i !== index);
    if (selectedBox === index) setSelectedBox(null);
    setShowEditor(false);
  };

  const handleChange = (index, value) => {
    setTextBoxes((prev) =>
      prev.map((box, i) => (i === index ? { ...box, text: value } : box))
    );
  };

  const handleStyleChange = (field, value) => {
    if (selectedBox === null) return;
    setTextBoxes((prev) =>
      prev.map((box, i) =>
        i === selectedBox ? { ...box, [field]: value } : box
      )
    );
  };

  const updateBoxPosition = (index, x, y) => {
    setTextBoxes((prev) =>
      prev.map((box, i) => (i === index ? { ...box, x, y } : box))
    );
  };

  const updateBoxRotation = (index, rotation) => {
    setTextBoxes((prev) =>
      prev.map((box, i) => (i === index ? { ...box, rotation } : box))
    );
  };

  // Drag functions
  const handleMouseDown = (e, index) => {
    if (editingBox === index) return;
    
    const box = textBoxes[index];
    e.preventDefault();
    e.stopPropagation();
    
    setDragState({
      isDragging: true,
      dragId: index,
      startX: box.x,
      startY: box.y,
      startMouseX: e.clientX,
      startMouseY: e.clientY
    });
  };

  const handleMouseMove = (e) => {
    if (dragState.isDragging && dragState.dragId !== null) {
      const deltaX = e.clientX - dragState.startMouseX;
      const deltaY = e.clientY - dragState.startMouseY;
      
      const newX = dragState.startX + deltaX;
      const newY = dragState.startY + deltaY;
      
      const container = containerRef.current;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const boundedX = Math.max(0, Math.min(newX, containerRect.width - 200));
      const boundedY = Math.max(0, Math.min(newY, containerRect.height - 100));
      
      updateBoxPosition(dragState.dragId, boundedX, boundedY);
    }

    // Handle rotation
    if (rotateState.isRotating && rotateState.rotateId !== null) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rotateState.centerX;
      const centerY = rotateState.centerY;
      
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const angle = Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);
      const rotation = angle - rotateState.startAngle + rotateState.currentRotation;
      
      updateBoxRotation(rotateState.rotateId, rotation);
    }
  };

  const handleMouseUp = () => {
    setDragState({
      isDragging: false,
      dragId: null,
      startX: 0,
      startY: 0,
      startMouseX: 0,
      startMouseY: 0
    });
    setRotateState({
      isRotating: false,
      rotateId: null,
      centerX: 0,
      centerY: 0,
      startAngle: 0,
      currentRotation: 0
    });
  };

  // Rotation functions
  const handleRotateStart = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    
    const box = textBoxes[index];
    const rect = containerRef.current.getBoundingClientRect();
    const boxRect = e.currentTarget.parentElement.getBoundingClientRect();
    
    const centerX = (boxRect.left + boxRect.width / 2) - rect.left;
    const centerY = (boxRect.top + boxRect.height / 2) - rect.top;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const startAngle = Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);
    
    setRotateState({
      isRotating: true,
      rotateId: index,
      centerX,
      centerY,
      startAngle,
      currentRotation: box.rotation || 0
    });
  };

  // Double click to edit
  const handleDoubleClick = (index) => {
    setEditingBox(index);
    setSelectedBox(index);
  };

  const handleEditComplete = (index) => {
    setEditingBox(null);
  };

  // Global mouse events
  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();

    if (dragState.isDragging || rotateState.isRotating) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [dragState, rotateState]);

  // Click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.text-box') && !e.target.closest('.editor-popup')) {
        setSelectedBox(null);
        setShowEditor(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-screen grid grid-cols-12">
      {/* พื้นที่ซ้าย */}
      <div
        ref={containerRef}
        className="col-span-9 bg-gray-200 relative overflow-hidden"
        style={{ userSelect: "none" }}
      >
        <div className="flex justify-center items-center h-screen">
          <img
            src="/asset/img/formater.jpg"
            alt="Main"
            className="h-screen object-cover"
            draggable={false}
          />
        </div>

        {textBoxes.map((box, index) => (
          <div
            key={index}
            ref={(el) => (boxesRef.current[index] = el)}
            className="text-box absolute p-2 border-none shadow bg-white"
            style={{
              left: `${box.x}px`,
              top: `${box.y}px`,
              transform: `rotate(${box.rotation || 0}deg)`,
              transformOrigin: "center center",
              cursor: editingBox === index ? "text" : "move",
              zIndex: selectedBox === index ? 20 : 10
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedBox(index);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleDoubleClick(index);
            }}
            onMouseDown={(e) => {
              if (editingBox !== index) {
                handleMouseDown(e, index);
              }
            }}
          >
            {/* Input */}
            {editingBox === index ? (
              <input
                type="text"
                value={box.text}
                onChange={(e) => handleChange(index, e.target.value)}
                onBlur={() => handleEditComplete(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEditComplete(index);
                  }
                }}
                autoFocus
                className="outline-none bg-transparent border-none p-0"
                style={{
                  fontSize: `${box.size}px`,
                  fontWeight: box.bold ? "bold" : "normal",
                  color: box.color,
                  minWidth: "100px"
                }}
                onMouseDown={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                style={{
                  fontSize: `${box.size}px`,
                  fontWeight: box.bold ? "bold" : "normal",
                  color: box.color,
                  display: "block",
                  minWidth: "100px",
                  padding: "2px"
                }}
              >
                {box.text}
              </span>
            )}

            {/* Controls แสดงเมื่อกล่องถูกเลือก */}
            {selectedBox === index && editingBox !== index && (
              <div className="absolute -top-10 right-0 flex space-x-1 z-50">
                {/* Rotate */}
                <button
                  onMouseDown={(e) => handleRotateStart(e, index)}
                  className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs cursor-grab active:cursor-grabbing"
                  title="Rotate"
                >
                  ↻
                </button>
                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(index);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                  title="Delete"
                >
                  ❌
                </button>
                {/* Edit Style */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditor(true);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                  title="Edit Style"
                >
                  ✏️
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Popup editor */}
        {showEditor && selectedBox !== null && (
          <div 
            className="editor-popup absolute top-20 left-20 bg-white p-4 border shadow-lg rounded-lg z-50"
            style={{ minWidth: "250px" }}
          >
            <h3 className="font-bold mb-3 text-gray-700">Edit Text Style</h3>
            <div className="flex flex-col space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">Color:</span>
                <input
                  type="color"
                  value={textBoxes[selectedBox].color}
                  onChange={(e) => handleStyleChange("color", e.target.value)}
                  className="w-12 h-8 rounded border cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">Size:</span>
                <select
                  value={textBoxes[selectedBox].size}
                  onChange={(e) =>
                    handleStyleChange("size", parseInt(e.target.value))
                  }
                  className="px-2 py-1 border rounded"
                >
                  {[12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48].map((s) => (
                    <option key={s} value={s}>
                      {s}px
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">Bold:</span>
                <input
                  type="checkbox"
                  checked={textBoxes[selectedBox].bold}
                  onChange={(e) => handleStyleChange("bold", e.target.checked)}
                  className="w-4 h-4"
                />
              </label>
              <button
                onClick={() => setShowEditor(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded mt-3 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="col-span-3 bg-white flex flex-col items-center justify-start pt-4">
        <button
          onClick={addTextBox}
          className="py-2.5 px-5 mb-4 text-sm font-medium text-gray-900 
                     bg-white rounded-full border border-gray-300 
                     hover:bg-gray-100 hover:text-blue-700 
                     focus:outline-none focus:ring-2 focus:ring-blue-300
                     transition-colors"
        >
          Add Textbox
        </button>
        
        <div className="text-xs text-gray-600 px-4 text-start">
          <p className="mb-2">🖱️ <strong>Click</strong> to select</p>
          <p className="mb-2">🖱️ <strong>Double-click</strong> to edit text</p>
          <p className="mb-2">🎯 <strong>Drag</strong> to move</p>
          <p>🔄 <strong>Green button</strong> to rotate</p>
        </div>
      </div>
    </div>
  );
}