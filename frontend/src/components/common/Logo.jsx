import React from 'react';

const Logo = ({ size = 'md', showText = true }) => {
    const sizes = {
        sm: { icon: 28, text: 'text-lg' },
        md: { icon: 36, text: 'text-xl' },
        lg: { icon: 48, text: 'text-3xl' },
    };
    const s = sizes[size];

    return (
        <div className="flex items-center gap-2.5">
        {/* MindCare SVG Icon - a leaf forming a mind/brain shape */}
        <svg
            width={s.icon}
            height={s.icon}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
        >
            {/* Outer circle background */}
            <circle cx="24" cy="24" r="22" className="fill-verde-600" />
            {/* Brain/leaf stylized path */}
            <path
            d="M16 14c0-1.1.9-2 2-2h4a6 6 0 016 6v2h2a4 4 0 010 8h-2v2a6 6 0 01-6 6h-4a2 2 0 01-2-2V14z"
            fill="white"
            fillOpacity="0.2"
            />
            <path
            d="M20 12a8 8 0 018 8v1h1a5 5 0 010 10h-1v1a8 8 0 01-8 8"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            />
            <path
            d="M16 24h8M16 20h6M16 28h7"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            />
            {/* Small leaf accent */}
            <path
            d="M32 18c2-2 4-1 4 1s-2 4-4 3"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            />
        </svg>

        {showText && (
            <div className="leading-tight">
            <span
                className={`font-display font-bold ${s.text} text-verde-600 dark:text-verde-400`}
                style={{ fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}
            >
                Mind
                <span className="text-ink-800 dark:text-ink-100">Care</span>
            </span>
            </div>
        )}
        </div>
    );
};

export default Logo;
