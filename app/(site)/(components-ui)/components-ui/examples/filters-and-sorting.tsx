import { Search } from "lucide-react";
import { DirectoryFilterController } from "@/app/ui/directories/directory-filter-controller";
import { DirectoryCheckboxGroup, DirectoryRadioGroup, DirectoryTagSelectGroup } from "@/app/ui/directories/directory-filters";
import { SortDropdown } from "@/app/ui/directories/directory-sort-dropdown";
import { Example } from "../gallery";
import styles from "../components-ui.module.css";

export function FiltersAndSortingExamples() {
  return (
    <>
      <Example
        components={["SortDropdown", "DirectoryCheckboxGroup", "DirectoryRadioGroup", "DirectoryTagSelectGroup", "DirectoryFilterController"]}
        note="These work for any long list of records. Filters live in the sidebar on wide screens and in the drawer on small ones. The controller updates the URL as you choose."
        source="app/ui/directories/"
        title="Filter form"
      >
        <form action="/components-ui/filters-and-sorting" className={styles.directoryFilters} data-default-sort="name" data-live-filter-form>
          <label className="directory-search">
            <span>Search</span>
            <span className="directory-search-field"><Search aria-hidden="true" size={16} /><input name="q" placeholder="Find a device…" type="search" /></span>
          </label>
          <SortDropdown name="sort" options={[{ label: "Name", value: "name" }, { label: "Recently added", value: "newest" }]} value="name" />
          <DirectoryCheckboxGroup name="feature" options={[{ label: "Battery", value: "battery", count: 214 }, { label: "Local control", value: "local", count: 98 }]} selected={[]} title="Features" />
          <DirectoryRadioGroup name="source" options={[{ label: "Any source", value: "any" }, { label: "Official", value: "official" }]} selected="any" title="Source" />
          <DirectoryTagSelectGroup
            name="category"
            options={[
              { label: "Home automation", value: "home", iconKey: "house-plug", count: 42 },
              { label: "Media", value: "media", iconKey: "tv", count: 37 },
              { label: "Backups", value: "backups", iconKey: "folder-sync", count: 18 },
            ]}
            selected={[]}
            title="Category"
          />
          <DirectoryFilterController />
        </form>
      </Example>
    </>
  );
}
