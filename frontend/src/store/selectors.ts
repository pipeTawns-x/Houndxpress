import { createSelector } from "@reduxjs/toolkit";
import { summarizeGuides } from "../domain/index.ts";
import type { RootState } from "./store.ts";

export const selectGuides = (state: RootState) => state.guides.items;
export const selectGuidesStatus = (state: RootState) => state.guides.status;
export const selectGuidesError = (state: RootState) => state.guides.error;
export const selectCanResetGuides = (state: RootState) => state.guides.canReset;

/** Total, en tránsito, entregadas y guías por etapa. Se recalcula solo cuando cambia la lista. */
export const selectStageCounts = createSelector([selectGuides], (guides) => summarizeGuides(guides));
