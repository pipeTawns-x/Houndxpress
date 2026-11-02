import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store.ts";

/** `useDispatch` y `useSelector` ya tipados con el almacén de la aplicación. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
