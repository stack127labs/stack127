import { CategoryIcon } from "@/app/category-icon";

export type CatalogFilterOption = {
  count?: number;
  iconKey?: string | null;
  label: string;
  value: string;
};

type MultipleFilterProps = {
  name: string;
  options: CatalogFilterOption[];
  selected: string[];
  title: string;
};

export function CatalogCheckboxGroup({
  title,
  name,
  options,
  selected,
}: MultipleFilterProps) {
  return (
    <fieldset className="filter-group">
      <legend>{title}</legend>
      <div className="filter-options">
        {options.map((option) => (
          <label key={option.value}>
            <input
              defaultChecked={selected.includes(option.value)}
              name={name}
              type="checkbox"
              value={option.value}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function CatalogTagSelectGroup({
  title,
  name,
  options,
  selected,
}: MultipleFilterProps) {
  const selectedSet = new Set(selected);
  const selectedOptions = selected
    .map((value) => options.find((option) => option.value === value))
    .filter((option): option is CatalogFilterOption => Boolean(option));

  return (
    <fieldset className="filter-group filter-tag-select" data-filter-tag-select data-name={name}>
      <legend>{title}</legend>
      <div className="custom-select">
        <button
          aria-expanded="false"
          className="custom-select-trigger"
          data-filter-select-trigger
          type="button"
        >
          <span>{`Add ${title.toLowerCase()}`}</span>
          <span className="custom-select-caret" aria-hidden="true" />
        </button>

        <div className="custom-select-menu" data-filter-select-menu hidden>
          {options.map((option) => (
            <button
              aria-pressed={selectedSet.has(option.value)}
              className={selectedSet.has(option.value) ? "active" : ""}
              data-filter-select-option
              data-label={option.label}
              data-value={option.value}
              key={option.value}
              type="button"
            >
              {option.iconKey ? <CategoryIcon iconKey={option.iconKey} /> : null}
              <span>{option.label}</span>
              {typeof option.count === "number" ? (
                <small className="filter-option-count">{option.count.toLocaleString("en-US")}</small>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-tag-list" data-filter-tag-list>
        {selectedOptions.map((option) => (
          <span className="filter-tag" data-filter-tag data-value={option.value} key={option.value}>
            <input name={name} type="hidden" value={option.value} />
            {option.iconKey ? <CategoryIcon iconKey={option.iconKey} /> : null}
            <span>{option.label}</span>
            <button aria-label={`Remove ${option.label}`} data-filter-tag-remove type="button">
              ×
            </button>
          </span>
        ))}
      </div>
    </fieldset>
  );
}

export function CatalogRadioGroup({
  title,
  name,
  options,
  selected,
}: {
  title: string;
  name: string;
  options: CatalogFilterOption[];
  selected: string;
}) {
  return (
    <fieldset className="filter-group">
      <legend>{title}</legend>
      <div className="filter-options">
        {options.map((option) => (
          <label key={option.value}>
            <input
              defaultChecked={selected === option.value}
              name={name}
              type="radio"
              value={option.value}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
