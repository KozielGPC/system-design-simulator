import type { EnvelopeEstimation } from '../types';

export interface EnvelopeResults {
  // Traffic
  avgReadQps: number;
  avgWriteQps: number;
  peakReadQps: number;
  peakWriteQps: number;
  // Storage
  dailyStorageBytes: number;
  yearlyStorageBytes: number;
  totalStorageBytes: number;
  // Bandwidth
  incomingBandwidthBps: number;
  outgoingBandwidthBps: number;
  peakIncomingBandwidthBps: number;
  peakOutgoingBandwidthBps: number;
}

export function computeEnvelope(est: EnvelopeEstimation): EnvelopeResults {
  const totalDailyRequests = est.dau * est.avgRequestsPerUser;
  const avgQps = totalDailyRequests / 86400;
  const writeRatio = 1 / (1 + est.readWriteRatio);
  const readRatio = est.readWriteRatio / (1 + est.readWriteRatio);

  const avgReadQps = avgQps * readRatio;
  const avgWriteQps = avgQps * writeRatio;
  const peakReadQps = avgReadQps * est.peakMultiplier;
  const peakWriteQps = avgWriteQps * est.peakMultiplier;

  const dailyStorageBytes = est.newRecordsPerDay * est.recordSizeBytes;
  const yearlyStorageBytes = dailyStorageBytes * 365;
  const totalStorageBytes = yearlyStorageBytes * est.retentionYears;

  const incomingBandwidthBps = avgWriteQps * est.avgWritePayloadBytes * 8;
  const outgoingBandwidthBps = avgReadQps * est.avgReadPayloadBytes * 8;
  const peakIncomingBandwidthBps = incomingBandwidthBps * est.peakMultiplier;
  const peakOutgoingBandwidthBps = outgoingBandwidthBps * est.peakMultiplier;

  return {
    avgReadQps,
    avgWriteQps,
    peakReadQps,
    peakWriteQps,
    dailyStorageBytes,
    yearlyStorageBytes,
    totalStorageBytes,
    incomingBandwidthBps,
    outgoingBandwidthBps,
    peakIncomingBandwidthBps,
    peakOutgoingBandwidthBps,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val.toFixed(val >= 100 ? 0 : 1)} ${units[i]}`;
}

export function formatBandwidth(bitsPerSec: number): string {
  if (bitsPerSec === 0) return '0 bps';
  const units = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'];
  const i = Math.floor(Math.log(bitsPerSec) / Math.log(1000));
  const val = bitsPerSec / Math.pow(1000, i);
  return `${val.toFixed(val >= 100 ? 0 : 1)} ${units[Math.min(i, units.length - 1)]}`;
}

export function formatQps(qps: number): string {
  if (qps >= 1_000_000) return `${(qps / 1_000_000).toFixed(1)}M`;
  if (qps >= 1_000) return `${(qps / 1_000).toFixed(1)}K`;
  return qps.toFixed(0);
}

export const DEFAULT_ESTIMATION: EnvelopeEstimation = {
  dau: 1_000_000,
  readWriteRatio: 10,
  avgRequestsPerUser: 20,
  peakMultiplier: 3,
  recordSizeBytes: 1024,
  newRecordsPerDay: 500_000,
  retentionYears: 5,
  avgReadPayloadBytes: 2048,
  avgWritePayloadBytes: 512,
};
