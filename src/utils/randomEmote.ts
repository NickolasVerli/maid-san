const emotes = ["( •̀ ω •́ )y", "=￣ω￣=", "(●'◡'●)", "(o′┏▽┓｀o)"];

export const getRandomEmote = () => {
  const randomIndex = ~~(Math.random() * emotes.length);

  return emotes[randomIndex]!;
};
