import styles from './Button.module.css';

export default function Button({ variant = 'primary', icon: Icon, children, className = '', ...props }) {
  const btnClass = styles[`btn_${variant}`] || styles.btn_primary;
  return (
    <button className={`${styles.button} ${btnClass} ${className}`} {...props}>
      {Icon && <Icon className={styles.btnIcon} />}
      {children}
    </button>
  );
}
