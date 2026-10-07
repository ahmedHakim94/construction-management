import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import { dailyWorkSchema } from "../schemas/dailyWork.schema";
import type { CreateDailyWorkPayload, DailyWorkFormValues } from "../types";

interface UseDailyWorkFormProps {
  open: boolean;
  dailyWork?: DailyWorkFormValues & {
    id: number;
    createdAt: string;
  };
  onSubmit: (values: CreateDailyWorkPayload) => Promise<void>;
}

export function useDailyWorkForm({
  open,
  dailyWork,
  onSubmit,
}: UseDailyWorkFormProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<DailyWorkFormValues>({
    resolver: zodResolver(dailyWorkSchema),
    defaultValues: {
      date: dayjs().format("YYYY-MM-DD"),
      projectId: "",
      contractorId: "",
      isExternal: false,
      externalContractorId: "",
      equipmentId: "",
      temporaryEquipmentName: "",
      startTime: "",
      endTime: "",
      hourRate: 0,
      fuelConsumption: 0,
      taskId: "",
      cost: 0,
      deduction: 0,
      deductionReason: "",
      notes: "",
    },
  });

  const [contractorId, isExternal, equipmentId, startTime, endTime, hourRate] =
    watch([
      "contractorId",
      "isExternal",
      "equipmentId",
      "startTime",
      "endTime",
      "hourRate",
    ]);

  const workingMinutes = useMemo(() => {
    if (!startTime || !endTime) return 0;

    const toMinutes = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const start = toMinutes(startTime);
    const end = toMinutes(endTime);

    if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;

    return end <= start ? end + 1440 - start : end - start;
  }, [startTime, endTime]);

  const workingDuration = useMemo(() => {
    if (!workingMinutes) return "";

    const hours = Math.floor(workingMinutes / 60);
    const minutes = workingMinutes % 60;

    if (isArabic) {
      return minutes ? `${hours} ساعة و ${minutes} دقيقة` : `${hours} ساعة`;
    }

    return minutes
      ? `${hours}h ${minutes}m`
      : `${hours} hour${hours === 1 ? "" : "s"}`;
  }, [workingMinutes, isArabic]);

  useEffect(() => {
    if (!open) return;

    const isExternalValue = Boolean(Number(dailyWork?.isExternal));

    reset({
      date: dailyWork?.date ?? dayjs().format("YYYY-MM-DD"),
      projectId: dailyWork?.projectId ?? "",
      contractorId: dailyWork?.isExternal
        ? ""
        : (dailyWork?.contractorId ?? ""),
      isExternal: isExternalValue,
      externalContractorId: isExternalValue
        ? (dailyWork?.contractorId ?? "")
        : "",
      equipmentId: isExternalValue ? "" : (dailyWork?.equipmentId ?? ""),
      temporaryEquipmentName: isExternalValue
        ? (dailyWork?.temporaryEquipmentName ?? "")
        : "",
      startTime: dailyWork?.startTime ?? "",
      endTime: dailyWork?.endTime ?? "",
      hourRate: dailyWork?.hourRate ?? 0,
      fuelConsumption: Number(dailyWork?.fuelConsumption ?? 0),
      taskId: dailyWork?.taskId ?? "",
      cost: Number(dailyWork?.cost ?? 0),
      deduction: Number(dailyWork?.deduction ?? 0),
      deductionReason: dailyWork?.deductionReason ?? "",
      notes: dailyWork?.notes ?? "",
    });
  }, [open, dailyWork, reset]);

  useEffect(() => {
    const cost = (workingMinutes / 60) * (Number(hourRate) || 0);

    setValue("cost", Math.round(cost * 100) / 100, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [workingMinutes, hourRate, setValue]);

  const handleFormSubmit = async (values: DailyWorkFormValues) => {
    const {
      date,
      startTime,
      endTime,
      isExternal,
      projectId,
      contractorId,
      externalContractorId,
      equipmentId,
      taskId,
      temporaryEquipmentName,
      hourRate,
      fuelConsumption,
      deduction,
      deductionReason,
      notes,
    } = values;

    const startDatetime = `${date} ${startTime}:00`;

    const endDate = dayjs(date).add(endTime <= startTime ? 1 : 0, "day");

    const endDatetime = `${endDate.format("YYYY-MM-DD")} ${endTime}:00`;

    const payload: CreateDailyWorkPayload = {
      projectId: Number(projectId),
      contractorId: Number(isExternal ? externalContractorId : contractorId),
      equipmentId: isExternal ? null : Number(equipmentId),
      taskId: Number(taskId),
      isExternal,
      temporaryEquipmentName: isExternal
        ? temporaryEquipmentName?.trim()
        : undefined,
      startDatetime,
      endDatetime,
      hourRate: Number(hourRate),
      fuelConsumption: Number(fuelConsumption) || 0,
      deduction: Number(deduction) || 0,
      deductionReason: deductionReason?.trim() || undefined,
      notes: notes?.trim() || undefined,
    };

    setLoading(true);

    try {
      await onSubmit(payload);
    } catch (error) {
      console.error("Failed to submit daily work:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    loading,
    isArabic,
    contractorId,
    isExternal,
    equipmentId,
    workingDuration,
    handleFormSubmit,
  };
}
