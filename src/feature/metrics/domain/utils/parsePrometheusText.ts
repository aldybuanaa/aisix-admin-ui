import type { MetricsSummary, ProviderBreakdown } from '../entities/MetricsEntity';

/**
 * Parses Prometheus text exposition (text/plain; version=0.0.4) into a summary.
 *
 * Recognised series:
 *   aisix_requests_total{provider="…",…} N
 *   aisix_tokens_consumed_total{provider="…",type="prompt|completion"} N
 *   aisix_request_duration_seconds_sum{…} N   (with the matching _count)
 *
 * Latency is reported as the mean: sum / count, converted to milliseconds.
 * Unknown series (process_start_time_seconds, comments, HELP/TYPE lines) are ignored.
 */
export function parsePrometheusText(text: string): MetricsSummary {
  let totalRequests = 0;
  let totalTokens = 0;
  let durationSum = 0;
  let durationCount = 0;
  const providerBreakdown: Record<string, ProviderBreakdown> = {};

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) continue;

    const parsed = parseSampleLine(line);
    if (!parsed) continue;

    const { name, labels, value } = parsed;
    if (!Number.isFinite(value)) continue;

    const provider = labels.provider;
    const ensureProvider = (): ProviderBreakdown => {
      const key = provider ?? 'unknown';
      providerBreakdown[key] ??= { requests: 0, tokens: 0 };
      return providerBreakdown[key];
    };

    switch (name) {
      case 'aisix_requests_total':
        totalRequests += value;
        ensureProvider().requests += value;
        break;
      case 'aisix_tokens_consumed_total':
        totalTokens += value;
        ensureProvider().tokens += value;
        break;
      case 'aisix_request_duration_seconds_sum':
        durationSum += value;
        break;
      case 'aisix_request_duration_seconds_count':
        durationCount += value;
        break;
      default:
        break;
    }
  }

  const avgLatencyMs = durationCount > 0 ? (durationSum / durationCount) * 1000 : 0;

  return {
    total_requests: totalRequests,
    total_tokens: totalTokens,
    avg_latency_ms: avgLatencyMs,
    provider_breakdown: providerBreakdown,
  };
}

interface ParsedSample {
  name: string;
  labels: Record<string, string>;
  value: number;
}

function parseSampleLine(line: string): ParsedSample | null {
  const braceIndex = line.indexOf('{');

  if (braceIndex === -1) {
    const spaceIndex = line.indexOf(' ');
    if (spaceIndex === -1) return null;
    const name = line.slice(0, spaceIndex);
    const value = Number.parseFloat(line.slice(spaceIndex + 1));
    return { name, labels: {}, value };
  }

  const name = line.slice(0, braceIndex);
  const closeIndex = findClosingBrace(line, braceIndex);
  if (closeIndex === -1) return null;

  const labels = parseLabels(line.slice(braceIndex + 1, closeIndex));
  const value = Number.parseFloat(line.slice(closeIndex + 1));
  return { name, labels, value };
}

function findClosingBrace(line: string, openIndex: number): number {
  let inQuotes = false;
  for (let i = openIndex + 1; i < line.length; i += 1) {
    const char = line[i];
    if (char === '\\' && inQuotes) {
      i += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === '}' && !inQuotes) return i;
  }
  return -1;
}

function parseLabels(segment: string): Record<string, string> {
  const labels: Record<string, string> = {};
  let i = 0;

  while (i < segment.length) {
    const eqIndex = segment.indexOf('=', i);
    if (eqIndex === -1) break;

    const key = segment.slice(i, eqIndex).trim();
    let j = eqIndex + 1;
    if (segment[j] !== '"') break;
    j += 1;

    let value = '';
    while (j < segment.length) {
      const char = segment[j];
      if (char === '\\' && j + 1 < segment.length) {
        value += segment[j + 1];
        j += 2;
        continue;
      }
      if (char === '"') break;
      value += char;
      j += 1;
    }

    if (key) labels[key] = value;

    const commaIndex = segment.indexOf(',', j);
    if (commaIndex === -1) break;
    i = commaIndex + 1;
  }

  return labels;
}
