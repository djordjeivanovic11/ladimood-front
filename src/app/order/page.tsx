'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function OrderPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <Card className="max-w-md text-center">
        <CardContent className="flex flex-col items-center p-8 md:p-16">
          <h1 className="mb-4 text-2xl font-bold md:text-3xl">Oops! No Orders Yet.</h1>
          <p className="mb-6 text-muted-foreground">
            It seems like your cart is feeling a bit lonely. Let&apos;s fix that!
          </p>
          <Link href="/shop" passHref>
            <Button size="lg" className="rounded-full">
              Shop Now
            </Button>
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
