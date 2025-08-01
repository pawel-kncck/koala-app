import { useState } from 'react';
import { Upload, File, Eye, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
}

const mockData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, city: 'New York' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25, city: 'Los Angeles' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, city: 'Chicago' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', age: 28, city: 'Houston' },
];

export function DataStudioTab() {
  const [files, setFiles] = useState<UploadedFile[]>([
    { id: '1', name: 'customers.csv', size: '2.3 MB', type: 'CSV' },
    { id: '2', name: 'sales_data.xlsx', size: '1.8 MB', type: 'Excel' },
  ]);

  const handleFileUpload = () => {
    // Mock file upload
    const newFile: UploadedFile = {
      id: Date.now().toString(),
      name: 'new_data.csv',
      size: '1.2 MB',
      type: 'CSV'
    };
    setFiles([...files, newFile]);
  };

  const handleFileDelete = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  return (
    <div className="h-full p-6 space-y-6">
      {/* Upload Zone */}
      <div 
        className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center hover:border-gray-500 transition-colors cursor-pointer"
        onClick={handleFileUpload}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg text-[#ECECF1] mb-2">Drop files here or click to upload</h3>
        <p className="text-gray-400">Supports CSV, Excel, JSON, and other data formats</p>
      </div>

      {/* File List */}
      <div className="space-y-4">
        <h3 className="text-lg text-[#ECECF1]">Uploaded Files</h3>
        <div className="space-y-2">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <File className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="text-[#ECECF1]">{file.name}</div>
                  <div className="text-sm text-gray-400">{file.size} • {file.type}</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-[#ECECF1] hover:bg-gray-600">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl bg-[#343541] border-gray-600">
                    <DialogHeader>
                      <DialogTitle className="text-[#ECECF1]">Data Preview: {file.name}</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-96 overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-[#ECECF1]">ID</TableHead>
                            <TableHead className="text-[#ECECF1]">Name</TableHead>
                            <TableHead className="text-[#ECECF1]">Email</TableHead>
                            <TableHead className="text-[#ECECF1]">Age</TableHead>
                            <TableHead className="text-[#ECECF1]">City</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockData.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell className="text-[#ECECF1]">{row.id}</TableCell>
                              <TableCell className="text-[#ECECF1]">{row.name}</TableCell>
                              <TableCell className="text-[#ECECF1]">{row.email}</TableCell>
                              <TableCell className="text-[#ECECF1]">{row.age}</TableCell>
                              <TableCell className="text-[#ECECF1]">{row.city}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-400 hover:bg-gray-600"
                  onClick={() => handleFileDelete(file.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}