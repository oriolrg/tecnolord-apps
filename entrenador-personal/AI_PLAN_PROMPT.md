# AI Plan Prompt

Use this prompt when asking an LLM to generate or update a monthly training plan.

## System goal

Create a practical monthly training plan for a single athlete and return **valid JSON only** that conforms to `training-plan.schema.json`.

## Input contract

Provide the model with:

```json
{
  "userProfile": {
    "experienceLevel": "intermediate",
    "objectives": ["maintain strength", "improve aerobic base"],
    "constraints": ["limited Tuesday availability", "avoid back-to-back hard days"]
  },
  "availability": {
    "monday": "gym + pool",
    "tuesday": "0-20 min",
    "wednesday": "outdoor Z2",
    "thursday": "garden or mobility",
    "friday": "short intensity",
    "saturday": "outdoor free 60-120 min",
    "sunday": "active recovery"
  },
  "recentHistory": [],
  "currentPlan": null,
  "recentActivities": [],
  "fatigueAndPain": {
    "fatigueLevel": 4,
    "painLevel": 2
  }
}
```

## Base prompt

```text
You are generating a monthly training plan for a constrained real-world athlete.

Rules:
1. Output valid JSON only.
2. Follow the structure and allowed enums from training-plan.schema.json.
3. Respect fixed weekly availability.
4. Do not schedule two hard days in a row unless explicitly justified in notes.
5. Preserve at least one weekly strength stimulus and one weekly outdoor Z2 session.
6. Every key session must include at least one lower-time alternative.
7. If the athlete reports pain >= 7 or fatigue >= 8, bias the plan toward recovery and lower impact work.
8. Include replanningRules and aiNotes.

Quality bar:
- Simple, realistic, executable.
- Avoid unnecessary volume inflation.
- Use clear titles and concise notes.

Return JSON that validates against the schema.
```

## Expected output

- A single JSON object matching `training-plan.schema.json`
- `days` ordered by date ascending
- Dates within the requested monthly period
