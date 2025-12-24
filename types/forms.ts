import { FieldValues } from "react-hook-form";
import { z } from "zod";

export type BaseField = {
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  dependencies?: string[];
  when?: (values: FieldValues) => boolean;
};

export type TextField = BaseField & {
  type: "text" | "email" | "password" | "number" | "date";
  min?: number;
  max?: number;
  step?: number | "any";
};

export type TextareaField = BaseField & {
  type: "textarea";
  rows?: number;
};

export type SelectField = BaseField & {
  type: "select";
  options: Array<{ label: string; value: string }>;
};

export type RadioField = BaseField & {
  type: "radio";
  options: Array<{ label: string; value: string }>;
};

export type CheckboxField = BaseField & {
  type: "checkbox";
};

export type ArrayField = BaseField & {
  type: "array";
  itemFields: DynamicFieldConfig[];
  minItems?: number;
  maxItems?: number;
  addLabel?: string;
};

export type DynamicFieldConfig =
  | TextField
  | TextareaField
  | SelectField
  | RadioField
  | CheckboxField
  | ArrayField;

export type StepId = string;

export type StepDescriptor = {
  id: StepId;
  title: string;
  description?: string;
  fields: string[];
};

export type StepsConfig = StepDescriptor[];

export type SchemasByField = Record<string, z.ZodTypeAny>;

export type SubmissionHandler<TValues extends FieldValues> = (values: TValues) => Promise<void> | void;
