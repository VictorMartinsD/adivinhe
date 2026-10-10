import styles from "@/components/LettersUsed/styles.module.css";
import { Letter } from "@/components/Letter";

export function LettersUsed() {
  return (
    <div className={styles.lettersUsed}>
      <h5>Letras utilizadas</h5>

      <div>
        <Letter value="R" size="small" />
        <Letter value="X" size="small" />
      </div>
    </div>
  );
}
