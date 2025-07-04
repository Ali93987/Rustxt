export interface Lesson {
  id: number;
  slug: string;
  title: string;
  description: string;
  text: string;
  audioSrc: string;
}

export const lessons: Lesson[] = [
  {
    id: 1,
    slug: 'alphabet-and-pronunciation',
    title: 'Урок 1: Алфавит и произношение',
    description: 'Learn the Russian alphabet and the basics of pronunciation.',
    text: `The Russian alphabet, or азбука (azbuka), uses the Cyrillic script. It consists of 33 letters. Some letters look like their Latin counterparts but are pronounced differently. For example, 'В' is pronounced like 'V', and 'Н' is like 'N'.

Let's start with the vowels: А, Е, Ё, И, О, У, Ы, Э, Ю, Я. These letters form the foundation of Russian sounds.`,
    audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 2,
    slug: 'basic-greetings',
    title: 'Урок 2: Основные приветствия',
    description: 'Common greetings and phrases for everyday conversation.',
    text: `Greeting people is the first step in any language.

- Здравствуйте (Zdravstvuyte): Hello (formal)
- Привет (Privet): Hi (informal)
- Как дела? (Kak dela?): How are you?
- Хорошо, спасибо (Khorosho, spasibo): Fine, thank you.
- До свидания (Do svidaniya): Goodbye.`,
    audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 3,
    slug: 'introducing-yourself',
    title: 'Урок 3: Представление себя',
    description: "Learn how to introduce yourself and ask for someone's name.",
    text: `To introduce yourself, you can say:

- Меня зовут... (Menya zovut...): My name is...
- Как вас зовут? (Kak vas zovut?): What is your name? (formal)
- Очень приятно (Ochen' priyatno): Nice to meet you.`,
    audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 4,
    slug: 'numbers-and-counting',
    title: 'Урок 4: Цифры и счёт',
    description: 'Learn to count from 1 to 10 in Russian.',
    text: `Counting is an essential skill. Here are the numbers from one to ten:

1. один (odin)
2. два (dva)
3. три (tri)
4. четыре (chetyre)
5. пять (pyat')
6. шесть (shest')
7. семь (sem')
8. восемь (vosem')
9. девять (devyat')
10. десять (desyat')`,
    audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
];
