import { GLOSSARY, type GlossaryKey } from '../../utils/glossary';
import { InfoTip } from './InfoTip';

/** Tooltip com a explicação de um conceito do glossário. */
export function Term({ id, tone }: { id: GlossaryKey; tone?: 'default' | 'light' }) {
  const entry = GLOSSARY[id];
  return (
    <InfoTip term={entry.term} tone={tone}>
      {entry.text}
    </InfoTip>
  );
}
