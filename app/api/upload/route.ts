import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Читаем тело запроса, чтобы подтвердить получение данных
    const data = await request.arrayBuffer();
    const receivedSize = data.byteLength;

    return NextResponse.json({
      status: 'success',
      receivedBytes: receivedSize,
    });
  } catch (err) {
    console.error('Ошибка обработки upload:', err);
    return NextResponse.json({ status: 'error', message: 'Failed to process upload' }, { status: 500 });
  }
}
