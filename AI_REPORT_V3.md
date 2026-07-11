# Nexus Sight — AI Report V3

Raport AI korzysta z niezależnego Algorithm V2 jako źródła ocen i liczb. Model językowy interpretuje dane oraz przygotowuje raport coachingowy, ale nie przelicza ponownie głównego wyniku.

## Modele

Domyślna kolejność:

1. `qwen/qwen3-next-80b-a3b-instruct`,
2. `meta/llama-3.3-70b-instruct`,
3. `meta/llama-3.1-8b-instruct`.

Zmienne środowiskowe:

```text
NVIDIA_API_KEY=...
NVIDIA_AI_MODEL=qwen/qwen3-next-80b-a3b-instruct
NVIDIA_AI_FALLBACK_MODEL=meta/llama-3.3-70b-instruct
```

Dwie ostatnie zmienne są opcjonalne — kod ma wartości domyślne.

## Przepływ

1. API pobiera rangę, mastery i ostatnie rankedy.
2. Mecze trafiają do `analysis-engine-v2.ts`.
3. Model otrzymuje ustrukturyzowane dane V2.
4. Odpowiedź jest wycinana do jednego obiektu JSON.
5. Zod waliduje strukturę.
6. Backend ponownie uziemia score, rating, formę, radar, konsekwencję i roadmapę w V2.
7. Po błędzie następuje próba kolejnego modelu.
8. Gdy wszystkie modele zawiodą albo nie ma klucza, zwracany jest pełny raport deterministyczny z V2.

Endpoint `/api/summoner/:puuid/ai-report` zwraca pole `meta` z wersją pipeline, modelem, próbami fallbacku, czasem generowania i pewnością wyniku.
