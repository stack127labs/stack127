type SortOption = {
  label: string;
  value: string;
};

export function SortDropdown({
  name,
  options,
  value,
}: {
  name: string;
  options: readonly SortOption[];
  value: string;
}) {
  const fallback = options[0]?.value ?? "";
  const selected = value || fallback;
  const selectedOption =
    options.find((option) => option.value === selected) ?? options[0];

  return (
    <div className="directory-select" data-custom-select>
      <span className="field-label-line">Sort</span>
      <input name={name} type="hidden" value={selected} />
      <div className="custom-select">
        <button
          aria-expanded="false"
          className="custom-select-trigger"
          data-custom-select-trigger
          type="button"
        >
          <span data-custom-select-label>{selectedOption?.label ?? "Sort"}</span>
          <span className="custom-select-caret" aria-hidden="true" />
        </button>

        <div className="custom-select-menu" data-custom-select-menu hidden>
          {options.map((option) => (
            <button
              aria-pressed={selected === option.value}
              className={selected === option.value ? "active" : ""}
              data-custom-select-option
              data-value={option.value}
              key={option.value}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
