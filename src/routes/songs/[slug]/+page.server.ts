import { PrismaClient } from '@prisma/client';
import type { PageServerLoad } from './$types';
import type { IChord, IChordLine, IEmptyLine, ILyricLine, ISong, ISongSection } from '$lib/types';

const prisma = new PrismaClient();

const sectionIndicator = '---';
const chordIndicator = '@@@';


type TLineType = 'section' | 'chord' | 'lyric' | 'empty';

const determineLineType = (line: string): TLineType => {
  const isSectionLine = new RegExp(`${sectionIndicator}$`).test(line);
  const isChordLine = new RegExp(`${chordIndicator}$`).test(line);

  if (isSectionLine) {
    return 'section';
  }

  if (isChordLine) {
    return 'chord';
  }

  if (line.length === 0) {
    return 'empty';
  }

  return 'lyric';
};

const stringToLine = (line: string): ILyricLine | IChordLine | IEmptyLine => {
  const type = determineLineType(line);
  if (type === 'chord') {
    return {
      type: 'chord',
      chords: stringToChords(line)
    };
  } else if (type === 'lyric') {
    return {
      type: 'lyric',
      data: line
    };
  } else {
    return {
      type: 'empty'
    };
  }
};

const stringToChord = (line: string) => {
  const chordRegExp = new RegExp(/(^|\s+|$)?((?:[A-G])(?:#|b)?(?:m)?(?:sus)?(?:\d)?)/, 'g');
  return line
    .split(chordRegExp)
    .filter((part) => {
      if (part === undefined) {
        return true;
      }
      return part.length !== 0;
    })
    .map((linePart) => {
      return linePart === undefined ? '' : linePart;
    });
};

const stringToChords = (line: string): IChord[] | undefined => {
  const chordRegExp = new RegExp(/(^|\s+|$)?((?:[A-G])(?:#|b)?(?:m)?(?:sus)?(?:\d)?)/, 'g');
  const chordGroups = line
    .replace(chordIndicator, '')
    .match(chordRegExp)
    ?.map((item) => {
      return stringToChord(item);
    });

  if (chordGroups) {
    return chordGroups.map((chordGroup) => {
      const [gap, chord] = chordGroup;

      return {
        data: chord,
        position: gap.length
      };
    });
  }
};

const srcToSections = (src: string) => {
  const lines = src.split('\n');
  const sectionRanges = lines
    .map((line, i) => {
      return line.includes(sectionIndicator) ? i : -1;
    })
    .filter((line) => line >= 0);

  const sections = sectionRanges.map((rangeStart, i) => {
    if (sectionRanges[i + 1]) {
      return lines.slice(rangeStart, sectionRanges[i + 1]);
    } else {
      return lines.slice(rangeStart, lines.length);
    }
  });

  const buildSections = (section: string[]): ISongSection => {
    const [sectionTitle, ...lines] = section;

    return {
      title: sectionTitle.replace(sectionIndicator, '').trim(),
      lines: lines.map(stringToLine)
    };
  };

  return sections.map(buildSections);
};

export const load = (async ({ params }) => {

  const dbSong = await prisma.song.findUnique({
    where: {
      id: Number(params.slug),
    }
  })
  if(dbSong) {
    return {
      src: dbSong.content,
      sections: srcToSections(dbSong.content),
      meta: {
        title: dbSong.title,
        artist: "Artist",
        key: "Key"
      }
    }
  }
}) satisfies PageServerLoad;