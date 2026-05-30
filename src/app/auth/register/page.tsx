import { Suspense } from 'react';
import Register from '@/components/Authentication/Register';

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <Register />
    </Suspense>
  );
}
