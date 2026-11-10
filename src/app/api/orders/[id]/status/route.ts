import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/db';
import { OrderStatus } from '@/lib/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { status, user_id, comment, courier_id } = body;

    if (!status) {
      return NextResponse.json({ error: 'El nuevo estado es obligatorio' }, { status: 400 });
    }
    if (!user_id) {
      return NextResponse.json({ error: 'El usuario responsable del cambio es obligatorio' }, { status: 400 });
    }

    const updated = updateOrderStatus(
      id,
      status as OrderStatus,
      user_id,
      comment,
      courier_id
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
