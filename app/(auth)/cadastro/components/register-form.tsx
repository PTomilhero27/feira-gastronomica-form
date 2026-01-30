"use client";

import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

import { maskCpfCnpj, onlyDigits } from "@/app/modules/shared/utils/document";
import { toast } from "@/components/ui/toast";
import { useCreatePublicInterestMutation } from "@/app/modules/public/interests/public-interests.queries";
import { publicInterestCreateSchema } from "@/app/modules/public/interests/public-interests.schemas";


/**
 * RegisterForm (Cadastro público de interessado)
 *
 * Responsabilidade:
 * - Coletar os dados básicos do interessado (sem senha)
 * - Enviar para o endpoint público /public/interests/upsert (create-only)
 * - Mostrar erro amigável quando o CPF/CNPJ já estiver cadastrado
 *
 * Decisões:
 * - A inferência CPF/CNPJ é apenas visual (UX).
 * - Normalizamos document/phone antes de enviar para manter consistência com o backend.
 * - O submit usa mutation (TanStack Query) para controle explícito de loading/erro.
 */
type InterestedRegisterFormValues = {
  document: string;
  fullName: string;
  email: string;
  phone: string;
  stallsDescription: string;
};

export function RegisterForm(props: {
  onBack: () => void;
  onSuccess: () => void;
}) {
  const { onSuccess } = props;

  const create = useCreatePublicInterestMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InterestedRegisterFormValues>({
    defaultValues: {
      document: "",
      fullName: "",
      email: "",
      phone: "",
      stallsDescription: "",
    },
    mode: "onBlur",
  });

  const watchedDocument = watch("document");

  const inferredDocType = React.useMemo<"CPF" | "CNPJ">(() => {
    const d = onlyDigits(watchedDocument);
    return d.length === 14 ? "CNPJ" : "CPF";
  }, [watchedDocument]);

  function handleDocumentChange(v: string) {
    setValue("document", maskCpfCnpj(v), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  async function onSubmit(values: InterestedRegisterFormValues) {
    /**
     * Payload normalizado (contrato do backend):
     * - document e phone sempre em dígitos
     * - e-mail em lowercase
     * - stallsDescription pode virar null
     */
    const payload = {
      personType: onlyDigits(values.document).length === 14 ? ("PJ" as const) : ("PF" as const),
      document: onlyDigits(values.document),
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      phone: onlyDigits(values.phone),
      stallsDescription: values.stallsDescription?.trim() || null,
    };

    /**
     * Validação final com Zod antes do POST:
     * - Evita mandar lixo para a API e deixa o fluxo mais previsível.
     */
    const parsed = publicInterestCreateSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error({
        title: "Revise os dados",
        subtitle: "Alguns campos estão inválidos. Verifique e tente novamente.",
      });
      return;
    }

    try {
      await create.mutateAsync(parsed.data);
      onSuccess();
    } catch (e: any) {
      /**
       * Mensagem vem pronta do backend quando:
       * - CPF/CNPJ já existe: "Já existe um cadastro com este CPF/CNPJ."
       * - ou validações de personType/document etc.
       */
      toast.error({
        title: "Não foi possível enviar",
        subtitle: e?.message ?? "Tente novamente em instantes.",
      });
    }
  }

  const isSubmitting = create.isPending;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Cadastro de interessado</h1>
        <p className="text-sm text-muted-foreground">
          Essas informações nos ajudam a entender sua operação e organizar os
          próximos contatos.
        </p>
      </header>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Tipo de documento */}
        <section className="space-y-2">
          <Label>Tipo de documento</Label>

          <div className="grid gap-3 sm:grid-cols-2">
            <div
              className={[
                "rounded-xl border p-3 transition",
                "min-w-0",
                inferredDocType === "CPF"
                  ? "border-foreground/30 bg-muted/40"
                  : "bg-card",
              ].join(" ")}
              aria-disabled
            >
              <p className="text-sm font-medium">CPF</p>
              <p className="text-xs text-muted-foreground">Pessoa física</p>
            </div>

            <div
              className={[
                "rounded-xl border p-3 transition",
                "min-w-0",
                inferredDocType === "CNPJ"
                  ? "border-foreground/30 bg-muted/40"
                  : "bg-card",
              ].join(" ")}
              aria-disabled
            >
              <p className="text-sm font-medium">CNPJ</p>
              <p className="text-xs text-muted-foreground">Pessoa jurídica</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            O tipo muda automaticamente conforme você digita.
          </p>
        </section>

        {/* Documento + Nome */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 min-w-0">
            <Label htmlFor="document">{inferredDocType}</Label>
            <Input
              id="document"
              placeholder={
                inferredDocType === "CPF"
                  ? "Digite seu CPF"
                  : "Digite seu CNPJ"
              }
              disabled={isSubmitting}
              {...register("document", {
                required: "Informe seu CPF ou CNPJ",
                validate: (v) => {
                  const d = onlyDigits(v);
                  if (!(d.length === 11 || d.length === 14))
                    return "Documento inválido";
                  return true;
                },
                onChange: (e) => handleDocumentChange(e.target.value),
              })}
            />
            {errors.document ? (
              <p className="text-sm text-red-600">{errors.document.message}</p>
            ) : null}
          </div>

          <div className="space-y-2 min-w-0">
            <Label htmlFor="fullName">Nome / Razão social</Label>
            <Input
              id="fullName"
              placeholder="Ex.: Maria da Silva / Empresa LTDA"
              disabled={isSubmitting}
              {...register("fullName", {
                required: "Informe seu nome",
                minLength: { value: 3, message: "Informe um nome válido" },
              })}
            />
            {errors.fullName ? (
              <p className="text-sm text-red-600">{errors.fullName.message}</p>
            ) : null}
          </div>
        </section>

        {/* Contato */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 min-w-0">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              autoComplete="email"
              disabled={isSubmitting}
              {...register("email", {
                required: "Informe seu e-mail",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "E-mail inválido",
                },
              })}
            />
            {errors.email ? (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2 min-w-0">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              autoComplete="tel"
              disabled={isSubmitting}
              {...register("phone", {
                required: "Informe seu telefone",
                validate: (v) => {
                  const d = onlyDigits(v);
                  if (d.length < 10) return "Telefone inválido";
                  return true;
                },
              })}
            />
            {errors.phone ? (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            ) : null}
          </div>
        </section>

        {/* Descrição */}
        <section className="space-y-2">
          <Label htmlFor="stallsDescription">Descrição da operação</Label>
          <Textarea
            id="stallsDescription"
            rows={4}
            placeholder="Descreva brevemente o que você vende e sua estrutura (ex.: barraca, food truck, equipamentos)."
            disabled={isSubmitting}
            {...register("stallsDescription", {
              minLength: {
                value: 10,
                message: "Descreva um pouco mais sua operação (mín. 10 caracteres)",
              },
            })}
          />
          {errors.stallsDescription ? (
            <p className="text-sm text-red-600">
              {errors.stallsDescription.message}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Isso nos ajuda a entender seu perfil e operação.
            </p>
          )}
        </section>

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              Enviando <Spinner />
            </span>
          ) : (
            "Enviar cadastro"
          )}
        </Button>
      </form>
    </div>
  );
}
