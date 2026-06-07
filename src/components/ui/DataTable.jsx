import React from 'react';
import styles from './DataTable.module.css';

export default function DataTable({ 
  columns, 
  data, 
  keyField = 'id', 
  renderRow, 
  loading = false,
  totalItems = 0,
  currentPage = 1,
  onPageChange
}) {
  return (
    <>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={styles.th}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className={styles.loadingCell}>
                  Loading data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.loadingCell}>
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((item) => renderRow(item, item[keyField]))
            )}
          </tbody>
        </table>
      </div>
      
      {!loading && totalItems > 0 && (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Showing {data.length} of {totalItems} entries
          </span>
          <div className={styles.paginationBtns}>
            <button 
              className={styles.pageBtn} 
              disabled={currentPage <= 1}
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
            >
              &lt;
            </button>
            <button className={`${styles.pageBtn} ${styles.active}`}>
              {currentPage}
            </button>
            <button 
              className={styles.pageBtn}
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
