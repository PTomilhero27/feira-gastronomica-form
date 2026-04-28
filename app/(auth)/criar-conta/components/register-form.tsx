"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

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
 * RegisterForm (Cadastro de expositor com senha)
 *
 * Responsabilidade:
 * - Coletar dados básicos + senha + confirmação de senha
 * - Enviar para POST /public/interests/upsert
 * - Inclui validação de senha (mín. 6, match com confirmação)
 *
 * Decisões:
 * - A inferência CPF/CNPJ é apenas visual (UX)
 * - Normalizamos document/phone antes de enviar
 * - password vai para o backend; confirmPassword é validado só no front
 */
type RegisterFormValues = {
  document: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  stallsDescription: string;
};

export function RegisterForm(props: {
  onBack: () => void;
  onSuccess: (email: string) => void;
}) {
  const { onSuccess } = props;

  const create = useCreatePublicInterestMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      document: "",
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      stallsDescription: "",
    },
    mode: "onBlur",
  });

  const watchedDocument = watch("document");
  const watchedPassword = watch("password");

  // ──────────────────────────────────────────
  // Visibilidade da senha
  // ──────────────────────────────────────────
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

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

  async function onSubmit(values: RegisterFormValues) {
    // ✅ Verificar confirmação de senha
    if (values.password !== values.confirmPassword) {
      toast.error({
        title: "Senhas não conferem",
        subtitle: "A senha e a confirmação devem ser iguais.",
      });
      return;
    }

    const payload = {
      personType: onlyDigits(values.document).length === 14 ? ("PJ" as const) : ("PF" as const),
      document: onlyDigits(values.document),
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      phone: onlyDigits(values.phone),
      password: values.password,
      stallsDescription: values.stallsDescription?.trim() || null,
    };

    // Validação final com Zod
    const parsed = publicInterestCreateSchema.safeParse(payload);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues?.[0]?.message;
      toast.error({
        title: "Revise os dados",
        subtitle: firstIssue ?? "Alguns campos estão inválidos.",
      });
      return;
    }

    try {
      await create.mutateAsync(parsed.data);
      onSuccess(payload.email);
    } catch (e: any) {
      toast.error({
        title: "Não foi possível enviar",
        subtitle: e?.message ?? "Tente novamente em instantes.",
      });
    }
  }

  const isSubmitting = create.isPending;

  // ──────────────────────────────────────────
  // Indicador de força da senha
  // ──────────────────────────────────────────
  const passwordStrength = React.useMemo(() => {
    const p = watchedPassword ?? "";
    if (p.length === 0) return { level: 0, label: "", color: "" };
    if (p.length < 6) return { level: 1, label: "Muito fraca", color: "bg-red-500" };

    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;

    if (score <= 1) return { level: 2, label: "Fraca", color: "bg-orange-500" };
    if (score === 2) return { level: 3, label: "Média", color: "bg-yellow-500" };
    return { level: 4, label: "Forte", color: "bg-emerald-500" };
  }, [watchedPassword]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Cadastro de expositor</h1>
        <p className="text-sm text-muted-foreground">
          Preencha seus dados e crie uma senha para acessar o portal.
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

        {/* ✅ Senha + Confirmação */}
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 min-w-0">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Crie uma senha"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  {...register("password", {
                    required: "Crie uma senha",
                    minLength: { value: 6, message: "Mínimo 6 caracteres" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              ) : null}

              {/* Indicador de força */}
              {watchedPassword && watchedPassword.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i <= passwordStrength.level
                            ? passwordStrength.color
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  {...register("confirmPassword", {
                    required: "Confirme sua senha",
                    validate: (v) =>
                      v === watchedPassword || "As senhas não conferem",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword ? (
                <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
              ) : null}
            </div>
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
              Criando conta <Spinner />
            </span>
          ) : (
            "Criar conta"
          )}
        </Button>
      </form>
    </div>
  );
}
