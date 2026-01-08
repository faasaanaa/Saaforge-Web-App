import { Timestamp } from 'firebase/firestore';
import { createDocument } from '@/lib/hooks/useFirestore';
import { AuditLog, AuditAction } from '@/lib/types';

export async function logAudit(
  action: AuditAction,
  performedBy: string,
  details: Record<string, any> = {},
  targetId?: string,
  targetType?: string
) {
  try {
    // Only include fields that are defined
    const auditData: any = {
      action,
      performedBy,
      details,
      timestamp: Timestamp.now(),
    };

    if (targetId) auditData.targetId = targetId;
    if (targetType) auditData.targetType = targetType;

    await createDocument<AuditLog>('auditLogs', auditData);
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function formatDate(timestamp: Timestamp | undefined): string {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatDateTime(timestamp: Timestamp | undefined): string {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}
