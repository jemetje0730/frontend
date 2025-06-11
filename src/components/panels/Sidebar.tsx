import React from 'react';
import { nanoid } from 'nanoid';
import { KEYBOARD_ACTIONS } from '../../constants/actionColors';

const ACTIONS = [
  { key: "click", label: "Click", color: "red" },      
  { key: "double_click", label: "Double Click", color: "blue" }, 
  { key: "right_click", label: "Right Click", color: "green" },  
];

const Sidebar = ({ setNodes }) => {
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:5000/upload-image', {
        method: 'POST',
        body: formData,
      });
      const { filename } = await res.json();
      const id = nanoid();

      setNodes((nds) => [
        ...nds,
        {
          id,
          type: 'imageNode',
          position: { x: 100, y: 100 + nds.length * 120 },
          data: {
            label: filename,
            imageUrl: `http://localhost:5000/assets/${filename}`,
          },
        },
      ]);
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
    }
  };

  const onDragStart = (event, type) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 100,
        height: '100vh',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        overflowY: 'auto',
        boxSizing: 'border-box',
        padding: 6,
        userSelect: 'none',
        zIndex: 10,
      }}
    >
      {/* 이미지 업로드 */}
      <label
        htmlFor="file-upload"
        style={{
          cursor: 'pointer',
          padding: '4px 6px',
          backgroundColor: '#2563eb',
          color: 'white',
          borderRadius: 3,
          display: 'block',
          fontSize: 11,
          marginBottom: 10,
          textAlign: 'center',
        }}
      >
        Upload Image
      </label>
      <input
        id="file-upload"
        type="file"
        onChange={handleUpload}
        style={{ display: 'none' }}
        accept="image/*"
      />

      {/* 드래그 가능한 노드들 */}
      <div
        style={{
          fontWeight: 'bold',
          fontSize: 12,
          margin: '10px 0 6px',
          textAlign: 'center',
        }}
      >
        Result
      </div>

      {/* Screen Node */}
      <div
        draggable
        onDragStart={(e) => onDragStart(e, 'screenNode')}
        style={{
          padding: '3px 6px',
          marginBottom: 4,
          borderRadius: 2,
          cursor: 'grab',
          fontSize: 10,
          fontWeight: '600',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          backgroundColor: '#e5e7eb',
          color: 'black',
          border: '1px solid #ccc',
        }}
      >
        📺 Screen
      </div>

      {/* Keyboard Nodes */}
      <div
        style={{
          fontWeight: 'bold',
          fontSize: 12,
          margin: '10px 0 6px',
          textAlign: 'center',
        }}
      >
        Keyboard
      </div>
      {KEYBOARD_ACTIONS.map((type) => (
        <div
          key={type}
          draggable
          onDragStart={(e) => onDragStart(e, `keyboard:${type}`)}
          style={{
            padding: '3px 6px',
            marginBottom: 4,
            borderRadius: 2,
            cursor: 'grab',
            fontSize: 10,
            fontWeight: '600',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            backgroundColor: 'transparent',
            color: 'black',
            border: 'none',
            listStyleType: 'disc',
            paddingLeft: 12,
            position: 'relative',
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 6,
              height: 6,
              backgroundColor: 'black',
              borderRadius: '50%',
            }}
          ></span>
          {type}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
