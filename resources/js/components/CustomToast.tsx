import { Toaster } from 'react-hot-toast';

export default function CustomToast() {
    return (
        <>
            <Toaster
                position="bottom-center"
                toastOptions={{
                    className: 'my-custom-toast',
                    style: {
                        background: 'linear-gradient(135deg, #052e16 0%, #059669 100%)',
                        color: '#fff',
                        borderRadius: '12px',
                        padding: '18px 28px',
                        boxShadow: '0 4px 18px 0 rgba(16,185,129,0.10), 0 1px 4px 0 rgba(34,197,94,0.08)',
                        border: '1.5px solid #10b981',
                        fontWeight: 600,
                        fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
                        letterSpacing: '0.01em',
                        animation: 'toast-pop-in 0.7s cubic-bezier(.22,1,.36,1)',
                        position: 'relative',
                        overflow: 'hidden',
                    },
                    icon: (
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#052e16',
                            borderRadius: '50%',
                            width: 28,
                            height: 28,
                            marginRight: 12,
                        }}>
                            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                                <circle cx="9" cy="9" r="8" fill="#fff" opacity="0.13"/>
                                <path d="M6 9.5l2 2 4-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </span>
                    ),
                    error: {
                        style: {
                            background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)',
                            border: '1.5px solid #ef4444',
                            boxShadow: '0 4px 18px 0 rgba(239,68,68,0.15), 0 1px 4px 0 rgba(248,113,113,0.08)',
                        },
                        icon: (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#7f1d1d',
                                borderRadius: '50%',
                                width: 28,
                                height: 28,
                                marginRight: 12,
                            }}>
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </span>
                        ),
                    },
                }}
            />
            <style>
                {`
                @keyframes toast-pop-in {
                    0% { opacity: 0; transform: translateY(40px) scale(0.95);}
                    80% { opacity: 1; transform: translateY(-6px) scale(1.03);}
                    100% { opacity: 1; transform: translateY(0) scale(1);}
                }
                .my-custom-toast {
                    transition: box-shadow 0.2s, border 0.2s, background 0.3s;
                    border-width: 1.5px;
                    border-style: solid;
                    box-shadow: 0 4px 18px 0 rgba(34,197,94,0.10), 0 1px 4px 0 rgba(59,130,246,0.08);
                    background: linear-gradient(135deg, #164e63 0%, #155e75 100%);
                    position: relative;
                }
                .my-custom-toast::before {
                    display: none;
                }
                `}
            </style>
        </>
    );
}
