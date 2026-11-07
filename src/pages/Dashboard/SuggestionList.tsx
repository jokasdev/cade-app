import { Lightbulb } from 'lucide-react';
import type { Suggestion } from '../../services/diagnostics/suggestions';

export function SuggestionList({ suggestions }: { suggestions: readonly Suggestion[] }) {
  return (
    <ol className="suggestions" role="list">
      {suggestions.map((suggestion, index) => (
        <li key={suggestion.id} className="suggestion reveal" style={{ ['--i' as string]: index }}>
          <span className="suggestion__icon" aria-hidden="true">
            <Lightbulb />
          </span>
          <div>
            <h3 className="suggestion__title">{suggestion.title}</h3>
            <p className="suggestion__text">{suggestion.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
