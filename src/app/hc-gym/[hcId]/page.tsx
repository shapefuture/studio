
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { hcLibraryData } from '@/assets/data/hcLibraryData';
import { hcDrillsData } from '@/assets/data/hcDrillsData';
import type { HC, HCDrillQuestion } from '@/types';
import { ArrowRight, ListChecks, BookOpenText, ChevronLeft, Brain } from 'lucide-react';
import Image from 'next/image';

export async function generateStaticParams() {
  return hcLibraryData.map((hc) => ({
    hcId: hc.id,
  }));
}

interface HCDetailPageProps {
  params: { hcId: string };
}

export default function HCDetailPage({ params }: HCDetailPageProps) {
  const hc = hcLibraryData.find((h) => h.id === params.hcId);

  if (!hc) {
    notFound();
  }

  const associatedDrills = hcDrillsData.filter(drill => drill.hcId === hc.id);

  return (
    <div className="container mx-auto py-10 px-4">
       <Button variant="outline" size="sm" asChild className="mb-6 shadow-sm">
        <Link href="/hc-gym">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to HC Gym
        </Link>
      </Button>

      <Card className="shadow-xl rounded-xl overflow-hidden border-border">
        <CardHeader className="bg-gradient-to-br from-primary via-blue-400 to-blue-500 p-8 text-primary-foreground rounded-t-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-2">
            {hc.icon && <hc.icon className="h-16 w-16 md:h-20 md:w-20 mr-0 md:mr-4 p-3 bg-white/25 rounded-full shadow-lg" />}
            <div className="flex-1">
              <CardTitle className="text-4xl md:text-5xl font-bold tracking-tight">{hc.name}</CardTitle>
              <CardDescription className="text-lg md:text-xl text-blue-100 mt-2">
                {hc.description} 
                <span className="block md:inline-block font-mono bg-white/20 px-2 py-1 rounded text-sm ml-0 md:ml-3 mt-2 md:mt-0">{hc.tag}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-foreground flex items-center">
                  <BookOpenText className="mr-3 h-7 w-7 text-primary" />
                  Detailed Explanation
                </h2>
                <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground leading-relaxed space-y-4">
                  <p>{hc.longDescription || hc.description}</p>
                  {/* Add more structured content if available */}
                </div>
              </section>

              <Separator className="my-8" />

              <section>
                <h2 className="text-2xl font-semibold mb-6 text-foreground flex items-center">
                  <ListChecks className="mr-3 h-7 w-7 text-primary" />
                  Available Drills
                </h2>
                {associatedDrills.length > 0 ? (
                  <ul className="space-y-4">
                    {associatedDrills.map((drill: HCDrillQuestion) => (
                      <li key={drill.id} className="p-5 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-card hover:border-primary/50">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-primary">{drill.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{drill.questionText}</p>
                          </div>
                          <Link href={`/hc-gym/${hc.id}/${drill.id}`} passHref>
                            <Button variant="outline" size="sm" className="w-full sm:w-auto shadow-sm hover:bg-accent/10">
                              Start Drill <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground p-4 border border-dashed rounded-md text-center">
                    No specific MCQ drills available for this HC yet. Check back soon!
                  </p>
                )}
              </section>
            </div>
            <aside className="md:col-span-1 space-y-6">
               <Card className="bg-secondary/30 rounded-lg shadow">
                 <CardHeader>
                   <CardTitle className="text-lg flex items-center"><Brain className="mr-2 h-5 w-5 text-primary" />Key Concepts</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 pl-2">
                        <li>Understanding {hc.name.toLowerCase()}</li>
                        <li>Practical application</li>
                        <li>Identifying common pitfalls</li>
                        <li>Strategies for improvement</li>
                        <li>Real-world relevance</li>
                    </ul>
                 </CardContent>
               </Card>
               <div className="aspect-video rounded-lg overflow-hidden shadow-md border">
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
         <CardFooter className="p-6 bg-muted/20 text-right border-t">
            <Link href="/hc-gym" passHref>
              <Button variant="ghost" className="text-muted-foreground hover:text-primary">Return to HC Gym Overview</Button>
            </Link>
          </CardFooter>
      </Card>
    </div>
  );
}
