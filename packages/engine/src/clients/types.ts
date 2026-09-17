export interface ClientRequestOptions {
  dryRun?: boolean;
  timeoutMs?: number;
  signal?: AbortSignal;
}
