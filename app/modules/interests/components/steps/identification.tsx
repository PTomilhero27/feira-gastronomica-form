"use client";

import * as React from "react";
import type { UseFormReturn } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";


import type { InterestOwnerForm } from "../../api/interests.schemas";
import { maskPhoneBR } from "./mask-phone";
import { RadioCard } from "@/app/modules/shared/components/radio-card";
import { maskCpfCnpj } from "@/app/modules/shared/utils/document";

/**
 * Step 1: Identificação + contato
 * Responsável por:
 * - Documento + Nome/Razão social + Email + Telefone
 * - Exibir tipo (CPF/CNPJ) inferido, mas sem permitir troca manual
 */
export function Identification(props: {
  form: UseFormReturn<InterestOwnerForm>;
  isBusy: boolean;
  lockedFields: { document: boolean; docType: boolean };
  inferredDocType: "CPF" | "CNPJ";
  showError: (step: 1 | 2 | 3, field: keyof InterestOwnerForm) => React.ReactNode;
}) {
  const { form, isBusy, lockedFields, inferredDocType, showError } = props;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tipo de documento</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <RadioCard
            checked={inferredDocType === "CPF"}
            onClick={() => {}}
            title="CPF"
            subtitle=""
            disabled={lockedFields.docType || isBusy}
          />
          <RadioCard
            checked={inferredDocType === "CNPJ"}
            onClick={() => {}}
            title="CNPJ"
            subtitle=""
            disabled={lockedFields.docType || isBusy}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          O tipo muda automaticamente conforme você digita.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="document">{inferredDocType}</Label>
          <Input
            id="document"
            inputMode="numeric"
            placeholder={inferredDocType === "CPF" ? "Digite seu CPF" : "Digite seu CNPJ"}
            value={form.watch("document")}
            onChange={(e) =>
              form.setValue("document", maskCpfCnpj(e.target.value), { shouldDirty: true })
            }
            disabled={lockedFields.document || isBusy}
          />
          {showError(1, "document")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Nome / Razão social</Label>
          <Input
            id="fullName"
            placeholder="Ex.: Maria da Silva / Empresa LTDA"
            {...form.register("fullName")}
            disabled={isBusy}
          />
          {showError(1, "fullName")}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            placeholder="email@exemplo.com"
            {...form.register("email")}
            disabled={isBusy}
          />
          {showError(1, "email")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            inputMode="numeric"
            placeholder="(11) 99999-9999"
            value={form.watch("phone")}
            onChange={(e) =>
              form.setValue("phone", maskPhoneBR(e.target.value), { shouldDirty: true })
            }
            disabled={isBusy}
          />
          {showError(1, "phone")}
        </div>
      </div>
    </div>
  );
}
