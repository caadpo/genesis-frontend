"use client";

import { useEffect } from "react";
import { useUser } from "@/app/context/UserContext";
import { useRouter, useSearchParams } from "next/navigation";

export default function PjesRedirectPage() {
  const user = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!user) return;

    const ano = searchParams.get("ano");
    const mes = searchParams.get("mes");

    if (!ano || !mes) return;

    if (user.typeUser === 1) {
      router.replace(`/pjes/useraux?ano=${ano}&mes=${mes}`);
    } else if (user.typeUser === 5 || user.typeUser === 10) {
      router.replace(`/pjes/usermaster?ano=${ano}&mes=${mes}`);
    } else if (user.typeUser === 3) {
      router.replace(`/pjes/usermaster?ano=${ano}&mes=${mes}`);
    } else {
      router.replace("/acesso-negado");
    }
  }, [user, searchParams]);

  return <p>Redirecionando para a página correta...</p>;
}
