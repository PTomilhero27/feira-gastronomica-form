"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { Stepper } from "@/modules/shared/components/stepper";
import { maskCpfCnpj, onlyDigits } from "@/modules/shared/utils/document";
import { fetchAddressByCep } from "@/modules/shared/service/cep";

import {
    interestOwnerFormSchema,
    type InterestOwnerForm,
} from "../api/interests.schemas";



import { BlockedStateCard } from "./state/blocked-state-card";
import { DocumentLookupDialog } from "./lookup/document-lookup-dialog";
import { Identification } from "./steps/identification";
import { Address } from "./steps/address";
import { Financial } from "./steps/financial";
import { FormNavigation } from "./steps/form-navigation";
import { useLookupOwnerByDocumentMutation, useUpsertOwnerMutation } from "../api/interests.queries";
import { SubmissionResult } from "./state/submission-result";


/**
 * Form 1: Interessados (público)
 *
 * Responsabilidade deste arquivo:
 * - Orquestrar o wizard (stepper, gate, estado de travas)
 * - Centralizar a integração com API (lookup + upsert)
 * - Manter regras de UX (touchedSteps, sincronização do titular)
 *
 * Observação:
 * - Os campos de UI de cada etapa foram extraídos para componentes menores
 *   para facilitar manutenção e evolução.
 */
