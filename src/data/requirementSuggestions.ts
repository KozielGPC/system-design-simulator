export const FR_SUGGESTIONS: string[] = [
  'Users can create/read/update/delete resources',
  'Users can search and filter results',
  'System supports real-time notifications',
  'Users can upload and download files',
  'System supports user authentication and authorization',
  'Users can share content with others',
  'System generates analytics and reports',
  'Users can subscribe to events or topics',
  'System supports pagination for large result sets',
  'Users can rate or review items',
];

export const NFR_PRESETS: { category: string; label: string; target: string }[] = [
  { category: 'Availability', label: 'High Availability', target: '99.99% uptime' },
  { category: 'Latency', label: 'Low Read Latency', target: 'p99 < 200ms' },
  { category: 'Latency', label: 'Low Write Latency', target: 'p99 < 500ms' },
  { category: 'Throughput', label: 'High Throughput', target: '> 10K req/s' },
  { category: 'Consistency', label: 'Strong Consistency', target: 'Linearizable reads' },
  { category: 'Consistency', label: 'Eventual Consistency', target: 'Converge within 5s' },
  { category: 'Durability', label: 'Data Durability', target: '99.999999999% (11 9s)' },
  { category: 'Scalability', label: 'Horizontal Scalability', target: 'Linear scale to 10x' },
  { category: 'Security', label: 'Data Encryption', target: 'AES-256 at rest & in transit' },
  { category: 'Compliance', label: 'GDPR Compliance', target: 'Data residency & deletion' },
];
