import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { Edit3, RotateCw, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(Draggable);

export default function App() {
  const [textBoxes, setTextBoxes] = useState([]);
  const [selectedBox, setSelectedBox] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingBox, setEditingBox] = useState(null);

  const containerRef = useRef(null);
  const addTextBox = () => {
    const newIndex = textBoxes.length;
    let startX = 50;
    let startY = 50;

    const container = containerRef.current;
    if (container) {
      const imageArea = container.querySelector("img");
      if (imageArea) {
        const containerRect = container.getBoundingClientRect();
        const imageRect = imageArea.getBoundingClientRect();

        const relativeImageRect = {
          left: imageRect.left - containerRect.left,
          top: imageRect.top - containerRect.top,
          width: imageRect.width,
          height: imageRect.height,
        };
        startX = relativeImageRect.left + relativeImageRect.width * 0.4;
        startY = relativeImageRect.top + relativeImageRect.height * 0.4;
      }
    }

    const newBox = {
      text: "Double click to edit",
      color: "#000000",
      size: 16,
      bold: false,
      x: startX,
      y: startY,
      rotation: 0,
    };

    setTextBoxes((prev) => [...prev, newBox]);
  };

  const handleDelete = (index) => {
    setTextBoxes((prev) => prev.filter((_, i) => i !== index));
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

  const handleDoubleClick = (index) => {
    setEditingBox(index);
    setSelectedBox(index);
  };

  const handleEditComplete = () => {
    setEditingBox(null);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest(".text-box") &&
        !e.target.closest(".editor-popup")
      ) {
        setSelectedBox(null);
        setShowEditor(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  console.log("text ", textBoxes);

  return (
    <div className="h-screen grid grid-cols-12">
      <div
        ref={containerRef}
        className="col-span-9 bg-gray-200 relative overflow-hidden flex justify-center items-center"
        style={{ userSelect: "none" }}
      >
        <img
          src="/asset/img/formater.jpg"
          alt="Main"
          className="h-full object-contain max-h-screen"
          draggable={false}
        />

        {textBoxes.map((box, index) => (
          <DraggableBox
            key={index}
            index={index}
            box={box}
            selectedBox={selectedBox}
            editingBox={editingBox}
            containerRef={containerRef}
            handleDelete={handleDelete}
            handleChange={handleChange}
            handleDoubleClick={handleDoubleClick}
            handleEditComplete={handleEditComplete}
            handleSelectBox={(idx) => setSelectedBox(idx)}
            setTextBoxes={setTextBoxes}
            setShowEditor={setShowEditor}
          />
        ))}

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
          <p className="mb-2">
            🖱️ <strong>Click</strong> to select
          </p>
          <p className="mb-2">
            🖱️ <strong>Double-click</strong> to edit text
          </p>
          <p className="mb-2">
            🎯 <strong>Drag</strong> to move
          </p>
          <p>
            🔄 <strong>Green button</strong> to rotate
          </p>
        </div>
      </div>
    </div>
  );
}

const DraggableBox = ({
  index,
  box,
  selectedBox,
  editingBox,
  containerRef,
  handleDelete,
  handleChange,
  handleDoubleClick,
  handleEditComplete,
  handleSelectBox,
  setTextBoxes,
  setShowEditor,
}) => {
  const boxRef = useRef(null);

  useEffect(() => {
    const element = boxRef.current;
    if (!element) return;

    const imageArea = containerRef.current.querySelector("img");
    const bounds = imageArea ? imageArea : containerRef.current;

    const mainDraggable = Draggable.create(element, {
      type: "x,y",
      bounds: bounds,
      cursor: editingBox === index ? "text" : "move",
      onPress: function (e) {
        handleSelectBox(index);
        e.stopPropagation();
      },
      onDragStart: function () {
        gsap.to(this.target, {
          scale: 1.1,
          boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
          duration: 0.2,
        });
      },
      onDragEnd: function () {
        gsap.to(this.target, {
          scale: 1,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          duration: 0.2,
        });
        const finalX = this.x;
        const finalY = this.y;
        setTextBoxes((prev) =>
          prev.map((b, i) => (i === index ? { ...b, x: finalX, y: finalY } : b))
        );
      },
      onClick: (e) => {
        e.stopPropagation();
      },
    })[0];

    const rotateButton = element.querySelector(".rotate-btn");
    let rotateDraggable = null;
    if (rotateButton) {
      console.log(" rotateButton", rotateButton);

      rotateDraggable = Draggable.create(element, {
        type: "rotation",
        trigger: rotateButton,
        onPress: (e) => {
          e.stopPropagation();
          gsap.to(element, { scale: 1.1, duration: 0.2 });
        },
        onRelease: function () {
          gsap.to(element, { scale: 1, duration: 0.2 });
          setTextBoxes((prev) =>
            prev.map((b, i) =>
              i === index ? { ...b, rotation: this.rotation } : b
            )
          );
        },
      })[0];
    }

    if (editingBox === index) {
      mainDraggable.disable();
    } else {
      mainDraggable.enable();
    }

    return () => {
      mainDraggable.kill();
      if (rotateDraggable) rotateDraggable.kill();
    };
  }, [box, index, editingBox, setTextBoxes]);

  return (
    <div
      ref={boxRef}
      className={`text-box absolute p-2 border shadow bg-white rounded-sm ${
        selectedBox === index ? "ring-2 ring-blue-500" : ""
      }`}
      style={{
        left: 0,
        top: 0,
        x: box.x,
        y: box.y,
        rotation: box.rotation,
        transformOrigin: "center center",
        cursor: editingBox === index ? "text" : "move",
        zIndex: selectedBox === index ? 20 : 10,
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        handleDoubleClick(index);
      }}
    >
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
            minWidth: "100px",
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
            padding: "2px",
          }}
        >
          {box.text}
        </span>
      )}

      {selectedBox === index && editingBox !== index && (
        <div className="absolute -top-10 right-0 flex space-x-1 z-50">
          <button
            className="rotate-btn bg-green-500 hover:bg-green-600 text-white p-1 rounded cursor-grab active:cursor-grabbing transition-colors"
            title="Rotate"
          >
            <RotateCw size={14} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              gsap.to(boxRef.current, {
                opacity: 0,
                scale: 0,
                duration: 0.2,
                onComplete: () => {
                  handleDelete(index);
                },
              });
            }}
            className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowEditor(true);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded transition-colors"
            title="Edit Style"
          >
            <Edit3 size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
