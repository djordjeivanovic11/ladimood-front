'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IMAGE_SIZES, shouldUnoptimizeImage } from '@/lib/image';
import { getCreatorChallengeImageUrl } from '@/lib/supabase-public-url';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const INSTAGRAM_URL = 'https://instagram.com/ladimood.store';
const INSTAGRAM_HANDLE = '@ladimood.store';

const GAME_RULES = [
  'Snimi Reel ili TikTok u Ladimood majici.',
  'Taguj @ladimood.store.',
  'Profil i objava moraju biti javni.',
  'Pošalji nam link do videa.',
  'Ako video pređe 2.000 pregleda u 7 dana, dobijaš Ladimood majicu.',
  'Ako pređe 10.000 pregleda, dobijaš tri majice.',
  'Video mora biti originalan, normalan i stvarno vezan za Ladimood.',
  'Ladimood zadržava pravo da odobri nagrade i repostuje najbolje objave.',
];

const CreatorChallengeSection: React.FC = () => {
  const [rulesOpen, setRulesOpen] = useState(false);
  const imageSrc = getCreatorChallengeImageUrl();

  return (
    <>
      <section className="bg-gradient-to-br from-muted/40 via-background to-primary/5 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 md:flex-row md:gap-16">
          <div className="relative w-full md:w-1/2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted/30 p-4 shadow-2xl md:aspect-square md:p-6">
              <Image
                src={imageSrc}
                alt="Ladimood ladi — klasični bust sa naočarima i pićem"
                fill
                sizes={IMAGE_SIZES.creatorChallenge}
                unoptimized={shouldUnoptimizeImage(imageSrc)}
                className="object-contain"
              />
            </div>
          </div>

          <div className="w-full rounded-2xl border border-border/50 bg-background/70 p-6 shadow-lg backdrop-blur-sm md:w-1/2 md:p-10">
            <Badge variant="outline" className="mb-4 uppercase tracking-widest">
              Ladimood igra
            </Badge>

            <h2 className="mb-6 text-4xl font-extrabold text-primary md:text-5xl">
              Ko ladi, dobija majicu.
            </h2>

            <div className="mb-8 space-y-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
              <p>
                Obuci Ladimood, snimi najlaganiji Reel, taguj{' '}
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {INSTAGRAM_HANDLE}
                </a>{' '}
                i pokaži nam kako se ladi u Crnoj Gori.
              </p>
              <p>
                Ako tvoj video pređe 2.000 pregleda, dobijaš majicu.
                <br />
                Ako pređe 10.000 pregleda, dobijaš tri majice za ekipu.
                <br />A ako baš eksplodira — možda pravimo poseban Ladimood dizajn sa tobom.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full rounded-full sm:w-auto">
                <Link href="/creator-challenge#prijava">Prijavi svoj reel</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full rounded-full sm:w-auto"
                onClick={() => setRulesOpen(true)}
              >
                Pravila igre
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Najbolji reelovi idu na{' '}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {INSTAGRAM_HANDLE}
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <Dialog open={rulesOpen} onOpenChange={setRulesOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pravila igre</DialogTitle>
          </DialogHeader>

          <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
            {GAME_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>

          <p className="pt-2 text-xs text-muted-foreground">Instagram nije organizator ove igre.</p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreatorChallengeSection;
