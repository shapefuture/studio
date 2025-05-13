
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HCS } from '@/lib/constants';
import { ArrowRight, Brain } from 'lucide-react';
import Image from 'next/image';

export default function HCGymPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-primary mb-3 flex items-center justify-center">
          <Brain className="mr-3 h-10 w-10" /> HC Gym
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Welcome to the Heuristics & Cognitive Skills Gym! Explore various cognitive concepts, understand their importance, and practice with interactive drills to sharpen your mind.
        </p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {HCS.map((hc) => (
          <Card key={hc.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden">
            <CardHeader className="bg-secondary/30 p-6">
              <div className="flex items-center mb-3">
                {hc.icon && <hc.icon className="h-8 w-8 text-primary mr-3" />}
                <CardTitle className="text-2xl text-primary">{hc.name}</CardTitle>
              </div>
              <CardDescription className="text-sm h-20 overflow-hidden">{hc.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex-grow">
              {/* Placeholder for a small visual element or key takeaway */}
              <div className="h-24 w-full bg-muted rounded-md flex items-center justify-center my-2">
                <Image 
                  src={`https://picsum.photos/seed/${hc.id}/200/100`} 
                  alt={`${hc.name} illustration`} 
                  width={200} 
                  height={100} 
                  className="rounded-md object-cover"
                  data-ai-hint="abstract concept"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Tag: <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{hc.tag}</span></p>
            </CardContent>
            <CardFooter className="p-6 bg-muted/20">
              <Link href={`/hc-gym/${hc.id}`} passHref className="w-full">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Explore {hc.name} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
