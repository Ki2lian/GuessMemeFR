"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import type { MemeTableRow } from "@/app/admin/memes/meme-data-table";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { normalizeAnswer } from "@/lib/game/normalize-answer";
import { MAX_MEDIA_FILE_SIZE_BYTES } from "@/lib/media/constants";

const difficulties = [ "EASY", "MEDIUM", "HARD" ] as const;

type MemeFormAction = (formData: FormData) => Promise<unknown>;

interface MemeFormProps {
    action: MemeFormAction;
    imageRequired?: boolean;
    meme?: MemeTableRow;
    onSuccess?: () => void;
}

export const MemeForm = ({ action, imageRequired = false, meme, onSuccess }: MemeFormProps) => {
    const t = useTranslations("Admin.memes");
    const [ step, setStep ] = useState(0);
    const [ aliasesImport, setAliasesImport ] = useState("");
    const [ aliasesImportError, setAliasesImportError ] = useState<string>();
    const informationSchema = useMemo(
        () =>
            z.object({
                difficulty: z.enum(difficulties),
                origin: z.string().trim().max(255, t("errorOriginTooLong")),
                sourceUrl: z.union([ z.literal(""), z.url(t("errorSourceUrl")) ]),
                title: z.string().trim().min(2, t("errorTitleTooShort")).max(255, t("errorTitleTooLong")),
            }),
        [ t ],
    );
    const formSchema = useMemo(
        () =>
            z.object({
                aliases: z.array(z.object({ value: z.string().trim().min(1, t("errorAliasRequired")) })),
                canonicalAnswer: z.string().trim().min(1, t("errorCanonicalAnswerRequired")),
                difficulty: z.enum(difficulties),
                image: z.custom<File | undefined>(),
                origin: z.string().trim().max(255, t("errorOriginTooLong")),
                sourceUrl: z.union([ z.literal(""), z.url(t("errorSourceUrl")) ]),
                title: z.string().trim().min(2, t("errorTitleTooShort")).max(255, t("errorTitleTooLong")),
            }).superRefine((values, context) => {
                const normalizedAnswers = new Set([ normalizeAnswer(values.canonicalAnswer) ]);

                for (const [ index, alias ] of values.aliases.entries()) {
                    const normalizedAlias = normalizeAnswer(alias.value);

                    if (!normalizedAlias || normalizedAnswers.has(normalizedAlias)) {
                        context.addIssue({ code: "custom", message: t("errorAnswersDifferent"), path: [ "aliases", index, "value" ] });
                    }

                    normalizedAnswers.add(normalizedAlias);
                }

                if (imageRequired && (!(values.image instanceof File) || values.image.size === 0)) {
                    context.addIssue({ code: "custom", message: t("errorImageRequired"), path: [ "image" ] });
                }

                if (values.image instanceof File && values.image.size > MAX_MEDIA_FILE_SIZE_BYTES) {
                    context.addIssue({ code: "custom", message: t("errorImageTooLarge"), path: [ "image" ] });
                }
            }),
        [ imageRequired, t ],
    );
    type MemeFormValues = z.infer<typeof formSchema>;
    const canonicalAnswer = meme?.answers.find(answer => answer.type === "CANONICAL")?.value ?? "";
    const aliases = meme?.answers.filter(answer => answer.type === "ALIAS").map(answer => ({ value: answer.value })) ?? [];
    const form = useForm<MemeFormValues>({
        defaultValues: {
            aliases,
            canonicalAnswer,
            difficulty: meme?.difficulty ?? "MEDIUM",
            image: undefined,
            origin: meme?.origin ?? "",
            sourceUrl: meme?.sourceUrl ?? "",
            title: meme?.title ?? "",
        },
        resolver: zodResolver(formSchema),
    });
    const aliasFields = useFieldArray({ control: form.control, name: "aliases" });
    const { errors } = form.formState;

    const importAliases = () => {
        try {
            const parsedAliases: unknown = JSON.parse(aliasesImport);

            if (!Array.isArray(parsedAliases) || parsedAliases.some(alias => typeof alias !== "string")) {
                throw new Error("Invalid aliases import.");
            }

            aliasFields.replace(parsedAliases.map(value => ({ value: value.trim() })).filter(alias => alias.value));
            setAliasesImport("");
            setAliasesImportError(undefined);
        } catch {
            setAliasesImportError(t("errorInvalidAliasesJson"));
        }
    };

    const moveToAnswers = () => {
        const validation = informationSchema.safeParse({
            difficulty: form.getValues("difficulty"),
            origin: form.getValues("origin"),
            sourceUrl: form.getValues("sourceUrl"),
            title: form.getValues("title"),
        });

        if (!validation.success) {
            for (const issue of validation.error.issues) {
                const field = issue.path[0];

                if (field === "difficulty" || field === "origin" || field === "sourceUrl" || field === "title") {
                    form.setError(field, { message: issue.message });
                }
            }

            return;
        }

        form.clearErrors([ "difficulty", "origin", "sourceUrl", "title" ]);
        setStep(1);
    };

    const submit = async (values: MemeFormValues) => {
        const formData = new FormData();
        formData.set("aliases", values.aliases.map(alias => alias.value).join("\n"));
        formData.set("canonicalAnswer", values.canonicalAnswer);
        formData.set("difficulty", values.difficulty);
        formData.set("origin", values.origin);
        formData.set("sourceUrl", values.sourceUrl);
        formData.set("title", values.title);

        if (values.image) {
            formData.set("image", values.image);
        }

        await action(formData);
        onSuccess?.();
    };

    return (
        <form className="gap-4 grid" noValidate onSubmit={ event => event.preventDefault() }>
            <div aria-label={ t("progress") } className="items-center gap-2 grid grid-cols-[1fr_auto_1fr]" role="status">
                <div className={ step === 0 ? "flex items-center gap-2 text-foreground" : "flex items-center gap-2 text-muted-foreground" }>
                    <span
                        className={
                            step === 0
                                ? "place-items-center grid bg-primary rounded-full size-6 font-semibold text-primary-foreground text-xs"
                                : "place-items-center grid bg-muted rounded-full size-6 font-semibold text-xs"
                        }
                    >
                        1
                    </span>
                    <span className="font-medium text-sm">{t("stepInformation")}</span>
                </div>
                <span aria-hidden="true" className="bg-border w-8 h-px" />
                <div
                    className={
                        step === 1
                            ? "flex items-center justify-end gap-2 text-foreground"
                            : "flex items-center justify-end gap-2 text-muted-foreground"
                    }
                >
                    <span className="font-medium text-sm text-right">{t("stepAnswers")}</span>
                    <span
                        className={
                            step === 1
                                ? "place-items-center grid bg-primary rounded-full size-6 font-semibold text-primary-foreground text-xs"
                                : "place-items-center grid bg-muted rounded-full size-6 font-semibold text-xs"
                        }
                    >
                        2
                    </span>
                </div>
            </div>
            {step === 0 ? (
                <FieldGroup>
                    <Field data-invalid={ !!errors.title }>
                        <FieldLabel htmlFor="title">{t("titleLabel")}</FieldLabel>
                        <Input { ...form.register("title") } aria-invalid={ !!errors.title } id="title" />
                        {errors.title && <FieldError errors={ [ errors.title ] } />}
                    </Field>
                    <Controller
                        control={ form.control }
                        name="difficulty"
                        render={ ({ field, fieldState }) => (
                            <Field data-invalid={ fieldState.invalid }>
                                <FieldLabel htmlFor={ field.name }>{t("difficulty")}</FieldLabel>
                                <Select name={ field.name } onValueChange={ field.onChange } value={ field.value ?? "MEDIUM" }>
                                    <SelectTrigger aria-invalid={ fieldState.invalid } className="w-full" id={ field.name }>
                                        <SelectValue>
                                            {t(
                                                `difficulty${ (field.value ?? "MEDIUM").slice(0, 1) }${ (field.value ?? "MEDIUM").slice(1).toLowerCase() }`,
                                            )}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {difficulties.map(difficulty => (
                                            <SelectItem key={ difficulty } value={ difficulty }>
                                                {t(`difficulty${ difficulty.slice(0, 1) }${ difficulty.slice(1).toLowerCase() }`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && <FieldError errors={ [ fieldState.error ] } />}
                            </Field>
                        ) }
                    />
                    <Field data-invalid={ !!errors.origin }>
                        <FieldLabel htmlFor="origin">{t("origin")}</FieldLabel>
                        <Input { ...form.register("origin") } aria-invalid={ !!errors.origin } id="origin" />
                        {errors.origin && <FieldError errors={ [ errors.origin ] } />}
                    </Field>
                    <Field data-invalid={ !!errors.sourceUrl }>
                        <FieldLabel htmlFor="sourceUrl">{t("sourceUrl")}</FieldLabel>
                        <Input { ...form.register("sourceUrl") } aria-invalid={ !!errors.sourceUrl } id="sourceUrl" type="url" />
                        {errors.sourceUrl && <FieldError errors={ [ errors.sourceUrl ] } />}
                    </Field>
                </FieldGroup>
            ) : (
                <FieldGroup>
                    <Field data-invalid={ !!errors.canonicalAnswer }>
                        <FieldLabel htmlFor="canonicalAnswer">{t("canonicalAnswer")}</FieldLabel>
                        <Input { ...form.register("canonicalAnswer") } aria-invalid={ !!errors.canonicalAnswer } id="canonicalAnswer" />
                        {errors.canonicalAnswer && <FieldError errors={ [ errors.canonicalAnswer ] } />}
                    </Field>
                    <Field>
                        <FieldLabel>{t("aliases")}</FieldLabel>
                        <FieldDescription>{t("aliasesImportDescription")}</FieldDescription>
                        <Textarea aria-invalid={ !!aliasesImportError } onChange={ event => setAliasesImport(event.target.value) } placeholder={ t("aliasesImportPlaceholder") } rows={ 3 } value={ aliasesImport } />
                        {aliasesImportError && <FieldError errors={ [ { message: aliasesImportError } ] } />}
                        <Button className="w-fit" disabled={ !aliasesImport.trim() } onClick={ importAliases } size="sm" type="button" variant="outline">
                            {t("importAliases")}
                        </Button>
                        <div className="flex flex-col gap-2 max-h-36 overflow-y-auto">
                            {aliasFields.fields.map((alias, index) => (
                                <Field data-invalid={ !!errors.aliases?.[index]?.value } key={ alias.id } orientation="horizontal">
                                    <Input { ...form.register(`aliases.${ index }.value`) } aria-invalid={ !!errors.aliases?.[index]?.value } />
                                    <Button
                                        aria-label={ t("removeAlias") }
                                        onClick={ () => aliasFields.remove(index) }
                                        size="icon-sm"
                                        type="button"
                                        variant="ghost"
                                    >
                                        <Minus />
                                    </Button>
                                    {errors.aliases?.[index]?.value && <FieldError errors={ [ errors.aliases[index].value ] } />}
                                </Field>
                            ))}
                        </div>
                        <Button className="w-fit" onClick={ () => aliasFields.append({ value: "" }) } size="sm" type="button" variant="outline">
                            <Plus />
                            {t("addAlias")}
                        </Button>
                    </Field>
                    <Controller
                        control={ form.control }
                        name="image"
                        render={ ({ field, fieldState }) => (
                            <Field data-invalid={ fieldState.invalid }>
                                <FieldLabel htmlFor={ field.name }>{imageRequired ? t("image") : t("imageOptional")}</FieldLabel>
                                <Input
                                    accept="image/jpeg,image/png,image/webp"
                                    aria-invalid={ fieldState.invalid }
                                    id={ field.name }
                                    name={ field.name }
                                    onChange={ event => field.onChange(event.target.files?.[0]) }
                                    type="file"
                                />
                                <FieldDescription>{t("imageDescription")}</FieldDescription>
                                {fieldState.invalid && <FieldError errors={ [ fieldState.error ] } />}
                            </Field>
                        ) }
                    />
                </FieldGroup>
            )}
            <DialogFooter>
                {step === 0 ? (
                    <DialogClose render={ <Button type="button" variant="outline" /> }>{t("cancel")}</DialogClose>
                ) : (
                    <Button onClick={ () => setStep(0) } type="button" variant="outline">
                        {t("previousStep")}
                    </Button>
                )}
                {step === 0 ? (
                    <Button onClick={ moveToAnswers } type="button">
                        {t("nextStep")}
                    </Button>
                ) : (
                    <Button disabled={ form.formState.isSubmitting } onClick={ () => void form.handleSubmit(submit)() } type="button">
                        {meme ? t("save") : t("create")}
                    </Button>
                )}
            </DialogFooter>
        </form>
    );
};
