import { useState } from "react";
import { useListLocations, useCreateLocation } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Plus, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AdminLocations() {
  const [short, setShort] = useState("");
  const [long, setLong] = useState("");

  const { data: locations = [], isLoading } = useListLocations();
  const createLocation = useCreateLocation();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!short || !long) return;

    createLocation.mutate(
      { data: { short, long } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
          setShort("");
          setLong("");
          toast({ title: "Location created" });
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-card/50 border-border h-fit">
          <CardHeader>
            <CardTitle>Create Location</CardTitle>
            <CardDescription>Group nodes geographically for easier organization.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Short Code</Label>
                <Input 
                  placeholder="US.NYC" 
                  value={short}
                  onChange={(e) => setShort(e.target.value)}
                  className="bg-background/50 font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  placeholder="New York, USA" 
                  value={long}
                  onChange={(e) => setLong(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!short || !long || createLocation.isPending}
              >
                {createLocation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Location
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-card/50 border-border">
          <CardHeader>
            <CardTitle>Configured Locations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-black/20">
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Short Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Nodes</TableHead>
                  <TableHead className="text-center">Servers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading locations...</TableCell>
                  </TableRow>
                ) : locations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No locations configured.</TableCell>
                  </TableRow>
                ) : (
                  locations.map((loc) => (
                    <TableRow key={loc.id} className="hover:bg-white/5">
                      <TableCell className="font-mono text-muted-foreground">{loc.id}</TableCell>
                      <TableCell>
                        <div className="inline-flex items-center gap-1.5 font-mono text-sm bg-black/30 px-2 py-0.5 rounded text-white border border-white/5">
                          <MapPin className="w-3 h-3 text-primary" /> {loc.short}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-white">{loc.long}</TableCell>
                      <TableCell className="text-center font-mono text-sm">{loc.nodeCount}</TableCell>
                      <TableCell className="text-center font-mono text-sm">{loc.serverCount}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
