"use client";

import * as React from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Modal obrigatório de entrada do documento (CPF/CNPJ).
 * Mantemos isolado para:
 * - facilitar ajustes de UX
 * - reduzir complexidade do componente principal
 */
export function DocumentLookupDialog(props: {
  open: boolean;
  value: string;
  isPending: boolean;
  isError: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={props.open} onOpenChange={() => {}}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>Buscar cadastro</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Informe seu CPF/CNPJ para localizar seu cadastro. Se não existir, você poderá criar.
          </p>

          <div className="space-y-2">
            <Label htmlFor="lookup-doc">CPF/CNPJ</Label>
            <Input
              id="lookup-doc"
              autoFocus
              inputMode="numeric"
              placeholder="Digite seu CPF ou CNPJ"
              value={props.value}
              onChange={(e) => props.onChange(e.target.value)}
              disabled={props.isPending}
            />
            <p className="text-xs text-muted-foreground">
              * Você não precisa criar conta ou senha.
            </p>
          </div>

          {props.isError ? (
            <Alert>
              <AlertTitle>Não foi possível consultar</AlertTitle>
              <AlertDescription>
                O sistema está indisponível no momento. Tente novamente mais tarde.
              </AlertDescription>
            </Alert>
          ) : null}

          <Button className="w-full" onClick={props.onSubmit} disabled={props.isPending}>
            {props.isPending ? "Consultando…" : "Continuar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
