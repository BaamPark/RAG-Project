"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

const NamespacePage: React.FC = () => {
  const [namespace, setNamespace] = useState<string>("");
  const router = useRouter();

  const handleSubmit = () => {
    if (!namespace) {
      alert("Please enter a namespace.");
      return;
    }

    // Store the namespace in session storage for use in the RAG page
    sessionStorage.setItem("namespace", namespace);

    // Redirect to the RAG interface page
    router.push("/rag");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Enter Namespace</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Enter namespace"
            value={namespace}
            onChange={(e) => setNamespace(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleSubmit} className="w-full">
            Submit
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NamespacePage;