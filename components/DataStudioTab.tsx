import { useState, useRef, useEffect } from 'react';
import { Upload, File, Eye, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import api from '../src/services/api';

interface DataStudioTabProps {
  projectId: string;
}

interface UploadedFile {
  id: string;
  project_id: string;
  filename: string;
  size: number;
  upload_date: string;
  file_type: string;
  status?: 'uploading' | 'success' | 'error';
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

export function DataStudioTab({ projectId }: DataStudioTabProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load files on mount and when project changes
  useEffect(() => {
    loadFiles();
  }, [projectId]);

  const loadFiles = async () => {
    try {
      const fileList = await api.files.list(projectId);
      setFiles(fileList.map((f: UploadedFile) => ({ ...f, status: 'success' })));
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileUpload = async (fileList: FileList | null) => {
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

    // Create temporary file entry
    const tempId = Date.now().toString();
    const tempFile: UploadedFile = {
      id: tempId,
      project_id: projectId,
      filename: file.name,
      size: file.size,
      upload_date: new Date().toISOString(),
      file_type: fileExtension === '.csv' ? 'CSV' : 'Excel',
      status: 'uploading'
    };

    setFiles([...files, tempFile]);

    try {
      // Upload to backend
      const uploadedFile = await api.files.upload(projectId, file);
      
      // Update with real file data
      setFiles(prevFiles =>
        prevFiles.map(f =>
          f.id === tempId ? { ...uploadedFile, status: 'success' } : f
        )
      );
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError('Failed to upload file. Please try again.');
      
      // Update status to error
      setFiles(prevFiles =>
        prevFiles.map(f =>
          f.id === tempId ? { ...f, status: 'error' } : f
        )
      );
    }
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

  const handleFileDelete = async (id: string) => {
    try {
      await api.files.delete(projectId, id);
      setFiles(files.filter(file => file.id !== id));
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  const handlePreview = async (fileId: string) => {
    setPreviewLoading(true);
    try {
      const data = await api.files.preview(projectId, fileId);
      setPreviewData(data);
    } catch (error) {
      console.error('Failed to preview file:', error);
      alert('Failed to preview file. Please try again.');
    } finally {
      setPreviewLoading(false);
    }
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
                    <div className="text-[#ECECF1]">{file.filename}</div>
                    <div className="text-sm text-gray-400">
                      {formatFileSize(file.size)} • {file.file_type} • Uploaded {new Date(file.upload_date).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {file.status === 'success' && (
                    <>
                      <Dialog onOpenChange={(open) => {
                        if (open) handlePreview(file.id);
                        else setPreviewData(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-[#ECECF1] hover:bg-gray-600">
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl bg-[#343541] border-gray-600">
                          <DialogHeader>
                            <DialogTitle className="text-[#ECECF1]">Data Preview: {file.filename}</DialogTitle>
                          </DialogHeader>
                          <div className="max-h-[500px] overflow-auto bg-gray-800 rounded-lg p-4">
                            {previewLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                              </div>
                            ) : previewData ? (
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-gray-600">
                                    {previewData.columns.map((col: string) => (
                                      <TableHead key={col} className="text-[#ECECF1]">{col}</TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {previewData.data.map((row: any, idx: number) => (
                                    <TableRow key={idx} className="border-gray-600">
                                      {previewData.columns.map((col: string) => (
                                        <TableCell key={col} className="text-[#ECECF1]">
                                          {row[col]?.toString() || ''}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <div className="text-center py-8 text-gray-400">
                                Failed to load preview
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-gray-400 mt-2">
                            {previewData && `Showing ${previewData.preview_rows} rows of ${file.filename}`}
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