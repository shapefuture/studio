
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { HCS } from '@/lib/constants';
import type { HC } from '@/types';
import { ArrowRight, ListChecks, BookOpenText } from 'lucide-react';
import Image from 'next/image';

export async function generateStaticParams() {
  return HCS.map((hc) => ({
    hcId: hc.id,
  }));
}

interface HCDetailPageProps {
  params: { hcId: string };
}

export default function HCDetailPage({ params }: HCDetailPageProps) {
  const hc = HCS.find((h) => h.id === params.hcId);

  if (!hc) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary via-blue-400 to-blue-500 p-8 text-primary-foreground">
          <div className="flex items-center mb-2">
            {hc.icon && <hc.icon className="h-12 w-12 mr-4 p-2 bg-white/20 rounded-full" />}
            <div>
              <CardTitle className="text-4xl font-bold">{hc.name}</CardTitle>
              <CardDescription className="text-lg text-blue-100 mt-1">
                {hc.description} <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-sm ml-2">{hc.tag}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-3 text-foreground flex items-center">
                  <BookOpenText className="mr-2 h-6 w-6 text-primary" />
                  Detailed Explanation
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {hc.longDescription || hc.description}
                </p>
              </section>

              <Separator className="my-8" />

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center">
                  <ListChecks className="mr-2 h-6 w-6 text-primary" />
                  Available Drills
                </h2>
                {hc.drills.length > 0 ? (
                  <ul className="space-y-4">
                    {hc.drills.map((drill) => (
                      <li key={drill.id} className="p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow bg-secondary/20">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-medium text-primary">{drill.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{drill.description}</p>
                          </div>
                          <Link href={`/hc-gym/${hc.id}/${drill.id}`} passHref>
                            <Button variant="outline" size="sm">
                              Start Drill <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No drills available for this HC yet. Check back soon!</p>
                )}
              </section>
            </div>
            <aside className="md:col-span-1 space-y-6">
               <Card className="bg-secondary/30">
                 <CardHeader>
                   <CardTitle className="text-lg">Key Concepts</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>Understanding {hc.name.toLowerCase()}</li>
                        <li>Practical application</li>
                        <li>Common pitfalls</li>
                        <li>Improvement strategies</li>
                    </ul>
                 </CardContent>
               </Card>
               <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-md">
                 <Image 
                    src={`https://picsum.photos/seed/${hc.id}-detail/400/225`} 
                    alt={`${hc.name} conceptual image`}
                    width={400}
                    height={225}
                    className="object-cover w-full h-full"
                    data-ai-hint="concept visualization"
                 />
               </div>
            </aside>
          </div>
        </CardContent>
         <CardFooter className="p-6 bg-muted/20 text-right">
            <Link href="/hc-gym" passHref>
              <Button variant="ghost">Back to HC Gym</Button>
            </Link>
          </CardFooter>
      </Card>
    </div>
  );
}
