
const FONT =
  "'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif";

export function AnnouncementBar({announcement, isHome = false}) {
  if (!announcement?.enabled || !announcement?.message?.trim()) {
    return null;
  }

  return (
    <div
      className="announcement-bar"
      role="status"
      style={{
        margin: '8px 18px 0',
        minHeight: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 12px',
        background: isHome ? '#345225' : '#000000',
        color: '#fff',
        borderRadius: 7,
        fontFamily: FONT,
        fontSize: 13,
        fontWeight: 400,
        lineHeight: 1.3,
        textAlign: 'center',
        letterSpacing: '0.02em',
      }}
    >
      {announcement.message}
    </div>
  );
}