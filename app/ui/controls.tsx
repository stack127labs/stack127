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
import styles from "./controls.module.css";

export type UiOption = {
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

function UiLabel({ label, required }: Pick<FieldCopy, "label" | "required">) {
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

export type UiTextFieldProps = FieldCopy & {
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
  suffix?: string;
  type?: "text" | "email" | "url" | "password" | "tel";
  value?: string;
  className?: string;
};

export function UiTextField({
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
  suffix,
  type = "text",
  value,
}: UiTextFieldProps) {
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
      <UiLabel label={label} required={required} />
      {suffix ? (
        <Group className={styles.numberControl}>
          <Input
            autoComplete={autoComplete}
            autoCapitalize={autoCapitalize}
            className={styles.numberInput}
            data-focus-key={dataFocusKey}
            inputMode={inputMode}
            placeholder={placeholder}
            ref={inputRef}
            spellCheck={spellCheck}
          />
          <span aria-hidden="true" className={styles.numberSuffix}>{suffix}</span>
        </Group>
      ) : (
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
      )}
      <FieldMessages description={description} error={error} />
    </TextField>
  );
}

export type UiSearchFieldProps = FieldCopy & {
  name?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  value?: string;
};

export function UiSearchField({ description, error, label, name, onChange, placeholder, required, value }: UiSearchFieldProps) {
  return (
    <SearchField
      className={styles.field}
      name={name}
      isInvalid={Boolean(error)}
      isRequired={required}
      onChange={onChange}
      validationBehavior="aria"
      value={value}
    >
      <UiLabel label={label} required={required} />
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

export type UiTextAreaProps = FieldCopy & {
  autoCapitalize?: "none" | "off" | "sentences" | "words" | "characters";
  className?: string;
  inputRef?: Ref<HTMLTextAreaElement>;
  name?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  rows?: number;
  spellCheck?: boolean;
  value?: string;
};

export function UiTextArea({ autoCapitalize, className = "", description, error, inputRef, label, name, onChange, placeholder, readOnly, required, rows = 4, spellCheck, value }: UiTextAreaProps) {
  return (
    <TextField
      className={`${styles.field} ${className}`}
      isInvalid={Boolean(error)}
      isReadOnly={readOnly}
      isRequired={required}
      onChange={onChange}
      validationBehavior="aria"
      value={value}
    >
      <UiLabel label={label} required={required} />
      <TextArea autoCapitalize={autoCapitalize} className={styles.textarea} name={name} placeholder={placeholder} ref={inputRef} rows={rows} spellCheck={spellCheck} />
      <FieldMessages description={description} error={error} />
    </TextField>
  );
}

export type UiDatePickerProps = FieldCopy & {
  disabled?: boolean;
  maxValue?: DateValue;
  minValue?: DateValue;
  onChange?: (value: DateValue | null) => void;
  value?: DateValue | null;
};

export function UiDatePicker({ description, disabled, error, label, maxValue, minValue, onChange, required, value }: UiDatePickerProps) {
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
      <UiLabel label={label} required={required} />
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

export type UiSelectProps = FieldCopy & {
  ariaLabel?: string;
  dataFocusKey?: string;
  disabled?: boolean;
  hideLabel?: boolean;
  name?: string;
  onChange?: (value: string) => void;
  options: UiOption[];
  placeholder?: string;
  value?: string | null;
};

export function UiSelect({
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
}: UiSelectProps) {
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
        <UiLabel label={label} required={required} />
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

export type UiComboBoxProps = FieldCopy & {
  onChange?: (value: string | null) => void;
  onInputChange?: (value: string) => void;
  onOpenChange?: (isOpen: boolean) => void;
  options: UiOption[];
  placeholder?: string;
  value?: string | null;
};

export function UiComboBox({ description, error, label, onChange, onInputChange, onOpenChange, options, placeholder, required, value }: UiComboBoxProps) {
  const triggerLabelId = useId();

  return (
    <ComboBox
      className={styles.field}
      items={options}
      isInvalid={Boolean(error)}
      isRequired={required}
      onChange={(key) => onChange?.(key === null ? null : String(key))}
      onInputChange={onInputChange}
      onOpenChange={onOpenChange}
      validationBehavior="aria"
      value={value ?? null}
    >
      <UiLabel label={label} required={required} />
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
          {(option: UiOption) => (
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

export type UiNumberFieldProps = FieldCopy & {
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

export function UiNumberField({
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
}: UiNumberFieldProps) {
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

export type UiQuantityFieldProps = UiNumberFieldProps & {
  onUnitChange?: (value: string) => void;
  unit: string;
  units: UiOption[];
};

export function UiQuantityField({
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
}: UiQuantityFieldProps) {
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
          <UiSelect
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

export type UiQuantityInputProps = FieldCopy & {
  ariaLabel?: string;
  dataFocusKey?: string;
  hideLabel?: boolean;
  onChange?: (value: string) => void;
  onUnitChange?: (value: string) => void;
  placeholder?: string;
  unit: string;
  unitAriaLabel?: string;
  units: UiOption[];
  value: string;
};

export function UiQuantityInput({
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
}: UiQuantityInputProps) {
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
          <UiSelect
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

export type UiChoiceGroupProps = FieldCopy & {
  dataFocusKey?: string;
  name?: string;
  onChange?: (value: string) => void;
  options: UiOption[];
  value?: string;
};

export function UiChoiceGroup({ dataFocusKey, description, error, label, name, onChange, options, required, value }: UiChoiceGroupProps) {
  return (
    <RadioGroup
      className={styles.field}
      isInvalid={Boolean(error)}
      isRequired={required}
      name={name}
      onChange={onChange}
      validationBehavior="aria"
      value={value}
    >
      <UiLabel label={label} required={required} />
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

export function UiCheckbox({ children, isDisabled, isSelected, onChange }: { children: ReactNode; isDisabled?: boolean; isSelected?: boolean; onChange?: (selected: boolean) => void }) {
  return (
    <RacCheckbox className={styles.check} isDisabled={isDisabled} isSelected={isSelected} onChange={onChange}>
      <span aria-hidden="true" className={styles.checkBox}>✓</span>
      <span>{children}</span>
    </RacCheckbox>
  );
}

export function UiSwitch({ children, isSelected, onChange }: { children: ReactNode; isSelected?: boolean; onChange?: (selected: boolean) => void }) {
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

export function UiSlider({ label, min = 0, max = 100, step = 1, value, onChange, formatOptions }: SliderCopy & { value: number; onChange?: (value: number) => void }) {
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

export function UiRangeSlider({ label, min = 0, max = 100, step = 1, value, onChange, formatOptions }: SliderCopy & { value: number[]; onChange?: (value: number[]) => void }) {
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

export type UiLevel = Readonly<{
  description?: string;
  id: string;
  label: string;
}>;

export function UiLevelSlider({ label, levels, onChange, value }: { label: string; levels: readonly UiLevel[]; onChange?: (value: string) => void; value: string }) {
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

export type UiButtonProps = Omit<RacButtonProps, "className"> & {
  className?: string;
  ref?: Ref<HTMLButtonElement>;
  title?: string;
  variant?: "primary" | "secondary" | "ghost" | "icon";
};

export function UiButton({ className = "", variant = "secondary", ...props }: UiButtonProps) {
  return <RacButton {...props} className={`${styles.button} ${styles[variant]} ${className}`} />;
}

export function UiDisclosure({ children, label }: { children: ReactNode; label: string }) {
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

export function UiRepeatableList<T extends { id: string }>({
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
          <div className={styles.repeatableRow} data-repeatable-row key={item.id}>
            <div className={styles.repeatableContent}>{renderItem(item, index)}</div>
            <UiButton aria-label={removeLabel?.(item, index) ?? `Remove item ${index + 1}`} onPress={() => onRemove(item.id)} variant="icon">
              <X aria-hidden="true" size={17} />
            </UiButton>
          </div>
        ))}
      </div>
      <UiButton isDisabled={addDisabled} onPress={onAdd} variant="secondary">
        <Plus aria-hidden="true" size={17} />
        {addLabel}
      </UiButton>
    </section>
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

export function UiRawOutput({ label, value }: { label: string; value: unknown }) {
  return (
    <UiDisclosure label={label}>
      <div className={styles.rawViewport}>
        <pre tabIndex={0}><code>{outputText(value)}</code></pre>
      </div>
    </UiDisclosure>
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

export function UiCopyAction({
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
  variant?: UiButtonProps["variant"];
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
      <UiButton aria-label={failed ? failureLabel : copied ? successLabel : label} onPress={copy} variant={variant}>
        {copied ? <Check aria-hidden="true" size={17} /> : <Copy aria-hidden="true" size={17} />}
        {failed ? failureLabel : copied ? successLabel : label}
      </UiButton>
      <span aria-live="polite" className={styles.visuallyHidden} role="status">
        {failed ? `${failureLabel}. Select the text manually.` : copied ? successLabel : ""}
      </span>
      {failed && withManualFallback ? (
        <div className={styles.copyFallback}>
          <label>Select and copy this text manually.</label>
          <textarea onFocus={(event) => event.currentTarget.select()} readOnly rows={5} value={value} />
        </div>
      ) : null}
    </div>
  );
}

export function UiDownloadAction({
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
  variant?: UiButtonProps["variant"];
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
    <UiButton aria-label={label} onPress={download} variant={variant}>
      <Download aria-hidden="true" size={17} />
      {label}
    </UiButton>
  );
}

export function uiOption(id: Key, label: string, description?: string): UiOption {
  return { id: String(id), label, description };
}
