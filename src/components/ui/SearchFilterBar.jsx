import React from 'react';
import styles from './SearchFilterBar.module.css';
import { SearchIcon, FilterIcon } from './Icons';

export default function SearchFilterBar({ 
  searchPlaceholder = "Search...", 
  searchValue, 
  onSearchChange,
  onFilterClick 
}) {
  return (
    <div className={styles.tableHeader}>
      <div className={styles.searchWrap}>
        <SearchIcon className={styles.searchIcon} />
        <input 
          className={styles.searchInput} 
          value={searchValue} 
          onChange={onSearchChange} 
          placeholder={searchPlaceholder} 
        />
      </div>
      <button className={styles.filterBtn} onClick={onFilterClick}>
        <FilterIcon className={styles.filterIcon} />
        Filter
      </button>
    </div>
  );
}
