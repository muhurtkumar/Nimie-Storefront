const FONT =
  "'Swiss 721', 'Swiss', 'Helvetica Neue', Helvetica, Arial, sans-serif";

export function AnnouncementBar({announcement}) {
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
        background: '#345225',
        color: '#fff',
        borderRadius: 7,
        fontFamily: FONT,
        fontSize: 13,
        fontWeight: 400,
        lineHeight: 1.3,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
      }}
    >
      {announcement.message}
    </div>
  );
}