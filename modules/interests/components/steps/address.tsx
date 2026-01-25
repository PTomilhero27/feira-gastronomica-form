"use client";

import * as React from "react";
import type { UseFormReturn } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import type { InterestOwnerForm } from "../../api/interests.schemas";

/**
 * Step 2: Endereço
 * - CEP primeiro (com tentativa de autopreenchimento via ViaCEP)
 * - Depois endereço/cidade/estado
 *
 * Decisão:
 * - `lockAutoFields` é opcional e existe para reuso do componente no modal:
 *   no modal, queremos permitir editar o CEP e preencher (ou atualizar) os demais campos via lookup.
 */
export function Address(props: {
  form: UseFormReturn<InterestOwnerForm>;
  isBusy: boolean;
  cepStatus: "idle" | "loading" | "error" | "success";
  onCepChange: (rawCep: string) => void;
  showError: (step: 1 | 2 | 3, field: keyof InterestOwnerForm) => React.ReactNode;

  /** Quando true, trava endereço/cidade/estado (somente CEP editável). */
  lockAutoFields?: boolean;
}) {
  const { form, isBusy, cepStatus, onCepChange, showError, lockAutoFields = false } = props;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="addressZipcode">CEP</Label>
        <Input
          id="addressZipcode"
          inputMode="numeric"
          placeholder="Digite seu CEP"
          value={form.watch("addressZipcode")}
          onChange={(e) => {
            form.setValue("addressZipcode", e.target.value, { shouldDirty: true });
            onCepChange(e.target.value);
          }}
          disabled={isBusy}
        />

        {cepStatus === "loading" ? (
          <p className="text-xs text-muted-foreground">Buscando endereço…</p>
        ) : null}
        {cepStatus === "error" ? (
          <p className="text-xs text-red-600">
            Não consegui encontrar o CEP. Preencha manualmente.
          </p>
        ) : null}

        {lockAutoFields ? (
          <p className="text-xs text-muted-foreground">
            Os campos abaixo são preenchidos automaticamente ao buscar o CEP.
          </p>
        ) : null}

        {showError(2, "addressZipcode")}
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressFull">Endereço completo</Label>
        <Input
          id="addressFull"
          placeholder="Rua, número, bairro"
          {...form.register("addressFull")}
          disabled={isBusy || lockAutoFields}
        />
        {showError(2, "addressFull")}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="addressCity">Cidade</Label>
          <Input
            id="addressCity"
            placeholder="Sua cidade"
            {...form.register("addressCity")}
            disabled={isBusy || lockAutoFields}
          />
          {showError(2, "addressCity")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="addressState">Estado</Label>
          <Input
            id="addressState"
            placeholder="UF"
            {...form.register("addressState")}
            disabled={isBusy || lockAutoFields}
          />
          {showError(2, "addressState")}
        </div>
      </div>
    </div>
  );
}
