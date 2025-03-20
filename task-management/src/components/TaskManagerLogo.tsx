export const TaskManagerLogo = () => {
  return (
    <svg
      className="task-manager-logo"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
    >
      <rect x="10" y="20" width="80" height="60" rx="5" fill="#61dafb" stroke="#ffffff" strokeWidth="2" />
      <rect x="20" y="35" width="15" height="15" rx="2" fill="#ffffff" />
      <rect x="20" y="55" width="15" height="15" rx="2" fill="#ffffff" />
      <line x1="45" y1="42" x2="70" y2="42" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      <line x1="45" y1="62" x2="70" y2="62" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      <path d="M25 39 L30 44 L37 36" fill="none" stroke="#61dafb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};