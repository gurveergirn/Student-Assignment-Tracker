// Minimal stroke icons (Heroicons outline paths)
function Icon({ d, className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export const LogoIcon = (p) => <Icon d="M9 12l2 2 4-4M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" {...p} />;
export const HomeIcon = (p) => <Icon d="M2.25 12l8.95-8.96a1.13 1.13 0 011.6 0L21.75 12M4.5 9.75v10.13c0 .62.5 1.12 1.13 1.12H9.75v-4.88c0-.62.5-1.12 1.13-1.12h2.25c.62 0 1.12.5 1.12 1.12V21h4.13c.62 0 1.12-.5 1.12-1.13V9.75M8.25 21h8.25" {...p} />;
export const PlusIcon = (p) => <Icon d="M12 4.5v15m7.5-7.5h-15" {...p} />;
export const PencilIcon = (p) => <Icon d="M16.86 4.49l1.69-1.69a1.88 1.88 0 112.65 2.65L10.58 16.07a4.5 4.5 0 01-1.9 1.13L6 18l.8-2.68a4.5 4.5 0 011.13-1.9l8.93-8.93z" {...p} />;
export const TrashIcon = (p) => <Icon d="M14.74 9l-.35 9m-4.78 0L9.26 9m9.97-3.21c.34.05.68.11 1.02.17m-1.02-.17L18.16 19.67A2.25 2.25 0 0115.92 21.75H8.08a2.25 2.25 0 01-2.24-2.08L4.77 5.79m14.46 0a48.1 48.1 0 00-3.48-.4m-12 .57c.34-.06.68-.11 1.02-.17m0 0a48.1 48.1 0 013.48-.4m7.5 0v-.92c0-1.18-.91-2.16-2.09-2.2a52 52 0 00-3.32 0c-1.18.04-2.09 1.02-2.09 2.2v.92m7.5 0a48.7 48.7 0 00-7.5 0" {...p} />;
export const ChevronLeftIcon = (p) => <Icon d="M15.75 19.5L8.25 12l7.5-7.5" {...p} />;
export const ChevronRightIcon = (p) => <Icon d="M8.25 4.5l7.5 7.5-7.5 7.5" {...p} />;
export const ListIcon = (p) => <Icon d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.01v.01h-.01v-.01zm0 5.25h.01v.01h-.01V12zm0 5.25h.01v.01h-.01v-.01z" {...p} />;
export const CalendarIcon = (p) => <Icon d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" {...p} />;
export const LogoutIcon = (p) => <Icon d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" {...p} />;
