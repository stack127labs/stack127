"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import {
  DirectoryCheckboxGroup as CheckboxGroup,
  DirectoryRadioGroup as RadioGroup,
  DirectoryTagSelectGroup as TagSelectGroup,
  type DirectoryFilterOption as FilterOption,
} from "@/app/ui/directories/directory-filters";
import { DirectoryFilterController } from "@/app/ui/directories/directory-filter-controller";
import { paramString, paramValues, removeParamHref } from "@/app/ui/directories/directory-params";
import { useDirectoryQuery } from "@/app/ui/directories/directory-query";
import { SortDropdown } from "@/app/ui/directories/directory-sort-dropdown";
import { sidebarPanelClassName } from "@/app/ui/site/sidebar-panel";
import {
  defaultSort,
  dockerOptions,
  maintenanceOptions,
  ramOptions,
  route,
  signalOptions,
  sortOptions,
  sourceOptions,
  storageOptions,
} from "./options";
import { useSelfHostAppsSearch } from "./search";

function StorageSlider({
  options,
  selected,
  clearHref,
}: {
  options: FilterOption[];
  selected: string;
  clearHref: string;
}) {
  const selectedIndex = options.findIndex((option) => option.value === selected);
  const hasSelection = selectedIndex >= 0;
  const sliderIndex = hasSelection ? selectedIndex : options.length - 1;
  const sliderPosition = `${sliderIndex * 25}%`;
  const currentLabel = hasSelection ? options[selectedIndex]?.label : "Any storage";

  return (
    <fieldset className="filter-group storage-slider-group">
      <legend className="storage-slider-legend">
        <span>Storage</span>
        {hasSelection ? (
          <Link className="storage-slider-clear" href={clearHref}>
            any
          </Link>
        ) : (
          <span className="storage-slider-clear passive">any</span>
        )}
      </legend>

      <div
        className="storage-slider-shell"
        data-storage-slider-root
        style={
          {
            "--storage-slider-fill-width": sliderPosition,
            "--storage-slider-position": sliderPosition,
          } as CSSProperties
        }
      >
        <input
          data-storage-slider-value
          defaultValue={hasSelection ? options[selectedIndex]?.value : ""}
          name="storage"
          type="hidden"
        />
        <div className="storage-slider-current" aria-live="polite">
          <span data-storage-slider-current>{currentLabel}</span>
        </div>
        <div className="storage-slider-bar">
          <div className="storage-slider-track" aria-hidden="true">
            <i className="storage-slider-fill" />
            {options.map((option, index) => (
              <span
                className={hasSelection && index <= selectedIndex ? "active" : ""}
                data-storage-slider-step
                key={option.value}
              />
            ))}
            <i className="storage-slider-thumb" />
          </div>
          <input
            aria-label="Storage comfort"
            className="storage-slider-range"
            data-storage-slider
            data-storage-slider-labels={options.map((option) => option.label).join("|")}
            data-storage-slider-values={options.map((option) => option.value).join("|")}
            defaultValue={sliderIndex}
            max={options.length - 1}
            min="0"
            step="1"
            type="range"
          />
        </div>
      </div>
    </fieldset>
  );
}

// The sidebar form. The filter controller turns each change into a URL update,
// and the search provider loads the matching apps.
export function SelfHostAppFilters({ heading }: { heading: ReactNode }) {
  const { formKey } = useDirectoryQuery();
  const { params, results } = useSelfHostAppsSearch();
  const { facets } = results;

  return (
    <form
      action={route}
      className={sidebarPanelClassName}
      data-default-sort={defaultSort}
      data-live-filter-form
      key={formKey}
    >
      {heading}

      <label className="directory-search">
        <span>Search</span>
        <span className="directory-search-field">
          <Search aria-hidden="true" size={16} strokeWidth={2.2} />
          <input
            defaultValue={paramString(params, "q")}
            name="q"
            placeholder="Immich, DNS, photos..."
            type="search"
          />
        </span>
      </label>

      <SortDropdown name="sort" options={sortOptions} value={paramString(params, "sort") || defaultSort} />

      <TagSelectGroup
        name="category"
        options={facets.categories}
        selected={paramValues(params, "category")}
        title="Category"
      />
      <TagSelectGroup
        name="license"
        options={facets.licenses}
        selected={paramValues(params, "license")}
        title="License"
      />
      <CheckboxGroup
        name="source"
        options={sourceOptions}
        selected={paramValues(params, "source")}
        title="Source model"
      />
      <CheckboxGroup
        name="docker"
        options={dockerOptions}
        selected={paramValues(params, "docker")}
        title="Docker"
      />
      {facets.installMethods.length > 0 ? (
        <CheckboxGroup
          name="install"
          options={facets.installMethods}
          selected={paramValues(params, "install")}
          title="Install method"
        />
      ) : null}
      <RadioGroup
        name="ram"
        options={ramOptions}
        selected={paramString(params, "ram")}
        title="RAM"
      />
      <StorageSlider
        clearHref={removeParamHref(route, params, "storage")}
        options={storageOptions}
        selected={paramString(params, "storage")}
      />
      <CheckboxGroup
        name="maintenance"
        options={maintenanceOptions}
        selected={paramValues(params, "maintenance")}
        title="Health"
      />
      <CheckboxGroup
        name="signal"
        options={signalOptions}
        selected={paramValues(params, "signal")}
        title="Signals"
      />

      <div className="filter-actions">
        <Link href={route}>reset</Link>
      </div>
      <DirectoryFilterController />
    </form>
  );
}

const filterLabels: Array<[key: string, label: string]> = [
  ["category", "Category"],
  ["license", "License"],
  ["source", "Source model"],
  ["docker", "Docker"],
  ["install", "Install method"],
  ["ram", "RAM"],
  ["storage", "Storage"],
  ["maintenance", "Health"],
  ["signal", "Signal"],
];

export function ActiveFilters() {
  const { params, results: { facets } } = useSelfHostAppsSearch();
  const optionLabels = (options: FilterOption[]) => new Map(options.map((option) => [option.value, option.label]));
  const valueLabels = new Map([
    ["category", optionLabels(facets.categories)],
    ["license", optionLabels(facets.licenses)],
    ["source", optionLabels(sourceOptions)],
    ["docker", optionLabels(dockerOptions)],
    ["install", optionLabels(facets.installMethods)],
    ["ram", optionLabels(ramOptions)],
    ["storage", optionLabels(storageOptions)],
    ["maintenance", optionLabels(maintenanceOptions)],
    ["signal", optionLabels(signalOptions)],
  ]);
  const chips: Array<{ href: string; key: string; label: string; value: string }> = [];

  const query = paramString(params, "q");
  if (query) {
    chips.push({ href: removeParamHref(route, params, "q"), key: "q", label: `Search: ${query}`, value: query });
  }

  for (const [key, groupLabel] of filterLabels) {
    for (const value of paramValues(params, key)) {
      const valueLabel = valueLabels.get(key)?.get(value) ?? value.replaceAll("_", " ");
      chips.push({ href: removeParamHref(route, params, key, value), key, label: `${groupLabel}: ${valueLabel}`, value });
    }
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="active-filter-row" aria-label="Active filters">
      {chips.map((chip) => (
        <Link href={chip.href} key={`${chip.key}-${chip.value}`}>
          {chip.label}
          <span>×</span>
        </Link>
      ))}
      <Link className="clear-filters" href={route}>
        clear all
      </Link>
    </div>
  );
}
