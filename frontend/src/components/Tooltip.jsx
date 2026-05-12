import { useState } from 'react'

export default function Tooltip({ text, children }) {
    const [visible, setVisible] = useState(false)
    const [pos, setPos] = useState({ x: 0, y: 0 })

    function handleMove(e) {
        setPos({ x: e.clientX + 12, y: e.clientY + 12 })
    }

    return (
        <span
            style={{ position: 'relative', cursor: 'help' }}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            onMouseMove={handleMove}
        >
            {children}
            {visible && (
                <div style={{
                    position: 'fixed',
                    left: pos.x,
                    top: pos.y,
                    background: '#222',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    maxWidth: '220px',
                    lineHeight: '1.5',
                    zIndex: 9999,
                    pointerEvents: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                    {text}
                </div>
            )}
        </span>
    )
}