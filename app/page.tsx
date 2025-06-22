'use client';

import { useState, useEffect } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useReportWebVitals } from 'next/web-vitals';
import Head from 'next/head';
import Script from 'next/script';

// Интерфейс для хранения метрик
interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  cls: number | null;
  fid: number | null;
  inp: number | null;
  ttfb: number | null;
  navigationTime: number | null;
  downloadSpeed: number | null;
  uploadSpeed: number | null;
  deviceInfo: string | null;
}

// Компонент SpeedTest
export default function SpeedTest() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    cls: null,
    fid: null,
    inp: null,
    ttfb: null,
    navigationTime: null,
    downloadSpeed: null,
    uploadSpeed: null,
    deviceInfo: null,
  });
  const [testRunning, setTestRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Измерение скорости загрузки
  const measureDownloadSpeed = async () => {
    const fileUrl = '/api/download'; // Vercel Serverless Function
    const startTime = performance.now();

    try {
      const response = await fetch(fileUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch test file');
      const blob = await response.blob();
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; // в секундах
      const fileSize = 10 * 1024 * 1024; // 10MB в байтах
      const speedBps = (fileSize * 8) / duration; // Биты в секунду
      const speedMbps = speedBps / (1024 * 1024); // Мбит/с
      return speedMbps;
    } catch (err) {
      console.error('Ошибка измерения скорости загрузки:', err);
      setError('Failed to measure download speed');
      return null;
    }
  };

  // Измерение скорости выгрузки
  const measureUploadSpeed = async () => {
    const uploadUrl = '/api/upload'; // Vercel Serverless Function
    const data = new ArrayBuffer(5 * 1024 * 1024); // 5MB тестовых данных
    const startTime = performance.now();

    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: data,
        headers: { 'Content-Type': 'application/octet-stream' },
      });
      if (!response.ok) throw new Error('Failed to upload test data');
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; // в секундах
      const fileSize = 5 * 1024 * 1024; // 5MB в байтах
      const speedBps = (fileSize * 8) / duration; // Биты в секунду
      const speedMbps = speedBps / (1024 * 1024); // Мбит/с
      return speedMbps;
    } catch (err) {
      console.error('Ошибка измерения скорости выгрузки:', err);
      setError('Failed to measure upload speed');
      return null;
    }
  };

  // Запуск полного теста
  const runSpeedTest = async () => {
    setTestRunning(true);
    setError(null);

    const downloadSpeed = await measureDownloadSpeed();
    const uploadSpeed = await measureUploadSpeed();

    setMetrics((prev) => ({
      ...prev,
      downloadSpeed,
      uploadSpeed,
    }));
    setTestRunning(false);
  };

  // Сбор метрик производительности
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Сбор информации об устройстве
      const deviceInfo = `${navigator.userAgent}, Screen: ${window.screen.width}x${window.screen.height}, CPU: ${navigator.hardwareConcurrency} threads`;

      // Сбор времени навигации
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const navigationTime = navigationEntry?.duration;
      const ttfb = navigationEntry?.responseStart;

      setMetrics((prev) => ({
        ...prev,
        navigationTime,
        ttfb,
        deviceInfo,
      }));

      // Автоматический запуск теста при загрузке
      runSpeedTest();
    }
  }, []);

  // Обработка Web Vitals
  useReportWebVitals((metric) => {
    setMetrics((prev) => ({
      ...prev,
      [metric.name.toLowerCase()]: metric.value,
    }));
  });

  return (
    <>
      <Head>
        <title>ASTRACAT Bench - Speed Test</title>
        <meta name="description" content="Measure your internet speed and browser performance with ASTRACAT Bench" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <SpeedInsights />
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold mb-6">ASTRACAT Bench Speed Test</h1>
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl mb-4">Performance Metrics</h2>
          {error && <p className="text-red-400 mb-4">{error}</p>}
          {testRunning && <p className="text-yellow-400 mb-4">Running speed test...</p>}
          <ul className="space-y-3">
            <li className="flex justify-between">
              <span>First Contentful Paint (FCP):</span>
              <span>{metrics.fcp ? `${(metrics.fcp / 1000).toFixed(2)} s` : 'Loading...'}</span>
            </li>
            <li className="flex justify-between">
              <span>Largest Contentful Paint (LCP):</span>
              <span>{metrics.lcp ? `${(metrics.lcp / 1000).toFixed(2)} s` : 'Loading...'}</span>
            </li>
            <li className="flex justify-between">
              <span>Cumulative Layout Shift (CLS):</span>
              <span>{metrics.cls ? metrics.cls.toFixed(3) : 'Loading...'}</span>
            </li>
            <li className="flex justify-between">
              <span>First Input Delay (FID):</span>
              <span>{metrics.fid ? `${metrics.fid.toFixed(2)} ms` : 'Loading...'}</span>
            </li>
            <li className="flex justify-between">
              <span>Interaction to Next Paint (INP):</span>
              <span>{metrics.inp ? `${metrics.inp.toFixed(2)} ms` : 'Loading...'}</span>
            </li>
            <li className="flex justify-between">
              <span>Time to First Byte (TTFB):</span>
              <span>{metrics.ttfb ? `${metrics.ttfb.toFixed(2)} ms` : 'Loading...'}</span>
            </li>
            <li className="flex justify-between">
              <span>Navigation Time:</span>
              <span>{metrics.navigationTime ? `${(metrics.navigationTime / 1000).toFixed(2)} s` : 'Loading...'}</span>
            </li>
            <li className="flex justify-between">
              <span>Download Speed:</span>
              <span>{metrics.downloadSpeed ? `${metrics.downloadSpeed.toFixed(2)} Mbps` : 'Measuring...'}</span>
            </li>
            <li className="flex justify-between">
              <span>Upload Speed:</span>
              <span>{metrics.uploadSpeed ? `${metrics.uploadSpeed.toFixed(2)} Mbps` : 'Measuring...'}</span>
            </li>
            <li className="flex justify-between">
              <span>Device Info:</span>
              <span className="text-right">{metrics.deviceInfo || 'Loading...'}</span>
            </li>
          </ul>
          <button
            onClick={runSpeedTest}
            disabled={testRunning}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 w-full"
          >
            {testRunning ? 'Testing...' : 'Run Speed Test Again'}
          </button>
        </div>
        <footer className="mt-8 text-gray-400 text-center">
          <p>ASTRACAT Bench - Powered by Next.js and Vercel</p>
          <p>Optimized with Vercel Speed Insights</p>
          <p>
            Join us on Telegram:{' '}
            <a href="https://t.me/astracatui" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              @astracatui
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}
