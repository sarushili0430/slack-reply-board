import { z } from 'zod';

export const daemonHealthSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  daemonVersion: z.string().min(1),
  indexerConnected: z.boolean(),
  qwenConnected: z.boolean(),
});

export type DaemonHealthContract = z.infer<typeof daemonHealthSchema>;
