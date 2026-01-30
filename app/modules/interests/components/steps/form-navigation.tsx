"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

/**
 * Navegação do wizard:
 * - Step 1: sem botão "Voltar"
 * - Step 2/3: volta disponível
 * - Step 1/2: "Avançar" NÃO pode submeter o form (type="button")
 * - Step 3: botão de submit (type="submit")
 */
export function FormNavigation({ step, isBusy, onPrev, onNext }: {
  step: 1 | 2 | 3;
  isBusy: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
      {step === 1 ? (
        <div />
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          disabled={isBusy}
          className="w-full sm:w-auto"
        >
          Voltar
        </Button>
      )}

      {step < 3 ? (
        <Button
          type="button"        // ✅ isso aqui é o que resolve o click
          onClick={(e) => {
            e.preventDefault(); // ✅ extra: impede submit acidental
            onNext();
          }}
          disabled={isBusy}
          className="w-full sm:w-auto"
        >
          Avançar
        </Button>
      ) : (
        <Button type="submit" disabled={isBusy} className="w-full sm:w-auto">
          {isBusy ? "Enviando…" : "Enviar interesse"}
        </Button>
      )}
    </div>
  );
}
