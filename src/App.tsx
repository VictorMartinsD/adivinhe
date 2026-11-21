import styles from "@/app.module.css";
import { useEffect, useRef, useState } from "react";
import { WORDS, type Challenge } from "@/utils/words";
import { Tip } from "@/components/Tip";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Letter } from "@/components/Letter";
import { Header } from "@/components/Header";
import { LettersUsed, type LettersUsedProps } from "@/components/LettersUsed";

const ATTEMPTS_MARGIN = 5;

function sanitizeLetterInput(value: string) {
  const withoutAccents = value.normalize("NFD").replace(/\p{M}/gu, "");
  const asciiLetters = withoutAccents.replace(/[^A-Za-z]/g, "");

  return asciiLetters.slice(0, 1).toUpperCase();
}

export default function App() {
  const [score, setScore] = useState(0);
  const [letter, setLetter] = useState("");
  const [lettersUsed, setLettersUsed] = useState<LettersUsedProps[]>([]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [warning, setWarning] = useState("");
  const [warningType, setWarningType] = useState<"error" | "empty" | "duplicate" | "success">("error");
  const [duplicateLetter, setDuplicateLetter] = useState("");
  const [warningAnimationKey, setWarningAnimationKey] = useState(0);
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const incorrectAttempts = lettersUsed.filter((used) => !used.correct).length;
  const remainingAttempts = challenge ? challenge.word.length + ATTEMPTS_MARGIN - incorrectAttempts : 0;

  function focusInput() {
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function showWarning(message: string, type: "error" | "empty" | "duplicate" | "success" = "error", letterValue = "") {
    setWarning(message);
    setWarningType(type);
    setDuplicateLetter(type === "duplicate" ? letterValue : "");
    setWarningAnimationKey((current) => current + 1);
  }

  function clearWarning() {
    setWarning("");
    setWarningType("error");
    setDuplicateLetter("");
  }

  function handleRestartGame() {
    setIsRestartModalOpen(true);
  }

  function handleConfirmRestart() {
    startGame();
    setIsRestartModalOpen(false);
    focusInput();
  }

  function handleCancelRestart() {
    setIsRestartModalOpen(false);
    focusInput();
  }

  function startGame() {
    const index = Math.floor(Math.random() * WORDS.length);
    const randomWord = WORDS[index];

    setChallenge(randomWord);

    setScore(0);
    setLetter("");
    setLettersUsed([]);
    setWarning("");
    setWarningType("error");
    setDuplicateLetter("");
  }

  function HandleConfirm() {
    if (!challenge) {
      return;
    }

    if (!letter || !/^[A-Z]$/.test(letter)) {
      showWarning("Digite uma letra!", "empty");
      focusInput();
      return;
    }

    const value = letter.toUpperCase();
    const exists = lettersUsed.find((used) => used.value.toUpperCase() === value);

    if (exists) {
      setLetter("");
      showWarning("Você já utilizou a letra " + value, "duplicate", value);
      focusInput();
      return;
    }

    const hits = challenge.word
      .toUpperCase()
      .split("")
      .filter((char) => char === value).length;

    const correct = hits > 0;
    const currentScore = score + hits;

    setLettersUsed((prevState) => [...prevState, { value, correct }]);
    setScore(currentScore);
    setLetter("");
    focusInput();
  }

  useEffect(() => {
    const index = Math.floor(Math.random() * WORDS.length);
    setChallenge(WORDS[index]);
    setScore(0);
    setLetter("");
    setLettersUsed([]);
    setWarning("");
  }, []);

  useEffect(() => {
    if (!challenge) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (score === challenge.word.length) {
        showWarning("Parabéns, você descobriu a palavra!", "success");
      } else {
        const attemptLimit = challenge.word.length + ATTEMPTS_MARGIN;

        if (incorrectAttempts === attemptLimit) {
          setWarning("Que pena, você usou todas as tentativas!");
          setWarningType("error");
          setDuplicateLetter("");
          setWarningAnimationKey((current) => current + 1);
        } else {
          return;
        }
      }

      setTimeout(() => {
        const index = Math.floor(Math.random() * WORDS.length);
        setChallenge(WORDS[index]);
        setScore(0);
        setLetter("");
        setLettersUsed([]);
        setWarning("");
      }, 1200);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [challenge, score, incorrectAttempts]);

  if (!challenge) {
    return;
  }

  return (
    <>
      <div className={styles.container}>
        <main>
          <Header
            current={incorrectAttempts}
            max={challenge.word.length + ATTEMPTS_MARGIN}
            onRestart={handleRestartGame}
          />

          <Tip tip={challenge.tip} />
          <p className={styles.accentNote}>Acentos e cedilha é opcional</p>

          <div className={styles.word}>
            {challenge.word.split("").map((letter, index) => {
              const letterUsed = lettersUsed.find((used) => used.value.toUpperCase() === letter.toUpperCase());

              return (
                <Letter key={index} value={letterUsed?.value} color={letterUsed?.correct ? "correct" : "default"} />
              );
            })}
          </div>

          <h4>Palpite</h4>

          <form
            className={styles.guess}
            onSubmit={(event) => {
              event.preventDefault();
              HandleConfirm();
            }}>
            <Input
              ref={inputRef}
              autoFocus
              maxLength={1}
              placeholder="?"
              value={letter}
              pattern="[A-Za-z]"
              onChange={(e) => {
                const value = sanitizeLetterInput(e.target.value);
                setLetter(value);

                if (warningType === "empty" && value.trim()) {
                  clearWarning();
                }

                if (warningType === "duplicate") {
                  const normalizedValue = value.trim().toUpperCase();

                  if (normalizedValue && normalizedValue !== duplicateLetter) {
                    clearWarning();
                  }
                }
              }}
            />
            <Button title="Confirmar" type="submit" />
            {warning && (
              <span
                key={warningAnimationKey}
                className={`${styles.warning} ${warningType === "success" ? styles.success : ""}`}
                role="status"
                aria-live="polite">
                {warning}
              </span>
            )}
          </form>

          <LettersUsed data={lettersUsed} />
        </main>
      </div>

      {isRestartModalOpen && (
        <div className={styles.modalOverlay} role="presentation" onClick={handleCancelRestart}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="restart-modal-title"
            onClick={(event) => event.stopPropagation()}>
            <h2 id="restart-modal-title">Adivinhe</h2>
            <p>Você tem certeza que deseja reiniciar o jogo?</p>
            <span className={styles.modalNotice}>Você ainda tem {remainingAttempts} tentativas</span>
            <div className={styles.modalActions}>
              <button type="button" className={styles.cancelButton} onClick={handleCancelRestart}>
                Cancelar
              </button>
              <button type="button" className={styles.confirmButton} autoFocus onClick={handleConfirmRestart}>
                Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
