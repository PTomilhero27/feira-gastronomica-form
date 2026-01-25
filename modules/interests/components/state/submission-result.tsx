"use client";

import * as React from "react";
import { CheckCircle2, ClipboardList, Clock, AlertTriangle, RotateCcw, Pencil } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/**
 * Estado final do wizard (sem navegar para outra página).
 *
 * Responsabilidade:
 * - Mostrar feedback de sucesso/erro após o envio do formulário
 * - Oferecer ações claras: editar, tentar novamente, iniciar novo cadastro
 */
export function SubmissionResult(props: {
    variant: "success" | "error";
    onEdit: () => void;
    onNew: () => void;
    onRetry?: () => void;
    isBusy?: boolean;
}) {
    const { variant, onEdit, onNew, onRetry, isBusy } = props;

    if (variant === "success") {
        return (
            <Card className="mt-4 rounded-2xl p-5 sm:p-6">
                <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-7 w-7" />
                    <div className="space-y-1">
                        <h2 className="text-lg font-semibold">Cadastro enviado com sucesso</h2>
                        <p className="text-sm text-muted-foreground">
                            Obrigado! Suas informações foram registradas e você já está na nossa lista de interessados.
                        </p>
                    </div>
                </div>

                <Separator className="my-5" />

                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <ClipboardList className="mt-0.5 h-5 w-5" />
                        <div>
                            <p className="text-sm font-medium">Triagem pela organização</p>
                            <p className="text-sm text-muted-foreground">
                                Vamos analisar os dados enviados (tipo de barraca, estrutura e informações financeiras) para organizar
                                as próximas feiras.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Clock className="mt-0.5 h-5 w-5" />
                        <div>
                            <p className="text-sm font-medium">Próximos passos</p>
                            <p className="text-sm text-muted-foreground">
                                Se o seu perfil for selecionado, entraremos em contato pelos meios informados no cadastro.
                            </p>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onEdit}
                        >
                            Editar cadastro
                        </Button>

                        <Button
                            type="button"
                            onClick={onNew}
                            className="w-full"
                        >
                            Novo cadastro
                        </Button>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="mt-4 rounded-2xl p-5 sm:p-6">
            <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-7 w-7" />
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold">Não foi possível finalizar</h2>
                    <p className="text-sm text-muted-foreground">
                        Ocorreu um problema ao enviar seu cadastro. Você pode tentar novamente agora.
                    </p>
                </div>
            </div>

            <Separator className="my-5" />

            <div className="space-y-4">
                <div className="rounded-xl border p-4">
                    <p className="text-sm font-medium">Dica rápida</p>
                    <p className="text-sm text-muted-foreground">
                        Verifique sua conexão e tente novamente. Se persistir, procure a organização.
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onEdit}
                        className="w-full sm:w-auto"
                        disabled={isBusy}
                    >
                        Voltar ao formulário
                    </Button>

                    <Button
                        type="button"
                        onClick={onRetry}
                        className="w-full sm:w-auto"
                        disabled={isBusy || !onRetry}
                    >
                        {isBusy ? "Tentando…" : "Tentar novamente"}
                    </Button>

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onNew}
                        className="w-full sm:w-auto"
                        disabled={isBusy}
                    >
                        Novo cadastro
                    </Button>
                </div>
            </div>
        </Card>
    );
}
