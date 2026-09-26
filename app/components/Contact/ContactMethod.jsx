const FONT = "'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif";
// Space between the page edge and the card. Keep in sync with Header.jsx / Hero.jsx
const GAP_Y = '16px';
const GAP_X = '0px';

const DEFAULT_ITEMS = [
  {
    label: 'Write to us on mail',
    value: 'teamnimie@gmail.com',
    href: 'mailto:teamnimie@gmail.com',
    icon: 'mail',
  },
  {
    label: 'Follow us on Instagram',
    value: '@nimie.in',
    href: 'https://www.instagram.com/nimie.in',
    icon: 'instagram',
  },
  {
    label: 'Chat with us on WhatsApp',
    value: '+91-835-397-4975',
    href: 'https://wa.me/918353974975',
    icon: 'whatsapp',
  },
];


export function ContactMethod({image, imageAlt = '', items = DEFAULT_ITEMS}) {
  return (
    <section
      style={{padding: `${GAP_Y} ${GAP_X}`, margin: 0, boxSizing: 'border-box', width: '100%'}}
    >
      <div className="relative w-full overflow-hidden" style={{borderRadius: 16, lineHeight: 0}}>
        {image ? (
          <img
            src={image}
            alt={imageAlt}
            style={{display: 'block', width: '100%', height: 'auto', minHeight: 580, objectFit: 'cover'}}
          />
        ) : (
          <div className="bg-stone-300" style={{width: '100%', height: 260}} />
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{pointerEvents: 'none', background: 'rgba(17,23,13,0.4)'}}
        />

        <div
          className="absolute inset-0 z-10 flex flex-col items-stretch justify-center md:flex-row"
          style={{
            fontFamily: FONT,
            lineHeight: 'normal', // undo the card shell's lineHeight:0 before it hits any text
            padding: 'clamp(20px, 3vw, 32px)',
            gap: 'clamp(20px, 3vw, 32px)',
          }}
        >
          {items.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.icon === 'mail' ? undefined : '_blank'}
              rel={item.icon === 'mail' ? undefined : 'noreferrer'}
              className="flex flex-1 items-center justify-center gap-3 transition-opacity hover:opacity-80"
              style={{textDecoration: 'none'}}
            >
              
              <span style={{textAlign: 'center'}}>
                <span
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.75)',
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    display: 'block',
                    marginTop: 10,
                    fontSize: 'clamp(21px, 2.4vw, 27px)',
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  {item.value}
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
