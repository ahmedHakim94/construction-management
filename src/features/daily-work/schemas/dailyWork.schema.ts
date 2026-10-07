import { z } from "zod";

export const dailyWorkSchema = z
  .object({
    date: z.string().min(1, "dateRequired"),
    projectId: z.union([z.number(), z.literal("")]),
    contractorId: z.union([z.number(), z.literal("")]),
    isExternal: z.boolean(),
    externalContractorId: z.union([z.number(), z.literal("")]),
    equipmentId: z.union([z.number(), z.literal("")]),
    temporaryEquipmentName: z.string().optional(),
    startTime: z.string().min(1, "startTimeRequired"),
    endTime: z.string().min(1, "endTimeRequired"),
    hourRate: z.number().min(0),
    fuelConsumption: z.number().min(0),
    taskId: z.union([z.number(), z.literal("")]),
    cost: z.number().min(0),
    deduction: z.number().min(0),
    deductionReason: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    const addRequiredError = (
      field: "projectId" | "taskId" | "contractorId" |
        "equipmentId" | "externalContractorId",
      message: string,
    ) => {
      if (!values[field]) {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message,
        });
      }
    };

    addRequiredError("projectId", "projectRequired");
    addRequiredError("taskId", "taskRequired");

    if (values.isExternal) {
      addRequiredError(
        "externalContractorId",
        "externalContractorRequired",
      );

      if (!values.temporaryEquipmentName?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["temporaryEquipmentName"],
          message: "temporaryEquipmentNameRequired",
        });
      }

      if (values.hourRate <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["hourRate"],
          message: "hourRateRequired",
        });
      }
    } else {
      addRequiredError("contractorId", "contractorRequired");
      addRequiredError("equipmentId", "equipmentRequired");
    }
  });

export type DailyWorkFormValues = z.infer<typeof dailyWorkSchema>;