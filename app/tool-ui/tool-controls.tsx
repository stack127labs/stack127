"use client";

import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Copy, Download, Minus, Plus, Search, X } from "lucide-react";
import {
  Button as RacButton,
  Calendar as RacCalendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Checkbox as RacCheckbox,
  ComboBox,
  DateInput,
  DatePicker,
  DateSegment,
  Dialog,
  Disclosure,
  DisclosurePanel,
  FieldError,
  Group,
  Heading,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  NumberField,
  Popover,
  Radio,
  RadioGroup,
  SearchField,
  Select as RacSelect,
  SelectValue,
  Slider,
  SliderFill,
  SliderOutput,
  SliderThumb,
  SliderTrack,
  Switch,
  Text,
  TextArea,
  TextField,
  type ButtonProps as RacButtonProps,
  type DateValue,
  type Key,
} from "react-aria-components";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEventHandler,
  type ReactNode,
  type Ref,
} from "react";
import styles from "./tool-controls.module.css";

export type ToolOption = {
  id: string;
  label: string;
  description?: string;
  searchText?: string;
};

type FieldCopy = {
  label: string;
  description?: string;
  error?: string | null;
  required?: boolean;
};

function ToolLabel({ label, required }: Pick<FieldCopy, "label" | "required">) {
  return (
    <Label className={styles.label}>
      {label}
      {required ? (
        <>
          <span aria-hidden="true" className={styles.requiredMark}>*</span>
          <span className={styles.visuallyHidden}> Required</span>
        </>
      ) : null}
    </Label>
  );
}

function FieldMessages({ description, error }: Pick<FieldCopy, "description" | "error">) {
  return (
    <>
      {description ? <Text className={styles.description} slot="description">{description}</Text> : null}
      <FieldError className={styles.error}>{error}</FieldError>
    </>
  );
}

export type ToolTextFieldProps = FieldCopy & {
  autoCapitalize?: "none" | "off" | "sentences" | "words" | "characters";
  autoComplete?: string;
  autoFocus?: boolean;
  dataFocusKey?: string;
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
  inputRef?: Ref<HTMLInputElement>;
  name?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  spellCheck?: boolean;
  type?: "text" | "email" | "url" | "password" | "tel";
  value?: string;
  className?: string;
};

export function ToolTextField({
  autoComplete = "off",
  autoCapitalize,
  autoFocus,
  className = "",
  dataFocusKey,
  description,
  error,
  inputMode,
  inputRef,
  label,
  name,
  onChange,
  placeholder,
  readOnly,
  required,
  spellCheck,
  type = "text",
  value,
}: ToolTextFieldProps) {
  return (
    <TextField
      autoFocus={autoFocus}
      className={`${styles.field} ${className}`}
      isInvalid={Boolean(error)}
      isReadOnly={readOnly}
      isRequired={required}
      name={name}
      onChange={onChange}
      type={type}
      validationBehavior="aria"
      value={value}
    >
      <ToolLabel label={label} required={required} />
      <Input
        autoComplete={autoComplete}
        autoCapitalize={autoCapitalize}
        className={styles.input}
        data-focus-key={dataFocusKey}
        inputMode={inputMode}
        placeholder={placeholder}
        ref={inputRef}
        spellCheck={spellCheck}
      />
      <FieldMessages description={description} error={error} />
    </TextField>
  );
}

export type ToolSearchFieldProps = FieldCopy & {
  onChange?: (value: string) => void;
  placeholder?: string;
  value?: string;
};

export function ToolSearchField({ description, error, label, onChange, placeholder, required, value }: ToolSearchFieldProps) {
  return (
    <SearchField
      className={styles.field}
      isInvalid={Boolean(error)}
      isRequired={required}
      onChange={onChange}
      validationBehavior="aria"
      value={value}
    >
      <ToolLabel label={label} required={required} />
      <Group className={styles.searchControl}>
        <Search aria-hidden="true" className={styles.leadingIcon} size={18} />
        <Input autoComplete="off" className={styles.searchInput} placeholder={placeholder} />
        <RacButton aria-label={`Clear ${label}`} className={styles.clearButton} slot="clear">
          <X aria-hidden="true" size={16} />
        </RacButton>
      </Group>
      <FieldMessages description={description} error={error} />
    </SearchField>
  );
}

