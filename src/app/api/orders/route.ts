import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, createOrder } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sellerId = searchParams.get('sellerId');
    const search = searchParams.get('search')?.toLowerCase();

    let orders = getAllOrders();

    if (status && status !== 'todos') {
      orders = orders.filter(o => o.status === status);
    }

    if (sellerId) {
      orders = orders.filter(o => o.seller_id === sellerId);
    }

    if (search) {
      orders = orders.filter(o => 
        o.order_number.toLowerCase().includes(search) ||
        o.customer_name.toLowerCase().includes(search) ||
        o.parts_description.toLowerCase().includes(search) ||
        o.delivery_location.toLowerCase().includes(search)
      );
    }

    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar campos obligatorios según documento de requerimientos
    if (!body.customer_name?.trim()) {
      return NextResponse.json({ error: 'El nombre del cliente es obligatorio' }, { status: 400 });
    }
    if (!body.customer_phone?.trim()) {
      return NextResponse.json({ error: 'El teléfono del cliente es obligatorio' }, { status: 400 });
    }
    if (!body.parts_description?.trim()) {
      return NextResponse.json({ error: 'El detalle de los repuestos es obligatorio' }, { status: 400 });
    }
    if (!body.delivery_location?.trim()) {
      return NextResponse.json({ error: 'La ubicación/dirección de entrega es obligatoria' }, { status: 400 });
    }
    if (!body.seller_id) {
      return NextResponse.json({ error: 'Debe especificarse el vendedor responsable' }, { status: 400 });
    }
    if (!body.promised_date) {
      return NextResponse.json({ error: 'La fecha y hora de entrega prometida es obligatoria' }, { status: 400 });
    }

    const newOrder = createOrder({
      order_number: body.order_number,
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      parts_description: body.parts_description,
      delivery_location: body.delivery_location,
      delivery_notes: body.delivery_notes,
      seller_id: body.seller_id,
      promised_date: body.promised_date,
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
