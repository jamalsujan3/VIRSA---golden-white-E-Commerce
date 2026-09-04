import React, { useState, useEffect } from 'react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "h-10 sm:h-12 md:h-14 w-auto" }: LogoProps) {
  const [logoUrl, setLogoUrl] = useState<string>('');

  useEffect(() => {
    const updateLogo = () => {
      try {
        const saved = localStorage.getItem('virsa_brand_assets');
        if (saved) {
          const assets = JSON.parse(saved);
          const headerLogo = assets.find((a: any) => a.type === 'header_logo');
          setLogoUrl(headerLogo?.url || '');
        }
      } catch (e) {
        console.error(e);
      }
    };

    updateLogo();
    window.addEventListener('brand_assets_updated', updateLogo);
    return () => window.removeEventListener('brand_assets_updated', updateLogo);
  }, []);

  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt="VIRSA Atelier" 
        className={`${className} object-contain`} 
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 450 120" 
      className={className}
    >
      <defs>
        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C5A059" />
          <stop offset="35%" stopColor="#DFC488" />
          <stop offset="65%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8C6819" />
        </linearGradient>
      </defs>
      
      {/* Luxurious Monogram Motif */}
      <g transform="translate(15, 10)">
        {/* Outer Elegant Crest Shape */}
        <path d="M 50 5 L 90 35 L 90 65 L 50 95 L 10 65 L 10 35 Z" fill="none" stroke="url(#gold-gradient)" strokeWidth="1.5" opacity="0.8" />
        <path d="M 50 10 L 85 38 L 85 62 L 50 90 L 15 62 L 15 38 Z" fill="none" stroke="url(#gold-gradient)" strokeWidth="0.75" opacity="0.6" />
        
        {/* Outer Diamond Dots */}
        <circle cx="50" cy="1" r="2.5" fill="url(#gold-gradient)" />
        <circle cx="50" cy="99" r="2.5" fill="url(#gold-gradient)" />
        
        {/* Stylized Heritage 'V' */}
        <path d="M 30 35 L 50 78 L 70 35" fill="none" stroke="url(#gold-gradient)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 38 35 L 50 63 L 62 35" fill="none" stroke="url(#gold-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
        
        {/* Central Motif Star */}
        <polygon points="50,18 53,24 60,24 55,28 57,34 50,30 43,34 45,28 40,24 47,24" fill="url(#gold-gradient)" />
      </g>

      {/* Brand Wordmark */}
      <g transform="translate(135, 15)">
        {/* VIRSA */}
        <text x="0" y="52" fontFamily="'Cormorant Garamond', 'Cinzel', 'Playfair Display', 'Georgia', serif" fontSize="44" fontWeight="800" fill="url(#gold-gradient)" letterSpacing="12">VIRSA</text>
        
        {/* Tagline: TRADITION. REDEFINED. */}
        <text x="3" y="78" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10.5" fontWeight="700" fill="#3A342E" letterSpacing="5.5" opacity="0.95">TRADITION. REDEFINED.</text>
        
        {/* Elegant Divider Accent */}
        <line x1="3" y1="64" x2="255" y2="64" stroke="url(#gold-gradient)" strokeWidth="1.2" opacity="0.7" />
      </g>
    </svg>
  );
}