export type ToolTextAreaProps = FieldCopy & {
  autoCapitalize?: "none" | "off" | "sentences" | "words" | "characters";
  className?: string;
  inputRef?: Ref<HTMLTextAreaElement>;
  name?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  spellCheck?: boolean;
  value?: string;
};

export function ToolTextArea({ autoCapitalize, className = "", description, error, inputRef, label, name, onChange, placeholder, required, rows = 4, spellCheck, value }: ToolTextAreaProps) {
  return (
    <TextField
      className={`${styles.field} ${className}`}
      isInvalid={Boolean(error)}
      isRequired={required}
      onChange={onChange}
      validationBehavior="aria"
      value={value}
    >
      <ToolLabel label={label} required={required} />
      <TextArea autoCapitalize={autoCapitalize} className={styles.textarea} name={name} placeholder={placeholder} ref={inputRef} rows={rows} spellCheck={spellCheck} />
      <FieldMessages description={description} error={error} />
    </TextField>
  );
}

export type ToolDatePickerProps = FieldCopy & {
  disabled?: boolean;
  maxValue?: DateValue;
  minValue?: DateValue;
  onChange?: (value: DateValue | null) => void;
  value?: DateValue | null;
};

export function ToolDatePicker({ description, disabled, error, label, maxValue, minValue, onChange, required, value }: ToolDatePickerProps) {
  return (
    <DatePicker
      className={styles.field}
      isDisabled={disabled}
      isInvalid={Boolean(error)}
      isRequired={required}
      maxValue={maxValue}
      minValue={minValue}
      onChange={onChange}
      validationBehavior="aria"
      value={value ?? null}
    >
      <ToolLabel label={label} required={required} />
      <Group className={styles.dateControl}>
        <DateInput className={styles.dateInput}>
          {(segment) => <DateSegment className={styles.dateSegment} segment={segment} />}
        </DateInput>
        <RacButton aria-label={`Open ${label} calendar`} className={styles.dateButton}>
          <CalendarDays aria-hidden="true" size={18} />
        </RacButton>
      </Group>
      <FieldMessages description={description} error={error} />
      <Popover className={`${styles.popover} ${styles.calendarPopover}`} placement="bottom start">
        <Dialog className={styles.calendarDialog}>
          <RacCalendar className={styles.calendar}>
            <header className={styles.calendarHeader}>
              <RacButton aria-label="Previous month" className={styles.calendarButton} slot="previous">
                <ChevronLeft aria-hidden="true" size={18} />
              </RacButton>
              <Heading className={styles.calendarHeading} />
              <RacButton aria-label="Next month" className={styles.calendarButton} slot="next">
                <ChevronRight aria-hidden="true" size={18} />
              </RacButton>
            </header>
            <CalendarGrid className={styles.calendarGrid}>
              <CalendarGridHeader>
                {(day) => <CalendarHeaderCell className={styles.calendarHeaderCell}>{day}</CalendarHeaderCell>}
              </CalendarGridHeader>
              <CalendarGridBody>
                {(date) => <CalendarCell className={styles.calendarCell} date={date} />}
              </CalendarGridBody>
            </CalendarGrid>
          </RacCalendar>
        </Dialog>
      </Popover>
    </DatePicker>
  );
}

export type ToolSelectProps = FieldCopy & {
  ariaLabel?: string;
  dataFocusKey?: string;
  disabled?: boolean;
  hideLabel?: boolean;
  name?: string;
  onChange?: (value: string) => void;
  options: ToolOption[];
  placeholder?: string;
  value?: string | null;
};

