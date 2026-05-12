export default function Spinner({ size = 24, color = '#4a90d9' }) {
    return (
        <span style={{
            display: 'inline-block',
            width: size,
            height: size,
            border: `3px solid #e0e0e0`,
            borderTop: `3px solid ${color}`,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
        }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </span>
    )
}