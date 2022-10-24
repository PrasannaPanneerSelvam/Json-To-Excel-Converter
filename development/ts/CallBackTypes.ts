import { JsTypes } from "./JsonUtils"

type CreateNewTableCallback = (inputValue: JsTypes, row: number, column: number) => void;
type LazyLoadingCallback = (callback: () => void) => void;

export {
    CreateNewTableCallback,
    LazyLoadingCallback
}