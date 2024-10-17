"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

// Schema di validazione Zod per il codice 2FA
const twoFactorSchema = z.object({
  twoFactorCode: z
    .string()
    .length(6, "Il codice 2FA deve essere di 6 caratteri"),
});

type TwoFactorInputs = z.infer<typeof twoFactorSchema>;

const TwoFactorPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<TwoFactorInputs>({
    resolver: zodResolver(twoFactorSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: TwoFactorInputs) => {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      setIsSubmitting(false);

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Codice 2FA verificato!",
          text: "Accesso effettuato con successo.",
        });
        router.push("/dashboard");
      } else {
        Swal.fire({
          icon: "error",
          title: "Errore",
          text: result.message || "Codice 2FA non valido.",
        });
      }
    } catch (error) {
      setIsSubmitting(false);
      Swal.fire({
        icon: "error",
        title: "Errore",
        text: "Si è verificato un errore durante la verifica del codice 2FA.",
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md">
        <Input
          label="Codice 2FA"
          type="text"
          placeholder="Inserisci il codice 2FA"
          {...register("twoFactorCode")}
          error={errors.twoFactorCode?.message}
        />

        <Button
          label="Verifica Codice"
          type="submit"
          isLoading={isSubmitting}
          disabled={!isValid || isSubmitting}
        />
      </form>
    </div>
  );
};

export default TwoFactorPage;
