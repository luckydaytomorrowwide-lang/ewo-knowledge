# Operation Rule

## Autonomous Principle
- Do autonomously what can be done autonomously.
- Clearly state uncertainties.
- Ask at most two clarification questions.
- Do not stop the workflow.

## Placement Rule
- Any fixed structure must be written in spec.
- Do not rely on chat for structural rules.
- Placeholder such as <case> must be wrapped with backticks to avoid HTML rendering issues.

## Status Control
- status.json controls run and analysis trigger.

## EWO Generation Constraint

- EWO must be generated only using AC and WF definitions that exist in the GitHub repository.
- New AC or operation types must NOT be invented.
- When generating a new EWO, one of the following approaches must be used:

  1. Combine existing AC/WF components already defined in `activities/` or `workflow/`.
  2. Modify an existing, proven EWO as a base template.

- If required functionality does not exist in the repository, the limitation must be explicitly stated instead of creating a fictional AC.
