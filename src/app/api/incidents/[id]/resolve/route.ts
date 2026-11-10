import { NextRequest, NextResponse } from 'next/server';
import { resolveIncident } from '@/lib/db';
import { OrderStatus } from '@/lib/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { resolved_by, resolution_notes, next_order_status } = body;

    if (!resolved_by) {
      return NextResponse.json({ error: 'El usuario que resuelve es obligatorio' }, { status: 400 });
    }
    if (!resolution_notes?.trim()) {
      return NextResponse.json({ error: 'La nota de resolución es obligatoria' }, { status: 400 });
    }

    const updated = resolveIncident(
      id,
      resolved_by,
      resolution_notes,
      next_order_status as OrderStatus | undefined
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
