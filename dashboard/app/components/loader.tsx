import { Loader2 } from "lucide-react";

export const Loader = ({ title }: { title?: string }) => {
  return <Loader2 className="animate-spin size-6" />;
};
