// soundManager.js
const SoundManager = {
  correct: new Audio("./sound/sus_1.mp3"),
  wrong: new Audio("./sound/fall_1.wav"),

  playCorrect() {
    this.correct.currentTime = 0;
    this.correct.play();
  },

  playWrong() {
    this.wrong.currentTime = 0;
    this.wrong.play();
  },

  speak(text) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR";
    u.rate = 1.0;
    u.pitch = 1.2;
    speechSynthesis.cancel(); // 겹침 방지
    speechSynthesis.speak(u);
  }
};

export default SoundManager;
