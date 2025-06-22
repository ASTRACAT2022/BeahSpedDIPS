import { NextResponse } from 'next/server';

// Генерация тестового файла размером 10MB
export async function GET() {
  const fileSize = 10 * 1024 * 1024; // 10MB
  const buffer = Buffer.alloc(fileSize); // Создаем буфер 10MB
  buffer.fill(0); // Заполняем нулями

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': fileSize.toString(),
      'Cache-Control': 'no-store',
    },
  });
}
