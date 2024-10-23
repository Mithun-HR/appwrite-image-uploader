// pages/index.tsx
import { useState, useCallback } from 'react';
import { Client, Storage } from 'appwrite';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useDropzone } from 'react-dropzone'
import { Loader2, UploadCloud, X } from 'lucide-react'

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [appwriteDetails, setAppwriteDetails] = useState({
    endpoint: '',
    projectId: '',
    bucketId: ''
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleAppwriteDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAppwriteDetails(prev => ({ ...prev, [name]: value }));
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0 || !appwriteDetails.endpoint || !appwriteDetails.projectId || !appwriteDetails.bucketId) {
      setUploadStatus('error');
      return;
    }

    setUploading(true);
    setUploadStatus(null);
    setUploadProgress(0);

    const client = new Client()
      .setEndpoint(appwriteDetails.endpoint)
      .setProject(appwriteDetails.projectId);

    const storage = new Storage(client);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await storage.createFile(
          appwriteDetails.bucketId,
          'unique()',
          file
        );
        setUploadProgress(((i + 1) / files.length) * 100);
      }
      setUploadStatus('success');
      setFiles([]);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Appwrite Image Uploader</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="endpoint">Appwrite Endpoint</Label>
              <Input
                id="endpoint"
                name="endpoint"
                value={appwriteDetails.endpoint}
                onChange={handleAppwriteDetailChange}
                placeholder="https://cloud.appwrite.io/v1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectId">Project ID</Label>
              <Input
                id="projectId"
                name="projectId"
                value={appwriteDetails.projectId}
                onChange={handleAppwriteDetailChange}
                placeholder="Your Appwrite Project ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bucketId">Bucket ID</Label>
              <Input
                id="bucketId"
                name="bucketId"
                value={appwriteDetails.bucketId}
                onChange={handleAppwriteDetailChange}
                placeholder="Your Appwrite Bucket ID"
              />
            </div>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Drag 'n' drop some files here, or click to select files
              </p>
            </div>
            {files.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Selected Files:</h4>
                <ul className="mt-2 divide-y divide-gray-200">
                  {files.map((file, index) => (
                    <li key={index} className="py-2 flex items-center justify-between">
                      <span className="text-sm text-gray-500">{file.name}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button 
              onClick={handleUpload} 
              disabled={files.length === 0 || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Images
                </>
              )}
            </Button>
            {uploading && (
              <Progress value={uploadProgress} className="w-full" />
            )}
          </div>
          {uploadStatus && (
            <Alert className="mt-4" variant={uploadStatus === 'success' ? 'default' : 'destructive'}>
              <AlertDescription>
                {uploadStatus === 'success' ? 'Images uploaded successfully!' : 'Upload failed. Please check your Appwrite details and try again.'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}