export function ToolSelect({
  ariaLabel,
  dataFocusKey,
  description,
  disabled,
  error,
  hideLabel,
  label,
  name,
  onChange,
  options,
  placeholder = "Select an option",
  required,
  value,
}: ToolSelectProps) {
  const accessibleLabel = ariaLabel ?? label;
  return (
    <RacSelect
      aria-label={accessibleLabel}
      className={styles.field}
      isDisabled={disabled}
      isInvalid={Boolean(error)}
      isRequired={required}
      name={name}
      onChange={(key) => onChange?.(String(key))}
      placeholder={placeholder}
      validationBehavior="aria"
      value={value ?? null}
    >
      <div className={hideLabel ? styles.visuallyHidden : undefined}>
        <ToolLabel label={label} required={required} />
      </div>
      <RacButton className={styles.selectTrigger} data-focus-key={dataFocusKey} data-tool-label={accessibleLabel}>
        <SelectValue className={styles.selectValue} />
        <ChevronDown aria-hidden="true" size={18} />
      </RacButton>
      <FieldMessages description={description} error={error} />
      <Popover className={styles.popover} placement="bottom start">
        <ListBox className={styles.listbox} items={options}>
          {(option) => (
            <ListBoxItem
              aria-label={option.label}
              className={styles.option}
              id={option.id}
              textValue={option.label}
            >
              <span>{option.label}</span>
              {option.description ? <Text className={styles.optionDescription} slot="description">{option.description}</Text> : null}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </RacSelect>
  );
}

export type ToolComboBoxProps = FieldCopy & {
  onChange?: (value: string | null) => void;
  options: ToolOption[];
  placeholder?: string;
  value?: string | null;
};

export function ToolComboBox({ description, error, label, onChange, options, placeholder, required, value }: ToolComboBoxProps) {
  const triggerLabelId = useId();

  return (
    <ComboBox
      className={styles.field}
      defaultItems={options}
      isInvalid={Boolean(error)}
      isRequired={required}
      onChange={(key) => onChange?.(key === null ? null : String(key))}
      validationBehavior="aria"
      value={value ?? null}
    >
      <ToolLabel label={label} required={required} />
      <span className={styles.visuallyHidden} id={triggerLabelId}>Open {label}</span>
      <Group className={styles.comboControl}>
        <Input autoComplete="off" className={styles.comboInput} placeholder={placeholder} />
        <RacButton aria-labelledby={triggerLabelId} className={styles.comboButton}>
          <ChevronDown aria-hidden="true" size={18} />
        </RacButton>
      </Group>
      <FieldMessages description={description} error={error} />
      <Popover className={styles.popover} placement="bottom start" shouldFlip={false}>
        <ListBox className={styles.listbox}>
          {(option: ToolOption) => (
            <ListBoxItem
              aria-label={option.label}
              className={styles.option}
              id={option.id}
              textValue={option.label}
            >
              <span>{option.label}</span>
              {option.description ? <Text className={styles.optionDescription} slot="description">{option.description}</Text> : null}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </ComboBox>
  );
}

export type ToolNumberFieldProps = FieldCopy & {
  ariaLabel?: string;
  dataFocusKey?: string;
  disabled?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  max?: number;
  min?: number;
  name?: string;
  onChange?: (value: number) => void;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  step?: number;
  suffix?: string;
  value?: number;
};

export function ToolNumberField({
  ariaLabel,
  dataFocusKey,
  description,
  disabled,
  error,
  inputRef,
  label,
  max,
  min,
  name,
  onChange,
  onKeyDown,
  required,
  step = 1,
  suffix,
  value,
}: ToolNumberFieldProps) {
  const accessibleLabel = ariaLabel ?? label;

  return (
    <NumberField
      aria-label={accessibleLabel}
      className={styles.field}
      isDisabled={disabled}
      isInvalid={Boolean(error)}
      isRequired={required}
      maxValue={max}
      minValue={min}
      name={name}
      onChange={onChange}
      step={step}
      validationBehavior="aria"
      value={value}
    >
      <div className={styles.label}>
        {label}
        {required ? <span aria-hidden="true" className={styles.requiredMark}>*</span> : null}
      </div>
      <Group className={styles.numberControl}>
        <RacButton aria-label={`Decrease ${accessibleLabel}`} className={styles.stepButton} slot="decrement">
          <Minus aria-hidden="true" size={16} />
        </RacButton>
        <Input className={styles.numberInput} data-focus-key={dataFocusKey} inputMode="decimal" onKeyDown={onKeyDown} ref={inputRef} />
        {suffix ? <span className={styles.numberSuffix}>{suffix}</span> : null}
        <RacButton aria-label={`Increase ${accessibleLabel}`} className={styles.stepButton} slot="increment">
          <Plus aria-hidden="true" size={16} />
        </RacButton>
      </Group>
      <FieldMessages description={description} error={error} />
    </NumberField>
  );
}

export type ToolQuantityFieldProps = ToolNumberFieldProps & {
  onUnitChange?: (value: string) => void;
  unit: string;
  units: ToolOption[];
};

export function ToolQuantityField({
  description,
  disabled,
  error,
  label,
  max,
  min,
  name,
  onChange,
  onUnitChange,
  required,
  step = 1,
  unit,
  units,
  value,
}: ToolQuantityFieldProps) {
  return (
    <div className={styles.field}>
      <div className={styles.label}>
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className={styles.requiredMark}>*</span>
            <span className={styles.visuallyHidden}> Required</span>
          </>
        ) : null}
      </div>
      <div className={styles.quantityControl}>
        <NumberField
          aria-label={label}
          className={styles.quantityNumber}
          isDisabled={disabled}
          isInvalid={Boolean(error)}
          isRequired={required}
          maxValue={max}
          minValue={min}
          name={name}
          onChange={onChange}
          step={step}
          validationBehavior="aria"
          value={value}
        >
          <Group className={styles.quantityNumberGroup}>
            <RacButton aria-label={`Decrease ${label}`} className={styles.stepButton} slot="decrement">
              <Minus aria-hidden="true" size={16} />
            </RacButton>
            <Input className={styles.numberInput} inputMode="decimal" />
            <RacButton aria-label={`Increase ${label}`} className={styles.stepButton} slot="increment">
              <Plus aria-hidden="true" size={16} />
            </RacButton>
          </Group>
        </NumberField>
        <div className={styles.quantityUnit}>
          <ToolSelect
            ariaLabel={`${label} unit`}
            disabled={disabled}
            hideLabel
            label={`${label} unit`}
            onChange={onUnitChange}
            options={units}
            value={unit}
          />
        </div>
      </div>
      {description ? <p className={styles.description}>{description}</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}

export type ToolQuantityInputProps = FieldCopy & {
  ariaLabel?: string;
  dataFocusKey?: string;
  hideLabel?: boolean;
  onChange?: (value: string) => void;
  onUnitChange?: (value: string) => void;
  placeholder?: string;
  unit: string;
  unitAriaLabel?: string;
  units: ToolOption[];
  value: string;
};

export function ToolQuantityInput({
  ariaLabel,
  dataFocusKey,
  description,
  error,
  hideLabel,
  label,
  onChange,
  onUnitChange,
  placeholder,
  required,
  unit,
  unitAriaLabel,
  units,
  value,
}: ToolQuantityInputProps) {
  const inputId = useId();
  const errorId = useId();

  return (
    <div className={styles.field}>
      <label className={hideLabel ? styles.visuallyHidden : styles.label} htmlFor={inputId}>
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className={styles.requiredMark}>*</span>
            <span className={styles.visuallyHidden}> Required</span>
          </>
        ) : null}
      </label>
      <div className={styles.quantityControl} data-invalid={Boolean(error) || undefined}>
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          aria-label={ariaLabel}
          className={styles.quantityTextInput}
          data-focus-key={dataFocusKey}
          id={inputId}
          inputMode="decimal"
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          required={required}
          value={value}
        />
        <div className={styles.quantityUnit}>
          <ToolSelect
            ariaLabel={unitAriaLabel ?? `${label} unit`}
            hideLabel
            label={`${label} unit`}
            onChange={onUnitChange}
            options={units}
            value={unit}
          />
        </div>
      </div>
      {description ? <p className={styles.description}>{description}</p> : null}
      {error ? <p className={styles.error} id={errorId} role="alert">{error}</p> : null}
    </div>
  );
}

export type ToolChoiceGroupProps = FieldCopy & {
  dataFocusKey?: string;
  onChange?: (value: string) => void;
  options: ToolOption[];
  value?: string;
};

export function ToolChoiceGroup({ dataFocusKey, description, error, label, onChange, options, required, value }: ToolChoiceGroupProps) {
  return (
    <RadioGroup
      className={styles.field}
      isInvalid={Boolean(error)}
      isRequired={required}
      onChange={onChange}
      validationBehavior="aria"
      value={value}
    >
      <ToolLabel label={label} required={required} />
      <div className={styles.choiceRow}>
        {options.map((option) => (
          <Radio className={styles.choice} data-focus-key={option.id === options[0]?.id ? dataFocusKey : undefined} id={option.id} key={option.id} value={option.id}>
            {option.label}
          </Radio>
        ))}
      </div>
      <FieldMessages description={description} error={error} />
    </RadioGroup>
  );
}

export function ToolCheckbox({ children, isDisabled, isSelected, onChange }: { children: ReactNode; isDisabled?: boolean; isSelected?: boolean; onChange?: (selected: boolean) => void }) {
  return (
    <RacCheckbox className={styles.check} isDisabled={isDisabled} isSelected={isSelected} onChange={onChange}>
      <span aria-hidden="true" className={styles.checkBox}>✓</span>
      <span>{children}</span>
    </RacCheckbox>
  );
}

export function ToolSwitch({ children, isSelected, onChange }: { children: ReactNode; isSelected?: boolean; onChange?: (selected: boolean) => void }) {
  return (
    <Switch className={styles.switch} isSelected={isSelected} onChange={onChange}>
      <span aria-hidden="true" className={styles.switchTrack}><span /></span>
      <span>{children}</span>
    </Switch>
  );
}

type SliderCopy = {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  formatOptions?: Intl.NumberFormatOptions;
};

export function ToolSlider({ label, min = 0, max = 100, step = 1, value, onChange, formatOptions }: SliderCopy & { value: number; onChange?: (value: number) => void }) {
  return (
    <Slider className={styles.slider} formatOptions={formatOptions} maxValue={max} minValue={min} onChange={onChange} step={step} value={value}>
      <div className={styles.sliderHeader}>
        <Label className={styles.label}>{label}</Label>
        <SliderOutput className={styles.sliderOutput} />
      </div>
      <SliderTrack className={styles.sliderTrack}>
        <SliderFill className={styles.sliderFill} />
        <SliderThumb aria-label={label} className={styles.sliderThumb} />
      </SliderTrack>
    </Slider>
  );
}

export function ToolRangeSlider({ label, min = 0, max = 100, step = 1, value, onChange, formatOptions }: SliderCopy & { value: number[]; onChange?: (value: number[]) => void }) {
  return (
    <Slider className={styles.slider} formatOptions={formatOptions} maxValue={max} minValue={min} onChange={onChange} step={step} value={value}>
      <div className={styles.sliderHeader}>
        <Label className={styles.label}>{label}</Label>
        <SliderOutput className={styles.sliderOutput}>
          {({ state }) => state.values.map((item) => state.getFormattedValue(item)).join(" to ")}
        </SliderOutput>
      </div>
      <SliderTrack className={styles.sliderTrack}>
        <SliderFill className={styles.sliderFill} />
        <SliderThumb aria-label={`${label} minimum`} className={styles.sliderThumb} index={0} />
        <SliderThumb aria-label={`${label} maximum`} className={styles.sliderThumb} index={1} />
      </SliderTrack>
    </Slider>
  );
}

export type ToolLevel = Readonly<{
  description?: string;
  id: string;
  label: string;
}>;

export function ToolLevelSlider({ label, levels, onChange, value }: { label: string; levels: readonly ToolLevel[]; onChange?: (value: string) => void; value: string }) {
  const selectedIndex = Math.max(0, levels.findIndex((level) => level.id === value));
  const selected = levels[selectedIndex];
  if (!selected || levels.length < 2) return null;

  return (
    <Slider
      className={`${styles.slider} ${styles.levelSlider}`}
      maxValue={levels.length - 1}
      minValue={0}
      onChange={(next) => onChange?.(levels[Math.round(next)]?.id ?? levels[0].id)}
      step={1}
      value={selectedIndex}
    >
      <div className={styles.sliderHeader}>
        <Label className={styles.label}>{label}</Label>
        <SliderOutput className={styles.levelOutput}>{selected.label}</SliderOutput>
      </div>
      <SliderTrack className={styles.sliderTrack} data-tool-level-track>
        <SliderFill className={styles.sliderFill} data-tool-level-fill />
        <SliderThumb aria-label={label} aria-valuetext={selected.label} className={styles.sliderThumb} />
      </SliderTrack>
      <div aria-hidden="true" className={styles.levelMarks} style={{ gridTemplateColumns: `repeat(${levels.length}, minmax(0, 1fr))` }}>
        {levels.map((level) => <span data-selected={level.id === selected.id || undefined} key={level.id}>{level.label}</span>)}
      </div>
      {selected.description ? <p className={styles.levelDescription}>{selected.description}</p> : null}
    </Slider>
  );
}

export type ToolButtonProps = Omit<RacButtonProps, "className"> & {
  className?: string;
  ref?: Ref<HTMLButtonElement>;
  title?: string;
  variant?: "primary" | "secondary" | "ghost" | "icon";
};

export function ToolButton({ className = "", variant = "secondary", ...props }: ToolButtonProps) {
  return <RacButton {...props} className={`${styles.button} ${styles[variant]} ${className}`} />;
}

export function ToolActionRow({ children }: { children: ReactNode }) {
  return <div className={styles.actionRow}>{children}</div>;
}

export function ToolDisclosure({ children, label }: { children: ReactNode; label: string }) {
  return (
    <Disclosure className={styles.disclosure}>
      <Heading className={styles.disclosureHeading}>
        <RacButton className={styles.disclosureButton} slot="trigger">
          <ChevronRight aria-hidden="true" size={17} />
          {label}
        </RacButton>
      </Heading>
      <DisclosurePanel className={styles.disclosurePanel}>{children}</DisclosurePanel>
    </Disclosure>
  );
}

export function ToolRepeatableList<T extends { id: string }>({
  addDisabled = false,
  addLabel,
  ariaLabel,
  items,
  onAdd,
  onRemove,
  removeLabel,
  renderItem,
}: {
  addDisabled?: boolean;
  addLabel: string;
  ariaLabel: string;
  items: T[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  removeLabel?: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
}) {
  const previousCount = useRef(items.length);
  const rows = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (items.length > previousCount.current) {
      const lastRow = rows.current?.querySelector<HTMLElement>("[data-repeatable-row]:last-child input, [data-repeatable-row]:last-child button");
      lastRow?.focus();
    }
    previousCount.current = items.length;
  }, [items.length]);

  return (
    <section aria-label={ariaLabel} className={styles.repeatable}>
      <div className={styles.repeatableRows} ref={rows}>
        {items.map((item, index) => (
          <div className={styles.repeatableRow} data-repeatable-row data-testid="drive-row" key={item.id}>
            <div className={styles.repeatableContent}>{renderItem(item, index)}</div>
            <ToolButton aria-label={removeLabel?.(item, index) ?? `Remove drive ${index + 1}`} onPress={() => onRemove(item.id)} variant="icon">
              <X aria-hidden="true" size={17} />
            </ToolButton>
          </div>
        ))}
      </div>
      <ToolButton isDisabled={addDisabled} onPress={onAdd} variant="secondary">
        <Plus aria-hidden="true" size={17} />
        {addLabel}
      </ToolButton>
    </section>
  );
}

export function ToolStatus({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" }) {
  return <p aria-live="polite" className={styles.status} data-tone={tone} role={tone === "danger" ? "alert" : "status"}>{children}</p>;
}

export function ToolResultLead({ children, inputRef }: { children: ReactNode; inputRef?: Ref<HTMLParagraphElement> }) {
  return <p className={styles.resultLead} ref={inputRef} tabIndex={inputRef ? -1 : undefined}>{children}</p>;
}

export function ToolPrimaryResult({
  detail,
  inputRef,
  label,
  tone = "neutral",
  unit,
  value,
}: {
  detail?: ReactNode;
  inputRef?: Ref<HTMLOutputElement>;
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger";
  unit?: ReactNode;
  value: ReactNode;
}) {
  return (
    <output aria-label={label} className={styles.primaryResult} data-tone={tone} ref={inputRef} tabIndex={inputRef ? -1 : undefined}>
      <span className={styles.primaryResultLabel}>{label}</span>
      <span className={styles.primaryResultLine}>
        <strong className={styles.primaryResultValue}>{value}</strong>
        {unit ? <span className={styles.primaryResultUnit}> {unit}</span> : null}
      </span>
      {detail ? <span className={styles.primaryResultDetail}>{detail}</span> : null}
    </output>
  );
}

export function ToolProgressBar({
  label,
  max = 100,
  value,
  valueText,
}: {
  label: string;
  max?: number;
  value: number;
  valueText?: string;
}) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue = Math.min(safeMax, Math.max(0, Number.isFinite(value) ? value : 0));
  const display = valueText ?? `${Math.round((safeValue / safeMax) * 100)}%`;

  return (
    <figure className={styles.progressFigure}>
      <figcaption className={styles.progressHeader}>
        <span>{label}</span>
        <strong>{display}</strong>
      </figcaption>
      <progress aria-label={label} aria-valuetext={display} className={styles.progressBar} max={safeMax} value={safeValue} />
    </figure>
  );
}

export type ToolAllocationPalette = "neutral" | "accent" | "categorical";

export type ToolAllocationTone =
  | "strong"
  | "medium"
  | "light"
  | "empty"
  | "accent"
  | "chartreuse"
  | "cyan"
  | "blue"
  | "yellow"
  | "red"
  | "violet"
  | "green";

export type ToolAllocationSegment = {
  id: string;
  label: string;
  tone?: ToolAllocationTone;
  value: number | bigint;
};

const allocationPalettes: Record<ToolAllocationPalette, readonly ToolAllocationTone[]> = {
  neutral: ["strong", "medium", "light", "empty"],
  accent: ["accent", "strong", "light", "empty"],
  categorical: ["chartreuse", "cyan", "blue", "yellow", "red", "violet", "green"],
};

function allocationClass(tone: ToolAllocationTone) {
  return styles[`allocation${tone[0].toUpperCase()}${tone.slice(1)}`];
}

function positiveAllocationValue(value: number | bigint) {
  if (typeof value === "bigint") return value > 0n ? value : 0n;
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function isPositiveAllocationValue(value: number | bigint) {
  return typeof value === "bigint" ? value > 0n : value > 0;
}

function allocationWidth(value: number | bigint, scale: number | bigint) {
  if (typeof value === "bigint" && typeof scale === "bigint") {
    if (scale <= 0n) return "0%";
    const precision = 1_000_000n;
    const scaled = value * 100n * precision / scale;
    const whole = scaled / precision;
    const fraction = (scaled % precision).toString().padStart(6, "0").replace(/0+$/, "");
    return `${whole}${fraction ? `.${fraction}` : ""}%`;
  }
  const numericValue = typeof value === "bigint" ? parseFloat(value.toString()) : value;
  const numericScale = typeof scale === "bigint" ? parseFloat(scale.toString()) : scale;
  return `${numericScale > 0 ? numericValue / numericScale * 100 : 0}%`;
}

export function ToolAllocationBar({
  ariaLabel,
  formatValue = (value) => value.toLocaleString("en-US"),
  palette = "neutral",
  segments,
  total,
}: {
  ariaLabel: string;
  formatValue?: (value: number | bigint) => string;
  palette?: ToolAllocationPalette;
  segments: ToolAllocationSegment[];
  total?: number | bigint;
}) {
  const normalized = segments.map((segment) => ({
    ...segment,
    value: positiveAllocationValue(segment.value),
  }));
  const allBigInt = normalized.every((segment) => typeof segment.value === "bigint")
    && (total === undefined || typeof total === "bigint");
  const segmentTotal = allBigInt
    ? normalized.reduce((sum, segment) => sum + (segment.value as bigint), 0n)
    : normalized.reduce((sum, segment) => sum + (typeof segment.value === "bigint" ? parseFloat(segment.value.toString()) : segment.value), 0);
  const normalizedTotal = total === undefined ? (allBigInt ? 0n : 0) : positiveAllocationValue(total);
  const scale = allBigInt
    ? [segmentTotal as bigint, normalizedTotal as bigint, 1n].reduce((largest, value) => value > largest ? value : largest)
    : Math.max(segmentTotal as number, typeof normalizedTotal === "bigint" ? parseFloat(normalizedTotal.toString()) : normalizedTotal, 1);
  const paletteTones = allocationPalettes[palette];

  return (
    <figure aria-label={ariaLabel} className={styles.allocationFigure} data-allocation-palette={palette}>
      <div aria-hidden="true" className={styles.allocationBar}>
        {normalized.map((segment, index) => {
          const tone = segment.tone ?? paletteTones[index % paletteTones.length];
          return isPositiveAllocationValue(segment.value) ? (
            <span
              aria-hidden="true"
              className={`${styles.allocationSegment} ${allocationClass(tone)}`}
              data-allocation-segment={segment.id}
              key={segment.id}
              style={{ width: allocationWidth(segment.value, scale) }}
            />
          ) : null;
        })}
      </div>
      <figcaption>
        <ul className={styles.allocationLegend}>
          {normalized.map((segment, index) => {
            const tone = segment.tone ?? paletteTones[index % paletteTones.length];
            return (
              <li key={segment.id}>
                <span aria-hidden="true" className={`${styles.allocationSwatch} ${allocationClass(tone)}`} />
                <span>{segment.label}</span>
                <strong>{formatValue(segment.value)}</strong>
              </li>
            );
          })}
        </ul>
      </figcaption>
    </figure>
  );
}

function outputText(value: unknown) {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}

export function ToolRawOutput({ label, value }: { label: string; value: unknown }) {
  return (
    <ToolDisclosure label={label}>
      <div className={styles.rawViewport}>
        <pre tabIndex={0}><code>{outputText(value)}</code></pre>
      </div>
    </ToolDisclosure>
  );
}

export function ToolCodeOutput({
  actions,
  code,
  label,
}: {
  actions?: ReactNode;
  code: string;
  label: string;
}) {
  return (
    <section aria-label={label} className={styles.codeOutput}>
      <header className={styles.codeHeader}>
        <h3>{label}</h3>
        {actions ? <div className={styles.codeActions}>{actions}</div> : null}
      </header>
      <div className={styles.codeViewport}>
        <pre tabIndex={0}><code>{code}</code></pre>
      </div>
    </section>
  );
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
      previousFocus?.focus({ preventScroll: true });
    }
  }
}

