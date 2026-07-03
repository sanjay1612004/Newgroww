import { FiClock, FiExternalLink } from 'react-icons/fi';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NewsCard({ item }) {
  const title = item.data?.title || item.name || 'Market News';
  const body = item.data?.description || item.data?.body || '';
  const publisher = item.publisher || 'Stock News';
  const time = timeAgo(item.publishedAt);

  return (
    <div className="card group hover:bg-groww-surface transition-colors duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-groww-green bg-groww-green/10 px-2 py-0.5 rounded-full">{publisher}</span>
            <span className="flex items-center gap-1 text-xs text-groww-muted">
              <FiClock className="text-xs" />{time}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-groww-text leading-snug group-hover:text-groww-green transition-colors line-clamp-2">
            {title}
          </h3>
          {body && (
            <p className="text-xs text-groww-muted mt-1.5 line-clamp-2 leading-relaxed">{body}</p>
          )}
        </div>
        <FiExternalLink className="text-groww-muted shrink-0 mt-1 group-hover:text-groww-green transition-colors" />
      </div>
    </div>
  );
}
