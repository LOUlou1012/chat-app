"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  if (!user) return <div>Not logged in</div>;

  return (
    <div className="p-10">
      <h1>Logged in as:</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
