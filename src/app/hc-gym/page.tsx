
"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { hcLibraryData } from '@/assets/data/hcLibraryData'; 
import type { HC } from '@/types';
import { ArrowRight, Brain } from 'lucide-react';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';

export default function HCGymPage() {
  return (
    <div className="container mx-auto py-10 px-4 animate-slideInUp">
      <header className="mb-12 text-center">
        <div className="inline-block p-5 bg-primary/10 rounded-full mb-6 shadow-apple">
          <Brain className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-5xl font-bold text-primary mb-4 tracking-tight">
          HC Gym
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Welcome to the Heuristics & Cognitive Skills Gym by {APP_NAME}! Explore concepts, understand their importance, and practice with interactive drills.
        </p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {hcLibraryData.map((hc: HC, index: number) => (
          <Card 
            key={hc.id} 
            className="flex flex-col shadow-apple-lg hover:shadow-apple-xl transition-all duration-300 rounded-2xl overflow-hidden group bg-card border-border/50 glassmorphic"
            style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
            // Using style for animation delay with opacity 0 which will be overridden by animation class
            // Add a class that sets opacity to 1 on animation end if needed, or rely on `forwards`
            // For simplicity, we can add animate-slideInUp here too, if it's defined globally to apply on mount
            // If animate-slideInUp is already on the parent, this direct style might be enough for staggered effect
            // Or use a more complex animation setup with GSAP/Framer Motion if available
          >
            <CardHeader className="p-6 bg-gradient-to-br from-secondary/30 via-secondary/10 to-transparent">
              <div className="flex items-center mb-4">
                {hc.icon && <hc.icon className="h-12 w-12 text-primary mr-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-5deg]" />}
                <CardTitle className="text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">{hc.name}</CardTitle>
              </div>
              <CardDescription className="text-sm h-20 overflow-hidden text-muted-foreground three-line-clamp leading-relaxed"> 
                {hc.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-grow">
              <div className="aspect-[16/9] w-full bg-muted rounded-xl flex items-center justify-center my-2 overflow-hidden shadow-inner group-hover:shadow-apple transition-shadow">
                <Image 
                  src={`https://picsum.photos/seed/${hc.id}-${index}/600/338`} // Larger for better quality
                  alt={`${hc.name} illustration`} 
                  width={600} 
                  height={338} 
                  className="rounded-xl object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-105"
                  data-ai-hint="abstract concept"
                  priority={index < 3} // Prioritize loading images for first few cards
                />
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Tag: <span className="font-mono bg-muted/80 dark:bg-muted/50 px-2.5 py-1 rounded-md text-foreground/80 shadow-sm">{hc.tag}</span>
              </p>
            </CardContent>
            <CardFooter className="p-6 bg-muted/20 border-t border-border/30">
              <Link href={`/hc-gym/${hc.id}`} passHref className="w-full">
                <Button className="w-full btn-apple-primary font-semibold py-3 text-md rounded-xl shadow-apple-lg transform hover:scale-105 active:scale-100">
                  Explore {hc.name} <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
       <style jsx global>{`
        .three-line-clamp {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;  
          overflow: hidden;
        }
        /* Add this if cards aren't appearing due to initial opacity from style attribute */
        /* Or ensure animate-slideInUp (if used on cards) sets opacity to 1 */
        .animate-slideInUp { /* Ensure this class is applied or similar for entry */
            opacity: 1 !important; /* Force opacity if needed, or better, manage with JS/animation library */
        }
      `}</style>
    </div>
  );
}