export function InterestForm() {
    const lookup = useLookupOwnerByDocumentMutation();
    const upsert = useUpsertOwnerMutation();

    const [step, setStep] = React.useState<1 | 2 | 3>(1);

    /**
     * Gate do formulário:
     * - lookup: modal obrigatório pedindo CPF/CNPJ
     * - ready : formulário liberado
     * - blocked: indisponível (quando decidirmos bloquear de verdade)
     */
    type FlowState = "lookup" | "ready" | "blocked" | "success" | "error";

    const [gate, setGate] = React.useState<FlowState>("lookup");

    const lastSubmitRef = React.useRef<InterestOwnerForm | null>(null);


    const [lookupDoc, setLookupDoc] = React.useState("");

    /**
     * Travas:
     * - Quando o cadastro EXISTE: trava tipo e documento.
     * - Quando é novo: deixa editar normalmente.
     */
    const [lockedFields, setLockedFields] = React.useState({
        document: false,
        docType: false,
    });

    /**
     * Estado do CEP
     */
    const [cepStatus, setCepStatus] = React.useState<
        "idle" | "loading" | "error" | "success"
    >("idle");

    /**
     * Evita erro vermelho “na entrada”:
     * - Só mostramos erros após tentar avançar / enviar na etapa
     */
    const [touchedSteps, setTouchedSteps] = React.useState<{
        1: boolean;
        2: boolean;
        3: boolean;
    }>({ 1: false, 2: false, 3: false });

    /**
     * Controle de sincronização dos campos de titular:
     * - Se o usuário editar manualmente, paramos de auto-sincronizar.
     */
    const [bankHolderTouched, setBankHolderTouched] = React.useState({
        doc: false,
        name: false,
    });

    const form = useForm<InterestOwnerForm>({
        resolver: zodResolver(interestOwnerFormSchema),
        defaultValues: {
            personType: "PF",
            document: "",
            fullName: "",
            email: "",
            phone: "",
            addressFull: "",
            addressCity: "",
            addressState: "",
            addressZipcode: "",
            pixKey: "",
            bankName: "",
            bankAgency: "",
            bankAccount: "",
            bankAccountType: "CORRENTE",
            bankHolderDoc: "",
            bankHolderName: "",
            stallsDescription: "",
        },
        mode: "onBlur",
    });

    const isBusy = lookup.isPending || upsert.isPending;

    const stepsMeta = React.useMemo(
        () => [{ title: "Identificação" }, { title: "Endereço" }, { title: "Financeiro" }],
        []
    );

    /**
     * Inferência do tipo de documento pelo tamanho:
     * - 11 => CPF
     * - 14 => CNPJ
     */
    const watchedDocument = form.watch("document");
    const watchedFullName = form.watch("fullName");

    const inferredDocType = React.useMemo(() => {
        const d = onlyDigits(watchedDocument);
        if (d.length === 14) return "CNPJ";
        return "CPF";
    }, [watchedDocument]);

    /**
     * Ajusta PF/PJ automaticamente ao digitar documento (quando não estiver travado)
     */
    React.useEffect(() => {
        if (lockedFields.docType) return;

        const digits = onlyDigits(watchedDocument);
        if (digits.length === 11) form.setValue("personType", "PF", { shouldDirty: true });
        if (digits.length === 14) form.setValue("personType", "PJ", { shouldDirty: true });
    }, [watchedDocument, lockedFields.docType, form]);

    /**
     * Sincroniza TITULAR com os dados do Step 1:
     * - bankHolderDoc segue document
     * - bankHolderName segue fullName
     *
     * Regra:
     * - Só sincroniza se o usuário ainda NÃO mexeu manualmente no campo de titular.
     */
    React.useEffect(() => {
        const docDigits = onlyDigits(watchedDocument);
        const hasDoc = docDigits.length === 11 || docDigits.length === 14;

        if (hasDoc && !bankHolderTouched.doc) {
            form.setValue("bankHolderDoc", maskCpfCnpj(docDigits), { shouldDirty: false });
        }

        if (watchedFullName?.trim() && !bankHolderTouched.name) {
            form.setValue("bankHolderName", watchedFullName, { shouldDirty: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedDocument, watchedFullName, bankHolderTouched.doc, bankHolderTouched.name]);

    /**
     * Autopreenchimento por CEP (ViaCEP)
     */
    async function tryAutoFillCep(rawCep: string) {
        const digits = onlyDigits(rawCep);
        if (digits.length !== 8) return;

        try {
            setCepStatus("loading");

            const data = await fetchAddressByCep(digits);

            const composed =
                [data.street, data.neighborhood].filter(Boolean).join(" - ") ||
                form.getValues("addressFull");

            if (composed) form.setValue("addressFull", composed, { shouldDirty: true });
            form.setValue("addressCity", data.city, { shouldDirty: true });
            form.setValue("addressState", data.state, { shouldDirty: true });

            setCepStatus("success");
        } catch {
            setCepStatus("error");
        }
    }

    /**
     * Lookup do cadastro por documento.
     * Ajuste principal: o backend espera body { document }, então chamamos mutateAsync({ document }).
     */
    async function handleLookup() {
        const digits = onlyDigits(lookupDoc);
        if (!(digits.length === 11 || digits.length === 14)) return;

        const inferredPersonType: "PF" | "PJ" = digits.length === 14 ? "PJ" : "PF";

        try {
            const res = await lookup.mutateAsync({ document: digits });

            // Novo cadastro
            if (!res.found || !res.owner) {
                setLockedFields({ document: false, docType: false });

                // Reseta também o controle de sincronização do titular
                setBankHolderTouched({ doc: false, name: false });

                form.reset({
                    ...form.getValues(),
                    personType: inferredPersonType,
                    document: maskCpfCnpj(digits),
                    // titular inicia igual ao documento (e vai continuar sincronizando)
                    bankHolderDoc: maskCpfCnpj(digits),
                });

                setStep(1);
                setTouchedSteps({ 1: false, 2: false, 3: false });
                setCepStatus("idle");
                setGate("ready");
                return;
            }

            // Cadastro existente
            setLockedFields({ document: true, docType: true });
            setBankHolderTouched({ doc: false, name: false });

            form.reset({
                personType: res.owner.personType,
                document: maskCpfCnpj(res.owner.document),
                fullName: res.owner.fullName ?? "",
                email: res.owner.email ?? "",
                phone: res.owner.phone ?? "",

                addressFull: res.owner.addressFull ?? "",
                addressCity: res.owner.addressCity ?? "",
                addressState: res.owner.addressState ?? "",
                addressZipcode: res.owner.addressZipcode ?? "",

                pixKey: res.owner.pixKey ?? "",
                bankName: res.owner.bankName ?? "",
                bankAgency: res.owner.bankAgency ?? "",
                bankAccount: res.owner.bankAccount ?? "",
                bankAccountType: (res.owner.bankAccountType ?? "CORRENTE") as any,

                // Se backend já tiver salvo titular específico, usamos; senão, cai no sincronizado
                bankHolderDoc: res.owner.bankHolderDoc
                    ? maskCpfCnpj(res.owner.bankHolderDoc)
                    : maskCpfCnpj(res.owner.document),
                bankHolderName: res.owner.bankHolderName ?? (res.owner.fullName ?? ""),

                stallsDescription: res.owner.stallsDescription ?? "",
            });

            setStep(1);
            setTouchedSteps({ 1: false, 2: false, 3: false });
            setCepStatus("idle");
            setGate("ready");
        } catch {
            /**
             * Regra do produto (futuro):
             * - quando o backend estiver ativo e for obrigatório, aqui será: setGate('blocked')
             *
             * Por enquanto:
             * - fallback liberando o form em modo “offline”
             */
            setLockedFields({ document: false, docType: false });
            setBankHolderTouched({ doc: false, name: false });

            form.reset({
                ...form.getValues(),
                personType: inferredPersonType,
                document: maskCpfCnpj(digits),
                bankHolderDoc: maskCpfCnpj(digits),
            });

            setStep(1);
            setTouchedSteps({ 1: false, 2: false, 3: false });
            setCepStatus("idle");
            setGate("ready");
        }
    }

    async function nextStep() {
        if (step === 1) {
            setTouchedSteps((p) => ({ ...p, 1: true }));

            const ok = await form.trigger(["document", "fullName", "email", "phone"]);
            if (ok) setStep(2);
            return;
        }

        if (step === 2) {
            setTouchedSteps((p) => ({ ...p, 2: true }));

            const ok = await form.trigger([
                "addressZipcode",
                "addressFull",
                "addressCity",
                "addressState",
            ]);
            if (ok) setStep(3);
            return;
        }
    }

    function prevStep() {
        setStep((s) => (s === 3 ? 2 : 1));
    }

    async function onSubmit(values: InterestOwnerForm) {
        setTouchedSteps((p) => ({ ...p, 3: true }));

        const ok = await form.trigger([
            "bankName",
            "bankAccountType",
            "pixKey",
            "bankAgency",
            "bankAccount",
            "bankHolderDoc",
            "bankHolderName",
            "stallsDescription",
        ]);
        if (!ok) return;

        // payload normalizado (contrato do backend)
        const payload = {
            ...values,
            document: onlyDigits(values.document),
            phone: onlyDigits(values.phone),
            addressZipcode: onlyDigits(values.addressZipcode),
            bankHolderDoc: onlyDigits(values.bankHolderDoc),
        };

        // guardamos para retry
        lastSubmitRef.current = values;

        try {
            await upsert.mutateAsync(payload as any);

            setGate("success");
        } catch {
            setGate("error");
        }
    }

    async function retrySubmit() {
        const values = lastSubmitRef.current;
        if (!values) return;

        const payload = {
            ...values,
            document: onlyDigits(values.document),
            phone: onlyDigits(values.phone),
            addressZipcode: onlyDigits(values.addressZipcode),
            bankHolderDoc: onlyDigits(values.bankHolderDoc),
        };

        try {
            await upsert.mutateAsync(payload as any);
            setGate("success");
        } catch {
            setGate("error");
        }
    }

    function goToEdit() {
        // volta pro wizard sem perder dados
        setGate("ready");
        setStep(1);
    }

    function startNew() {
        // reseta tudo e volta pro modal
        setGate("lookup");
        setStep(1);
        setLookupDoc("");
        setCepStatus("idle");
        setTouchedSteps({ 1: false, 2: false, 3: false });
        setBankHolderTouched({ doc: false, name: false });
        lookup.reset();
        upsert.reset();
        lastSubmitRef.current = null;

        // opcional: limpar form para não "piscar" dados antigos quando reabrir
        form.reset({
            personType: "PF",
            document: "",
            fullName: "",
            email: "",
            phone: "",
            addressFull: "",
            addressCity: "",
            addressState: "",
            addressZipcode: "",
            pixKey: "",
            bankName: "",
            bankAgency: "",
            bankAccount: "",
            bankAccountType: "CORRENTE",
            bankHolderDoc: "",
            bankHolderName: "",
            stallsDescription: "",
        });
    }


    /**
     * Helper de erro: só mostra se tentou avançar/submit na etapa
     */
    function showError(stepNumber: 1 | 2 | 3, field: keyof InterestOwnerForm) {
        if (!touchedSteps[stepNumber]) return null;
        const err = (form.formState.errors as any)?.[field]?.message;
        if (!err) return null;
        return <p className="text-sm text-red-600">{String(err)}</p>;
    }

    return (
        <div className="mx-auto w-full max-w-lg p-4 sm:p-6">
            <div className="space-y-2">
                <h1 className="text-lg font-semibold">Lista de Interessados</h1>
                <p className="text-sm text-muted-foreground">
                    Cadastre seus dados para participar de futuras feiras.
                </p>
            </div>

            {/* MODAL obrigatório de documento */}
            <DocumentLookupDialog
                open={gate === "lookup"}
                value={lookupDoc}
                isPending={lookup.isPending}
                isError={lookup.isError}
                onChange={(v) => {
                    if (lookup.isError) lookup.reset();
                    setLookupDoc(maskCpfCnpj(v));
                }}
                onSubmit={handleLookup}
            />

            {/* BLOQUEIO total quando der erro de sistema */}
            {gate === "blocked" ? (
                <BlockedStateCard
                    onTryAgain={() => {
                        lookup.reset();
                        setGate("lookup");
                    }}
                />
            ) : null}

            {gate === "ready" ? (
                <Card className="mt-4 rounded-2xl p-4">
                    <Stepper current={step} steps={stepsMeta} />

                    <form
                        className="mt-5 space-y-4"
                        onSubmit={(e) => {
                            if (step < 3) {
                                e.preventDefault();
                                e.stopPropagation();
                                void nextStep();
                                return;
                            }

                            void form.handleSubmit(onSubmit)(e);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && step < 3) {
                                e.preventDefault();
                                void nextStep();
                            }
                        }}
                    >



                        {/* STEP 1 */}
                        {step === 1 ? (
                            <Identification
                                form={form}
                                isBusy={isBusy}
                                lockedFields={lockedFields}
                                inferredDocType={inferredDocType}
                                showError={showError}
                            />
                        ) : null}

                        {/* STEP 2 */}
                        {step === 2 ? (
                            <Address
                                form={form}
                                isBusy={isBusy}
                                cepStatus={cepStatus}
                                onCepChange={(raw) => void tryAutoFillCep(raw)}
                                showError={showError}
                            />
                        ) : null}

                        {/* STEP 3 */}
                        {step === 3 ? (
                            <Financial
                                form={form}
                                isBusy={isBusy}
                                showError={showError}
                                onBankHolderTouched={(kind) =>
                                    setBankHolderTouched((p) => ({ ...p, [kind]: true }))
                                }
                            />
                        ) : null}

                        <Separator />

                        <FormNavigation
                            step={step}
                            isBusy={isBusy}
                            onPrev={prevStep}
                            onNext={nextStep}
                        />
                    </form>
                </Card>
            ) : null}

            {gate === "success" ? (
                <SubmissionResult variant="success" onEdit={goToEdit} onNew={startNew} />
            ) : null}

            {gate === "error" ? (
                <SubmissionResult
                    variant="error"
                    onEdit={goToEdit}
                    onNew={startNew}
                    onRetry={retrySubmit}
                    isBusy={upsert.isPending}
                />
            ) : null}
        </div>
    );
}
