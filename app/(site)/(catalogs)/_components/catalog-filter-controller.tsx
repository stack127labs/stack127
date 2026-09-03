"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

function appendUniqueParam(
  params: URLSearchParams,
  seen: Set<string>,
  key: string,
  value: string,
) {
  const pair = `${key}\u0000${value}`;

  if (seen.has(pair)) {
    return;
  }

  seen.add(pair);
  params.append(key, value);
}

function buildParamsFromForm(form: HTMLFormElement) {
  const params = new URLSearchParams();
  const data = new FormData(form);
  const defaultSort = form.dataset.defaultSort ?? "popular";
  const seen = new Set<string>();

  for (const [key, rawValue] of data.entries()) {
    const value = String(rawValue).trim();

    if (!value) {
      continue;
    }

    if (key === "sort" && value === defaultSort) {
      continue;
    }

    appendUniqueParam(params, seen, key, value);
  }

  return { params, seen };
}

function buildFilterHref(form: HTMLFormElement, pathname: string) {
  const { params } = buildParamsFromForm(form);

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function buildTagFilterHref(
  form: HTMLFormElement,
  pathname: string,
  name: string,
  value: string,
  action: "add" | "remove",
) {
  const { params, seen } = buildParamsFromForm(form);

  if (action === "add") {
    appendUniqueParam(params, seen, name, value);
  }

  if (action === "remove") {
    params.delete(name);
    const rebuiltSeen = new Set(
      [...params.entries()].map(([key, current]) => `${key}\u0000${current}`),
    );

    for (const paramValue of new FormData(form).getAll(name)) {
      const current = String(paramValue).trim();

      if (!current || current === value) {
        continue;
      }

      appendUniqueParam(params, rebuiltSeen, name, current);
    }
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function setSelectOpen(root: HTMLElement, open: boolean) {
  const trigger = root.querySelector<HTMLButtonElement>("[data-custom-select-trigger]");
  const menu = root.querySelector<HTMLElement>("[data-custom-select-menu]");

  if (!trigger || !menu) {
    return;
  }

  trigger.setAttribute("aria-expanded", String(open));
  menu.hidden = !open;
}

function setFilterSelectOpen(root: HTMLElement, open: boolean) {
  const trigger = root.querySelector<HTMLButtonElement>("[data-filter-select-trigger]");
  const menu = root.querySelector<HTMLElement>("[data-filter-select-menu]");

  if (!trigger || !menu) {
    return;
  }

  trigger.setAttribute("aria-expanded", String(open));
  menu.hidden = !open;
}

function setFilterOptionActive(root: HTMLElement, value: string, active: boolean) {
  const option = root.querySelector<HTMLButtonElement>(
    `[data-filter-select-option][data-value="${CSS.escape(value)}"]`,
  );

  if (!option) {
    return;
  }

  option.classList.toggle("active", active);
  option.setAttribute("aria-pressed", String(active));
}

function updateStorageSlider(slider: HTMLInputElement) {
  const root = slider.closest<HTMLElement>("[data-storage-slider-root]");

  if (!root) {
    return;
  }

  const index = Number(slider.value);
  const values = slider.dataset.storageSliderValues?.split("|") ?? [];
  const labels = slider.dataset.storageSliderLabels?.split("|") ?? [];
  const input = root.querySelector<HTMLInputElement>("[data-storage-slider-value]");
  const current = root.querySelector<HTMLElement>("[data-storage-slider-current]");

  if (!input || !values[index]) {
    return;
  }

  const position = `${index * 25}%`;

  root.style.setProperty("--storage-slider-fill-width", position);
  root.style.setProperty("--storage-slider-position", position);
  input.value = values[index];

  if (current) {
    current.textContent = labels[index] ?? values[index];
  }

  for (const [stepIndex, step] of root
    .querySelectorAll<HTMLElement>("[data-storage-slider-step]")
    .entries()) {
    step.classList.toggle("active", stepIndex <= index);
  }
}

export function CatalogFilterController() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const form = document.querySelector<HTMLFormElement>("[data-live-filter-form]");

    if (!form) {
      return undefined;
    }

    form.dataset.liveFilterReady = "true";

    let searchTimer: ReturnType<typeof setTimeout> | undefined;
    let rangeTimer: ReturnType<typeof setTimeout> | undefined;

    const applyFilters = () => {
      router.replace(buildFilterHref(form, pathname), { scroll: false });
    };

    const scheduleSearch = () => {
      if (searchTimer) {
        clearTimeout(searchTimer);
      }

      searchTimer = setTimeout(applyFilters, 320);
    };

    const scheduleRange = () => {
      if (rangeTimer) {
        clearTimeout(rangeTimer);
      }

      rangeTimer = setTimeout(applyFilters, 220);
    };

    const handleInput = (event: Event) => {
      const target = event.target;

      if (target instanceof HTMLInputElement && target.type === "search") {
        scheduleSearch();
      }

      if (target instanceof HTMLInputElement && target.matches("[data-storage-slider]")) {
        updateStorageSlider(target);
        scheduleRange();
      }

    };

    const handleChange = (event: Event) => {
      const target = event.target;

      if (
        target instanceof HTMLInputElement &&
        (target.type === "checkbox" || target.type === "hidden" || target.type === "radio")
      ) {
        applyFilters();
      }

      if (target instanceof HTMLInputElement && target.matches("[data-storage-slider]")) {
        if (rangeTimer) {
          clearTimeout(rangeTimer);
        }

        updateStorageSlider(target);
        applyFilters();
      }

    };

    const handleSubmit = (event: SubmitEvent) => {
      event.preventDefault();
      applyFilters();
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const trigger = target.closest<HTMLElement>("[data-custom-select-trigger]");

      if (trigger) {
        const root = trigger.closest<HTMLElement>("[data-custom-select]");
        const expanded = trigger.getAttribute("aria-expanded") === "true";

        if (root) {
          setSelectOpen(root, !expanded);
        }

        return;
      }

      const filterTrigger = target.closest<HTMLElement>("[data-filter-select-trigger]");

      if (filterTrigger) {
        const root = filterTrigger.closest<HTMLElement>("[data-filter-tag-select]");
        const expanded = filterTrigger.getAttribute("aria-expanded") === "true";

        if (root) {
          setFilterSelectOpen(root, !expanded);
        }

        return;
      }

      const option = target.closest<HTMLButtonElement>("[data-custom-select-option]");

      if (option) {
        const root = option.closest<HTMLElement>("[data-custom-select]");
        const input = root?.querySelector<HTMLInputElement>('input[type="hidden"]');
        const label = root?.querySelector<HTMLElement>("[data-custom-select-label]");
        const value = option.dataset.value ?? "";

        if (root && input && label && value) {
          input.value = value;
          label.textContent = option.textContent?.trim() ?? value;

          for (const item of root.querySelectorAll<HTMLButtonElement>("[data-custom-select-option]")) {
            const active = item === option;
            item.classList.toggle("active", active);
            item.setAttribute("aria-pressed", String(active));
          }

          setSelectOpen(root, false);
          applyFilters();
        }

        return;
      }

      const filterOption = target.closest<HTMLButtonElement>("[data-filter-select-option]");

      if (filterOption) {
        const root = filterOption.closest<HTMLElement>("[data-filter-tag-select]");
        const name = root?.dataset.name;
        const value = filterOption.dataset.value ?? "";

        if (root && name && value) {
          setFilterSelectOpen(root, false);
          router.replace(buildTagFilterHref(form, pathname, name, value, "add"), { scroll: false });
        }

        return;
      }

      const removeTag = target.closest<HTMLButtonElement>("[data-filter-tag-remove]");

      if (removeTag) {
        const tag = removeTag.closest<HTMLElement>("[data-filter-tag]");
        const root = removeTag.closest<HTMLElement>("[data-filter-tag-select]");
        const name = root?.dataset.name;
        const value = tag?.dataset.value ?? "";

        if (root && name && value) {
          setFilterOptionActive(root, value, false);
          router.replace(buildTagFilterHref(form, pathname, name, value, "remove"), { scroll: false });
        }

        return;
      }

      for (const root of form.querySelectorAll<HTMLElement>("[data-custom-select]")) {
        if (!root.contains(target)) {
          setSelectOpen(root, false);
        }
      }

      for (const root of form.querySelectorAll<HTMLElement>("[data-filter-tag-select]")) {
        if (!root.contains(target)) {
          setFilterSelectOpen(root, false);
        }
      }
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      for (const root of form.querySelectorAll<HTMLElement>("[data-custom-select]")) {
        setSelectOpen(root, false);
      }

      for (const root of form.querySelectorAll<HTMLElement>("[data-filter-tag-select]")) {
        setFilterSelectOpen(root, false);
      }
    };

    form.addEventListener("input", handleInput);
    form.addEventListener("change", handleChange);
    form.addEventListener("submit", handleSubmit);
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeydown);

    return () => {
      delete form.dataset.liveFilterReady;

      if (searchTimer) {
        clearTimeout(searchTimer);
      }

      if (rangeTimer) {
        clearTimeout(rangeTimer);
      }

      form.removeEventListener("input", handleInput);
      form.removeEventListener("change", handleChange);
      form.removeEventListener("submit", handleSubmit);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [pathname, router]);

  return null;
}
