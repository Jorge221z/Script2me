import { useState, useEffect } from 'react';

const RecaptchaContainer = ({ showCaptcha, shouldShowCaptcha, sitekey }) => {
    const [theme, setTheme] = useState(
        document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    );

    useEffect(() => {
        const observer = new MutationObserver(() => {
            const isDark = document.documentElement.classList.contains('dark');
            setTheme(isDark ? 'dark' : 'light');
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });
        return () => observer.disconnect();
    }, []);

    if (!showCaptcha || !shouldShowCaptcha) return null;

    return (
        <div
            id="recaptcha-container"
            className="g-recaptcha mb-4"
            data-sitekey={sitekey}
            data-callback="onCaptchaCompleted"
            data-size="normal"
            data-theme={theme}
        ></div>
    );
};

export default RecaptchaContainer;
