"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

const Home: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadNamespace, setUploadNamespace] = useState<string>(''); // Namespace for upload
  const [question, setQuestion] = useState<string>('');
  const [queryNamespace, setQueryNamespace] = useState<string>(''); // Optional namespace for query
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setPdfFile(selectedFile);
  };

  const handleUploadSubmit = async () => {
    if (!pdfFile) {
      alert('Please select a PDF file to upload.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', pdfFile);

    try {
      await axios.post(`http://localhost:8000/upload-pdf/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: { namespace: uploadNamespace }, // Namespace can be empty
      });
      alert('PDF uploaded successfully!');
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || 'Upload failed.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuerySubmit = async () => {
    if (!question) {
      alert('Please enter a question.');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.get(`http://localhost:8000/query/`, {
        params: { question, namespace: queryNamespace || "" }, // Allow empty namespace
      });
      setResponse(res.data.response);
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || 'Query failed.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-8">RAG System Interface</h1>

      {/* Upload Section */}
      <Card className="w-full max-w-md mb-6">
        <CardHeader>
          <CardTitle>Upload PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="file"
            onChange={handleFileUpload}
            className="mb-4"
          />
          <Input
            type="text"
            placeholder="Enter namespace (optional)"
            value={uploadNamespace}
            onChange={(e) => setUploadNamespace(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleUploadSubmit} disabled={loading} className="w-full">
            {loading ? 'Uploading...' : 'Upload PDF'}
          </Button>
        </CardContent>
      </Card>

      {/* Query Section */}
      <Card className="w-full max-w-md mb-6">
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Enter your question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="mb-4"
          />
          <Input
            type="text"
            placeholder="Enter namespace (optional)"
            value={queryNamespace}
            onChange={(e) => setQueryNamespace(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleQuerySubmit} disabled={loading} className="w-full">
            {loading ? 'Querying...' : 'Submit Query'}
          </Button>
        </CardContent>
      </Card>

      {/* Response Section */}
      {response && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Response</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{response}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Home;
