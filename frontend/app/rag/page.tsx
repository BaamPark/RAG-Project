"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

const RagPage: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [question, setQuestion] = useState<string>("");
  const [response, setResponse] = useState<string | null>(null);
  const [namespace, setNamespace] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedNamespace = sessionStorage.getItem("namespace");
    if (!storedNamespace) {
      router.push("/"); // Redirect to namespace entry if none found
    } else {
      setNamespace(storedNamespace);
    }
  }, [router]);

  const handleFileUpload = async () => {
    if (!pdfFile) return alert("Please select a PDF file.");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", pdfFile);

    try {
      await axios.post("http://localhost:8000/upload-pdf/", formData, {
        params: { namespace },
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("PDF uploaded successfully!");
    } catch (error: any) {
      console.error(error);
      alert("Error uploading PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuerySubmit = async () => {
    if (!question) return alert("Please enter a question.");
    setLoading(true);

    try {
      const res = await axios.get("http://localhost:8000/query/", {
        params: { question, namespace },
      });
      setResponse(res.data.response);
    } catch (error: any) {
      console.error(error);
      alert("Error querying documents.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVectors = async () => {
    if (!namespace) return alert("Namespace is missing.");
    setLoading(true);

    try {
      await axios.delete("http://localhost:8000/delete-vectors/", {
        params: { namespace },
      });
      alert("Vectors deleted successfully!");
    } catch (error: any) {
      console.error(error);
      alert("Error deleting vectors.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-8">RAG System Interface</h1>

      <Card className="w-full max-w-md mb-6">
        <CardHeader>
          <CardTitle>Upload PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="file"
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            className="mb-4"
          />
          <Button onClick={handleFileUpload} disabled={loading} className="w-full">
            {loading ? "Uploading..." : "Upload PDF"}
          </Button>
        </CardContent>
      </Card>

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
          <Button onClick={handleQuerySubmit} disabled={loading} className="w-full">
            {loading ? "Querying..." : "Submit Query"}
          </Button>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Manage Vectors</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDeleteVectors} disabled={loading} className="w-full">
            {loading ? "Deleting..." : "Delete Vectors"}
          </Button>
        </CardContent>
      </Card>

      {response && (
        <Card className="w-full max-w-md mt-6">
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

export default RagPage;