export function ToolCopyAction({
  failureLabel = "Copy failed",
  label = "Copy",
  successLabel = "Copied",
  value,
  variant = "secondary",
  withManualFallback = false,
}: {
  failureLabel?: string;
  label?: string;
  successLabel?: string;
  value: string;
  variant?: ToolButtonProps["variant"];
  withManualFallback?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copy() {
    const didCopy = await copyText(value);
    setFailed(!didCopy);
    if (!didCopy) {
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className={styles.copyAction}>
      <ToolButton aria-label={failed ? failureLabel : copied ? successLabel : label} onPress={copy} variant={variant}>
        {copied ? <Check aria-hidden="true" size={17} /> : <Copy aria-hidden="true" size={17} />}
        {failed ? failureLabel : copied ? successLabel : label}
      </ToolButton>
      {failed && withManualFallback ? (
        <div className={styles.copyFallback}>
          <label>Select and copy this text manually.</label>
          <textarea onFocus={(event) => event.currentTarget.select()} readOnly rows={5} value={value} />
        </div>
      ) : null}
    </div>
  );
}

export function ToolDownloadAction({
  contents,
  filename,
  label = "Download",
  mimeType = "text/plain;charset=utf-8",
  variant = "secondary",
}: {
  contents: BlobPart;
  filename: string;
  label?: string;
  mimeType?: string;
  variant?: ToolButtonProps["variant"];
}) {
  function download() {
    const url = URL.createObjectURL(new Blob([contents], { type: mimeType }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <ToolButton aria-label={label} onPress={download} variant={variant}>
      <Download aria-hidden="true" size={17} />
      {label}
    </ToolButton>
  );
}

export type ToolMetric = {
  id: string;
  label: string;
  unit?: ReactNode;
  value: ReactNode;
};

export function ToolMetricGroup({ ariaLabel, items }: { ariaLabel: string; items: ToolMetric[] }) {
  return (
    <dl aria-label={ariaLabel} className={styles.metricGroup}>
      {items.map((item) => (
        <div key={item.id}>
          <dt>{item.label}</dt>
          <dd>
            <strong>{item.value}</strong>
            {item.unit ? <span>{item.unit}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export type ToolTimelineEvent = {
  dateTime?: string;
  id: string;
  label: string;
  state?: "past" | "current" | "future";
  value: ReactNode;
};

export function ToolTimeline({ ariaLabel, events }: { ariaLabel: string; events: ToolTimelineEvent[] }) {
  return (
    <ol aria-label={ariaLabel} className={styles.timeline}>
      {events.map((event) => (
        <li aria-current={event.state === "current" ? "step" : undefined} data-state={event.state} key={event.id}>
          <span className={styles.timelineLabel}>{event.label}</span>
          {event.dateTime && typeof event.value === "string" ? (
            <time dateTime={event.dateTime}>{event.value}</time>
          ) : (
            <strong>{event.value}</strong>
          )}
        </li>
      ))}
    </ol>
  );
}

export function ToolKeyValueList({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className={styles.keyValues}>
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ToolDataTable({
  ariaLabel,
  columns,
  rows,
}: {
  ariaLabel: string;
  columns: { id: string; label: string }[];
  rows: { id: string; cells: Record<string, ReactNode> }[];
}) {
  return (
    <div className={styles.tableScroll}>
      <table aria-label={ariaLabel} className={styles.table}>
        <thead>
          <tr>{columns.map((column) => <th key={column.id} scope="col">{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column, index) => index === 0
                ? <th data-label={column.label} key={column.id} scope="row">{row.cells[column.id]}</th>
                : <td data-label={column.label} key={column.id}>{row.cells[column.id]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function toolOption(id: Key, label: string, description?: string): ToolOption {
  return { id: String(id), label, description };
}
