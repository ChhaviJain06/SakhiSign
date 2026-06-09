import { useEffect, useState } from "react";
import api from "../api/client.js";

export function useSigns() {
  const [signs, setSigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let on = true;
    api
      .get("/signs")
      .then((r) => on && setSigns(r.data.signs))
      .catch((e) => on && setError(e.response?.data?.error || e.message))
      .finally(() => on && setLoading(false));
    return () => (on = false);
  }, []);

  return { signs, loading, error };
}

export function useSign(slug) {
  const [sign, setSign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let on = true;
    api
      .get(`/signs/${slug}`)
      .then((r) => on && setSign(r.data.sign))
      .catch((e) => on && setError(e.response?.data?.error || e.message))
      .finally(() => on && setLoading(false));
    return () => (on = false);
  }, [slug]);

  return { sign, loading, error };
}
