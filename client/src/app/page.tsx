import Link from 'next/link';
import '@/lib/env';

import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className='flex h-screen w-screen flex-col items-center justify-center gap-6'>
      <h1 className='text-4xl font-extrabold tracking-tight text-gray-800'>
        Video Stream Template
      </h1>

      <Button asChild className='bg-yellow-500 hover:bg-yellow-600'>
        <Link href='/video-stream-v1'>Video Stream V1</Link>
      </Button>

      <Button asChild className='bg-yellow-500 hover:bg-yellow-600'>
        <Link href='/video-stream-v2'>Video Stream V2</Link>
      </Button>

      <footer className='absolute bottom-4 text-base text-gray-500'>
        © {new Date().getFullYear()} by{' '}
        <a href='/' className='font-medium text-blue-500 hover:underline'>
          -
        </a>
      </footer>
    </main>
  );
}
