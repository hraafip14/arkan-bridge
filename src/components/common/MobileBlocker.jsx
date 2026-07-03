import { useState, useEffect } from 'react';
import bridgeLogo from '../../assets/bridge2.png';

const MOBILE_BREAKPOINT = 768;

const MobileBlocker = ({ children }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

        const handleChange = (e) => setIsMobile(e.matches);

        // Set initial value
        setIsMobile(mediaQuery.matches);

        // Listen for changes (e.g. device rotation, browser resize)
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    if (!isMobile) return children;

    return (
        <div style={styles.overlay}>
            {/* Animated background blobs */}
            <div style={styles.blob1} />
            <div style={styles.blob2} />
            <div style={styles.blob3} />

            <div style={styles.card}>
                <div style={styles.iconContainer}>
                    <img src={bridgeLogo} alt="Arkan BRIDGE" style={styles.logo} />
                </div>

                <div style={styles.divider} />

                <div style={styles.mobileIconWrap}>
                    <svg style={styles.mobileIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                        <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                    {/* X mark over phone */}
                    <svg style={styles.xMark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="4" y1="4" x2="20" y2="20" />
                        <line x1="20" y1="4" x2="4" y2="20" />
                    </svg>
                </div>

                <h1 style={styles.title}>Desktop Only</h1>
                <p style={styles.message}>
                    This website is not yet available on mobile devices.
                </p>
                <p style={styles.submessage}>
                    Please access <strong>Arkan BRIDGE</strong> from a desktop or laptop computer for the best experience.
                </p>

                <div style={styles.hintBox}>
                    <svg style={styles.hintIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                    <span style={styles.hintText}>Minimum screen width: {MOBILE_BREAKPOINT}px</span>
                </div>
            </div>

            <style>{`
                @keyframes mobileBlockerFloat1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -40px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.95); }
                }
                @keyframes mobileBlockerFloat2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(-40px, 30px) scale(1.05); }
                    66% { transform: translate(25px, -25px) scale(0.9); }
                }
                @keyframes mobileBlockerFloat3 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(15px, 35px) scale(1.08); }
                }
                @keyframes mobileBlockerFadeIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes mobileBlockerPulse {
                    0%, 100% { transform: scale(1); opacity: 0.7; }
                    50% { transform: scale(1.08); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F2878 0%, #1E40AF 40%, #2563EB 70%, #22D3EE 100%)',
        overflow: 'hidden',
        padding: '24px',
    },
    blob1: {
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,211,238,0.25) 0%, transparent 70%)',
        top: '-60px',
        right: '-80px',
        animation: 'mobileBlockerFloat1 8s ease-in-out infinite',
    },
    blob2: {
        position: 'absolute',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(96,165,250,0.2) 0%, transparent 70%)',
        bottom: '-40px',
        left: '-60px',
        animation: 'mobileBlockerFloat2 10s ease-in-out infinite',
    },
    blob3: {
        position: 'absolute',
        width: '180px',
        height: '180px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
        top: '40%',
        left: '50%',
        animation: 'mobileBlockerFloat3 7s ease-in-out infinite',
    },
    card: {
        position: 'relative',
        zIndex: 1,
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.2)',
        padding: '40px 32px',
        maxWidth: '380px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
        animation: 'mobileBlockerFadeIn 0.6s ease-out both',
    },
    iconContainer: {
        marginBottom: '16px',
    },
    logo: {
        width: '56px',
        height: '56px',
        objectFit: 'contain',
        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))',
    },
    divider: {
        width: '48px',
        height: '3px',
        borderRadius: '2px',
        background: 'linear-gradient(90deg, #22D3EE, #60A5FA)',
        margin: '0 auto 24px',
    },
    mobileIconWrap: {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '72px',
        height: '72px',
        marginBottom: '20px',
    },
    mobileIcon: {
        width: '48px',
        height: '48px',
        color: 'rgba(255,255,255,0.5)',
    },
    xMark: {
        position: 'absolute',
        width: '56px',
        height: '56px',
        color: '#EF4444',
        filter: 'drop-shadow(0 2px 6px rgba(239,68,68,0.5))',
        animation: 'mobileBlockerPulse 2.5s ease-in-out infinite',
    },
    title: {
        fontFamily: "'Sora', sans-serif",
        fontSize: '22px',
        fontWeight: 700,
        color: '#FFFFFF',
        marginBottom: '12px',
        letterSpacing: '-0.3px',
    },
    message: {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '15px',
        fontWeight: 600,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 1.5,
        marginBottom: '8px',
    },
    submessage: {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '13px',
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 1.6,
        marginBottom: '24px',
    },
    hintBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 16px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.1)',
    },
    hintIcon: {
        width: '18px',
        height: '18px',
        color: '#22D3EE',
        flexShrink: 0,
    },
    hintText: {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '12px',
        color: 'rgba(255,255,255,0.55)',
        fontWeight: 500,
    },
};

export default MobileBlocker;
