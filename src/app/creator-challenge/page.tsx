'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import CreatorChallengeForm from '@/components/CreatorChallenge/CreatorChallengeForm';

const INSTAGRAM_URL = 'https://instagram.com/ladimood.store';

export default function CreatorChallengePage() {
  return (
    <div className="min-h-[60vh] bg-gradient-to-br from-muted/40 via-background to-primary/5 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-primary md:text-5xl">
            Ko ladi, dobija majicu.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Snimi najlaganiji Reel u Ladimood majici, taguj{' '}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              @ladimood.store
            </a>{' '}
            i pošalji nam link ispod.
          </p>
        </div>

        <CreatorChallengeForm />

        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/">Nazad na početnu</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
