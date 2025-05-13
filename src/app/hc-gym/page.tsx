
"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { hcLibraryData } from '@/assets/data/hcLibraryData'; // Updated import
import type { HC } from '@/types';
import { ArrowRight, Brain } from 'lucide-react';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';

export default function HCGymPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <header className="mb-12 text-center">
        <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
          <Brain className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-5xl font-bold text-primary mb-4">
          HC Gym
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Welcome to the Heuristics & Cognitive Skills Gym by {APP_NAME}! Explore concepts, understand their importance, and practice with interactive drills.
        </p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {hcLibraryData.map((hc: HC) => (
          <Card key={hc.id} className="flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden group bg-card border-border">
            <CardHeader className="p-6 bg-gradient-to-br from-secondary/50 via-secondary/20 to-transparent">
              <div className="flex items-center mb-3">
                {hc.icon && <hc.icon className="h-10 w-10 text-primary mr-4 transition-transform duration-300 group-hover:scale-110" />}
                <CardTitle className="text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">{hc.name}</CardTitle>
              </div>
              <CardDescription className="text-sm h-20 overflow-hidden text-muted-foreground three-line-clamp"> 
                {hc.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-grow">
              <div className="aspect-[16/9] w-full bg-muted rounded-lg flex items-center justify-center my-2 overflow-hidden shadow-inner">
                <Image 
                  src={`https://picsum.photos/seed/${hc.id}/400/225`} 
                  alt={`${hc.name} illustration`} 
                  width={400} 
                  height={225} 
                  className="rounded-lg object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  data-ai-hint="abstract concept"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Tag: <span className="font-mono bg-muted px-2 py-1 rounded-md text-foreground">{hc.tag}</span>
              </p>
            </CardContent>
            <CardFooter className="p-6 bg-muted/30 border-t">
              <Link href={`/hc-gym/${hc.id}`} passHref className="w-full">
                <Button className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-semibold py-3 text-md rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                  Explore {hc.name} <ArrowRight className="ml-2 h-5 w-5" />
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
      `}</style>
    </div>
  );
}
