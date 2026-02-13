import React from 'react';

const Background3D = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            pointerEvents: 'none',
            backgroundColor: '#000000',
            backgroundImage: `
                radial-gradient(circle at 50% 0%, rgba(30, 30, 30, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(132, 204, 22, 0.03) 0%, transparent 40%)
            `
        }} />
    );
};

export default Background3D;
