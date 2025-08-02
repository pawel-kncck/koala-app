import { useState, useRef } from 'react';
import { Upload, File, Eye, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: Date;
  status: 'uploading' | 'success' | 'error';
}

const sampleData = {
  'july_sales.csv': [
    { id: 1, product: 'Widget Pro', qty: 150, rrp: 29.99, date: '2024-07-01', region: 'North' },
    { id: 2, product: 'Super Widget', qty: 87, rrp: 49.99, date: '2024-07-02', region: 'South' },
    { id: 3, product: 'Widget Lite', qty: 234, rrp: 19.99, date: '2024-07-03', region: 'East' },
    { id: 4, product: 'Widget Pro', qty: 98, rrp: 29.99, date: '2024-07-04', region: 'West' },
    { id: 5, product: 'Mega Widget', qty: 45, rrp: 99.99, date: '2024-07-05', region: 'North' },
  ],
  default: [
    { id: 1, name: 'John Doe', email: 'john@example.com', purchases: 12, total_spent: 450.50 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', purchases: 8, total_spent: 325.00 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', purchases: 15, total_spent: 890.75 },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', purchases: 6, total_spent: 210.25 },
  ]
};

export function DataStudioTab() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileUpload = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setUploadError(null);
    const file = fileList[0];

    // Validate file type
    const validTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validTypes.includes(fileExtension)) {
      setUploadError('Please upload a CSV or Excel file only.');
      return;
    }

    // Create new file entry
    const newFile: UploadedFile = {
      id: Date.now().toString(),
      name: file.name,
      size: formatFileSize(file.size),
      type: fileExtension === '.csv' ? 'CSV' : 'Excel',
      uploadedAt: new Date(),
      status: 'uploading'
    };

    setFiles([...files, newFile]);

    // Simulate upload process
    setTimeout(() => {
      setFiles(prevFiles =>
        prevFiles.map(f =>
          f.id === newFile.id ? { ...f, status: 'success' } : f
        )
      );
    }, 1500);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleFileDelete = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  return (
    <div className="h-full p-6 space-y-6">
      {/* Error Alert */}
      {uploadError && (
        <Alert className="bg-red-900/20 border-red-600 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {/* Upload Zone */}
      <div 
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
          isDragging 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg text-[#ECECF1] mb-2">Drop files here or click to upload</h3>
        <p className="text-gray-400">Supports CSV and Excel files</p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg text-[#ECECF1]">Uploaded Files</h3>
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  {file.status === 'uploading' && (
                    <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                  )}
                  {file.status === 'success' && (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  )}
                  <div>
                    <div className="text-[#ECECF1]">{file.name}</div>
                    <div className="text-sm text-gray-400">
                      {file.size} • {file.type} • Uploaded {file.uploadedAt.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {file.status === 'success' && (
                    <>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-[#ECECF1] hover:bg-gray-600">
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl bg-[#343541] border-gray-600">
                          <DialogHeader>
                            <DialogTitle className="text-[#ECECF1]">Data Preview: {file.name}</DialogTitle>
                          </DialogHeader>
                          <div className="max-h-[500px] overflow-auto bg-gray-800 rounded-lg p-4">
                            {file.name === 'july_sales.csv' ? (
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-gray-600">
                                    <TableHead className="text-[#ECECF1]">ID</TableHead>
                                    <TableHead className="text-[#ECECF1]">Product</TableHead>
                                    <TableHead className="text-[#ECECF1]">QTY</TableHead>
                                    <TableHead className="text-[#ECECF1]">RRP</TableHead>
                                    <TableHead className="text-[#ECECF1]">Date</TableHead>
                                    <TableHead className="text-[#ECECF1]">Region</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {sampleData['july_sales.csv'].map((row) => (
                                    <TableRow key={row.id} className="border-gray-600">
                                      <TableCell className="text-[#ECECF1]">{row.id}</TableCell>
                                      <TableCell className="text-[#ECECF1]">{row.product}</TableCell>
                                      <TableCell className="text-[#ECECF1]">{row.qty}</TableCell>
                                      <TableCell className="text-[#ECECF1]">${row.rrp}</TableCell>
                                      <TableCell className="text-[#ECECF1]">{row.date}</TableCell>
                                      <TableCell className="text-[#ECECF1]">{row.region}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-gray-600">
                                    <TableHead className="text-[#ECECF1]">ID</TableHead>
                                    <TableHead className="text-[#ECECF1]">Name</TableHead>
                                    <TableHead className="text-[#ECECF1]">Email</TableHead>
                                    <TableHead className="text-[#ECECF1]">Purchases</TableHead>
                                    <TableHead className="text-[#ECECF1]">Total Spent</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {sampleData.default.map((row) => (
                                    <TableRow key={row.id} className="border-gray-600">
                                      <TableCell className="text-[#ECECF1]">{row.id}</TableCell>
                                      <TableCell className="text-[#ECECF1]">{row.name}</TableCell>
                                      <TableCell className="text-[#ECECF1]">{row.email}</TableCell>
                                      <TableCell className="text-[#ECECF1]">{row.purchases}</TableCell>
                                      <TableCell className="text-[#ECECF1]">${row.total_spent}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>
                          <div className="text-sm text-gray-400 mt-2">
                            Showing first 100 rows of {file.name}
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
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">No files uploaded yet. Upload your first CSV or Excel file to get started.</p>
        </div>
      )}
    </div>
  );
}