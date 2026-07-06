import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPlatformSettings, updatePlatformSettings } from '@/lib/platform-settings';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { error: NextResponse.json({ error: 'Non autorisé' }, { status: 401 }) };
  if (session.user.role !== 'ADMIN') return { error: NextResponse.json({ error: 'Accès refusé' }, { status: 403 }) };
  return { session };
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const settings = await getPlatformSettings();
  return NextResponse.json(settings);
}

export async function PATCH(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const data = {};
  if (typeof body.maintenanceMode === 'boolean') data.maintenanceMode = body.maintenanceMode;
  if (typeof body.openSignups === 'boolean') data.openSignups = body.openSignups;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Aucune donnée à mettre à jour' }, { status: 400 });
  }

  const settings = await updatePlatformSettings(data);
  return NextResponse.json(settings);
}
