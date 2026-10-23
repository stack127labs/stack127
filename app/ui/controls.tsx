"use client";

import { CalendarDays, Check, Clock, ChevronDown, ChevronLeft, ChevronRight, Copy, Download, Link2, Minus, Plus, Search, X } from "lucide-react";
import {
  Button as RacButton,
  Calendar as RacCalendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Checkbox as RacCheckbox,
  CheckboxGroup,
  ComboBox,
  DateInput,
  DatePicker,
  DatePickerStateContext,
  DateSegment,
  TimeField,
  Dialog,
  DialogTrigger,
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
  type TimeValue,
  type Key,
} from "react-aria-components";
import { CalendarDateTime, getLocalTimeZone, Time, toCalendarDate, toCalendarDateTime, toZoned, type ZonedDateTime } from "@internationalized/date";
import {
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEventHandler,
  type ReactNode,
  type Ref,
} from "react";
import { createPortal } from "react-dom";
import styles from "./controls.module.css";

export type UiOption = {
  id: string;
  label: string;
  description?: string;
  searchText?: string;
};

type FieldCopy = {
  label: string;
  /** Visible text under the field. Tools use `hint` instead. */
  description?: string;
  error?: string | null;
  /** One plain sentence behind a small ? beside the label. */
  hint?: string;
  required?: boolean;
};

function subscribeToNothing() {
  return () => {};
}

function UiLabel({ hint, label, required }: Pick<FieldCopy, "hint" | "label" | "required">) {
  const text = (
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
  if (!hint) return text;
  // The ? sits beside the label, not inside it, so pressing it never moves focus to the field.
  return (
    <div className={styles.labelRow}>
      {text}
      <UiHint label={label} text={hint} />
    </div>
  );
}

function FieldMessages({ description, error, hint }: Pick<FieldCopy, "description" | "error" | "hint">) {
  // Screen readers hear the hint as the field's description, so nobody has to find the ? first.
  return (
    <>
      {description ? (
        <Text className={styles.description} slot="description">
          {description}
          {hint ? <span className={styles.visuallyHidden}> {hint}</span> : null}
        </Text>
      ) : hint ? (
        <Text className={styles.visuallyHidden} slot="description">{hint}</Text>
      ) : null}
      <FieldError className={styles.error}>{error}</FieldError>
    </>
  );
}

/**
 * A small ? beside a label. Its one sentence shows on hover, keyboard focus, and tap, so a
 * tool never needs help text under its fields. A tap or click keeps it open until the next
 * tap elsewhere, Escape, or leaving the button.
 */
export function UiHint({ label, text }: { label: string; text: string }) {
  const id = useId();
  // The bubble lives in document.body, so a clipped or transformed parent can't hide or move it.
  const hydrated = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const pinned = useRef(false);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    pinned.current = false;
    setOpen(false);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    // Fixed position keeps the bubble out of any clipped parent. It sits above the ?, moves
    // below it near the top of the screen, and stays inside the viewport's sides.
    const place = () => {
      const button = buttonRef.current;
      const bubble = bubbleRef.current;
      if (!button || !bubble) return;
      const margin = 8;
      const anchor = button.getBoundingClientRect();
      const box = bubble.getBoundingClientRect();
      const viewport = document.documentElement.clientWidth;
      const centered = anchor.left + anchor.width / 2 - box.width / 2;
      const left = Math.max(margin, Math.min(centered, viewport - box.width - margin));
      const above = anchor.top - box.height - 6;
      bubble.style.left = `${left}px`;
      bubble.style.top = `${above >= margin ? above : anchor.bottom + 6}px`;
    };
    const closeOutside = (event: PointerEvent) => {
      if (!buttonRef.current?.contains(event.target as Node)) close();
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [close, open]);

  return (
    <span className={styles.hint}>
      <button
        aria-describedby={id}
        aria-label={`About ${label}`}
        className={styles.hintButton}
        data-open={open || undefined}
        onBlur={close}
        onClick={() => {
          if (open && pinned.current) {
            close();
            return;
          }
          pinned.current = true;
          setOpen(true);
        }}
        onFocus={(event) => {
          if (event.currentTarget.matches(":focus-visible")) setOpen(true);
        }}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setOpen(true);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse" && !pinned.current) setOpen(false);
        }}
        ref={buttonRef}
        type="button"
      >
        <span aria-hidden="true">?</span>
      </button>
      {hydrated ? createPortal(
        <span className={styles.hintBubble} hidden={!open} id={id} ref={bubbleRef} role="tooltip">{text}</span>,
        document.body,
      ) : null}
    </span>
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
  hint,
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
      <UiLabel hint={hint} label={label} required={required} />
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
      <FieldMessages description={description} error={error} hint={hint} />
    </TextField>
  );
}

export type UiSearchFieldProps = FieldCopy & {
  name?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  value?: string;
};

