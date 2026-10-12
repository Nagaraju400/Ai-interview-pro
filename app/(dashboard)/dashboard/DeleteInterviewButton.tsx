"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteInterview } from "./actions";

export function DeleteInterviewButton({ interviewId }: { interviewId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this mock interview? This action cannot be undone.")) {
      setIsDeleting(true);
      await deleteInterview(interviewId);
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 ml-2" 
      onClick={handleDelete}
      disabled={isDeleting}
      title="Delete Session"
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Delete</span>
    </Button>
  );
}
