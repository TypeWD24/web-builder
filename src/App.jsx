import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { toPng } from "html-to-image";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Edit3,
  RotateCw,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
// import "./index.css";
import "./style.css";

gsap.registerPlugin(Draggable);

export default function App() {
  const [textBoxes, setTextBoxes] = useState([]);
  const [selectedBox, setSelectedBox] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingBox, setEditingBox] = useState(null);

  const [vw, setVw] = useState(0);
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  console.log("vw : ", vw);

  const containerRef = useRef(null);
  const exportRef = useRef(null);

  useEffect(() => {
    const boundsEl =
      containerRef.current?.querySelector("img") || containerRef.current;
    if (!boundsEl) return;

    const W = boundsEl.clientWidth || 1;
    const H = boundsEl.clientHeight || 1;

    setTextBoxes((prev) =>
      prev.map((b) => {
        const xPct = b.xPercent ?? (b.x != null ? b.x / W : 0);
        const yPct = b.yPercent ?? (b.y != null ? b.y / H : 0);
        return {
          ...b,
          x: xPct * W,
          y: yPct * H,
          xPercent: xPct,
          yPercent: yPct,
        };
      })
    );
  }, [vw, containerRef]);

  const addTextBox = () => {
    const xPercent = 0.4;
    const yPercent = 0.4;

    let startX = 50;
    let startY = 50;

    const container = containerRef.current;
    if (container) {
      const boundsEl = container.querySelector("img") || container;

      const c = container.getBoundingClientRect();
      const b = boundsEl.getBoundingClientRect();

      const left = b.left - c.left;
      const top = b.top - c.top;

      startX = left + b.width * xPercent;
      startY = top + b.height * yPercent;
    }

    const newBox = {
      text: "Double click to edit",
      id: Date.now(),
      color: "#000000",
      size: 16,
      bold: false,
      rotation: 0,
      align: "left",
      font: "Arial",
      fontStyle: "normal",
      xPercent,
      yPercent,
      x: startX,
      y: startY,
    };

    setTextBoxes((prev) => [...prev, newBox]);
  };

  const handleDelete = (id) => {
    setTextBoxes((prev) => prev.filter((box) => box.id !== id));
    if (selectedBox === id) setSelectedBox(null);
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

  const handleExport = () => {
    if (!exportRef.current) return;

    toPng(exportRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "exported-image.png";
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("Export failed", err);
      });
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
  console.log("selcteBox : ", selectedBox);

  return (
    <div className="h-screen grid grid-cols-12">
      <div
        ref={containerRef}
        className="col-span-10 bg-gray-200 relative overflow-hidden flex justify-center items-center"
        style={{ userSelect: "none" }}
      >
        <div
          ref={exportRef}
          className="relative inline-block builder-container"
        >
          <img
            src="/asset/img/formater.jpg"
            alt="Main"
            className="h-full max-h-screen"
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
              vw={vw}
            />
          ))}
        </div>
      </div>
      <div className="col-span-2 bg-white flex flex-col justify-start pt-4 px-0">
        <div className="flex justify-center items-center">
          <button
            onClick={addTextBox}
            className="py-2.5 px-5 mb-4 text-sm font-medium text-gray-900
            bg-white rounded-full border border-gray-300
            hover:bg-gray-100 hover:text-blue-700
            focus:outline-none focus:ring-2 focus:ring-blue-300
            transition-colors w-50"
          >
            Add Textbox
          </button>
        </div>

        <div className="border-gray-400 border-b-1">
          <div className="text-xs text-gray-600 px-4 text-start mb-4">
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
        <div className="border-gray-400 border-b-1 flex justify-center items-center p-6">
          <button
            onClick={() => {
              setShowEditor(false);
              setSelectedBox(null);
              handleExport();
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Export as PNG
          </button>
        </div>
        {showEditor && selectedBox !== null && textBoxes[selectedBox] && (
          <div className="editor-popup bg-white p-6 rounded-xl z-50">
            <div className="flex flex-col space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Color:
                </span>
                <input
                  type="color"
                  value={textBoxes[selectedBox].color}
                  onChange={(e) => handleStyleChange("color", e.target.value)}
                  className="w-12 h-8 rounded border cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Size:</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleStyleChange(
                        "size",
                        Math.max(1, textBoxes[selectedBox].size - 1)
                      )
                    }
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded"
                  >
                    -
                  </button>

                  <input
                    type="number"
                    value={textBoxes[selectedBox].size}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      handleStyleChange("size", value);
                    }}
                    className="w-16 text-center border rounded px-2 py-1"
                    min={1}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      handleStyleChange("size", textBoxes[selectedBox].size + 1)
                    }
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded"
                  >
                    +
                  </button>
                </div>
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Bold:</span>
                <input
                  type="checkbox"
                  checked={textBoxes[selectedBox].bold}
                  onChange={(e) => handleStyleChange("bold", e.target.checked)}
                  className="w-4 h-4"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium  text-gray-600">
                  Italic:
                </span>
                <input
                  type="checkbox"
                  checked={textBoxes[selectedBox].italic || false}
                  onChange={(e) =>
                    handleStyleChange("italic", e.target.checked)
                  }
                  className="w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm font-medium  text-gray-600">
                  Underline:
                </span>
                <input
                  type="checkbox"
                  checked={textBoxes[selectedBox].textDecoration || false}
                  onChange={(e) =>
                    handleStyleChange("textDecoration", e.target.checked)
                  }
                  className="w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Font:</span>
                <select
                  value={textBoxes[selectedBox].font || "Arial"}
                  onChange={(e) => handleStyleChange("font", e.target.value)}
                  className="px-2 py-1 border rounded w-36"
                >
                  {[
                    "Arial",
                    "Helvetica",
                    "Times New Roman",
                    "Georgia",
                    "Courier New",
                    "Verdana",
                    "Tahoma",
                    "Trebuchet MS",
                    "Impact",
                  ].map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-600 mb-2">
                  Align:
                </span>
                <div className="flex justify-between space-x-2 flex-1">
                  <button
                    onClick={() => handleStyleChange("align", "left")}
                    className={`flex items-center justify-center flex-1 p-2 rounded border ${
                      textBoxes[selectedBox].align === "left"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    <AlignLeft size={18} />
                  </button>
                  <button
                    onClick={() => handleStyleChange("align", "center")}
                    className={`flex items-center justify-center flex-1 p-2 rounded border ${
                      textBoxes[selectedBox].align === "center"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    <AlignCenter size={18} />
                  </button>
                  <button
                    onClick={() => handleStyleChange("align", "right")}
                    className={`flex items-center justify-center flex-1 p-2 rounded border ${
                      textBoxes[selectedBox].align === "right"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    <AlignRight size={18} />
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowEditor(false)}
                className="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
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
    const el = boxRef.current;
    if (!el) return;

    const imgOrContainer =
      containerRef.current.querySelector("img") || containerRef.current;

    const main = Draggable.create(el, {
      type: "x,y",
      bounds: imgOrContainer,
      cursor: editingBox === index ? "text" : "move",
      onPress: (e) => {
        handleSelectBox(index);
        e.stopPropagation();
        gsap.set(el, { x: 0, y: 0 });
      },
      onDragStart: function () {
        gsap.to(el, {
          scale: 1.05,
          boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
          duration: 0.2,
        });
      },
      onDragEnd: function () {
        gsap.to(el, {
          scale: 1,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          duration: 0.2,
        });

        const br = el.getBoundingClientRect();
        const boundRect = imgOrContainer.getBoundingClientRect();

        const centerX = br.left - boundRect.left + br.width / 2;
        const centerY = br.top - boundRect.top + br.height / 2;
        let xPercent = centerX / boundRect.width;
        let yPercent = centerY / boundRect.height;
        xPercent = Math.min(Math.max(xPercent, 0), 1);
        yPercent = Math.min(Math.max(yPercent, 0), 1);

        setTextBoxes((prev) =>
          prev.map((b, i) => (i === index ? { ...b, xPercent, yPercent } : b))
        );
        gsap.set(el, { x: 0, y: 0 });
      },
      onClick: (e) => e.stopPropagation(),
    })[0];

    const rotateBtn = el.querySelector(".rotate-btn");
    let rot = null;
    if (rotateBtn) {
      rot = Draggable.create(el, {
        type: "rotation",
        trigger: rotateBtn,
        onPress: (e) => {
          e.stopPropagation();
          gsap.set(el, { x: 0, y: 0 });
          gsap.to(el, { scale: 1.1, duration: 0.2 });
        },
        onRelease: function () {
          gsap.to(el, { scale: 1, duration: 0.2 });
          setTextBoxes((prev) =>
            prev.map((b, i) =>
              i === index ? { ...b, rotation: this.rotation } : b
            )
          );
        },
      })[0];
    }

    if (editingBox === index) main.disable();
    else main.enable();

    return () => {
      main.kill();
      if (rot) rot.kill();
    };
  }, [index, editingBox, setTextBoxes, containerRef]);

  return (
    <div
      ref={boxRef}
      className={`editable-textbox text-box absolute items-center shadow bg-white rounded-sm ${
        selectedBox === index ? "ring-2 ring-blue-500" : ""
      }`}
      style={{
        left: `${(box.xPercent ?? 0.5) * 100}%`,
        top: `${(box.yPercent ?? 0.5) * 100}%`,
        transform: `translate(-50%, -50%) rotate(${box.rotation || 0}deg)`,
        transformOrigin: "center center",
        cursor: editingBox === index ? "text" : "move",
        zIndex: selectedBox === index ? 20 : 10,
        willChange: "transform",
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
          onKeyDown={(e) => e.key === "Enter" && handleEditComplete(index)}
          autoFocus
          className="outline-none bg-transparent border-none p-0"
          style={{
            fontSize: `${box.size}px`,
            fontWeight: box.bold ? "bold" : "normal",
            color: box.color,
            minWidth: "200px",
            maxWidth: "360px",
            fontFamily: box.font || "Arial",
            fontStyle: box.italic ? "italic" : "normal",
            textDecoration: box.textDecoration ? "underline" : "",
          }}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="editable-title items-center">
          <span
            className="title"
            style={{
              fontWeight: box.bold ? "bold" : "normal",
              fontSize: `${box.size}px`,
              color: box.color,
              textAlign: box.align,
              fontFamily: box.font || "Arial",
              fontStyle: box.italic ? "italic" : "normal",
              textDecoration: box.textDecoration ? "underline" : "",
              display: "block",
              padding: "2px",
            }}
          >
            {box.text}
          </span>
        </div>
      )}

      {selectedBox === index && editingBox !== index && (
        <div className="edit-button-group">
          <div className="btn-edit">
            <button
              className="rotate-btn flex items-center bg-green-500 hover:bg-green-600 text-white p-1 rounded cursor-grab active:cursor-grabbing transition-colors"
              title="Rotate"
            >
              <RotateCw className="scale-icon" />
            </button>
          </div>
          <div className="btn-edit">
            <button
              onClick={(e) => {
                e.stopPropagation();
                gsap.to(boxRef.current, {
                  opacity: 0,
                  scale: 0,
                  duration: 0.2,
                  onComplete: () => handleDelete(box.id),
                });
              }}
              className="flex items-center bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="scale-icon" />
            </button>
          </div>
          <div className="btn-edit">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowEditor(true);
              }}
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white p-1 rounded transition-colors"
              title="Edit Style"
            >
              <Edit3 className="scale-icon" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
