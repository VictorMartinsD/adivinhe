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

export default function App() {
  const [score, setScore] = useState(0);
  const [letter, setLetter] = useState("");
  const [lettersUsed, setLettersUsed] = useState<LettersUsedProps[]>([]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const incorrectAttempts = lettersUsed.filter((used) => !used.correct).length;

  function focusInput() {
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function handleRestartGame() {
    const isConfirmed = window.confirm("Você tem certeza que deseja reiniciar?");

    if (isConfirmed) {
      startGame();
    }

    focusInput();
  }

  function startGame() {
    const index = Math.floor(Math.random() * WORDS.length);
    const randomWord = WORDS[index];

    setChallenge(randomWord);

    setScore(0);
    setLetter("");
    setLettersUsed([]);
  }

  function HandleConfirm() {
    if (!challenge) {
      return;
    }

    if (!letter.trim()) {
      alert("Digite uma letra!");
      focusInput();
      return;
    }

    const value = letter.toUpperCase();
    const exists = lettersUsed.find((used) => used.value.toUpperCase() === value);

    if (exists) {
      setLetter("");
      alert("Você já utilizou a letra " + value);
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

  function endGame(message: string) {
    alert(message);
    startGame();
    focusInput();
  }

  useEffect(() => {
    startGame();
  }, []);

  useEffect(() => {
    if (!challenge) {
      return;
    }

    setTimeout(() => {
      if (score === challenge.word.length) {
        return endGame("Parabéns, você descobriu a palavra!");
      }

      const attemptLimit = challenge.word.length + ATTEMPTS_MARGIN;

      if (incorrectAttempts === attemptLimit) {
        return endGame("Que pena, você usou todas as tentativas!");
      }
    }, 200);
  }, [score, incorrectAttempts]);

  if (!challenge) {
    return;
  }

  return (
    <div className={styles.container}>
      <main>
        <Header
          current={incorrectAttempts}
          max={challenge.word.length + ATTEMPTS_MARGIN}
          onRestart={handleRestartGame}
        />

        <Tip tip={challenge.tip} />

        <div className={styles.word}>
          {challenge.word.split("").map((letter, index) => {
            const letterUsed = lettersUsed.find((used) => used.value.toUpperCase() === letter.toUpperCase());

            return <Letter key={index} value={letterUsed?.value} color={letterUsed?.correct ? "correct" : "default"} />;
          })}
        </div>

        <h4>Palpite</h4>

        <form
          className={styles.guess}
          onSubmit={(event) => {
            event.preventDefault();
            HandleConfirm();
          }}
        >
          <Input
            ref={inputRef}
            autoFocus
            maxLength={1}
            placeholder="?"
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
          />
          <Button title="Confirmar" type="submit" />
        </form>

        <LettersUsed data={lettersUsed} />
      </main>
    </div>
  );
}
