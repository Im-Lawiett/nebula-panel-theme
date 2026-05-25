import { useListNests, useListEggs } from "@workspace/api-client-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, PackageOpen, Server } from "lucide-react";

function NestEggs({ nestId }: { nestId: number }) {
  const { data: eggs = [], isLoading } = useListEggs(nestId);

  if (isLoading) {
    return <div className="p-4 text-center text-sm text-muted-foreground animate-pulse">Loading eggs...</div>;
  }

  if (eggs.length === 0) {
    return <div className="p-4 text-center text-sm text-muted-foreground border border-dashed border-border rounded m-4 bg-black/20">No eggs found in this nest.</div>;
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {eggs.map(egg => (
        <div key={egg.id} className="bg-card border border-border p-4 rounded-lg hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <PackageOpen className="w-4 h-4 text-primary" /> {egg.name}
            </h4>
            <div className="text-xs bg-black/40 px-2 py-1 rounded font-mono flex items-center gap-1">
              <Server className="w-3 h-3" /> {egg.serverCount}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {egg.description || "No description provided."}
          </p>
          <div className="text-xs font-mono text-gray-400 bg-black/30 p-2 rounded border border-white/5 truncate">
            {egg.dockerImage}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminNests() {
  const { data: nests = [], isLoading } = useListNests();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Nests & Eggs</h1>
      </div>

      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle>Service Nests</CardTitle>
          <CardDescription>
            Nests group related eggs together (e.g. Minecraft, Rust). Eggs define the runtime environment for servers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-card/50 rounded-lg animate-pulse border border-border" />)}
            </div>
          ) : nests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg bg-black/20">
              No nests configured.
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-4">
              {nests.map(nest => (
                <AccordionItem key={nest.id} value={nest.id.toString()} className="border border-border rounded-lg bg-background/30 px-2 overflow-hidden">
                  <AccordionTrigger className="hover:no-underline py-4 px-2">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{nest.name}</div>
                        <div className="text-sm text-muted-foreground font-normal mt-0.5">{nest.description || "No description."}</div>
                      </div>
                    </div>
                    <div className="ml-auto mr-4 text-sm font-normal hidden sm:flex items-center gap-2 text-muted-foreground">
                      <Badge variant="outline" className="bg-black/30 border-white/10 font-mono">ID: {nest.id}</Badge>
                      <Badge variant="outline" className="bg-black/30 border-white/10">{nest.eggCount} Eggs</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="border-t border-border bg-black/10">
                    <NestEggs nestId={nest.id} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
