'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function OrderPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <Card className="max-w-md text-center">
        <CardContent className="flex flex-col items-center p-8 md:p-16">
          <h1 className="mb-4 text-2xl font-bold md:text-3xl">Još nema porudžbina.</h1>
          <p className="mb-6 text-muted-foreground">Izgleda da je korpa prazna. Popunimo je!</p>
          <Button asChild size="lg" className="rounded-full">
            <Link href="/shop">Kupi sada</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
