import React from 'react'

const NodeCanvas: React.FC = () => {
  return (
    <div className="node-canvas">
      <div className="canvas-toolbar">
        <button className="btn btn-primary">Play</button>
        <button className="btn btn-secondary">Stop</button>
        <input 
          type="range" 
          min="60" 
          max="180" 
          defaultValue="120"
          className="tempo-slider"
        />
        <span>Tempo: 120 BPM</span>
      </div>
      <div className="canvas-area">
        <p>Нодовый граф появится здесь</p>
      </div>
    </div>
  )
}

export default NodeCanvas
