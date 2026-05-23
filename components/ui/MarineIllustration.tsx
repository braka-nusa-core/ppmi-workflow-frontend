// Pure SVG illustration — marine/maritime enterprise atmosphere
// Used only on the login page left panel

export function MarineIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Ocean horizon — layered depth */}
      <ellipse cx="240" cy="310" rx="320" ry="80" fill="rgba(255,255,255,0.03)" />
      <ellipse cx="240" cy="290" rx="260" ry="55" fill="rgba(255,255,255,0.03)" />

      {/* Far horizon line */}
      <line x1="40" y1="220" x2="440" y2="220" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

      {/* Distant ship silhouette */}
      <g opacity="0.25">
        <rect x="310" y="202" width="80" height="10" rx="2" fill="white" />
        <rect x="322" y="188" width="56" height="14" rx="2" fill="white" />
        <rect x="340" y="174" width="4" height="14" fill="white" />
        <rect x="364" y="178" width="3" height="10" fill="white" />
      </g>

      {/* Primary ship — hull */}
      <g opacity="0.90">
        {/* Main hull */}
        <path
          d="M80 240 L100 230 L380 230 L400 240 L390 258 L90 258 Z"
          fill="rgba(255,255,255,0.12)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
        />
        {/* Hull underside / waterline */}
        <path
          d="M90 258 Q240 265 390 258"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
        />

        {/* Superstructure base */}
        <rect x="155" y="198" width="170" height="32" rx="2"
          fill="rgba(255,255,255,0.10)"
          stroke="rgba(255,255,255,0.20)"
          strokeWidth="1"
        />

        {/* Bridge / wheelhouse */}
        <rect x="195" y="170" width="90" height="28" rx="2"
          fill="rgba(255,255,255,0.12)"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1"
        />

        {/* Bridge windows */}
        <rect x="203" y="177" width="12" height="8" rx="1" fill="rgba(255,255,255,0.35)" />
        <rect x="220" y="177" width="12" height="8" rx="1" fill="rgba(255,255,255,0.35)" />
        <rect x="237" y="177" width="12" height="8" rx="1" fill="rgba(255,255,255,0.35)" />
        <rect x="254" y="177" width="12" height="8" rx="1" fill="rgba(255,255,255,0.35)" />
        <rect x="271" y="177" width="12" height="8" rx="1" fill="rgba(255,255,255,0.35)" />

        {/* Mast */}
        <line x1="240" y1="115" x2="240" y2="170" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
        {/* Radar arm */}
        <line x1="220" y1="130" x2="260" y2="130" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        <circle cx="240" cy="125" r="6" fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" />

        {/* Funnel */}
        <rect x="280" y="175" width="22" height="36" rx="2"
          fill="rgba(255,255,255,0.10)"
          stroke="rgba(255,255,255,0.20)"
          strokeWidth="1"
        />
        {/* Funnel band */}
        <rect x="280" y="182" width="22" height="4" rx="0" fill="rgba(255,255,255,0.18)" />

        {/* Crane / derrick */}
        <line x1="130" y1="198" x2="130" y2="155" stroke="rgba(255,255,255,0.22)" strokeWidth="2" />
        <line x1="130" y1="160" x2="168" y2="185" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />

        {/* Deck details */}
        <line x1="155" y1="215" x2="325" y2="215" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <line x1="100" y1="238" x2="400" y2="238" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

        {/* Anchor point decoration */}
        <circle cx="110" cy="244" r="4" fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="1.5" />
      </g>

      {/* Water / wake effect */}
      <g opacity="0.15">
        <path d="M60 268 Q120 262 180 268 Q240 274 300 268 Q360 262 420 268" stroke="white" strokeWidth="1" fill="none" />
        <path d="M75 278 Q140 272 210 278 Q280 284 350 278 Q400 274 435 278" stroke="white" strokeWidth="1" fill="none" />
        <path d="M90 288 Q160 282 240 288 Q320 294 390 288" stroke="white" strokeWidth="0.8" fill="none" />
      </g>

      {/* Compass rose — top right */}
      <g transform="translate(400, 72)" opacity="0.20">
        <circle cx="0" cy="0" r="28" fill="none" stroke="white" strokeWidth="1" />
        <circle cx="0" cy="0" r="20" fill="none" stroke="white" strokeWidth="0.5" />
        <circle cx="0" cy="0" r="4" fill="rgba(255,255,255,0.4)" />
        {/* Cardinal points */}
        <polygon points="0,-28 3,-20 0,-14 -3,-20" fill="white" opacity="0.7" />
        <polygon points="0,28 3,20 0,14 -3,20" fill="white" opacity="0.4" />
        <polygon points="28,0 20,3 14,0 20,-3" fill="white" opacity="0.4" />
        <polygon points="-28,0 -20,3 -14,0 -20,-3" fill="white" opacity="0.4" />
        {/* N label */}
        <text x="-4" y="-32" fill="white" fontSize="8" fontWeight="600" opacity="0.7">N</text>
      </g>

      {/* Grid / coordinate lines — subtle */}
      <g opacity="0.04" stroke="white" strokeWidth="1">
        <line x1="0"   y1="80"  x2="480" y2="80"  />
        <line x1="0"   y1="160" x2="480" y2="160" />
        <line x1="80"  y1="0"   x2="80"  y2="360" />
        <line x1="160" y1="0"   x2="160" y2="360" />
        <line x1="240" y1="0"   x2="240" y2="360" />
        <line x1="320" y1="0"   x2="320" y2="360" />
        <line x1="400" y1="0"   x2="400" y2="360" />
      </g>

      {/* Document / workflow nodes — abstract */}
      <g opacity="0.18">
        <rect x="42" y="52" width="44" height="34" rx="3" fill="none" stroke="white" strokeWidth="1" />
        <line x1="50" y1="63" x2="78" y2="63" stroke="white" strokeWidth="0.8" />
        <line x1="50" y1="70" x2="72" y2="70" stroke="white" strokeWidth="0.8" />
        <line x1="50" y1="77" x2="75" y2="77" stroke="white" strokeWidth="0.8" />

        <line x1="86" y1="69" x2="100" y2="69" stroke="white" strokeWidth="0.8" strokeDasharray="2 2" />

        <rect x="100" y="52" width="44" height="34" rx="3" fill="none" stroke="white" strokeWidth="1" />
        <line x1="108" y1="63" x2="136" y2="63" stroke="white" strokeWidth="0.8" />
        <line x1="108" y1="70" x2="130" y2="70" stroke="white" strokeWidth="0.8" />

        <line x1="144" y1="69" x2="158" y2="69" stroke="white" strokeWidth="0.8" strokeDasharray="2 2" />

        <rect x="158" y="52" width="44" height="34" rx="3" fill="rgba(255,255,255,0.08)" stroke="white" strokeWidth="1" />
        <line x1="166" y1="63" x2="194" y2="63" stroke="white" strokeWidth="0.8" />
        <line x1="166" y1="70" x2="188" y2="70" stroke="white" strokeWidth="0.8" />
        <line x1="166" y1="77" x2="191" y2="77" stroke="white" strokeWidth="0.8" />
      </g>
    </svg>
  )
}
