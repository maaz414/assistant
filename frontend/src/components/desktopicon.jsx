import React, { useState, useEffect, useRef } from 'react';
import './DesktopIcon.css';
import mainIconImg from '../assets/main.png';

const DesktopIcon = ({ initialPosition, onExpand }) => {
  // If electron mode, the physical window moves, so the div is locked to center.
  const isElectron = Boolean(window.electronAPI);
  const [position, setPosition] = useState(
    isElectron ? { x: 90, y: 90 } : (initialPosition || { x: window.innerWidth / 2, y: window.innerHeight / 2 })
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragInfo = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragInfo.current = {
      startX: e.screenX,
      startY: e.screenY,
      initialX: position.x,
      initialY: position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.screenX - dragInfo.current.startX;
      const dy = e.screenY - dragInfo.current.startY;
      
      if (isElectron) {
        window.electronAPI.moveWindow(dx, dy);
        dragInfo.current.startX = e.screenX;
        dragInfo.current.startY = e.screenY;
      } else {
        setPosition({
          x: dragInfo.current.initialX + dx,
          y: dragInfo.current.initialY + dy
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      className="widget-wrapper"
      style={{ left: position.x, top: position.y }}
    >
      <div className="widget-core">
        <div className="widget-hit-area"></div>

        <div className="child-icon icon-a">A</div>
        <div className="child-icon icon-b">B</div>
        <div className="child-icon icon-c">C</div>

        <div className="search-bar-container">
          <input type="text" className="search-input" placeholder="Type here" />
          <div className="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>

        <div className="main-icon" onMouseDown={handleMouseDown} onDoubleClick={onExpand}>
          <img src={mainIconImg} alt="Main" style={{ width: '140%', height: '140%', objectFit: 'cover', transform: 'scale(1.4)', pointerEvents: 'none' }} />
        </div>
      </div>
    </div>
  );
};

export default DesktopIcon;