export function UiSearchField({ description, error, hint, label, name, onChange, placeholder, required, value }: UiSearchFieldProps) {
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
      <UiLabel hint={hint} label={label} required={required} />
      <Group className={styles.searchControl}>
        <Search aria-hidden="true" className={styles.leadingIcon} size={18} />
        <Input autoComplete="off" className={styles.searchInput} placeholder={placeholder} />
        <RacButton aria-label={`Clear ${label}`} className={styles.clearButton} slot="clear">
          <X aria-hidden="true" size={16} />
        </RacButton>
      </Group>
      <FieldMessages description={description} error={error} hint={hint} />
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

export function UiTextArea({ autoCapitalize, className = "", description, error, hint, inputRef, label, name, onChange, placeholder, readOnly, required, rows = 4, spellCheck, value }: UiTextAreaProps) {
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
      <UiLabel hint={hint} label={label} required={required} />
      <TextArea autoCapitalize={autoCapitalize} className={styles.textarea} name={name} placeholder={placeholder} ref={inputRef} rows={rows} spellCheck={spellCheck} />
      <FieldMessages description={description} error={error} hint={hint} />
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

export function UiDatePicker(props: UiDatePickerProps) {
  return <DatePickerBase {...props} granularity="day" />;
}

type TimeOptions = {
  /** 12 (the default) or 24 hours. */
  hourCycle?: 12 | 24;
  /** Gap between the minutes in the list. Typing still accepts any minute. Defaults to 5. */
  minuteStep?: number;
};

export type UiDateTimePickerProps = UiDatePickerProps & TimeOptions;

/** A date and a time in one box. Picking a day in the calendar moves straight to the time list. */
export function UiDateTimePicker(props: UiDateTimePickerProps) {
  return <DatePickerBase {...props} granularity="minute" />;
}


/**
 * Date and time segments follow the reader's locale, which the server can't know: it would
 * draw 10/14/2026 for a reader who sees 14/10/2026, and a different space before AM/PM.
 * The segments render after hydration; the server keeps an empty box of the same size.
 */
function DateSegments() {
  const hydrated = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  if (!hydrated) return <span aria-hidden="true" className={styles.dateInput} />;
  return (
    <DateInput className={styles.dateInput}>
      {(segment) => <DateSegment className={styles.dateSegment} segment={segment} />}
    </DateInput>
  );
}

function DatePickerBase({
  description,
  disabled,
  error,
  granularity,
  hint,
  hourCycle = 12,
  label,
  maxValue,
  minValue,
  minuteStep = 5,
  onChange,
  required,
  value,
}: UiDateTimePickerProps & { granularity: "day" | "minute" }) {
  const hasTime = granularity === "minute";
  return (
    <DatePicker
      className={styles.field}
      granularity={granularity}
      hourCycle={hourCycle}
      isDisabled={disabled}
      isInvalid={Boolean(error)}
      isRequired={required}
      maxValue={maxValue}
      minValue={minValue}
      onChange={onChange}
      shouldCloseOnSelect={!hasTime}
      validationBehavior="aria"
      value={value ?? null}
    >
      <UiLabel hint={hint} label={label} required={required} />
      <Group className={styles.dateControl}>
        <DateSegments />
        <RacButton aria-label={`Open ${label} calendar`} className={styles.dateButton}>
          <CalendarDays aria-hidden="true" size={18} />
        </RacButton>
      </Group>
      <FieldMessages description={description} error={error} hint={hint} />
      <Popover className={`${styles.popover} ${styles.calendarPopover}`} placement="bottom start">
        <Dialog className={styles.calendarDialog}>
          {hasTime ? <DateThenTime commit={onChange} hourCycle={hourCycle} maxValue={maxValue} minValue={minValue} minuteStep={minuteStep} /> : <PickerCalendar />}
        </Dialog>
      </Popover>
    </DatePicker>
  );
}

function PickerCalendar({ onChange }: { onChange?: (day: DateValue) => void }) {
  return (
    <RacCalendar className={styles.calendar} onChange={onChange}>
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
  );
}

/** The date-and-time popover: the calendar first, then the time list once a day is picked. */
function DateThenTime({
  commit,
  hourCycle,
  maxValue,
  minValue,
  minuteStep,
}: Required<TimeOptions> & { commit?: (value: DateValue | null) => void; maxValue?: DateValue; minValue?: DateValue }) {
  const state = useContext(DatePickerStateContext);
  const [step, setStep] = useState<"date" | "time">("date");
  const day = state?.dateValue;
  const time = state?.timeValue ?? null;

  // Limits only apply on their own day: on any day between them, every time is allowed.
  const boundsFor = (picked: DateValue) => ({
    max: maxValue && "hour" in maxValue && sameDay(picked, maxValue) ? boundMinutes(maxValue, "max") : lastMinute,
    min: minValue && "hour" in minValue && sameDay(picked, minValue) ? boundMinutes(minValue, "min") : 0,
  });

  // Every pick builds the whole value on its day first, then holds it inside the limits at full
  // precision, so a time zone, a daylight saving gap, or leftover seconds can't slip past them.
  // Committing right away also means every way out of the popover keeps an allowed value.
  const place = (picked: DateValue, hour: number, minute: number) => {
    const current = state?.value && "hour" in state.value ? state.value : null;
    const fields = { day: picked.day, hour, millisecond: 0, minute, month: picked.month, second: 0, year: picked.year };
    const candidate = current ? current.set(fields) : new CalendarDateTime(picked.year, picked.month, picked.day, hour, minute);
    commit?.(withinLimits(candidate, minValue, maxValue));
  };

  // A new day keeps the chosen time. A first pick starts at midnight, moved to the day's earliest allowed time.
  const pickDay = (picked: DateValue) => {
    const current = state?.value && "hour" in state.value ? state.value : null;
    place(picked, current?.hour ?? 0, current?.minute ?? 0);
    setStep("time");
  };

  if (step === "date" || !state || !day) {
    const timeLabel = time
      ? new Intl.DateTimeFormat(undefined, { hour: "numeric", hourCycle: hourCycle === 12 ? "h12" : "h23", minute: "2-digit" }).format(new Date(2000, 0, 1, time.hour, time.minute))
      : null;
    return (
      <div className={styles.timePanel}>
        <PickerCalendar onChange={pickDay} />
        {day ? <UiButton className={styles.timeDone} onPress={() => setStep("time")}>{timeLabel ? `Time: ${timeLabel}` : "Choose time"}</UiButton> : null}
      </div>
    );
  }

  const dayLabel = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", weekday: "short" }).format(day.toDate(getLocalTimeZone()));
  return (
    <div className={styles.timePanel}>
      <RacButton className={styles.timeBack} onPress={() => setStep("date")}>
        <ChevronLeft aria-hidden="true" size={18} />
        <span><span className={styles.visuallyHidden}>Change date, </span>{dayLabel}</span>
      </RacButton>
      <TimeColumns bounds={boundsFor(day)} hourCycle={hourCycle} minuteStep={minuteStep} onPick={(hour, minute) => place(day, hour, minute)} value={time} />
      <UiButton className={styles.timeDone} onPress={() => state.setOpen(false)} variant="primary">Done</UiButton>
    </div>
  );
}

export type UiTimeFieldProps = FieldCopy & TimeOptions & {
  disabled?: boolean;
  maxValue?: TimeValue;
  minValue?: TimeValue;
  onChange?: (value: TimeValue | null) => void;
  value?: TimeValue | null;
};

/** Hours and minutes. Type each part, or open the clock to pick from a list. */
export function UiTimeField({ description, disabled, error, hint, hourCycle = 12, label, maxValue, minValue, minuteStep = 5, onChange, required, value }: UiTimeFieldProps) {
  return (
    <TimeField
      className={styles.field}
      hourCycle={hourCycle}
      isDisabled={disabled}
      isInvalid={Boolean(error)}
      isRequired={required}
      maxValue={maxValue}
      minValue={minValue}
      onChange={onChange}
      validationBehavior="aria"
      value={value ?? null}
    >
      <UiLabel hint={hint} label={label} required={required} />
      <Group className={styles.dateControl}>
        <DateSegments />
        <DialogTrigger>
          <RacButton aria-label={`Choose ${label}`} className={styles.dateButton} isDisabled={disabled}>
            <Clock aria-hidden="true" size={18} />
          </RacButton>
          <Popover className={`${styles.popover} ${styles.timePopover}`} placement="bottom end">
            <Dialog aria-label={label} className={`${styles.calendarDialog} ${styles.timePanel}`}>
              <TimeColumns
                bounds={{ max: maxValue ? boundMinutes(maxValue, "max") : lastMinute, min: minValue ? boundMinutes(minValue, "min") : 0 }}
                hourCycle={hourCycle}
                minuteStep={minuteStep}
                onPick={(hour, minute) => {
                  // Change only the time, so a date or time zone the value carries survives. Seconds reset.
                  const candidate = value ? (value as Time).set({ hour, millisecond: 0, minute, second: 0 }) : new Time(hour, minute);
                  onChange?.(timeWithinLimits(candidate, minValue, maxValue));
                }}
                value={value ?? null}
              />
              <UiButton className={styles.timeDone} slot="close" variant="primary">Done</UiButton>
            </Dialog>
          </Popover>
        </DialogTrigger>
      </Group>
      <FieldMessages description={description} error={error} hint={hint} />
    </TimeField>
  );
}

const padTime = (part: number) => String(part).padStart(2, "0");
const lastMinute = 23 * 60 + 59;
const minutesOf = (time: { hour: number; minute: number }) => time.hour * 60 + time.minute;
/** A limit in whole minutes. A minimum with seconds rounds up, so a minute pick never lands before it. */
const boundMinutes = (time: { hour: number; millisecond: number; minute: number; second: number }, kind: "max" | "min") =>
  minutesOf(time) + (kind === "min" && (time.second > 0 || time.millisecond > 0) ? 1 : 0);
const sameDay = (a: DateValue, b: DateValue) => toCalendarDate(a).compare(toCalendarDate(b)) === 0;

/** Holds a date and time inside its limits at full precision. Date-only limits are the calendar's job. */
function withinLimits(candidate: CalendarDateTime | ZonedDateTime, min?: DateValue, max?: DateValue): DateValue {
  const like = (bound: DateValue) => ("timeZone" in candidate ? toZoned(bound, candidate.timeZone) : toCalendarDateTime(bound));
  if (min && "hour" in min && candidate.compare(min) < 0) return like(min);
  if (max && "hour" in max && candidate.compare(max) > 0) return like(max);
  return candidate;
}

const timeOfDay = (time: TimeValue) => ((time.hour * 60 + time.minute) * 60 + time.second) * 1000 + time.millisecond;

/** Holds a time of day inside its limits, seconds included. */
function timeWithinLimits(candidate: TimeValue, min?: TimeValue, max?: TimeValue): TimeValue {
  const like = (bound: TimeValue) => (candidate as Time).set({ hour: bound.hour, millisecond: bound.millisecond, minute: bound.minute, second: bound.second });
  if (min && timeOfDay(candidate) < timeOfDay(min)) return like(min);
  if (max && timeOfDay(candidate) > timeOfDay(max)) return like(max);
  return candidate;
}

/**
 * Hour, minute, and (for 12 hours) AM or PM lists. A pick in any list sets the whole time:
 * an hour on its own means minute 00, and a minute on its own means the 12 AM hour.
 * Times outside the bounds (minutes into the day) are disabled, and a pick that lands outside
 * them moves to the nearest allowed minute. The caller builds the value and checks it exactly.
 */
function TimeColumns({
  bounds,
  hourCycle,
  minuteStep,
  onPick,
  value,
}: Required<TimeOptions> & { bounds: { max: number; min: number }; onPick: (hour: number, minute: number) => void; value: TimeValue | null }) {
  const hour = value?.hour ?? null;
  const minute = value?.minute ?? 0;
  const isPm = hour !== null && hour >= 12;
  const to24 = (shown: number, pm: boolean) => (hourCycle === 24 ? shown : (shown % 12) + (pm ? 12 : 0));
  const hours = hourCycle === 24 ? Array.from({ length: 24 }, (_, index) => index) : [12, ...Array.from({ length: 11 }, (_, index) => index + 1)];
  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, index) => index * minuteStep);
  const outside = (first: number, last: number) => last < bounds.min || first > bounds.max;

  const pick = (nextHour: number, nextMinute: number) => {
    const total = Math.min(bounds.max, Math.max(bounds.min, nextHour * 60 + nextMinute));
    onPick(Math.floor(total / 60), total % 60);
  };

  return (
    <div className={styles.timeColumns}>
      <TimeColumn
        disabled={hours.filter((shown) => outside(to24(shown, isPm) * 60, to24(shown, isPm) * 60 + 59))}
        heading="Hour"
        label="Hour"
        onSelect={(shown) => pick(to24(shown, isPm), minute)}
        options={hours.map((shown) => ({ id: shown, label: hourCycle === 24 ? padTime(shown) : String(shown) }))}
        selected={hour === null ? null : hourCycle === 24 ? hour : hour % 12 || 12}
      />
      <TimeColumn
        disabled={hour === null ? [] : minutes.filter((option) => outside(hour * 60 + option, hour * 60 + option))}
        heading="Min"
        label="Minute"
        onSelect={(next) => pick(hour ?? 0, next)}
        options={minutes.map((option) => ({ id: option, label: padTime(option) }))}
        selected={value ? minute : null}
      />
      {hourCycle === 12 ? (
        <TimeColumn
          disabled={[outside(0, 719) ? 0 : -1, outside(720, lastMinute) ? 1 : -1].filter((id) => id >= 0)}
          label="AM or PM"
          onSelect={(pm) => pick(to24(hour === null ? 12 : hour % 12 || 12, pm === 1), minute)}
          options={[{ id: 0, label: "AM" }, { id: 1, label: "PM" }]}
          selected={hour === null ? null : isPm ? 1 : 0}
        />
      ) : null}
    </div>
  );
}

