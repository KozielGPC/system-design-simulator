import type { SystemNode, SystemEdge } from '../types';

export interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  nodes: SystemNode[];
  edges: SystemEdge[];
  targetRps: number;
  requirements?: {
    fr: string[];
    nfr: { category: string; label: string; target: string }[];
  };
}

const edgeDefaults = {
  type: 'labeled' as const,
  animated: false,
  style: { stroke: '#94a3b8', strokeWidth: 2 },
};

export const TEMPLATES: DesignTemplate[] = [
  {
    id: 'url-shortener',
    name: 'URL Shortener',
    description: 'Short URL generation and redirection service',
    icon: 'Link',
    targetRps: 10_000,
    nodes: [
      { id: 'tpl-lb', type: 'system', position: { x: 300, y: 80 }, data: { componentTypeId: 'load-balancer', label: 'Load Balancer', config: { throughput: 50_000, latency: 1, instances: 1, scalingType: 'horizontal', lbAlgorithm: 'round-robin' } } },
      { id: 'tpl-api', type: 'system', position: { x: 300, y: 220 }, data: { componentTypeId: 'api-server', label: 'API Server', config: { throughput: 2_000, latency: 30, instances: 3, scalingType: 'horizontal' } } },
      { id: 'tpl-cache', type: 'system', position: { x: 120, y: 380 }, data: { componentTypeId: 'cache', label: 'Redis Cache', config: { throughput: 100_000, latency: 1, instances: 1, scalingType: 'horizontal', cacheHitRate: 0.8, cacheEvictionPolicy: 'LRU', cachePattern: 'cache-aside', cacheInvalidation: 'TTL', cacheTtlSeconds: 86400 } } },
      { id: 'tpl-db', type: 'system', position: { x: 480, y: 380 }, data: { componentTypeId: 'nosql-db', label: 'URL Store', config: { throughput: 20_000, latency: 5, instances: 1, scalingType: 'horizontal', replicationFactor: 3 } } },
    ],
    edges: [
      { id: 'tpl-e1', source: 'tpl-lb', target: 'tpl-api', ...edgeDefaults, data: { label: '', protocol: 'HTTP', isAsync: false } },
      { id: 'tpl-e2', source: 'tpl-api', target: 'tpl-cache', ...edgeDefaults, data: { label: 'read', protocol: 'TCP', isAsync: false } },
      { id: 'tpl-e3', source: 'tpl-api', target: 'tpl-db', ...edgeDefaults, data: { label: 'write/miss', protocol: 'TCP', isAsync: false } },
    ],
    requirements: {
      fr: [
        'Generate short URL from long URL',
        'Redirect short URL to original URL',
        'Custom alias support',
        'URL expiration / TTL',
        'Analytics: click count per URL',
      ],
      nfr: [
        { category: 'Availability', label: 'High Availability', target: '99.99% uptime' },
        { category: 'Latency', label: 'Low Redirect Latency', target: 'p99 < 100ms' },
        { category: 'Throughput', label: 'Read-Heavy Throughput', target: '100:1 read/write' },
      ],
    },
  },
  {
    id: 'chat-system',
    name: 'Chat System',
    description: 'Real-time messaging with presence tracking',
    icon: 'MessageSquare',
    targetRps: 50_000,
    nodes: [
      { id: 'tpl-lb', type: 'system', position: { x: 300, y: 60 }, data: { componentTypeId: 'load-balancer', label: 'Load Balancer', config: { throughput: 100_000, latency: 1, instances: 2, scalingType: 'horizontal', lbAlgorithm: 'least-connections' } } },
      { id: 'tpl-ws', type: 'system', position: { x: 120, y: 200 }, data: { componentTypeId: 'web-server', label: 'WebSocket Server', config: { throughput: 10_000, latency: 5, instances: 4, scalingType: 'horizontal' } } },
      { id: 'tpl-api', type: 'system', position: { x: 480, y: 200 }, data: { componentTypeId: 'api-server', label: 'Chat API', config: { throughput: 5_000, latency: 20, instances: 3, scalingType: 'horizontal' } } },
      { id: 'tpl-mq', type: 'system', position: { x: 120, y: 360 }, data: { componentTypeId: 'pubsub', label: 'Message Broker', config: { throughput: 100_000, latency: 2, instances: 1, scalingType: 'horizontal' } } },
      { id: 'tpl-cache', type: 'system', position: { x: 300, y: 360 }, data: { componentTypeId: 'cache', label: 'Session Cache', config: { throughput: 100_000, latency: 1, instances: 1, scalingType: 'horizontal', cacheHitRate: 0.95, cacheEvictionPolicy: 'LRU', cachePattern: 'cache-aside', cacheInvalidation: 'TTL', cacheTtlSeconds: 3600 } } },
      { id: 'tpl-db', type: 'system', position: { x: 480, y: 360 }, data: { componentTypeId: 'nosql-db', label: 'Message Store', config: { throughput: 20_000, latency: 5, instances: 1, scalingType: 'horizontal', replicationFactor: 3 } } },
    ],
    edges: [
      { id: 'tpl-e1', source: 'tpl-lb', target: 'tpl-ws', ...edgeDefaults, data: { label: 'connect', protocol: 'WebSocket', isAsync: false } },
      { id: 'tpl-e2', source: 'tpl-lb', target: 'tpl-api', ...edgeDefaults, data: { label: 'REST', protocol: 'HTTP', isAsync: false } },
      { id: 'tpl-e3', source: 'tpl-ws', target: 'tpl-mq', ...edgeDefaults, data: { label: 'publish', protocol: 'AMQP', isAsync: true } },
      { id: 'tpl-e4', source: 'tpl-api', target: 'tpl-cache', ...edgeDefaults, data: { label: '', protocol: 'TCP', isAsync: false } },
      { id: 'tpl-e5', source: 'tpl-api', target: 'tpl-db', ...edgeDefaults, data: { label: 'persist', protocol: 'TCP', isAsync: false } },
    ],
    requirements: {
      fr: [
        'Send and receive messages in real-time',
        '1:1 and group chat support',
        'Message history and search',
        'Online/offline presence indicators',
        'Read receipts and typing indicators',
      ],
      nfr: [
        { category: 'Latency', label: 'Message Delivery', target: 'p99 < 300ms' },
        { category: 'Availability', label: 'High Availability', target: '99.99% uptime' },
        { category: 'Consistency', label: 'Message Ordering', target: 'Causal consistency' },
      ],
    },
  },
  {
    id: 'news-feed',
    name: 'News Feed',
    description: 'Social media feed with fanout-on-write',
    icon: 'Newspaper',
    targetRps: 100_000,
    nodes: [
      { id: 'tpl-lb', type: 'system', position: { x: 300, y: 60 }, data: { componentTypeId: 'load-balancer', label: 'Load Balancer', config: { throughput: 200_000, latency: 1, instances: 2, scalingType: 'horizontal', lbAlgorithm: 'round-robin' } } },
      { id: 'tpl-api', type: 'system', position: { x: 300, y: 200 }, data: { componentTypeId: 'api-server', label: 'Feed API', config: { throughput: 5_000, latency: 30, instances: 5, scalingType: 'horizontal' } } },
      { id: 'tpl-mq', type: 'system', position: { x: 120, y: 340 }, data: { componentTypeId: 'message-queue', label: 'Fanout Queue', config: { throughput: 50_000, latency: 2, instances: 1, scalingType: 'horizontal' } } },
      { id: 'tpl-worker', type: 'system', position: { x: 120, y: 480 }, data: { componentTypeId: 'worker', label: 'Fanout Worker', config: { throughput: 2_000, latency: 50, instances: 4, scalingType: 'horizontal' } } },
      { id: 'tpl-cache', type: 'system', position: { x: 300, y: 340 }, data: { componentTypeId: 'cache', label: 'Feed Cache', config: { throughput: 100_000, latency: 1, instances: 3, scalingType: 'horizontal', cacheHitRate: 0.9, cacheEvictionPolicy: 'LRU', cachePattern: 'write-through', cacheInvalidation: 'event-driven', cacheTtlSeconds: 600 } } },
      { id: 'tpl-db', type: 'system', position: { x: 480, y: 340 }, data: { componentTypeId: 'nosql-db', label: 'Post Store', config: { throughput: 20_000, latency: 5, instances: 1, scalingType: 'horizontal', replicationFactor: 3 } } },
    ],
    edges: [
      { id: 'tpl-e1', source: 'tpl-lb', target: 'tpl-api', ...edgeDefaults, data: { label: '', protocol: 'HTTP', isAsync: false } },
      { id: 'tpl-e2', source: 'tpl-api', target: 'tpl-mq', ...edgeDefaults, data: { label: 'new post', protocol: 'AMQP', isAsync: true } },
      { id: 'tpl-e3', source: 'tpl-api', target: 'tpl-cache', ...edgeDefaults, data: { label: 'read feed', protocol: 'TCP', isAsync: false } },
      { id: 'tpl-e4', source: 'tpl-api', target: 'tpl-db', ...edgeDefaults, data: { label: 'write', protocol: 'TCP', isAsync: false } },
      { id: 'tpl-e5', source: 'tpl-mq', target: 'tpl-worker', ...edgeDefaults, data: { label: 'consume', protocol: 'AMQP', isAsync: true } },
      { id: 'tpl-e6', source: 'tpl-worker', target: 'tpl-cache', ...edgeDefaults, data: { label: 'fanout', protocol: 'TCP', isAsync: false } },
    ],
    requirements: {
      fr: [
        'Users can create posts (text, images, links)',
        'Users see a personalized feed of posts',
        'Like, comment, and share interactions',
        'Follow/unfollow other users',
        'Feed ranking and relevance scoring',
      ],
      nfr: [
        { category: 'Latency', label: 'Feed Load Time', target: 'p99 < 500ms' },
        { category: 'Consistency', label: 'Eventual Consistency', target: 'Converge within 5s' },
        { category: 'Scalability', label: 'Celebrity Problem', target: 'Hybrid push/pull' },
      ],
    },
  },
  {
    id: 'video-streaming',
    name: 'Video Streaming',
    description: 'Video upload, processing, and streaming platform',
    icon: 'Video',
    targetRps: 50_000,
    nodes: [
      { id: 'tpl-cdn', type: 'system', position: { x: 300, y: 60 }, data: { componentTypeId: 'cdn', label: 'CDN', config: { throughput: 200_000, latency: 5, instances: 1, scalingType: 'horizontal', cacheHitRate: 0.95, cacheEvictionPolicy: 'TTL', cachePattern: 'read-through', cacheInvalidation: 'TTL', cacheTtlSeconds: 86400 } } },
      { id: 'tpl-lb', type: 'system', position: { x: 300, y: 200 }, data: { componentTypeId: 'load-balancer', label: 'Load Balancer', config: { throughput: 100_000, latency: 1, instances: 1, scalingType: 'horizontal', lbAlgorithm: 'round-robin' } } },
      { id: 'tpl-api', type: 'system', position: { x: 300, y: 340 }, data: { componentTypeId: 'api-server', label: 'Video API', config: { throughput: 3_000, latency: 30, instances: 3, scalingType: 'horizontal' } } },
      { id: 'tpl-mq', type: 'system', position: { x: 120, y: 480 }, data: { componentTypeId: 'message-queue', label: 'Transcode Queue', config: { throughput: 10_000, latency: 5, instances: 1, scalingType: 'horizontal' } } },
      { id: 'tpl-worker', type: 'system', position: { x: 120, y: 620 }, data: { componentTypeId: 'worker', label: 'Transcoder', config: { throughput: 100, latency: 5000, instances: 10, scalingType: 'horizontal' } } },
      { id: 'tpl-s3', type: 'system', position: { x: 480, y: 480 }, data: { componentTypeId: 'object-storage', label: 'Video Storage', config: { throughput: 10_000, latency: 20, instances: 1, scalingType: 'horizontal' } } },
      { id: 'tpl-db', type: 'system', position: { x: 300, y: 480 }, data: { componentTypeId: 'sql-db', label: 'Metadata DB', config: { throughput: 5_000, latency: 10, instances: 1, scalingType: 'vertical', replicationFactor: 2 } } },
    ],
    edges: [
      { id: 'tpl-e1', source: 'tpl-cdn', target: 'tpl-lb', ...edgeDefaults, data: { label: 'miss', protocol: 'HTTP', isAsync: false } },
      { id: 'tpl-e2', source: 'tpl-lb', target: 'tpl-api', ...edgeDefaults, data: { label: '', protocol: 'HTTP', isAsync: false } },
      { id: 'tpl-e3', source: 'tpl-api', target: 'tpl-mq', ...edgeDefaults, data: { label: 'upload', protocol: 'AMQP', isAsync: true } },
      { id: 'tpl-e4', source: 'tpl-api', target: 'tpl-db', ...edgeDefaults, data: { label: 'metadata', protocol: 'TCP', isAsync: false } },
      { id: 'tpl-e5', source: 'tpl-mq', target: 'tpl-worker', ...edgeDefaults, data: { label: '', protocol: 'AMQP', isAsync: true } },
      { id: 'tpl-e6', source: 'tpl-worker', target: 'tpl-s3', ...edgeDefaults, data: { label: 'store', protocol: 'HTTP', isAsync: false } },
    ],
    requirements: {
      fr: [
        'Upload and transcode videos (multiple resolutions)',
        'Stream video with adaptive bitrate',
        'Video metadata and search',
        'Like, comment, and subscribe',
        'View count and recommendation engine',
      ],
      nfr: [
        { category: 'Latency', label: 'Stream Start', target: 'p99 < 2s' },
        { category: 'Availability', label: 'High Availability', target: '99.9% uptime' },
        { category: 'Durability', label: 'Video Durability', target: '11 9s durability' },
      ],
    },
  },
  {
    id: 'rate-limiter-design',
    name: 'Rate Limiter',
    description: 'Distributed rate limiting service',
    icon: 'Timer',
    targetRps: 100_000,
    nodes: [
      { id: 'tpl-client', type: 'system', position: { x: 300, y: 60 }, data: { componentTypeId: 'web-client', label: 'API Clients', config: { throughput: 0, latency: 0, instances: 1, scalingType: 'horizontal' } } },
      { id: 'tpl-rl', type: 'system', position: { x: 300, y: 200 }, data: { componentTypeId: 'rate-limiter', label: 'Rate Limiter', config: { throughput: 100_000, latency: 1, instances: 3, scalingType: 'horizontal' } } },
      { id: 'tpl-cache', type: 'system', position: { x: 120, y: 340 }, data: { componentTypeId: 'cache', label: 'Counter Cache', config: { throughput: 200_000, latency: 1, instances: 3, scalingType: 'horizontal', cacheHitRate: 0.99, cacheEvictionPolicy: 'TTL', cachePattern: 'write-through', cacheInvalidation: 'TTL', cacheTtlSeconds: 60 } } },
      { id: 'tpl-api', type: 'system', position: { x: 480, y: 340 }, data: { componentTypeId: 'api-server', label: 'Backend API', config: { throughput: 10_000, latency: 30, instances: 5, scalingType: 'horizontal' } } },
      { id: 'tpl-db', type: 'system', position: { x: 120, y: 480 }, data: { componentTypeId: 'nosql-db', label: 'Rules Store', config: { throughput: 5_000, latency: 5, instances: 1, scalingType: 'horizontal', replicationFactor: 3 } } },
    ],
    edges: [
      { id: 'tpl-e1', source: 'tpl-client', target: 'tpl-rl', ...edgeDefaults, data: { label: 'request', protocol: 'HTTP', isAsync: false } },
      { id: 'tpl-e2', source: 'tpl-rl', target: 'tpl-cache', ...edgeDefaults, data: { label: 'check/incr', protocol: 'TCP', isAsync: false } },
      { id: 'tpl-e3', source: 'tpl-rl', target: 'tpl-api', ...edgeDefaults, data: { label: 'allow', protocol: 'HTTP', isAsync: false } },
      { id: 'tpl-e4', source: 'tpl-cache', target: 'tpl-db', ...edgeDefaults, data: { label: 'rules', protocol: 'TCP', isAsync: false } },
    ],
    requirements: {
      fr: [
        'Limit requests per client/IP/API key',
        'Support multiple rate-limiting algorithms (token bucket, sliding window)',
        'Return rate limit headers (X-RateLimit-*)',
        'Configurable rules per API endpoint',
        'Dashboard for monitoring rate limit hits',
      ],
      nfr: [
        { category: 'Latency', label: 'Low Overhead', target: 'p99 < 5ms added latency' },
        { category: 'Availability', label: 'Fail-Open', target: 'Allow traffic if limiter fails' },
        { category: 'Consistency', label: 'Approximate Counting', target: 'Within 1% accuracy' },
      ],
    },
  },
];
