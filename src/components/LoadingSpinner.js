// src/components/LoadingSpinner.js
import styles from '@/styles/LoadingSpinner.module.css'

const LoadingSpinner = () => {
  return (
    <div className={styles.spinner}>
      {/* Customize your loading spinner design */}
      <div className={styles.loader}></div>
    </div>
  );
};

export default LoadingSpinner;
