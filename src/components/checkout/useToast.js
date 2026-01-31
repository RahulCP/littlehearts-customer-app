// src/pages/store/checkout/hooks/useToast.js
import { useEffect, useState } from "react";

export default function useToast() {
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  return { toast, setToast };
}