function TimeColumn({
  disabled,
  heading,
  label,
  onSelect,
  options,
  selected,
}: {
  disabled: number[];
  heading?: string;
  label: string;
  onSelect: (id: number) => void;
  options: { id: number; label: string }[];
  selected: number | null;
}) {
  // Open with the chosen value in view. Only on open: scrolling on every pick would move the list under the pointer.
  // A ref on the option, not an effect, because react-aria draws the options after the list itself.
  const hasScrolled = useRef(selected === null);
  const scrollIntoView = useCallback((option: HTMLDivElement | null) => {
    const list = option?.parentElement;
    if (!option || !list || hasScrolled.current) return;
    hasScrolled.current = true;
    list.scrollTop = option.offsetTop - (list.clientHeight - option.offsetHeight) / 2;
  }, []);

  return (
    <div className={styles.timeColumn}>
      <span aria-hidden="true" className={styles.timeColumnLabel}>{heading}</span>
      <ListBox
        aria-label={label}
        className={styles.timeList}
        disabledKeys={disabled}
        disallowEmptySelection
        items={options}
        onSelectionChange={(keys) => {
          if (keys !== "all") {
            const [key] = keys;
            if (key !== undefined) onSelect(Number(key));
          }
        }}
        selectedKeys={selected === null ? [] : [selected]}
        selectionMode="single"
      >
        {(option) => (
          <ListBoxItem className={styles.timeOption} id={option.id} ref={option.id === selected ? scrollIntoView : undefined} textValue={option.label}>
            {option.label}
          </ListBoxItem>
        )}
      </ListBox>
    </div>
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
  hint,
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
        <UiLabel hint={hint} label={label} required={required} />
      </div>
      <RacButton className={styles.selectTrigger} data-focus-key={dataFocusKey} data-tool-label={accessibleLabel}>
        <SelectValue className={styles.selectValue} />
        <ChevronDown aria-hidden="true" size={18} />
      </RacButton>
      <FieldMessages description={description} error={error} hint={hint} />
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

export function UiComboBox({ description, error, hint, label, onChange, onInputChange, onOpenChange, options, placeholder, required, value }: UiComboBoxProps) {
  const triggerLabelId = useId();

  return (
    <ComboBox
      className={styles.field}
      // With onInputChange the caller filters the options itself. Without it, the combo box filters them as people type.
      defaultItems={onInputChange ? undefined : options}
      items={onInputChange ? options : undefined}
      isInvalid={Boolean(error)}
      isRequired={required}
      onChange={(key) => onChange?.(key === null ? null : String(key))}
      onInputChange={onInputChange}
      onOpenChange={onOpenChange}
      validationBehavior="aria"
      value={value ?? null}
    >
      <UiLabel hint={hint} label={label} required={required} />
      <span className={styles.visuallyHidden} id={triggerLabelId}>Open {label}</span>
      <Group className={styles.comboControl}>
        <Input autoComplete="off" className={styles.comboInput} placeholder={placeholder} />
        <RacButton aria-labelledby={triggerLabelId} className={styles.comboButton}>
          <ChevronDown aria-hidden="true" size={18} />
        </RacButton>
      </Group>
      <FieldMessages description={description} error={error} hint={hint} />
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
  hint,
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
        {hint ? <UiHint label={label} text={hint} /> : null}
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
      <FieldMessages description={description} error={error} hint={hint} />
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
  hint,
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
  const hintId = useId();
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
        {hint ? <UiHint label={label} text={hint} /> : null}
      </div>
      {hint ? <span className={styles.visuallyHidden} id={hintId}>{hint}</span> : null}
      <div className={styles.quantityControl}>
        <NumberField
          aria-describedby={hint ? hintId : undefined}
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
  hint,
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
  const hintId = useId();
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  const labelElement = (
    <label className={hideLabel ? styles.visuallyHidden : styles.label} htmlFor={inputId}>
      {label}
      {required ? (
        <>
          <span aria-hidden="true" className={styles.requiredMark}>*</span>
          <span className={styles.visuallyHidden}> Required</span>
        </>
      ) : null}
    </label>
  );

  return (
    <div className={styles.field}>
      {hint && !hideLabel ? (
        <div className={styles.labelRow}>
          {labelElement}
          <UiHint label={label} text={hint} />
        </div>
      ) : labelElement}
      {hint ? <span className={styles.visuallyHidden} id={hintId}>{hint}</span> : null}
      <div className={styles.quantityControl} data-invalid={Boolean(error) || undefined}>
        <input
          aria-describedby={describedBy}
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

export function UiChoiceGroup({ dataFocusKey, description, error, hint, label, name, onChange, options, required, value }: UiChoiceGroupProps) {
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
      <UiLabel hint={hint} label={label} required={required} />
      <div className={styles.choiceRow}>
        {options.map((option) => (
          <Radio className={styles.choice} data-focus-key={option.id === options[0]?.id ? dataFocusKey : undefined} id={option.id} key={option.id} value={option.id}>
            <ChoiceCopy option={option} />
          </Radio>
        ))}
      </div>
      <FieldMessages description={description} error={error} hint={hint} />
    </RadioGroup>
  );
}

function ChoiceCopy({ option }: { option: UiOption }) {
  return (
    <span className={styles.choiceCopy}>
      <span>{option.label}</span>
      {option.description ? <span className={styles.choiceDescription}>{option.description}</span> : null}
    </span>
  );
}

export type UiMultiChoiceGroupProps = FieldCopy & {
  dataFocusKey?: string;
  name?: string;
  onChange?: (value: string[]) => void;
  options: UiOption[];
  value?: string[];
};

/** Choose any number of options. Each chip carries a small check box, so it reads differently from the one-choice group. */
export function UiMultiChoiceGroup({ dataFocusKey, description, error, hint, label, name, onChange, options, required, value }: UiMultiChoiceGroupProps) {
  return (
    <CheckboxGroup
      className={styles.field}
      isInvalid={Boolean(error)}
      isRequired={required}
      name={name}
      onChange={onChange}
      validationBehavior="aria"
      value={value}
    >
      <UiLabel hint={hint} label={label} required={required} />
      <div className={styles.choiceRow}>
        {options.map((option) => (
          <RacCheckbox className={`${styles.choice} ${styles.multiChoice}`} data-focus-key={option.id === options[0]?.id ? dataFocusKey : undefined} id={option.id} key={option.id} value={option.id}>
            <span aria-hidden="true" className={styles.choiceBox}><Check size={13} strokeWidth={3} /></span>
            <ChoiceCopy option={option} />
          </RacCheckbox>
        ))}
      </div>
      <FieldMessages description={description} error={error} hint={hint} />
    </CheckboxGroup>
  );
}

export function UiCheckbox({ children, isDisabled, isSelected, onChange }: { children: ReactNode; isDisabled?: boolean; isSelected?: boolean; onChange?: (selected: boolean) => void }) {
  return (
    <RacCheckbox className={styles.check} isDisabled={isDisabled} isSelected={isSelected} onChange={onChange}>
      {(state) => (
        <>
          {/* An unavailable, unchecked box shows a muted X so it doesn't read as an empty choice. */}
          <span aria-hidden="true" className={styles.checkBox}>{state.isDisabled && !state.isSelected ? <X size={14} strokeWidth={2.2} /> : "✓"}</span>
          <span>{children}</span>
        </>
      )}
    </RacCheckbox>
  );
}

export function UiSwitch({ children, isDisabled, isSelected, onChange }: { children: ReactNode; isDisabled?: boolean; isSelected?: boolean; onChange?: (selected: boolean) => void }) {
  return (
    <Switch className={styles.switch} isDisabled={isDisabled} isSelected={isSelected} onChange={onChange}>
      <span aria-hidden="true" className={styles.switchTrack}><span /></span>
      <span>{children}</span>
    </Switch>
  );
}

type SliderCopy = {
  label: string;
  /** One plain sentence behind a small ? beside the label. */
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
  formatOptions?: Intl.NumberFormatOptions;
};

function SliderHintText({ hint, id }: { hint?: string; id: string }) {
  return hint ? <span className={styles.visuallyHidden} id={id}>{hint}</span> : null;
}

export function UiSlider({ hint, label, min = 0, max = 100, step = 1, value, onChange, formatOptions }: SliderCopy & { value: number; onChange?: (value: number) => void }) {
  const hintId = useId();
  return (
    <Slider className={styles.slider} formatOptions={formatOptions} maxValue={max} minValue={min} onChange={onChange} step={step} value={value}>
      <div className={styles.sliderHeader}>
        <span className={styles.labelRow}>
          <Label className={styles.label}>{label}</Label>
          {hint ? <UiHint label={label} text={hint} /> : null}
        </span>
        <SliderOutput className={styles.sliderOutput} />
      </div>
      <SliderTrack className={styles.sliderTrack}>
        <SliderFill className={styles.sliderFill} />
        <SliderThumb aria-describedby={hint ? hintId : undefined} aria-label={label} className={styles.sliderThumb} />
      </SliderTrack>
      <SliderHintText hint={hint} id={hintId} />
    </Slider>
  );
}

export function UiRangeSlider({ hint, label, min = 0, max = 100, step = 1, value, onChange, formatOptions }: SliderCopy & { value: number[]; onChange?: (value: number[]) => void }) {
  const hintId = useId();
  return (
    <Slider className={styles.slider} formatOptions={formatOptions} maxValue={max} minValue={min} onChange={onChange} step={step} value={value}>
      <div className={styles.sliderHeader}>
        <span className={styles.labelRow}>
          <Label className={styles.label}>{label}</Label>
          {hint ? <UiHint label={label} text={hint} /> : null}
        </span>
        <SliderOutput className={styles.sliderOutput}>
          {({ state }) => state.values.map((item) => state.getFormattedValue(item)).join(" to ")}
        </SliderOutput>
      </div>
      <SliderTrack className={styles.sliderTrack}>
        <SliderFill className={styles.sliderFill} />
        <SliderThumb aria-describedby={hint ? hintId : undefined} aria-label={`${label} minimum`} className={styles.sliderThumb} index={0} />
        <SliderThumb aria-describedby={hint ? hintId : undefined} aria-label={`${label} maximum`} className={styles.sliderThumb} index={1} />
      </SliderTrack>
      <SliderHintText hint={hint} id={hintId} />
    </Slider>
  );
}

export type UiLevel = Readonly<{
  description?: string;
  id: string;
  label: string;
}>;

export function UiLevelSlider({ hint, label, levels, onChange, value }: { hint?: string; label: string; levels: readonly UiLevel[]; onChange?: (value: string) => void; value: string }) {
  const hintId = useId();
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
        <span className={styles.labelRow}>
          <Label className={styles.label}>{label}</Label>
          {hint ? <UiHint label={label} text={hint} /> : null}
        </span>
        <SliderOutput className={styles.levelOutput}>{selected.label}</SliderOutput>
      </div>
      <SliderTrack className={styles.sliderTrack} data-tool-level-track>
        <SliderFill className={styles.sliderFill} data-tool-level-fill />
        <SliderThumb aria-describedby={hint ? hintId : undefined} aria-label={label} aria-valuetext={selected.label} className={styles.sliderThumb} />
      </SliderTrack>
      <div aria-hidden="true" className={styles.levelMarks} style={{ gridTemplateColumns: `repeat(${levels.length}, minmax(0, 1fr))` }}>
        {levels.map((level) => <span data-selected={level.id === selected.id || undefined} key={level.id}>{level.label}</span>)}
      </div>
      {selected.description ? <p className={styles.levelDescription}>{selected.description}</p> : null}
      <SliderHintText hint={hint} id={hintId} />
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

export function UiDisclosure({
  children,
  isExpanded,
  label,
  onExpandedChange,
  summary,
}: {
  children: ReactNode;
  isExpanded?: boolean;
  label: string;
  onExpandedChange?: (isExpanded: boolean) => void;
  summary?: ReactNode;
}) {
  return (
    <Disclosure className={styles.disclosure} isExpanded={isExpanded} onExpandedChange={onExpandedChange}>
      <Heading className={styles.disclosureHeading}>
        <RacButton className={styles.disclosureButton} slot="trigger">
          <ChevronRight aria-hidden="true" size={17} />
          <span className={styles.disclosureLabel}>{label}</span>
          {summary ? <span className={styles.disclosureSummary}>{summary}</span> : null}
        </RacButton>
      </Heading>
      <DisclosurePanel className={styles.disclosurePanel}>{children}</DisclosurePanel>
    </Disclosure>
  );
}

/** The closed summary for an Advanced disclosure: `Not used`, or how many optional values are set. */
export function uiSetSummary(count: number): string {
  return count > 0 ? `${count} set` : "Not used";
}

export function UiRepeatableList<T extends { id: string }>({
  addDescription,
  addDescriptionIsError = false,
  addDisabled = false,
  addLabel,
  ariaLabel,
  items,
  minItems = 0,
  onAdd,
  onRemove,
  removeLabel,
  renderItem,
}: {
  addDescription?: string;
  addDescriptionIsError?: boolean;
  addDisabled?: boolean;
  addLabel: string;
  ariaLabel: string;
  items: T[];
  /** Remove turns off while the list holds this many rows, such as 2 books in a series. */
  minItems?: number;
  onAdd: () => void;
  onRemove: (id: string) => void;
  removeLabel?: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
}) {
  const previousCount = useRef(items.length);
  const pendingRemovalIndex = useRef<number | null>(null);
  const rows = useRef<HTMLDivElement>(null);
  const descriptionId = useId();

  useLayoutEffect(() => {
    const countChange = items.length - previousCount.current;
    if (countChange > 0) {
      const lastRow = rows.current?.querySelector<HTMLElement>(
        "[data-repeatable-row]:last-child input:not([disabled]), [data-repeatable-row]:last-child button:not([disabled])",
      );
      lastRow?.focus();
    } else if (countChange < 0) {
      const removeIndex = pendingRemovalIndex.current ?? items.length;
      const rowIndex = Math.min(removeIndex, items.length - 1);
      const row = rowIndex >= 0
        ? rows.current?.querySelectorAll<HTMLElement>("[data-repeatable-row]")[rowIndex]
        : null;
      const focusTarget = row?.querySelector<HTMLElement>(
        "input:not([disabled]), button:not([disabled])",
      ) ?? rows.current?.parentElement?.querySelector<HTMLElement>("[data-repeatable-add]");
      focusTarget?.focus();
    }
    pendingRemovalIndex.current = null;
    previousCount.current = items.length;
  }, [items.length]);

  return (
    <section aria-label={ariaLabel} className={styles.repeatable}>
      <div className={styles.repeatableRows} ref={rows}>
        {items.map((item, index) => {
          const label = removeLabel?.(item, index) ?? `Remove item ${index + 1}`;
          return (
            <div className={styles.repeatableRow} data-repeatable-row key={item.id}>
              <div className={styles.repeatableContent}>{renderItem(item, index)}</div>
              <UiButton
                aria-label={label}
                isDisabled={items.length <= minItems}
                onPress={() => {
                  pendingRemovalIndex.current = index;
                  onRemove(item.id);
                }}
                title={label}
                variant="icon"
              >
                <X aria-hidden="true" size={17} />
              </UiButton>
            </div>
          );
        })}
      </div>
      <div className={styles.repeatableAdd}>
        <UiButton
          aria-describedby={addDescription ? descriptionId : undefined}
          data-repeatable-add=""
          isDisabled={addDisabled}
          onPress={onAdd}
          variant="secondary"
        >
          <Plus aria-hidden="true" size={17} />
          {addLabel}
        </UiButton>
        {addDescription ? (
          <span
            className={styles.repeatableNote}
            data-error={addDescriptionIsError ? "true" : undefined}
            id={descriptionId}
            role={addDescriptionIsError ? "alert" : undefined}
          >
            {addDescription}
          </span>
        ) : null}
      </div>
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
  const fallbackId = useId();

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
          <label htmlFor={fallbackId}>Select and copy this text manually.</label>
          <textarea id={fallbackId} onFocus={(event) => event.currentTarget.select()} readOnly rows={5} value={value} />
        </div>
      ) : null}
    </div>
  );
}

export type UiShareParams = Record<string, string | number | null | undefined>;

/**
 * Copies a link that reopens the tool with the same inputs. Empty values stay out of the link.
 * It leaves the address bar alone. The tool reads the link back with `useInitialQuery()`.
 */
export function UiShareAction({
  failureLabel = "Copy failed",
  label = "Copy link",
  params,
  successLabel = "Link copied",
  variant = "secondary",
}: {
  failureLabel?: string;
  label?: string;
  params: UiShareParams;
  successLabel?: string;
  variant?: UiButtonProps["variant"];
}) {
  const [copied, setCopied] = useState(false);
  const [fallback, setFallback] = useState<string | null>(null);
  const fallbackId = useId();

  async function share() {
    const url = new URL(window.location.pathname, window.location.origin);
    for (const [key, value] of Object.entries(params)) {
      const text = value === null || value === undefined ? "" : String(value).trim();
      if (text) url.searchParams.set(key, text);
    }
    const link = url.toString();
    const didCopy = await copyText(link);
    setFallback(didCopy ? null : link);
    if (!didCopy) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className={styles.copyAction}>
      <UiButton aria-label={fallback ? failureLabel : copied ? successLabel : label} onPress={share} variant={variant}>
        {copied ? <Check aria-hidden="true" size={17} /> : <Link2 aria-hidden="true" size={17} />}
        {fallback ? failureLabel : copied ? successLabel : label}
      </UiButton>
      <span aria-live="polite" className={styles.visuallyHidden} role="status">
        {fallback ? `${failureLabel}. Select the link manually.` : copied ? successLabel : ""}
      </span>
      {fallback ? (
        <div className={styles.copyFallback}>
          <label htmlFor={fallbackId}>Select and copy this link.</label>
          <textarea id={fallbackId} onFocus={(event) => event.currentTarget.select()} readOnly rows={2} value={fallback} />
        </div>
      ) : null}
    </div>
  );
}

export function UiDownloadAction({
  contents,
  filename,
  isDisabled = false,
  label = "Download",
  mimeType = "text/plain;charset=utf-8",
  variant = "secondary",
}: {
  /** The file, or a function that makes it on click, for files that are slow to build. */
  contents: BlobPart | (() => BlobPart);
  filename: string;
  /** Turn it off while the result it would save is stale, so nobody saves an old file. */
  isDisabled?: boolean;
  label?: string;
  mimeType?: string;
  variant?: UiButtonProps["variant"];
}) {
  function download() {
    const part = typeof contents === "function" ? contents() : contents;
    const url = URL.createObjectURL(new Blob([part], { type: mimeType }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <UiButton aria-label={label} isDisabled={isDisabled} onPress={download} variant={variant}>
      <Download aria-hidden="true" size={17} />
      {label}
    </UiButton>
  );
}

export function uiOption(id: Key, label: string, description?: string): UiOption {
  return { id: String(id), label, description };
}
