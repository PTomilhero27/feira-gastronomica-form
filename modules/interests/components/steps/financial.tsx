"use client";

import * as React from "react";
import type { UseFormReturn } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { BankAutocomplete } from "@/modules/shared/components/bank-autocomplete";
import { RadioCard } from "@/modules/shared/components/radio-card";
import { maskCpfCnpj } from "@/modules/shared/utils/document";

import type { InterestOwnerForm } from "../../api/interests.schemas";

/**
 * Step 3: Financeiro
 * - Banco autocomplete
 * - Tipo de conta (RadioCard)
 * - Agência/Conta/Pix
 * - Titular (sincronizado com Step 1 até edição manual)
 * - Descrição das barracas (texto livre)
 */
export function Financial(props: {
    form: UseFormReturn<InterestOwnerForm>;
    isBusy: boolean;
    showError: (step: 1 | 2 | 3, field: keyof InterestOwnerForm) => React.ReactNode;
    onBankHolderTouched: (kind: "doc" | "name") => void;
}) {
    const { form, isBusy, showError, onBankHolderTouched } = props;

    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <Label>Tipo de conta</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <RadioCard
                        checked={form.watch("bankAccountType") === "CORRENTE"}
                        onClick={() => form.setValue("bankAccountType", "CORRENTE", { shouldDirty: true })}
                        title="Conta corrente"
                        subtitle="Repasse na conta corrente."
                        disabled={isBusy}
                    />
                    <RadioCard
                        checked={form.watch("bankAccountType") === "POUPANCA"}
                        onClick={() => form.setValue("bankAccountType", "POUPANCA", { shouldDirty: true })}
                        title="Poupança"
                        subtitle="Repasse na poupança."
                        disabled={isBusy}
                    />
                </div>
                {showError(3, "bankAccountType")}
            </div>

            <Separator />

            <div className="space-y-2">
                <Label>Banco</Label>
                <BankAutocomplete
                    value={form.watch("bankName")}
                    onChange={(v) => form.setValue("bankName", v, { shouldDirty: true })}
                    disabled={isBusy}
                    placeholder="Selecione ou digite seu banco (ex: 341, itaú)..."
                />
                {showError(3, "bankName")}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="bankAgency">Agência</Label>
                    <Input
                        id="bankAgency"
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        placeholder="Ex: 1234"
                        value={form.watch("bankAgency") ?? ""}
                        onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "");
                            form.setValue("bankAgency", digits, { shouldDirty: true });
                        }}
                        maxLength={6} // agência normalmente é curta; ajuste se quiser
                        disabled={isBusy}
                    />
                    {showError(3, "bankAgency")}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bankAccount">Conta</Label>
                    <Input
                        id="bankAccount"
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        placeholder="Ex: 1234567"
                        value={form.watch("bankAccount") ?? ""}
                        onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "");
                            form.setValue("bankAccount", digits, { shouldDirty: true });
                        }}
                        maxLength={12} // conta pode variar; ajuste se preferir
                        disabled={isBusy}
                    />
                    {showError(3, "bankAccount")}
                </div>
            </div>


            <div className="space-y-2">
                <Label htmlFor="pixKey">Chave Pix</Label>
                <Input
                    id="pixKey"
                    placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
                    {...form.register("pixKey")}
                    disabled={isBusy}
                />
                {showError(3, "pixKey")}
            </div>

            {/* TITULAR (sincronizado com Step 1, mas editável) */}
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="bankHolderDoc">CPF/CNPJ do titular</Label>
                    <Input
                        id="bankHolderDoc"
                        inputMode="numeric"
                        placeholder="CPF/CNPJ do titular"
                        value={form.watch("bankHolderDoc")}
                        onChange={(e) => {
                            onBankHolderTouched("doc");
                            form.setValue("bankHolderDoc", maskCpfCnpj(e.target.value), { shouldDirty: true });
                        }}
                        disabled={isBusy}
                    />
                    {showError(3, "bankHolderDoc")}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bankHolderName">Nome do titular</Label>
                    <Input
                        id="bankHolderName"
                        placeholder="Nome do titular"
                        value={form.watch("bankHolderName")}
                        onChange={(e) => {
                            onBankHolderTouched("name");
                            form.setValue("bankHolderName", e.target.value, { shouldDirty: true });
                        }}
                        disabled={isBusy}
                    />
                    {showError(3, "bankHolderName")}
                </div>
            </div>

            <Separator />


            <div className="space-y-2">
                <Label htmlFor="stallsDescription">Descrição das barracas</Label>
                <Textarea
                    id="stallsDescription"
                    className="min-h-28"
                    placeholder="Conte pra gente quais barracas você tem (nomes e o que vende)."
                    {...form.register("stallsDescription")}
                    disabled={isBusy}
                />
                {showError(3, "stallsDescription")}
            </div>
        </div>
    );
}
