const GOOD = "bg-primary-100 text-primary-800";
const FRESH = "bg-lime-100 text-lime-800";
const WAIT = "bg-amber-100 text-amber-800";
const BAD = "bg-clay-100 text-clay-700";
const NEUTRAL = "bg-stone-100 text-stone-700";

const COLOR_MAP = {
  AVAILABLE: FRESH,
  OCCUPIED: GOOD,
  MAINTENANCE: WAIT,

  ACTIVE: GOOD,
  COMPLETED: NEUTRAL,
  CANCELLED: BAD,

  UNPAID: BAD,
  PENDING_VERIFICATION: WAIT,
  PAID: GOOD,
  OVERDUE: BAD,

  PENDING: WAIT,
  APPROVED: GOOD,
  REJECTED: BAD,

  OPEN: BAD,
  IN_PROGRESS: WAIT,
  RESOLVED: GOOD,
  CLOSED: NEUTRAL,

  LOW: NEUTRAL,
  MEDIUM: WAIT,
  HIGH: BAD,
};

export default function StatusBadge({ status }) {
  const classes = COLOR_MAP[status] || NEUTRAL;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}
