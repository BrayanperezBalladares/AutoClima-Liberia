import { NextRequest, NextResponse } from 'next/server';
import { getAllIncidents, createIncident } from '@/lib/db';

export async function GET() {
  try {
    const incidents = getAllIncidents();
    return NextResponse.json(incidents);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.order_id) {
      return NextResponse.json({ error: 'El pedido asociado es obligatorio' }, { status: 400 });
    }
    if (!body.reported_by) {
      return NextResponse.json({ error: 'El usuario que reporta es obligatorio' }, { status: 400 });
    }
    if (!body.reason?.trim()) {
      return NextResponse.json({ error: 'El motivo de la incidencia/devolución es obligatorio' }, { status: 400 });
    }
    if (!body.details?.trim()) {
      return NextResponse.json({ error: 'El detalle de la situación es obligatorio' }, { status: 400 });
    }

    const incident = createIncident({
      order_id: body.order_id,
      reported_by: body.reported_by,
      reason: body.reason,
      details: body.details,
    });

    return NextResponse.json(incident, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
