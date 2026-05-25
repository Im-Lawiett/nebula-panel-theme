import { useState } from "react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { 
  Folder, File, FileArchive, ChevronRight, MoreHorizontal, 
  Upload, FolderPlus, FilePlus, Download, Trash2, Edit, Scissors, Lock, Archive
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useListServerFiles, getListServerFilesQueryKey, useDeleteFile, useRenameFile, useCompressFile } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Placeholder formats
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function ServerFiles() {
  const params = useParams();
  const serverId = params.id || "";
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: files = [], isLoading } = useListServerFiles(serverId, {
    query: { enabled: !!serverId, queryKey: getListServerFilesQueryKey(serverId) }
  });

  const deleteFile = useDeleteFile();

  const toggleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map(f => f.name)));
    }
  };

  const toggleFile = (name: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(name)) {
      newSelected.delete(name);
    } else {
      newSelected.add(name);
    }
    setSelectedFiles(newSelected);
  };

  const handleDelete = (names: string[]) => {
    if (!confirm(`Delete ${names.length} item(s)? This cannot be undone.`)) return;
    
    deleteFile.mutate(
      { id: serverId, data: { files: names } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListServerFilesQueryKey(serverId) });
          setSelectedFiles(new Set());
          toast({ title: "Files deleted" });
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center text-sm font-medium text-muted-foreground">
          <Link href={`/server/${serverId}`} className="hover:text-white transition-colors">Server</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <Link href={`/server/${serverId}/files`} className="text-white">Files</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-primary">/</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-background/50 border-white/10 hover:bg-white/5" size="sm">
            <FolderPlus className="w-4 h-4 mr-2" /> Create Directory
          </Button>
          <Button variant="outline" className="bg-background/50 border-white/10 hover:bg-white/5" size="sm">
            <FilePlus className="w-4 h-4 mr-2" /> New File
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_10px_rgba(var(--primary),0.3)] border-0" size="sm">
            <Upload className="w-4 h-4 mr-2" /> Upload
          </Button>
        </div>
      </div>

      <Card className="bg-card/50 border-border overflow-hidden">
        {selectedFiles.size > 0 && (
          <div className="bg-primary/10 border-b border-primary/20 p-3 flex items-center justify-between">
            <span className="text-sm font-medium text-primary">{selectedFiles.size} items selected</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 border-primary/20 text-primary hover:bg-primary/20" onClick={() => setSelectedFiles(new Set())}>
                Clear
              </Button>
              <Button size="sm" variant="destructive" className="h-8" onClick={() => handleDelete(Array.from(selectedFiles))}>
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
              </Button>
            </div>
          </div>
        )}
        
        <Table>
          <TableHeader className="bg-black/20">
            <TableRow>
              <TableHead className="w-12 text-center">
                <Checkbox 
                  checked={selectedFiles.size === files.length && files.length > 0} 
                  onCheckedChange={toggleSelectAll} 
                  className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </TableHead>
              <TableHead>File Name</TableHead>
              <TableHead className="w-24 text-right">Size</TableHead>
              <TableHead className="w-48">Last Modified</TableHead>
              <TableHead className="w-12 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">Loading files...</TableCell>
              </TableRow>
            ) : files.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">This directory is empty.</TableCell>
              </TableRow>
            ) : (
              files.map((file) => (
                <TableRow key={file.name} className="group hover:bg-white/5 transition-colors">
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={selectedFiles.has(file.name)} 
                      onCheckedChange={() => toggleFile(file.name)}
                      className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {file.isDirectory ? (
                        <Folder className="w-5 h-5 text-blue-400" />
                      ) : file.name.endsWith('.zip') || file.name.endsWith('.tar.gz') ? (
                        <FileArchive className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <File className="w-5 h-5 text-muted-foreground" />
                      )}
                      <span className={`font-medium ${file.isDirectory ? 'text-white cursor-pointer hover:text-primary transition-colors' : 'text-gray-300'}`}>
                        {file.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm font-mono">
                    {!file.isDirectory && formatSize(file.size)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(file.modified), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                        <DropdownMenuItem className="focus:bg-white/10 cursor-pointer"><Edit className="w-4 h-4 mr-2" /> Rename</DropdownMenuItem>
                        <DropdownMenuItem className="focus:bg-white/10 cursor-pointer"><Scissors className="w-4 h-4 mr-2" /> Move</DropdownMenuItem>
                        <DropdownMenuItem className="focus:bg-white/10 cursor-pointer"><Lock className="w-4 h-4 mr-2" /> Permissions</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        {file.isDirectory ? (
                          <DropdownMenuItem className="focus:bg-white/10 cursor-pointer"><Archive className="w-4 h-4 mr-2" /> Archive</DropdownMenuItem>
                        ) : (
                          <>
                            <DropdownMenuItem className="focus:bg-white/10 cursor-pointer"><Download className="w-4 h-4 mr-2" /> Download</DropdownMenuItem>
                            {(file.name.endsWith('.zip') || file.name.endsWith('.tar.gz')) && (
                              <DropdownMenuItem className="focus:bg-white/10 cursor-pointer"><FileArchive className="w-4 h-4 mr-2" /> Decompress</DropdownMenuItem>
                            )}
                          </>
                        )}
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem 
                          className="text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer"
                          onClick={() => handleDelete([file.name])}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
