import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AppDatePicker } from "@/components/ui/AppDatePicker";
import dayjs from "dayjs";

function CreateDateField({ control }) {
  const { t } = useTranslation();

  return (
    <Controller
      name="date"
      control={control}
      render={({ field, fieldState }) => (
        <AppDatePicker
          label={t("date")}
          value={field.value ? dayjs(field.value) : null}
          onChange={(value) =>
            field.onChange(value ? value.format("YYYY-MM-DD") : "")
          }
          format="DD/MM/YYYY"
          disabled={false}
          error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
        />
      )}
    />
  );
}

export default CreateDateField;
