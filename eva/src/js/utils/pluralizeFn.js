export function pluralizeTime(count, timeUnits, periodLabel) {
  // Получаем последние две цифры числа
  const lastTwoDigits = count % 100;

  // Определяем остаток от деления на 10
  const lastDigit = count % 10;

  // Проверка на исключения (11-19 считаются исключением)
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return `${periodLabel} ${count} ${timeUnits[2]}`;
  }

  // Проверка на число 1
  if (lastDigit === 1) {
    return `${periodLabel} ${count} ${timeUnits[0]}`;
  }

  // Проверка на числа 2-4
  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${periodLabel} ${count} ${timeUnits[1]}`;
  }

  // Все остальные случаи (число больше 4 или оканчивается на 0)
  return `${periodLabel} ${count} ${timeUnits[2]}`;
}
