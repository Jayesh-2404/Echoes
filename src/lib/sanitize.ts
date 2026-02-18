import crypto from 'crypto';

const harmfulPatterns = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:\s*text\/html/gi,
];

export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '')
    .slice(0, 10000);

  for (const pattern of harmfulPatterns) {
    sanitized = sanitized.replace(pattern, '');
  }

  return sanitized;
}

export function sanitizeHtml(input: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => entities[char] || char);
}

export function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip + process.env.IP_HASH_SECRET || 'default').digest('hex');
}

export function maskIp(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
  }
  if (ip.includes(':')) {
    return ip.slice(0, 20) + '...';
  }
  return 'xxx.xxx.xxx.xxx';
}
